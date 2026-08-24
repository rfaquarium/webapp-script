// =========================================================================
// MODULE: OPERATIONS ALERTS & KPI CALCULATION
// Cập nhật: Tự động hoá quản trị vận hành RF_Workspace_Pro
// =========================================================================

/**
 * [RCA] Tái cấu trúc (Refactoring): Hệ thống cũ bị hardcode từng cá nhân, làm code phình to O(N) và rất khó mở rộng khi thêm nhân sự mới.
 * Khắc phục bằng mô hình "Role-Based KPI", tự động mapping theo `Chức Danh` trong bảng `Config_NhanSu`.
 * Tối ưu hóa Database: Dùng Batch Write (setValues) ghi toàn bộ data của tất cả nhân sự trong 1 lần gọi API duy nhất thay vì lặp qua từng người (O(1) thay vì O(N)).
 *
 * Tính toán KPI hàng tháng cho TOÀN BỘ nhân sự (Role-Based KPI)
 * @param {Object} allStatsMap - Map chứa chỉ số thực tế của từng nhân sự, key là tên nhân sự. 
 * Ví dụ: { "Nguyễn Hoàng Dương": { actualWorkingDays: 26, inventoryMatched: 1, qcFailedRate: 0.04, docsComplete: 1, outputVolume: 160, negotiationRate: 1 }, "Nguyễn Thị Diệu Hương": { actualWorkingDays: 26, revenueAchieved: 26000000, ... } }
 * @returns {Object} Kết quả KPI và Lương
 */
function api_generateMonthlyKPI_All(allStatsMap) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Quét danh sách nhân sự từ Config_NhanSu
    var hrSheet = ss.getSheetByName('Config_NhanSu');
    if (!hrSheet) throw new Error('Không tìm thấy bảng Config_NhanSu');
    var hrData = hrSheet.getDataRange().getValues();
    var hrHeaders = hrData[0];
    
    // Fallback tìm cột Name
    var nameCol = hrHeaders.indexOf('Họ và Tên');
    if (nameCol === -1) nameCol = hrHeaders.indexOf('Tên Nhân Viên');
    if (nameCol === -1) nameCol = hrHeaders.indexOf('user');
    
    var roleCol = hrHeaders.indexOf('Chức Danh');
    var baseSalaryCol = hrHeaders.indexOf('Lương Cơ Bản');
    var funcSalaryCol = hrHeaders.indexOf('Lương Chức Vụ');
    
    if (nameCol === -1 || roleCol === -1) throw new Error('Cấu trúc Config_NhanSu thiếu cột Họ và Tên hoặc Chức Danh');

    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!kpiSheet) throw new Error('Không tìm thấy bảng KPI_Progress');
    var kpiHeaderData = kpiSheet.getRange(1, 1, 1, kpiSheet.getLastColumn()).getValues()[0];
    
    // 2. Role-Based Configuration (Object Mapping)
    var ROLE_KPI_CONFIG = {
      "Quản Lý Bán Hàng": [
        { key: "revenueAchieved", name: "[PHAT_TRIEN] Doanh thu bán hàng (Mục tiêu 25M)", target: 25000000, reward: 1040000, unit: "VNĐ", condition: function(c, t) { return c >= t; } },
        { key: "responseRate", name: "[PHAT_TRIEN] Tỉ lệ phản hồi > 96%", target: 0.961, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "refundHandlingRate", name: "[PHAT_TRIEN] Xử lý hàng hoàn > 80%", target: 0.801, reward: 520000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "complaintWinRate", name: "[PHAT_TRIEN] Khiếu nại thắng > 50%", target: 0.501, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "msgResponseRate", name: "[PHAT_TRIEN] Phản hồi tin nhắn 100%", target: 1.0, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "lowRatingWinRate", name: "[PHAT_TRIEN] Xử lý đánh giá thấp > 50%", target: 0.501, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } }
      ],
      "Quản Lý Kho": [
        { key: "inventoryMatched", name: "[PHAT_TRIEN] Đảm bảo giá vốn, phân loại khớp 100%", target: 1, reward: 500000, unit: "SLA", condition: function(c, t) { return c >= t; } },
        { key: "docsComplete", name: "[PHAT_TRIEN] Lưu trữ đầy đủ 100% chứng từ/Hóa đơn", target: 1, reward: 250000, unit: "SLA", condition: function(c, t) { return c >= t; } },
        { key: "outputVolume", name: "[PHAT_TRIEN] Sản lượng đạt 160 bể (80 done/khâu)", target: 160, reward: 500000, unit: "SP", condition: function(c, t) { return c >= t; } },
        { key: "qcFailedRate", name: "[PHAT_TRIEN] Tỉ lệ hàng hóa hoàn < 5%", target: 0.05, reward: 500000, unit: "%", condition: function(c, t) { return c < t; } },
        { key: "materialSLA", name: "[PHAT_TRIEN] Nguyên liệu không thiếu hụt (100% SLA)", target: 1, reward: 375000, unit: "SLA", condition: function(c, t) { return c >= t; } },
        { key: "negotiationRate", name: "[PHAT_TRIEN] Quản lý công nợ NCC tốt (100% đối soát)", target: 1, reward: 375000, unit: "SLA", condition: function(c, t) { return c >= t; } }
      ]
    };
    
    var dataToAppend = [];
    var monthStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM");
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var eMonth = new Date(); eMonth.setMonth(eMonth.getMonth() + 1); eMonth.setDate(0);
    var endTimeStr = Utilities.formatDate(eMonth, "GMT+7", "yyyy-MM-dd") + ' 23:59:59';
    var logs = [];

    // 3. Duyệt toàn bộ nhân sự (O(N) data build)
    allStatsMap = allStatsMap || {};
    
    for (var i = 1; i < hrData.length; i++) {
      var userName = String(hrData[i][nameCol]).trim();
      if (!userName) continue;
      
      var role = String(hrData[i][roleCol]).trim();
      var baseSal = Number(hrData[i][baseSalaryCol]) || 0;
      var funcSal = Number(hrData[i][funcSalaryCol]) || 0;
      
      var stats = allStatsMap[userName] || {};
      var actualDays = Number(stats.actualWorkingDays) || 26;
      var timeSalary = ((baseSal + funcSal) / 26) * actualDays; // Tính lương thời gian
      
      var roleConfigs = ROLE_KPI_CONFIG[role];
      if (roleConfigs && roleConfigs.length > 0) {
        var userBonus = 0;
        for (var j = 0; j < roleConfigs.length; j++) {
          var cnf = roleConfigs[j];
          var currentVal = Number(stats[cnf.key]) || 0;
          var isMet = cnf.condition(currentVal, cnf.target);
          var actualReward = isMet ? cnf.reward : 0;
          userBonus += actualReward;
          
          logs.push({ user: userName, role: role, timeSalary: timeSalary, kpi: cnf.name, current: currentVal, target: cnf.target, reward: actualReward });
          
          var newRow = kpiHeaderData.map(function(colName) {
            if (colName === 'id') return 'KPI_' + Date.now() + '_' + i + '_' + j;
            if (colName === 'user') return userName;
            if (colName === 'kpiName') return cnf.name;
            if (colName === 'current') return currentVal;
            if (colName === 'target') return cnf.target;
            if (colName === 'unit') return cnf.unit;
            if (colName === 'lastUpdated') return timestamp;
            if (colName === 'startTime') return monthStr + '-01 00:00:00';
            if (colName === 'endTime') return endTimeStr;
            if (colName === 'reward') return actualReward;
            if (colName === 'isClaimed') return true;
            return '';
          });
          dataToAppend.push(newRow);
        }
      }
    }

    // 4. Batch Write (O(1) execution)
    if (dataToAppend.length > 0) {
      kpiSheet.getRange(kpiSheet.getLastRow() + 1, 1, dataToAppend.length, dataToAppend[0].length).setValues(dataToAppend);
    }

    return {
      success: true,
      message: 'Đã sinh KPI hàng loạt thành công cho ' + (dataToAppend.length) + ' dòng mục tiêu!',
      data: logs
    };
  } catch (error) {
    return { success: false, message: 'Lỗi khi tạo KPI hàng loạt: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🪙 MODULE PHỤ TRỢ: QUẢN LÝ VÀ GHI NHẬN QUỸ XU TÍCH LŨY DÀI HẠN
// Đảm bảo tách biệt hoàn toàn giữa Xu (Tích lũy cuối năm) và VNĐ (Lương tháng)
// =========================================================================

/**
 * Ghi nhận biến động Xu tích lũy của nhân sự vào bảng tính độc lập.
 * Tự động khởi tạo bảng 'ThongKe_TichLuyXu' ở danh sách bên trái nếu chưa tồn tại.
 * 
 * @param {string} user - Tên hoặc email nhân sự thực hiện
 * @param {number} amountXu - Số xu biến động (Dương là thưởng, Âm là phạt)
 * @param {string} type - Loại nghiệp vụ (Ví dụ: "Thưởng nhiệm vụ", "Phạt Anti-cheat")
 * @param {string} note - Ghi chú chi tiết lý do biến động
 * @param {string} orderCode - Mã đơn hàng hoặc mã nhiệm vụ liên quan (nếu có)
 * @returns {Object} Trạng thái thực thi
 */
function api_recordXuTransaction(user, amountXu, type, note, orderCode) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = 'ThongKe_TichLuyXu';
    var sheet = ss.getSheetByName(sheetName);
    
    // BƯỚC 1: Tự động khởi tạo bảng tính bên trái nếu chưa có (Zero-configuration)
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Thiết lập cấu trúc cột dữ liệu chuẩn hóa cho hệ thống lưu vết quỹ
      sheet.appendRow([
        'id', 
        'user', 
        'type', 
        'amount_xu', 
        'date', 
        'orderCode', 
        'note', 
        'timestamp'
      ]);
      // Định dạng dòng tiêu đề cho dễ nhìn và quản lý
      sheet.getRange(1, 1, 1, 8)
           .setBackground('#78350f') // Màu nâu hổ phách đặc trưng của Xu
           .setFontColor('#ffffff')
           .setFontWeight('bold')
           .setHorizontalAlignment('center');
    }
    
    // BƯỚC 2: Chuẩn bị dữ liệu dòng ghi nhận mới
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
    var uniqueId = 'XU_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    var newRow = [
      uniqueId,
      String(user).trim(),
      String(type).trim(),
      Number(amountXu) || 0,
      dateStr,
      orderCode ? String(orderCode).trim() : '',
      note ? String(note).trim() : '',
      timestamp
    ];
    
    // BƯỚC 3: Ghi dữ liệu vào dòng cuối cùng của bảng tính
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Đã ghi nhận thành công ' + amountXu + ' Xu vào quỹ tích lũy của nhân sự ' + user 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Lỗi phát sinh khi ghi nhận quỹ Xu tích lũy: ' + error.toString() 
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Tính tổng số dư Xu tích lũy hiện tại của một nhân sự từ lịch sử bảng tính.
 * Dùng để trả về dữ liệu thời gian thực hiển thị trên Badge của Tab_HR.html
 * 
 * @param {string} userName - Tên nhân sự cần tính toán số dư
 * @returns {number} Tổng số xu tích lũy hiện tại
 */
