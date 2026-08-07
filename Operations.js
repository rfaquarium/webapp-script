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
  try {
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
    var monthStr = new Date().toISOString().slice(0, 7);
    var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var eMonth = new Date(); eMonth.setMonth(eMonth.getMonth() + 1); eMonth.setDate(0);
    var endTimeStr = eMonth.toISOString().slice(0, 10) + ' 23:59:59';
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
  }
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
      
      var excludeStatuses = ['Completed', 'Hoàn thành', 'Cancelled', 'Đã hủy'];

      // Bỏ qua dòng tiêu đề, lọc từ dưới lên tối đa 1000 đơn gần nhất để tối ưu tốc độ
      var scanLimit = Math.max(1, orderData.length - 1000);
      for (var i = orderData.length - 1; i >= scanLimit; i--) {
        var status = orderData[i][oStatusCol];
        if (excludeStatuses.indexOf(status) === -1) { // Chưa hoàn thành
          var deadlineRaw = orderData[i][oDeadlineCol];
          if (deadlineRaw) {
            var deadline = new Date(deadlineRaw);
            if (deadline < now) {
              var channel = orderData[i][oChannelCol];
              var code = orderData[i][oCodeCol];
              var hasProd = orderData[i][oProdCol] ? 'Có sản xuất' : 'Giao thẳng';
              var hoursLate = Math.floor((now - deadline) / (1000 * 60 * 60));
              alerts.sla.push(`[${channel}] Đơn ${code} trễ SLA ${hoursLate} tiếng. (Loại: ${hasProd})`);
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
