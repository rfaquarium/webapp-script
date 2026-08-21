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
    inventory: []
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