function api_getUserXuBalance(userName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ThongKe_TichLuyXu');
    if (!sheet) return 0;
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return 0; // Chỉ có dòng tiêu đề
    
    var userCol = 1;     // Cột 'user'
    var amountCol = 3;   // Cột 'amount_xu'
    var totalBalance = 0;
    
    var targetUser = String(userName).trim().toLowerCase();
    
    for (var i = 1; i < data.length; i++) {
      var rowUser = String(data[i][userCol]).trim().toLowerCase();
      if (rowUser === targetUser) {
        totalBalance += (Number(data[i][amountCol]) || 0);
      }
    }
    
    return totalBalance;
  } catch (e) {
    console.error('Lỗi khi tính số dư Xu của ' + userName + ': ' + e.toString());
    return 0;
  }
}

/**
 * Wrapper for google.script.run
 */
function getOperationsHealth() {
  return api_getOperationsHealth();
}

/**
 * Quét toàn bộ hệ thống trả về Cảnh Báo Vận Hành
 */
function api_getOperationsHealth() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var alerts = {
    sla: [],
    bottleneck: [],
    inventory: [],
    packingEmergency: null
  };
  
  try {
    var now = new Date();

    // 1. Quét Cảnh Báo Trễ SLA (Bảng Orders)
    var orderSheet = ss.getSheetByName('Orders');
    if (orderSheet) {
      var orderData = orderSheet.getDataRange().getValues();
      var oHeaders = orderData[0];
      var oStatusCol = oHeaders.indexOf('status');
      var oDeadlineCol = oHeaders.indexOf('deadline');
      var oCodeCol = oHeaders.indexOf('orderCode');
      var oChannelCol = oHeaders.indexOf('channel');
      var oProdCol = oHeaders.indexOf('hasProduction');
      
      var excludeStatuses = ['Completed', 'Hoàn thành', 'Cancelled', 'Đã hủy', 'Đơn Huỷ', 'Đã Bàn Giao', 'Đối Soát Thành Công', 'Hàng Hoàn', 'Đã giao', 'Delivered', 'Returned', 'Hoàn tất', 'Đã Giao', 'Đã Gửi Hàng'];

      // Bỏ qua dòng tiêu đề, lọc từ dưới lên tối đa 1000 đơn gần nhất để tối ưu tốc độ
      var scanLimit = Math.max(1, orderData.length - 1000);
      for (var i = orderData.length - 1; i >= scanLimit; i--) {
        var status = String(orderData[i][oStatusCol] || '').trim();
        if (!status || excludeStatuses.indexOf(status) === -1) { // Chưa hoàn thành
          var deadlineRaw = orderData[i][oDeadlineCol];
          if (deadlineRaw) {
            var deadline = new Date(deadlineRaw);
            if (!isNaN(deadline.getTime()) && deadline < now) {
              var channel = orderData[i][oChannelCol] || 'Trực tiếp';
              var code = orderData[i][oCodeCol] || ('D-' + i);
              var hasProd = orderData[i][oProdCol] ? 'Có sản xuất' : 'Giao thẳng';
              var hoursLate = Math.floor((now - deadline) / (1000 * 60 * 60));
              if (alerts.sla.length < 15) {
                alerts.sla.push(`[${channel}] Đơn ${code} trễ SLA ${hoursLate} tiếng. (${hasProd})`);
              }
            }
          }
        }
      }
    }

    // 2. Quét Nghẽn Khâu Sản Xuất (Bảng Production)
    var prodSheet = ss.getSheetByName('Production');
    if (prodSheet) {
      var prodData = prodSheet.getDataRange().getValues();
      var pHeaders = prodData[0];
      var p1UserCol = pHeaders.indexOf('p1_user');
      var p1StatusCol = pHeaders.indexOf('p1_status');
      var p2UserCol = pHeaders.indexOf('p2_user');
      var p2StatusCol = pHeaders.indexOf('p2_status');

      var userBacklog = {};
      
      for (var j = 1; j < prodData.length; j++) {
        var p1Status = prodData[j][p1StatusCol];
        var p1User = prodData[j][p1UserCol];
        if (p1Status === 'Pending' && p1User) {
          userBacklog[p1User] = (userBacklog[p1User] || 0) + 1;
        }

        var p2Status = prodData[j][p2StatusCol];
        var p2User = prodData[j][p2UserCol];
        if (p2Status === 'Pending' && p2User) {
          userBacklog[p2User] = (userBacklog[p2User] || 0) + 1;
        }
      }

      for (var user in userBacklog) {
        if (userBacklog[user] >= 5) { // Cảnh báo nếu ai đó ôm >= 5 tasks Pending
          alerts.bottleneck.push(`Nhân sự ${user} đang bị nghẽn: ${userBacklog[user]} tasks Pending.`);
        }
      }
    }

    // 3. Quét Lệch Kho (Bảng Products)
    var productSheet = ss.getSheetByName('Products');
    if (productSheet) {
      var productData = productSheet.getDataRange().getValues();
      var prHeaders = productData[0];
      var prQtyCol = prHeaders.indexOf('quantity');
      var prMinCol = prHeaders.indexOf('minStock');
      var prSkuCol = prHeaders.indexOf('sku');
      var prNameCol = prHeaders.indexOf('name');

      for (var k = 1; k < productData.length; k++) {
        var qty = Number(productData[k][prQtyCol]) || 0;
        var minStock = Number(productData[k][prMinCol]) || 0;
        if (qty <= minStock && minStock > 0) { // Cảnh báo khi có minStock
          var sku = productData[k][prSkuCol];
          var name = productData[k][prNameCol];
          alerts.inventory.push(`Sản phẩm ${sku} (${name}) chỉ còn ${qty}. Dưới định mức tối thiểu (${minStock}).`);
        }
      }
    }

    // 4. BỘ LỌC TỰ ĐỘNG: CẢNH BÁO ĐÓNG GÓI SAU 19:00 & GHI COMBAT LOG (TRỪ CHỦ NHẬT)
    var currentHour = now.getHours();
    var isSunday = now.getDay() === 0;
    var isAfter19 = currentHour >= 19 && !isSunday; // Ngày Chủ Nhật xưởng nghỉ -> Không kích hoạt cảnh báo SLA đóng gói
    if (isAfter19 && orderSheet) {
      var unPackedOrders = [];
      var oData = orderSheet.getDataRange().getValues();
      var oHeaders2 = oData[0];
      var oStCol = oHeaders2.indexOf('status');
      var oCdCol = oHeaders2.indexOf('orderCode');
      var oChCol = oHeaders2.indexOf('channel');

      for (var m = 1; m < oData.length; m++) {
        var chUpper = String(oData[m][oChCol] || '').toUpperCase().trim();
        if (chUpper === 'SẢN XUẤT TỒN' || chUpper === 'SẢN XUẤT BÙ KHO' || chUpper.indexOf('SẢN XUẤT TỒN') !== -1 || chUpper.indexOf('BÙ KHO') !== -1 || chUpper.indexOf('SX TỒN') !== -1) {
          continue; // Bỏ qua lệnh nội bộ xưởng sản xuất
        }

        var stUpper = String(oData[m][oStCol] || '').toUpperCase().trim();
        if (stUpper === 'SẴN SÀNG ĐÓNG GÓI' || stUpper === 'SẴN SÀNG') {
          unPackedOrders.push({
            orderCode: oData[m][oCdCol] || ('D-' + m),
            channel: oData[m][oChCol] || 'Trực tiếp'
          });
        }
      }

      if (unPackedOrders.length > 0) {
        // Tìm nhân sự phụ trách đóng gói hôm nay
        var packingStaff = 'Nguyễn Thị Diệu Hương';
        var attSheet = ss.getSheetByName('Attendance');
        var todayStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");
        if (attSheet) {
          var attData = attSheet.getDataRange().getValues();
          for (var a = 1; a < attData.length; a++) {
            var aDate = String(attData[a][2] || '');
            var aUser = String(attData[a][1] || '');
            if (aDate.indexOf(todayStr) !== -1 && (aUser.indexOf('Hương') !== -1 || aUser.indexOf('Đóng Gói') !== -1)) {
              packingStaff = aUser;
              break;
            }
          }
        }

        alerts.packingEmergency = {
          count: unPackedOrders.length,
          orders: unPackedOrders.slice(0, 10),
          staff: packingStaff,
          time: Utilities.formatDate(now, "GMT+7", "HH:mm:ss dd/MM/yyyy"),
          message: `Sau 19:00 còn ${unPackedOrders.length} đơn hàng Sẵn Sàng Đóng Gói chưa hoàn tất! Vi phạm SLA đóng gói.`
        };

        // Ghi nhận trực tiếp vào Tracking_Log (Combat Log) & BonusPenalty (Tự động phạt sau 21:00 cho Shopee VN)
        api_recordPackingViolationLog(packingStaff, unPackedOrders.length, unPackedOrders.map(function(o){ return o.orderCode; }).join(', '), unPackedOrders, ss);
      }
    }

    return { success: true, data: alerts };
  } catch (error) {
    return { success: false, message: 'Lỗi khi quét vận hành: ' + error.toString() };
  }
}

// =========================================================================
// 🛠️ TOOL DỌN DẸP: BUNG CÁC LỆNH BỊ GỘP TRỞ LẠI THÀNH CÁC LỆNH ĐỘC LẬP
// =========================================================================
function TOOL_SplitGroupedProductionTasks() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    if (!sheet) return { success: false, message: 'Không tìm thấy bảng Production' };
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var idCol = headers.indexOf('id');
    var orderIdCol = headers.indexOf('orderId');
    var noteCol = headers.indexOf('note');
    
    var newRows = [];
    var modifiedCount = 0;
    
    // Duyệt ngược từ dưới lên
    for (var i = data.length - 1; i >= 1; i--) {
      var orderIdRaw = String(data[i][orderIdCol] || '');
      var noteRaw = String(data[i][noteCol] || '');
      
      if (orderIdRaw.indexOf('|') !== -1) {
        var ids = orderIdRaw.split('|').map(function(s) { return s.trim(); }).filter(Boolean);
        if (ids.length > 1) {
          var firstOrderId = ids[0];
          var cleanNote = noteRaw.replace(/\[Gộp đơn:.*?\]/g, '').trim();
          
          sheet.getRange(i + 1, orderIdCol + 1).setValue(firstOrderId);
          sheet.getRange(i + 1, noteCol + 1).setValue(cleanNote);
          modifiedCount++;
          
          for (var j = 1; j < ids.length; j++) {
            var clonedRow = data[i].slice();
            clonedRow[idCol] = 'PROD_SPLIT_' + Date.now() + '_' + i + '_' + j;
            clonedRow[orderIdCol] = ids[j];
            clonedRow[noteCol] = 'Tách từ lệnh gộp gốc';
            newRows.push(clonedRow);
          }
        }
      }
    }
    
    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
    }
    
    return { 
      success: true, 
      message: 'Đã bung thành công ' + modifiedCount + ' nhóm lệnh thành ' + (modifiedCount + newRows.length) + ' lệnh độc lập.' 
    };
  } catch (err) {
    return { success: false, message: 'Lỗi: ' + err.message };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🚨 GHI NHẬN VI PHẠM SLA ĐÓNG GÓI SAU 19:00 & TỰ ĐỘNG PHẠT SHOPEE VN LÚC 21:00 (TRỪ CHỦ NHẬT)
// =========================================================================
function api_recordPackingViolationLog(staffName, count, orderCodes, unPackedOrders, ss) {
  try {
    ss = ss || SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    // Chủ nhật xưởng nghỉ -> Tuyệt đối không ghi nhận vi phạm hay phạt SLA đóng gói
    if (now.getDay() === 0) {
      return;
    }

    var currentHour = now.getHours();
    var todayStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");
    var timestamp = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var violationId = 'BP_SLA_PACK_' + todayStr;

    // Lọc các đơn Shopee VN chưa hoàn tất
    var shopeeOrders = (unPackedOrders || []).filter(function(o) {
      var ch = String(o.channel || '').toUpperCase();
      return ch.indexOf('SHOPEE') !== -1;
    });
    var shopeeCount = shopeeOrders.length;
    var shopeeCodes = shopeeOrders.map(function(o) { return o.orderCode; }).join(', ');

    // 1. Ghi vào BonusPenalty
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (bpSheet) {
      var bpData = bpSheet.getDataRange().getValues();
      
      // A. Nếu sau 21:00 và có đơn Shopee VN -> TỰ ĐỘNG PHẠT 20.000đ / ĐƠN
      if (currentHour >= 21 && shopeeCount > 0) {
        var autoPenaltyId = 'BP_AUTO_SHOPEE_21H_' + todayStr;
        var hasAutoPenalized = false;
        for (var p = 1; p < bpData.length; p++) {
          if (String(bpData[p][0]) === autoPenaltyId) {
            hasAutoPenalized = true;
            break;
          }
        }

        if (!hasAutoPenalized) {
          var penaltyAmount = -(shopeeCount * 20000);
          var bpHeaders = bpData[0];
          var penRow = bpHeaders.map(function(h) {
            if (h === 'id') return autoPenaltyId;
            if (h === 'user') return staffName;
            if (h === 'amount') return penaltyAmount;
            if (h === 'type') return 'Phạt Vi Phạm';
            if (h === 'note') return 'Tự động phạt sau 21:00: Tồn ' + shopeeCount + ' đơn Shopee VN chưa đóng gói. Mã đơn: ' + shopeeCodes;
            if (h === 'date') return todayStr;
            if (h === 'orderCode') return String(shopeeCodes).slice(0, 100);
            return '';
          });
          bpSheet.appendRow(penRow);
        }
      }

      // B. Ghi nhận cảnh báo vi phạm SLA sau 19:00 nếu chưa ghi hôm nay
      var isRecordedToday = false;
      for (var b = 1; b < bpData.length; b++) {
        if (String(bpData[b][0]).indexOf('BP_SLA_PACK_' + todayStr) !== -1) {
          isRecordedToday = true;
          break;
        }
      }

      if (!isRecordedToday) {
        var bpHeaders2 = bpData[0];
        var newBpRow = bpHeaders2.map(function(h) {
          if (h === 'id') return violationId;
          if (h === 'user') return staffName;
          if (h === 'amount') return 0;
          if (h === 'type') return 'Cảnh Báo SLA Đóng Gói';
          if (h === 'note') return 'Sau 19:00 còn tồn ' + count + ' đơn hàng sẵn sàng đóng gói chưa xử lý. Mã đơn: ' + orderCodes;
          if (h === 'date') return todayStr;
          if (h === 'orderCode') return String(orderCodes).slice(0, 100);
          return '';
        });
        bpSheet.appendRow(newBpRow);
      }
    }

    // 2. Ghi vào Tracking_Log (Combat Log Hệ Thống)
    var trackSheet = ss.getSheetByName('Tracking_Log');
    if (trackSheet) {
      var trackHeaders = trackSheet.getDataRange().getValues()[0];
      var actionText = currentHour >= 21 && shopeeCount > 0 
        ? ('Tự động phạt Shopee 21:00 (-' + (shopeeCount * 20000) + 'đ)')
        : 'Cảnh báo SLA Đóng Gói';
      var aiText = currentHour >= 21 && shopeeCount > 0
        ? ('Sau 21:00 tồn ' + shopeeCount + ' đơn Shopee VN. Đã tự động phạt Diệu Hương ' + (shopeeCount * 20000) + 'đ')
        : ('Sau 19:00 còn ' + count + ' đơn chưa đóng gói');

      var newTrackRow = trackHeaders.map(function(h) {
        if (h === 'Thời gian') return timestamp;
        if (h === 'Tên nhân sự') return staffName;
        if (h === 'Hoàn thành') return actionText;
        if (h === 'Hỏi AI') return aiText;
        if (h === 'Ghi chú thêm') return 'Mã đơn: ' + (shopeeCodes || orderCodes);
        return '';
      });
      trackSheet.appendRow(newTrackRow);
    }
  } catch (err) {
    Logger.log('Lỗi khi ghi nhận log vi phạm đóng gói: ' + err.toString());
  }
}

/**
 * Trigger tự động quét sau 19:00 mỗi ngày
 */
function api_auditEndOfDayPackingSLA() {
  return api_getOperationsHealth();
}

/**
 * Dọn dẹp an toàn các bản ghi cảnh báo / phạt SLA vô lý tạo vào ngày Chủ Nhật
 */
function api_cleanupSundayPackingViolations(dateStr) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var targetDate = dateStr || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
    var deletedCount = 0;
    
    // 1. Dọn dẹp trong bảng BonusPenalty
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (bpSheet) {
      var bpData = bpSheet.getDataRange().getValues();
      var bpHeaders = bpData[0];
      var idCol = bpHeaders.indexOf('id');
      var dateCol = bpHeaders.indexOf('date');
      var noteCol = bpHeaders.indexOf('note');
      
      for (var i = bpData.length - 1; i >= 1; i--) {
        var rowId = String(bpData[i][idCol] || '');
        var rowDate = String(bpData[i][dateCol] || '');
        var rowNote = String(bpData[i][noteCol] || '');
        
        var isSundayViolation = (rowId.indexOf('BP_SLA_PACK_' + targetDate) !== -1 || 
                                 rowId.indexOf('BP_AUTO_SHOPEE_21H_' + targetDate) !== -1 ||
                                 (rowDate.indexOf(targetDate) !== -1 && (rowNote.indexOf('SLA Đóng Gói') !== -1 || rowNote.indexOf('Shopee VN chưa đóng gói') !== -1)));
        if (isSundayViolation) {
          bpSheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
    }
    return { success: true, message: 'Đã dọn dẹp ' + deletedCount + ' bản ghi vi phạm SLA ngày Chủ Nhật (' + targetDate + ')' };
  } catch (e) {
    return { success: false, message: 'Lỗi dọn dẹp vi phạm Chủ Nhật: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🚨 TỰ ĐỘNG XỬ LÝ ĐƠN HOÀN QUÁ HẠN 72H (SLA 72H) — XUẤT HUỶ & PHẠT GIÁ VỐN HƯƠNG
// =========================================================================
/**
 * Quét toàn bộ đơn Hàng Hoàn trong bảng Orders:
 * Nếu quá 72 giờ chưa xử lý / đối soát:
 * 1. Chuyển status -> 'Hoàn Thành' (Đã đối soát xong)
 * 2. Đánh dấu isReconciled = true
 * 3. Ghi nhận Xuất Huỷ trong ImportExport
 * 4. Phạt đúng 100% Giá Vốn (COGS) vào BonusPenalty cho Nguyễn Thị Diệu Hương
 * 5. Ghi log vào Tracking_Log
 */
function api_auditOverdueReturnOrdersSLA(ss) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    ss = ss || SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    var todayStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");
    var timestamp = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

    var orderSheet = ss.getSheetByName('Orders');
    if (!orderSheet) return { success: false, message: 'Không tìm thấy bảng Orders' };
    
    var oData = orderSheet.getDataRange().getValues();
    var oHeaders = oData[0];
    
    var idCol = oHeaders.indexOf('id');
    var oCdCol = oHeaders.indexOf('orderCode');
    var stCol = oHeaders.indexOf('status');
    var recCol = oHeaders.indexOf('isReconciled');
    var recAtCol = oHeaders.indexOf('reconciledAt');
    var dtCol = oHeaders.indexOf('createdAt') !== -1 ? oHeaders.indexOf('createdAt') : oHeaders.indexOf('date');
    var noteCol = oHeaders.indexOf('note');
    var cogsCol = oHeaders.indexOf('cogs');
    var revCol = oHeaders.indexOf('revenue');
    var costTotCol = oHeaders.indexOf('costTotal');

    var staffName = 'Nguyễn Thị Diệu Hương';
    var overdueOrders = [];
    var bpRowsToAppend = [];
    var ieRowsToAppend = [];
    var trackRowsToAppend = [];

    // Duyệt qua các đơn hàng
    for (var i = 1; i < oData.length; i++) {
      var row = oData[i];
      var rawStatus = String(row[stCol] || '').toUpperCase().trim();
      var isReconciled = row[recCol] === true || String(row[recCol]).toUpperCase() === 'TRUE';
      
      var isReturn = (rawStatus === 'HÀNG HOÀN' || rawStatus.indexOf('HOÀN CHỜ XỬ') !== -1 || rawStatus.indexOf('KIỂM HÀNG HOÀN') !== -1) && !isReconciled;
      if (!isReturn) continue;

      // Xác định thời gian nhận hoàn / tạo đơn
      var returnTimeRaw = row[recAtCol] || row[dtCol];
      if (!returnTimeRaw) continue;

      var returnDate = new Date(returnTimeRaw);
      if (isNaN(returnDate.getTime())) continue;

      var hoursPassed = (now.getTime() - returnDate.getTime()) / (1000 * 60 * 60);
      if (hoursPassed >= 72) {
        var orderId = String(row[idCol]);
        var orderCode = String(row[oCdCol] || orderId);
        
        // Tính giá vốn COGS
        var cogs = Number(row[cogsCol]) || Number(row[costTotCol]) || Math.round((Number(row[revCol]) || 0) * 0.5);
        if (cogs <= 0) cogs = 150000;

        // Cập nhật trạng thái đơn trên Sheet
        orderSheet.getRange(i + 1, stCol + 1).setValue('Hoàn Thành');
        if (recCol !== -1) orderSheet.getRange(i + 1, recCol + 1).setValue(true);
        if (recAtCol !== -1) orderSheet.getRange(i + 1, recAtCol + 1).setValue(timestamp);
        
        var oldNote = String(row[noteCol] || '');
        var newNote = '[XUẤT HUỶ - QUÁ HẠN 72H - TRỪ GIÁ VỐN HƯƠNG: -' + cogs.toLocaleString('vi-VN') + 'đ] ' + oldNote;
        if (noteCol !== -1) orderSheet.getRange(i + 1, noteCol + 1).setValue(newNote);

        overdueOrders.push({
          id: orderId,
          orderCode: orderCode,
          cogs: cogs,
          hoursPassed: Math.round(hoursPassed)
        });

        // Tạo bản ghi phạt BonusPenalty
        var bpId = 'BP_OVERDUE_72H_' + orderCode + '_' + todayStr;
        bpRowsToAppend.push([
          bpId,
          staffName,
          -Math.abs(cogs),
          'Phạt Vi Phạm',
          '[PHẠT SLA 72H] Quá hạn 72h không khiếu nại/xử lý đơn hoàn #' + orderCode + ' - Trừ 100% Giá Vốn (COGS)',
          todayStr,
          orderCode
        ]);

        // Tạo bản ghi xuất huỷ ImportExport
        var ieId = 'IE_SCRAP_72H_' + Date.now() + '_' + i;
        ieRowsToAppend.push([
          ieId,
          'Xuất Huỷ',
          'Xuất Huỷ Hàng Hoàn Quá 72H',
          cogs,
          timestamp,
          'Xuất huỷ do quá hạn khiếu nại 72h - Đơn #' + orderCode + ' - Trách nhiệm: Nguyễn Thị Diệu Hương',
          JSON.stringify([{ name: 'Hàng hoàn đơn ' + orderCode, qty: 1, price: cogs }])
        ]);

        // Ghi log Tracking_Log
        trackRowsToAppend.push([
          timestamp,
          staffName,
          'Tự động xuất huỷ & Phạt Giá Vốn quá hạn 72H (-' + cogs.toLocaleString('vi-VN') + 'đ)',
          'Đơn #' + orderCode + ' quá 72h chưa xử lý (đã trôi ' + Math.round(hoursPassed) + 'h). Tự động duyệt hoàn thành, xuất huỷ kho và phạt giá vốn Diệu Hương.',
          'Mã đơn: ' + orderCode + ' | COGS: ' + cogs
        ]);
      }
    }

    // Ghi hàng loạt (Batch append)
    if (bpRowsToAppend.length > 0) {
      var bpSheet = ss.getSheetByName('BonusPenalty');
      if (bpSheet) {
        var bpHeaders = bpSheet.getDataRange().getValues()[0];
        var mappedBpRows = bpRowsToAppend.map(function(r) {
          return bpHeaders.map(function(h) {
            if (h === 'id') return r[0];
            if (h === 'user') return r[1];
            if (h === 'amount') return r[2];
            if (h === 'type') return r[3];
            if (h === 'note') return r[4];
            if (h === 'date') return r[5];
            if (h === 'orderCode') return r[6];
            return '';
          });
        });
        bpSheet.getRange(bpSheet.getLastRow() + 1, 1, mappedBpRows.length, bpHeaders.length).setValues(mappedBpRows);
      }
    }

    if (ieRowsToAppend.length > 0) {
      var ieSheet = ss.getSheetByName('ImportExport');
      if (ieSheet) {
        var ieHeaders = ieSheet.getDataRange().getValues()[0];
        var mappedIeRows = ieRowsToAppend.map(function(r) {
          return ieHeaders.map(function(h) {
            if (h === 'id') return r[0];
            if (h === 'type') return r[1];
            if (h === 'target') return r[2];
            if (h === 'totalAmount') return r[3];
            if (h === 'date') return r[4];
            if (h === 'note') return r[5];
            if (h === 'itemsData') return r[6];
            return '';
          });
        });
        ieSheet.getRange(ieSheet.getLastRow() + 1, 1, mappedIeRows.length, ieHeaders.length).setValues(mappedIeRows);
      }
    }

    if (trackRowsToAppend.length > 0) {
      var trackSheet = ss.getSheetByName('Tracking_Log');
      if (trackSheet) {
        var trackHeaders = trackSheet.getDataRange().getValues()[0];
        var mappedTrackRows = trackRowsToAppend.map(function(r) {
          return trackHeaders.map(function(h) {
            if (h === 'Thời gian') return r[0];
            if (h === 'Tên nhân sự') return r[1];
            if (h === 'Hoàn thành') return r[2];
            if (h === 'Hỏi AI') return r[3];
            if (h === 'Ghi chú thêm') return r[4];
            return '';
          });
        });
        trackSheet.getRange(trackSheet.getLastRow() + 1, 1, mappedTrackRows.length, trackHeaders.length).setValues(mappedTrackRows);
      }
    }

    if (overdueOrders.length > 0) {
      try {
        var msg = '🚨 Đã tự động xử lý ' + overdueOrders.length + ' đơn hoàn quá hạn 72h khiếu nại sàn:\n' +
                  overdueOrders.map(function(o, idx) {
                    return (idx + 1) + '. Đơn ' + o.orderCode + ' (' + o.channel + ') - Giá vốn: ' + (Number(o.cogs) || 0).toLocaleString('vi-VN') + 'đ';
                  }).join('\n') + '\n👉 Đã xuất huỷ kho & ghi nhận trừ giá vốn nhân sự phụ trách.';
        sendSystemAlert('CẢNH BÁO HÀNG HOÀN 72H', msg);
      } catch (notifErr) { console.error('Lỗi bắn thông báo hoàn 72h:', notifErr); }
    }

    return {
      success: true,
      processedCount: overdueOrders.length,
      orders: overdueOrders,
      message: 'Đã tự động xử lý ' + overdueOrders.length + ' đơn hoàn quá hạn 72h!'
    };
  } catch (err) {
    return { success: false, message: 'Lỗi kiểm tra đơn hoàn 72h: ' + err.message };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// MODULE: ZALO GROUP NOTIFICATION WEBHOOK
// =========================================================================

function api_saveZaloWebhookConfig(cfg) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var props = PropertiesService.getScriptProperties();
    if (cfg && cfg.botToken !== undefined) props.setProperty('ZALO_BOT_TOKEN', String(cfg.botToken).trim());
    if (cfg && cfg.chatId !== undefined) props.setProperty('ZALO_CHAT_ID', String(cfg.chatId).trim());
    if (cfg && cfg.webhookUrl !== undefined) props.setProperty('ZALO_WEBHOOK_URL', String(cfg.webhookUrl).trim());
    if (cfg && cfg.isEnabled !== undefined) props.setProperty('ZALO_NOTIF_ENABLED', String(cfg.isEnabled));
    if (cfg && cfg.groupName !== undefined) props.setProperty('ZALO_GROUP_NAME', String(cfg.groupName).trim());
    return { success: true, message: 'Đã lưu cấu hình Zalo Bot thành công!' };
  } catch (e) {
    return { success: false, message: 'Lỗi lưu cấu hình: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function api_getZaloWebhookConfig() {
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    return {
      success: true,
      botToken: props['ZALO_BOT_TOKEN'] || '',
      chatId: props['ZALO_CHAT_ID'] || '',
      webhookUrl: props['ZALO_WEBHOOK_URL'] || '',
      isEnabled: props['ZALO_NOTIF_ENABLED'] !== 'false',
      groupName: props['ZALO_GROUP_NAME'] || 'Xưởng Rich Fish'
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function sendZaloNotification(title, message, customChatId) {
  try {
    var props = PropertiesService.getScriptProperties();
    var botToken = props.getProperty('ZALO_BOT_TOKEN') || '';
    var webhookUrl = props.getProperty('ZALO_WEBHOOK_URL') || '';
    var isEnabled = props.getProperty('ZALO_NOTIF_ENABLED');
    var defaultChatId = props.getProperty('ZALO_CHAT_ID') || props.getProperty('ZALO_GROUP_ID') || '';
    var chatId = customChatId || defaultChatId;
    
    if (isEnabled === 'false') {
      return { success: false, reason: 'Đang tắt thông báo Zalo' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var fullContent = '🔔 【' + (title || 'RF WORKSPACE PRO') + '】\n' +
                      '⏰ ' + timeStr + '\n' +
                      '-------------------------\n' +
                      message;
    
    var finalUrl = webhookUrl.trim();
    if (botToken) {
      finalUrl = 'https://bot-api.zaloplatforms.com/bot' + botToken.trim() + '/sendMessage';
    } else if (finalUrl.indexOf('zaloplatforms.com') !== -1) {
      if (finalUrl.indexOf('/setWebhook') !== -1) {
        finalUrl = finalUrl.replace('/setWebhook', '/sendMessage');
      } else if (!finalUrl.endsWith('/sendMessage')) {
        finalUrl = finalUrl.replace(/\/+$/, '') + '/sendMessage';
      }
    }
    
    if (!finalUrl) {
      return { success: false, reason: 'Chưa cấu hình Zalo Bot Token hoặc Webhook URL' };
    }
    
    var payload = {
      chat_id: chatId,
      group_id: chatId,
      text: fullContent,
      message: fullContent
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(finalUrl, options);
    var resText = res.getContentText();
    console.log('Zalo API Response:', resText);
    return { success: true, response: resText };
  } catch (e) {
    console.error('Lỗi sendZaloNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testZaloNotification() {
  return sendZaloNotification('TEST KẾT NỐI ZALO BOT', '✅ Kết nối thành công! Hệ điều hành RF_Workspace_Pro đã sẵn sàng bắn thông báo tự động vào nhóm Zalo xưởng.');
}

// =========================================================================
// MODULE: TELEGRAM BOT NOTIFICATION (MIỄN PHÍ 100% VĨNH VIỄN)
// =========================================================================

function api_saveTelegramConfig(cfg) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var props = PropertiesService.getScriptProperties();
    if (cfg && cfg.botToken !== undefined) props.setProperty('TELEGRAM_BOT_TOKEN', String(cfg.botToken).trim());
    if (cfg && cfg.chatId !== undefined) props.setProperty('TELEGRAM_CHAT_ID', String(cfg.chatId).trim());
    if (cfg && cfg.isEnabled !== undefined) props.setProperty('TELEGRAM_NOTIF_ENABLED', String(cfg.isEnabled));
    return { success: true, message: 'Đã lưu cấu hình Telegram Bot thành công!' };
  } catch (e) {
    return { success: false, message: 'Lỗi lưu cấu hình Telegram: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function api_getTelegramConfig() {
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    return {
      success: true,
      botToken: props['TELEGRAM_BOT_TOKEN'] || '',
      chatId: props['TELEGRAM_CHAT_ID'] || '',
      isEnabled: props['TELEGRAM_NOTIF_ENABLED'] !== 'false'
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function sendTelegramNotification(title, message, customChatId) {
  try {
    var props = PropertiesService.getScriptProperties();
    var botToken = props.getProperty('TELEGRAM_BOT_TOKEN') || '';
    var defaultChatId = props.getProperty('TELEGRAM_CHAT_ID') || '';
    var isEnabled = props.getProperty('TELEGRAM_NOTIF_ENABLED');
    var chatId = customChatId || defaultChatId;
    
    if (isEnabled === 'false') {
      return { success: false, reason: 'Đang tắt thông báo Telegram' };
    }
    
    if (!botToken || !chatId) {
      return { success: false, reason: 'Chưa cấu hình Telegram Bot Token hoặc Chat ID' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var fullContent = '🔔 *' + (title || 'RF WORKSPACE PRO') + '*\n' +
                      '⏰ `' + timeStr + '`\n' +
                      '━━━━━━━━━━━━━━━━━━━\n' +
                      message;
    
    var url = 'https://api.telegram.org/bot' + botToken.trim() + '/sendMessage';
    var payload = {
      chat_id: chatId,
      text: fullContent,
      parse_mode: 'Markdown'
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(url, options);
    var resText = res.getContentText();
    console.log('Telegram API Response:', resText);
    return { success: true, response: resText };
  } catch (e) {
    console.error('Lỗi sendTelegramNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testTelegramNotification() {
  return sendTelegramNotification('TEST KẾT NỐI TELEGRAM BOT', '✅ *Kết nối thành công!*\nHệ điều hành `RF_Workspace_Pro` đã sẵn sàng bắn thông báo tự động vào nhóm của bạn.');
}

// =========================================================================
// MODULE: GOOGLE CHAT SPACE WEBHOOK (MIỄN PHÍ 100% TRONG GMAIL/GOOGLE CHAT)
// =========================================================================

function api_saveGoogleChatConfig(cfg) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var props = PropertiesService.getScriptProperties();
    if (cfg && cfg.webhookUrl !== undefined) props.setProperty('GOOGLE_CHAT_WEBHOOK_URL', String(cfg.webhookUrl).trim());
    if (cfg && cfg.isEnabled !== undefined) props.setProperty('GOOGLE_CHAT_NOTIF_ENABLED', String(cfg.isEnabled));
    return { success: true, message: 'Đã lưu cấu hình Google Chat Webhook thành công!' };
  } catch (e) {
    return { success: false, message: 'Lỗi lưu cấu hình Google Chat: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function api_getGoogleChatConfig() {
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    return {
      success: true,
      webhookUrl: props['GOOGLE_CHAT_WEBHOOK_URL'] || '',
      isEnabled: props['GOOGLE_CHAT_NOTIF_ENABLED'] !== 'false'
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function sendGoogleChatNotification(title, message) {
  try {
    var props = PropertiesService.getScriptProperties();
    var webhookUrl = props.getProperty('GOOGLE_CHAT_WEBHOOK_URL') || '';
    var isEnabled = props.getProperty('GOOGLE_CHAT_NOTIF_ENABLED');
    
    if (isEnabled === 'false') {
      return { success: false, reason: 'Đang tắt thông báo Google Chat' };
    }
    
    if (!webhookUrl) {
      return { success: false, reason: 'Chưa cấu hình Google Chat Webhook URL' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var fullContent = '🔔 *【' + (title || 'RF WORKSPACE PRO') + '】*\n' +
                      '⏰ `' + timeStr + '`\n' +
                      '━━━━━━━━━━━━━━━━━━━\n' +
                      message;
    
    var payload = {
      text: fullContent
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json; charset=UTF-8',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(webhookUrl, options);
    var resText = res.getContentText();
    console.log('Google Chat API Response:', resText);
    return { success: true, response: resText };
  } catch (e) {
    console.error('Lỗi sendGoogleChatNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testGoogleChatNotification() {
  return sendGoogleChatNotification('TEST KẾT NỐI GOOGLE CHAT', '✅ *Kết nối thành công!*\nHệ điều hành `RF_Workspace_Pro` đã sẵn sàng bắn thông báo tự động vào Không Gian Google Chat của xưởng.');
}

// =========================================================================
// MODULE: NTFY.SH PUSH NOTIFICATION (MIỄN PHÍ 100%, KHÔNG CẦN TÀI KHOẢN)
// =========================================================================

function sendNtfyNotification(title, message, topic) {
  try {
    var props = PropertiesService.getScriptProperties();
    var targetTopic = topic || props.getProperty('NTFY_TOPIC') || 'rfworkspace';
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var fullContent = (title ? '🔔 【' + title + '】\n' : '') + message + '\n⏰ ' + timeStr;
    
    var safeTitle = title || 'RF Workspace Pro';
    var encodedTitle = '=?UTF-8?B?' + Utilities.base64Encode(safeTitle, Utilities.Charset.UTF_8) + '?=';
    
    var url = 'https://ntfy.sh/' + encodeURIComponent(targetTopic.trim());
    var options = {
      method: 'post',
      contentType: 'text/plain; charset=UTF-8',
      payload: fullContent,
      headers: {
        'Title': encodedTitle,
        'Priority': 'high',
        'Tags': 'bell,package'
      },
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(url, options);
    var resText = res.getContentText();
    console.log('ntfy.sh API Response:', resText);
    return { success: true, response: resText };
  } catch (e) {
    console.error('Lỗi sendNtfyNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testNtfyNotification(topic) {
  return sendNtfyNotification('TEST THÔNG BÁO RF WORKSPACE', '✅ Kết nối thành công! Thiết bị của bạn đã sẵn sàng nhận thông báo đơn hàng và sản xuất tức thì.', topic);
}

// =========================================================================
// MODULE: DISCORD WEBHOOK (MIỄN PHÍ 100% TRỌN ĐỜI)
// =========================================================================

function sendDiscordNotification(title, message, customUrl) {
  try {
    var props = PropertiesService.getScriptProperties();
    var webhookUrl = customUrl || props.getProperty('DISCORD_WEBHOOK_URL') || '';
    
    if (!webhookUrl) {
      return { success: false, reason: 'Chưa cấu hình Discord Webhook URL' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var payload = {
      username: "Rich Fish Workspace",
      avatar_url: "https://i.postimg.cc/TYD5NncZ/icon.png",
      embeds: [
        {
          title: "🔔 " + (title || "RF WORKSPACE PRO"),
          description: message,
          color: 13938487, // Gold #d4af37
          footer: { text: "Rich Fish Aquarium • " + timeStr }
        }
      ]
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(webhookUrl, options);
    return { success: true, response: res.getContentText() };
  } catch (e) {
    console.error('Lỗi sendDiscordNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testDiscordNotification(webhookUrl) {
  return sendDiscordNotification('TEST KẾT NỐI DISCORD', '✅ **Kết nối thành công!**\nHệ điều hành `RF_Workspace_Pro` đã sẵn sàng bắn thông báo tự động vào Server Discord của xưởng.', webhookUrl);
}

/**
 * Hàm bắn thông báo tổng hợp (Đa kênh: ntfy, Discord, Google Chat, Telegram, Zalo)
 */
function sendSystemAlert(title, message) {
  var results = {};
  try { results.ntfy = sendNtfyNotification(title, message); } catch (e) { results.ntfy = { success: false, error: e.toString() }; }
  try { results.discord = sendDiscordNotification(title, message); } catch (e) { results.discord = { success: false, error: e.toString() }; }
  try { results.googleChat = sendGoogleChatNotification(title, message); } catch (e) { results.googleChat = { success: false, error: e.toString() }; }
  try { results.telegram = sendTelegramNotification(title, message); } catch (e) { results.telegram = { success: false, error: e.toString() }; }
  try { results.zalo = sendZaloNotification(title, message); } catch (e) { results.zalo = { success: false, error: e.toString() }; }
  return results;
}

