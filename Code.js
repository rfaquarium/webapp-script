var SCHEMA = {
  Orders: ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'],
  Production: ['id', 'orderId', 'type', 'name', 'note', 'status', 'deadline', 'fulfilledFromStock', 'p1_name', 'p1_status', 'p1_user', 'p1_start', 'p1_endTime', 'p1_photo', 'p1_reward_vnd', 'p2_name', 'p2_status', 'p2_user', 'p2_start', 'p2_endTime', 'p2_photo', 'p2_reward_vnd', 'qc_front_photo', 'qc_side_photo', 'qc_status', 'qc_note'],
  Packings: ['id', 'orderId', 'user', 'start', 'end', 'endTime', 'status', 'photo', 'reward_vnd', 'photoBefore'],
  Attendance: ['id', 'user', 'date', 'morningIn', 'morningOut', 'afternoonIn', 'afternoonOut', 'leaveType', 'leaveReportAt', 'shift', 'timeIn', 'timeOut', 'totalHours', 'status', 'penalty', 'isEdited', 'leaveStart', 'leaveEnd', 'note'],
  Documents: ['id', 'category', 'title', 'description', 'link', 'createdAt', 'createdBy', 'attachments', 'testLink', 'readBy'],
  Trainings: ['id', 'title', 'content', 'targetRole', 'createdAt', 'createdBy', 'readUsers'],
  Models3D: ['id', 'name', 'url', 'createdAt', 'createdBy', 'productId', 'materials'],
  Reimbursements: ['id', 'staffName', 'reason', 'amount', 'qrCodeUrl', 'status', 'createdAt'],
  Monthly_Snapshots: ['id', 'month', 'user', 'totalSalary', 'totalHours', 'totalAdvance', 'totalDebt', 'createdAt', 'snapshotData'],
  Config_NhanSu: ['Tên Nhân Sự', 'ID Ảnh', 'Chức Danh', 'Chức Danh Phụ', 'Phân Quyền', 'Mã PIN', 'Lương Cơ Bản', 'Lương Chức Vụ', 'Phụ Cấp Xăng Xe', 'Khoản Trừ Vi Phạm', 'id'],
  Tracking_Log: ['Thời gian', 'Tên nhân sự', 'Hoàn thành', 'Hỏi AI', 'Ghi chú thêm']
};

var SCHEMA_ERP = {
  Products: ['id', 'sku', 'name', 'unit', 'image', 'category', 'sub_category', 'costPrice', 'price', 'quantity', 'minStock', 'maxStock', 'realImage', 'importUnit', 'conversionRate', 'model3D'],
  Accounts: ['id', 'accountName', 'balance', 'type', 'accountNumber', 'accountOwner'],
  Suppliers: ['id', 'name', 'phone', 'totalDebt', 'category', 'note'],
  Transactions: ['id', 'type', 'category', 'amount', 'fromAccount', 'toAccount', 'title', 'date', 'note', 'isAuto'],
  ImportExport: ['id', 'type', 'target', 'totalAmount', 'date', 'note', 'itemsData'],
  ProfitReports: ['id', 'period', 'channel', 'revenue', 'orderCount', 'platformFee', 'returns', 'discount', 'ads', 'cogs', 'salary', 'operation'],
  BonusPenalty: ['id', 'user', 'amount', 'type', 'note', 'date', 'orderCode'],
  KPI_Progress: ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'guide'],
  PurchasedServices: ['id', 'invoiceCode', 'supplier', 'taxCode', 'category', 'date', 'amount', 'payer', 'paymentMethod', 'note', 'expiryDate', 'createdAt', 'createdBy'],
  BOM_Config: ['id', 'layoutCode', 'materialSku', 'defaultQty', 'unit'],
  Monthly_Snapshots: ['id', 'month', 'user', 'totalSalary', 'totalHours', 'totalAdvance', 'totalDebt', 'createdAt', 'snapshotData'],
  Config_KPI: ['id', 'Nhóm Hàng', 'Từ Khoá', 'Tên Hàng', 'Thời gian Khâu 1', 'Tiền Khâu 1', 'Thời gian Khâu 2', 'Tiền Khâu 2', 'Thời gian Đóng Gói', 'Thưởng Đóng Gói', 'Thưởng Chở Kho'],
  CTV_Finance: ['id', 'date', 'type', 'amount', 'note', 'user', 'status'],
  Config_GiaLayout: ['Size_Max', 'Do_Chi_Tiet', 'He_So_Gia', 'Phi_Gui_Xuong', 'Phi_Gan_Reu']
};

function doGet(e) {
  // Hỗ trợ API cho Expo App qua phương thức GET để tránh lỗi CORS trên Web Browser
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter);
  }



  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('RF Workspace Pro')
    .setFaviconUrl('https://i.postimg.cc/TYD5NncZ/icon.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// =========================================================================
// HỆ THỐNG API CHO ỨNG DỤNG EXPO (REACT NATIVE)
// =========================================================================
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    return handleApiRequest(payload);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Lỗi Server: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleApiRequest(payload) {
  try {
    var action = payload.action;
    var response = { success: false, data: null, message: '' };

    if (action === 'validatePin') {
      var pin = payload.pin;
      var result = validatePin(pin);
      if (result && result.valid) {
        response.success = true;
        response.data = result;
      } else {
        response.message = 'Mã PIN không hợp lệ!';
      }
    }
    else if (action === 'getAppData') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response.success = true;
        response.data = getAppData(pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getArchivedData') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response.success = true;
        response.data = getArchivedData(pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'syncDeltas') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        var lock = LockService.getScriptLock();
        try {
          lock.waitLock(15000); // Đợi 15s để lấy quyền truy cập độc quyền
          response.success = true;
          var deltaPayload = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
          response.data = syncDeltas(deltaPayload, pin);
        } catch (e) {
          response.message = 'Hệ thống đang quá tải, vui lòng thử lại sau vài giây! Lỗi: ' + e.message;
        } finally {
          lock.releaseLock();
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'syncBank') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = syncBIDVEmails();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'deductInventoryBOM') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = processMaterialDeduction(payload.prodId, payload.materialUsageData);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'processCascadeCancelOrder') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = processCascadeCancelOrder(payload.orderId, payload.isHandedOver || payload.isReturned);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'checkAndAutoForwardOrder') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = checkAndAutoForwardOrder(payload.orderId);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'processAutoAllocation' || action === 'autoAllocateOrders') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = processAutoAllocation(payload.orderId);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'processRcaResolver') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = processRcaResolver(payload);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'saveUserPushSubscription') {
      var pushData = typeof payload.data === 'string' ? JSON.parse(payload.data) : (payload.data || payload);
      response = saveUserPushSubscription(pushData);
    }
    else if (action === 'api_insertManualKPI' || action === 'insertManualKPI') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_insertManualKPI(payload.data || payload);
      } else {
        response = api_insertManualKPI(payload);
      }
    }
    else if (action === 'api_syncMasterPayroll' || action === 'syncMasterPayroll') {
      response = api_syncMasterPayroll(payload.data || payload);
    }
    else if (action === 'generateMonthlySnapshot') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = generateMonthlySnapshot(payload.monthStr);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'approveQC') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = processQCApproval(payload.prodId, auth.user);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'generateMonthlyKPI_All') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_generateMonthlyKPI_All(payload.allStatsMap);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getOperationsHealth') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getOperationsHealth();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'uploadImage' || action === 'uploadQCImage') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response.success = true;
        response.data = uploadImage(payload.base64Data || payload.data || payload.b64, payload.fileName);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getDashboardErrors') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getDashboardErrors();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'autoCalculateGlassTankBOM' || action === 'autoCalculateGlassTankBOM_Dual') {
      response = autoCalculateGlassTankBOM_Dual();
    }
    else {
      response.message = 'Action không hợp lệ: ' + (action || 'null');
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Lỗi API: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  var content = HtmlService.createTemplateFromFile(filename).getRawContent();
  if (!content) return '';
  content = content.replace(/\0/g, '')
    .replace(/[\uFEFF\uFFFE]/g, '')
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\/script>/gi, '');
  return content;
}

// =========================================================================
// NEW ARCHITECTURE LOGIC: BOM, SLA, LEDGER, QC
// =========================================================================



function checkAndAutoForwardOrder(orderId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var orderSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Production');
    if (!orderSheet || !prodSheet) return { success: false, message: 'Bảng dữ liệu không tồn tại!' };

    var prodData = prodSheet.getDataRange().getValues();
    var pHeaders = prodData[0];
    var pOrderIdCol = pHeaders.indexOf('orderId');
    var pStatusCol = pHeaders.indexOf('status');
    var pStockCol = pHeaders.indexOf('fulfilledFromStock');

    var childProds = [];
    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][pOrderIdCol]).trim() === String(orderId).trim()) {
        var rawStatus = String(prodData[i][pStatusCol] || '').trim();
        var statusUpper = rawStatus.toUpperCase();
        if (statusUpper === 'HỦY/VỠ' || statusUpper === 'HỦY / VỠ' || statusUpper === 'HUỶ/VỠ' || statusUpper === 'HUỶ / VỠ' ||
            statusUpper === 'ĐÃ HUỶ' || statusUpper === 'ĐÃ HỦY' || statusUpper === 'HỦY' || statusUpper === 'HUỶ' ||
            statusUpper.indexOf('HỦY') > -1 || statusUpper.indexOf('HUỶ') > -1) {
          continue;
        }
        var isStock = prodData[i][pStockCol] === true || String(prodData[i][pStockCol]).toUpperCase() === 'TRUE';
        childProds.push({
          status: statusUpper,
          fulfilledFromStock: isStock
        });
      }
    }

    if (childProds.length === 0) return { success: false, message: 'Đơn hàng không chứa lệnh sản xuất nào hợp lệ.' };

    var isAllCompleted = childProds.every(function (p) {
      return p.status === 'DONE' || p.status === 'ĐÃ XONG' || p.status === 'HOÀN KHO ĐẠT' || p.fulfilledFromStock === true;
    });

    if (isAllCompleted) {
      var orderData = orderSheet.getDataRange().getValues();
      var oHeaders = orderData[0];
      var oIdCol = oHeaders.indexOf('id');
      var oStatusCol = oHeaders.indexOf('status');

      for (var o = 1; o < orderData.length; o++) {
        if (String(orderData[o][oIdCol]).trim() === String(orderId).trim()) {
          var currentStatus = String(orderData[o][oStatusCol] || '').trim();
          if (['Chờ Sản Xuất', 'Đang Sản Xuất', 'Quét Tự Động'].indexOf(currentStatus) > -1) {
            orderSheet.getRange(o + 1, oStatusCol + 1).setValue('Sẵn sàng đóng gói');
            return { success: true, message: 'Đã tự động chuyển đơn ' + orderId + ' ➔ Sẵn sàng đóng gói' };
          }
          break;
        }
      }
    }

    return { success: true, message: 'Đơn hàng chưa đủ điều kiện chuyển trạng thái.' };

  } catch (err) {
    return { success: false, message: 'Lỗi Auto-Forward SLA: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function processQCApproval(prodId, approverName) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    var statusCol = headers.indexOf('qc_status');
    var noteCol = headers.indexOf('qc_note');
    if (idCol === -1 || statusCol === -1) return { success: false, message: 'Thiếu cột schema' };
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(prodId)) {
        sheet.getRange(i + 1, statusCol + 1).setValue('Passed');
        if (noteCol !== -1) {
          var oldNote = String(data[i][noteCol] || '');
          var newNote = oldNote ? (oldNote + '\n[Duyệt bởi: ' + approverName + ']') : ('[Duyệt bởi: ' + approverName + ']');
          sheet.getRange(i + 1, noteCol + 1).setValue(newNote);
        }
        return { success: true, message: 'Đã duyệt QC' };
      }
    }
    return { success: false, message: 'Không tìm thấy ID sản xuất' };
  } catch (err) {
    return { success: false, message: 'Lỗi duyệt QC: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Quét bảng KPI_Progress, tính tổng tiền giải ngân cho quỹ [PHAT_TRIEN]
 * @param {string} monthStr - Chuỗi tháng định dạng 'YYYY-MM' (VD: '2026-08')
 * @param {string} userName - Tên nhân sự (tùy chọn, để trống sẽ tính cho toàn cty)
 * @returns {number|object} Tổng tiền, hoặc Object map theo user.
 */
function calculateDynamicPositionSalary(monthStr, userName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('KPI_Progress');
  if (!sheet) return 0;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return 0;

  const h = data[0];
  const userCol = h.indexOf('user');
  const kpiNameCol = h.indexOf('kpiName');
  const rewardCol = h.indexOf('reward');
  const isClaimedCol = h.indexOf('isClaimed');
  const endTimeCol = h.indexOf('endTime');

  let userTotals = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (userName && row[userCol] !== userName) continue;
    if (String(row[kpiNameCol] || '').indexOf('[PHAT_TRIEN]') !== 0) continue;

    // Điều kiện: Đã hoàn thành/Nhận
    const claimed = row[isClaimedCol];
    if (claimed !== true && String(claimed).toLowerCase() !== 'true') continue;

    // Điều kiện: Thuộc tháng chốt lương (dựa vào endTime)
    const endTime = new Date(row[endTimeCol]);
    if (isNaN(endTime.getTime())) continue;

    const rowMonthStr = endTime.getFullYear() + '-' + String(endTime.getMonth() + 1).padStart(2, '0');
    if (rowMonthStr === monthStr) {
      const u = row[userCol];
      userTotals[u] = (userTotals[u] || 0) + (Number(row[rewardCol]) || 0);
    }
  }

  return userName ? (userTotals[userName] || 0) : userTotals;
}

function calculateBusinessHoursSLA(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  var start = new Date(startStr);
  var end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return 0;

  var totalMin = 0;
  var cur = new Date(start.getTime());

  while (cur < end) {
    var h = cur.getHours();
    var d = cur.getDay();

    if (d === 0) { // Chủ nhật
      cur.setHours(24, 0, 0, 0);
      continue;
    }
    if (h < 8) {
      cur.setHours(8, 0, 0, 0);
      continue;
    }
    if (h >= 17) {
      cur.setHours(24, 0, 0, 0);
      continue;
    }

    var nextBreak = new Date(cur.getTime());
    nextBreak.setHours(17, 0, 0, 0);

    var endOfPeriod = (end < nextBreak) ? end : nextBreak;
    var diffMin = Math.floor((endOfPeriod.getTime() - cur.getTime()) / 60000);
    totalMin += diffMin;

    cur = new Date(endOfPeriod.getTime());
  }
  return totalMin;
}

// =========================================================================
// API ĐỒNG BỘ LƯƠNG TẬP TRUNG (CLIENT-SERVER PAYROLL SYNC)
// =========================================================================
function api_syncMasterPayroll(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận đồng bộ dữ liệu lương, vui lòng thử lại sau.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var p = payload || {};
    if (payload && payload.data) p = payload.data;

    var monthStr = p.monthStr || p.filterMonth || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM");

    // 1. KÍCH HOẠT TỰ ĐỘNG KHÓA SỔ LƯƠNG (FREEZE PAYROLL) KHI ĐÃ TRẢ / ĐÃ CHỐT
    var snapSheet = ss.getSheetByName('Monthly_Snapshots');
    if (snapSheet) {
      var existingSnaps = readSheet('Monthly_Snapshots', function (s) { return s.month === monthStr; }, ss);
      if (existingSnaps.length > 0) {
        var targetUsers = [];
        if (p.BonusPenalty_Updates) p.BonusPenalty_Updates.forEach(function (b) { if (b.user && targetUsers.indexOf(b.user) === -1) targetUsers.push(b.user); });
        if (p.Attendance_Updates) p.Attendance_Updates.forEach(function (a) { if (a.user && targetUsers.indexOf(a.user) === -1) targetUsers.push(a.user); });

        var isLocked = existingSnaps.some(function (s) {
          return targetUsers.length === 0 || targetUsers.indexOf(s.user) !== -1;
        });
        if (isLocked) {
          return { success: false, message: '🔒 Dữ liệu lương tháng ' + monthStr + ' đã Khóa Sổ / Đã Trả. Hệ thống tự động chặn mọi quyền chỉnh sửa!' };
        }
      }
    }

    // 2. GHI NHẬN THAY ĐỔI DỮ LIỆU
    if (p.BonusPenalty_Updates && p.BonusPenalty_Updates.length > 0) {
      updateDeltas('BonusPenalty', p.BonusPenalty_Updates, formatBonusPenalty, ss);
    }
    if (p.Attendance_Updates && p.Attendance_Updates.length > 0) {
      p.Attendance_Updates.forEach(function (a) {
        var tIn = a.timeIn ? String(a.timeIn).trim() : '';
        var tOut = a.timeOut ? String(a.timeOut).trim() : '';
        if ((a.totalHours === undefined || a.totalHours === null || a.totalHours === '' || Number(a.totalHours) === 0) && tIn && tOut) {
          try {
            var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
            var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
            var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
            var diffHours = diffMs / 3600000;
            if (diffHours < 0) diffHours += 24;
            a.totalHours = Math.max(0, diffHours);
          } catch (e) {}
        }
      });
      updateDeltas('Attendance', p.Attendance_Updates, formatAtt, ss);
    }
    if (p.deletes || p.Deletes) {
      var del = p.deletes || p.Deletes;
      if (del.BonusPenalty && del.BonusPenalty.length > 0) {
        deleteDeltas('BonusPenalty', del.BonusPenalty, ss);
      }
      if (del.Attendance && del.Attendance.length > 0) {
        deleteDeltas('Attendance', del.Attendance, ss);
      }
    }

    // 2. TÍNH TOÁN TẬP TRUNG (SERVER-SIDE PAYROLL AGGREGATION)
    var userConfig = getUserConfig();
    var allUsers = userConfig.users || [];
    if (allUsers.length === 0) {
      allUsers = ['Đỗ Minh Ân', 'Trần Hữu Tâm', 'Nguyễn Hoàng Dương', 'Nguyễn Thị Diệu Hương'];
    }

    var prodData = readSheet('Production', function (item) {
      return (item.p1_endTime && item.p1_endTime.indexOf(monthStr) === 0) || (item.p2_endTime && item.p2_endTime.indexOf(monthStr) === 0);
    }, ss);
    var packData = readSheet('Packings', function (item) {
      return item.endTime && item.endTime.indexOf(monthStr) === 0;
    }, ss);
    var attData = readSheet('Attendance', function (item) {
      return item.date && item.date.indexOf(monthStr) === 0;
    }, ss);
    var bpData = readSheet('BonusPenalty', function (item) {
      return item.date && item.date.indexOf(monthStr) === 0;
    }, ss);
    var kpiProgressData = readSheet('KPI_Progress', function (item) {
      return item.endTime && item.endTime.indexOf(monthStr) === 0;
    }, ss);

    // Dư nợ tháng trước
    var prevMonth = new Date(monthStr + '-01');
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    var prevMonthStr = prevMonth.getFullYear() + '-' + ('0' + (prevMonth.getMonth() + 1)).slice(-2);
    var prevSnaps = readSheet('Monthly_Snapshots', function (s) { return s.month === prevMonthStr; }, ss);
    var prevDebtMap = {};
    prevSnaps.forEach(function (s) { prevDebtMap[s.user] = Number(s.totalDebt) || 0; });

    var payrollData = {};

    allUsers.forEach(function (u) {
      var salConfig = userConfig.salaries ? (userConfig.salaries[u] || {}) : {};
      var userAtts = attData.filter(function (a) { return String(a.user).trim() === String(u).trim(); });
      var userBPs = bpData.filter(function (b) { return String(b.user).trim() === String(u).trim(); });

      var totalGateHours = userAtts.reduce(function (sum, a) {
        var h = Number(a.totalHours) || 0;
        if (h === 0 && a.timeIn && a.timeOut) {
          try {
            var tIn = String(a.timeIn).trim();
            var tOut = String(a.timeOut).trim();
            var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
            var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
            var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
            var diffHours = diffMs / 3600000;
            if (diffHours < 0) diffHours += 24;
            h = Math.max(0, diffHours);
          } catch (e) {}
        }
        return sum + h;
      }, 0);
      var hoursWorked = totalGateHours;
      var daysWorked = userAtts.filter(function (a) {
        var h = Number(a.totalHours) || 0;
        if (h === 0 && a.timeIn && a.timeOut) {
          try {
            var tIn = String(a.timeIn).trim();
            var tOut = String(a.timeOut).trim();
            var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
            var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
            var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
            var diffHours = diffMs / 3600000;
            if (diffHours < 0) diffHours += 24;
            h = Math.max(0, diffHours);
          } catch (e) {}
        }
        return h > 0 || (a.morningIn && a.morningOut);
      }).length;

      var baseSalaryConfig = Number(salConfig.baseSalary) || Number(salConfig['Lương Cơ Bản']) || 0;
      var luongChinh = baseSalaryConfig > 0 ? Math.round((baseSalaryConfig / 208) * hoursWorked) : hoursWorked * 20000;
      var luongLamThemGio = userBPs.filter(function (b) { return b.type === 'Lương Làm Thêm Giờ'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);

      // Quét Production: p1_user, p2_user, p1_endTime, p2_endTime, p1_reward_vnd, p2_reward_vnd khi status = 'Done'
      var prodSalary = 0;
      prodData.forEach(function (pItem) {
        var itemDone = pItem.status === 'Done' || String(pItem.status).toUpperCase() === 'ĐÃ XONG' || String(pItem.status).toUpperCase() === 'HOÀN KHO ĐẠT';
        if (pItem.p1_user === u && pItem.p1_endTime && pItem.p1_endTime.indexOf(monthStr) === 0 && (pItem.p1_status === 'Done' || itemDone)) {
          prodSalary += Number(pItem.p1_reward_vnd) || 0;
        }
        if (pItem.p2_user === u && pItem.p2_endTime && pItem.p2_endTime.indexOf(monthStr) === 0 && (pItem.p2_status === 'Done' || itemDone)) {
          prodSalary += Number(pItem.p2_reward_vnd) || 0;
        }
      });

      // Quét Packings: user, endTime, reward_vnd khi status = 'Done'
      var packSalary = 0;
      packData.forEach(function (pk) {
        if (pk.user === u && (pk.status === 'Done' || String(pk.status).toUpperCase() === 'ĐÃ XONG')) {
          packSalary += Number(pk.reward_vnd) || 0;
        }
      });

      var hoaHongSanXuat = prodSalary + packSalary;
      var hoTroSanLuong = userBPs.filter(function (b) { return b.type === 'Hỗ Trợ Sản Lượng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);

      // KPI Progress & Phụ Cấp Xăng Xe / Chức Vụ
      var userDevKpis = kpiProgressData.filter(function (k) {
        return k.user === u && String(k.unit).toLowerCase() !== 'xu' &&
          (k.isClaimed === true || String(k.isClaimed).toLowerCase() === 'true');
      });
      var dynamicFuncSalary = userDevKpis.reduce(function (sum, k) { return sum + (Number(k.reward) || 0); }, 0);
      var ceilingFuncSalary = Number(salConfig.funcSalary) || Number(salConfig['Lương Chức Vụ']) || 0;
      var funcSalary = ceilingFuncSalary > 0 ? Math.min(dynamicFuncSalary, ceilingFuncSalary) : dynamicFuncSalary;

      var allowanceConfig = Number(salConfig.allowance) || Number(salConfig['Phụ Cấp Xăng Xe']) || 0;
      var phuCapKhac = userBPs.filter(function (b) { return b.type === 'Phụ Cấp Khác'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
      var tongPhuCap = funcSalary + allowanceConfig + phuCapKhac;

      // Thưởng
      var thuongNong = userBPs.filter(function (b) { return b.type === 'Thưởng Nóng' || b.type === 'Thưởng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
      var manualChuyenCanRec = userBPs.find(function (b) { return b.type === 'Thưởng Chuyên Cần'; });
      var chuyenCan = manualChuyenCanRec ? Number(manualChuyenCanRec.amount) : ((daysWorked >= 28 || totalGateHours >= 216) ? 500000 : 0);
      var tongThuong = thuongNong + chuyenCan;

      var hoaHongBanHang = userBPs.filter(function (b) { return b.type === 'Hoa Hồng Bán Hàng' || b.type === 'Thưởng Bán Hàng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
      var cacKhoanThuKhac = userBPs.filter(function (b) { return b.type === 'Thu Nhập Khác' || b.type === 'Các Khoản Thu Khác'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);

      var tongThuNhap = luongChinh + luongLamThemGio + hoaHongSanXuat + hoTroSanLuong + tongPhuCap + tongThuong + hoaHongBanHang + cacKhoanThuKhac;

      // Giảm trừ
      var soNgayNghi = userAtts.filter(function (a) { return String(a.status || '').indexOf('Nghỉ') > -1 || String(a.shift || '').indexOf('Nghỉ') > -1; }).length;
      var phatVuotNgayNghi = soNgayNghi > 2 ? (soNgayNghi - 2) * 200000 : 0;
      var attPenalty = userAtts.reduce(function (sum, a) { return sum + (Number(a.penalty) || 0); }, 0);
      var phatQuyDinhBP = Math.abs(userBPs.filter(function (b) { return b.type === 'Phạt Quy Định' || b.type === 'Phạt'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var phatQuyDinh = phatQuyDinhBP + attPenalty + phatVuotNgayNghi;

      var phiCongDoan = 50000;
      var chiPhiBaoHanh = Math.abs(userBPs.filter(function (b) { return b.type === 'Chi Phí Bảo Hành'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var tamUng = Math.abs(userBPs.filter(function (b) { return b.type === 'Tạm Ứng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var excludeGiamTru = ['Phạt Quy Định', 'Phạt', 'Chi Phí Bảo Hành', 'Tạm Ứng', 'Thanh Toán Lương', 'Đã Trả'];
      var giamTruKhac = Math.abs(userBPs.filter(function (b) { return excludeGiamTru.indexOf(b.type) === -1 && Number(b.amount) < 0; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var noThangTruoc = prevDebtMap[u] || 0;

      var tongGiamTru = phatQuyDinh + phiCongDoan + chiPhiBaoHanh + tamUng + giamTruKhac + noThangTruoc;
      var totalSalary = tongThuNhap - tongGiamTru;
      var daTraNhanVien = Math.abs(userBPs.filter(function (b) { return b.type === 'Đã Trả' || b.type === 'Thanh Toán Lương'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var conCanTra = totalSalary - daTraNhanVien;

      payrollData[u] = {
        user: u,
        month: monthStr,
        hoursWorked: hoursWorked,
        totalGateHours: totalGateHours,
        daysWorked: daysWorked,
        luongChinh: luongChinh,
        luongLamThemGio: luongLamThemGio,
        hoaHongSanXuat: hoaHongSanXuat,
        tongPhuCap: tongPhuCap,
        tongThuong: tongThuong,
        hoaHongBanHang: hoaHongBanHang,
        cacKhoanThuKhac: cacKhoanThuKhac,
        tongThuNhap: tongThuNhap,
        phatQuyDinh: phatQuyDinh,
        phiCongDoan: phiCongDoan,
        chiPhiBaoHanh: chiPhiBaoHanh,
        tamUng: tamUng,
        giamTruKhac: giamTruKhac,
        noThangTruoc: noThangTruoc,
        tongGiamTru: tongGiamTru,
        totalSalary: totalSalary,
        daTraNhanVien: daTraNhanVien,
        conCanTra: conCanTra,
        totalDebt: totalSalary < 0 ? Math.abs(totalSalary) : 0
      };
    });

    return {
      success: true,
      message: 'Đồng bộ dữ liệu lương tập trung thành công!',
      payrollData: payrollData
    };
  } catch (err) {
    return { success: false, message: 'Lỗi đồng bộ lương: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function api_generateMonthlySnapshot(payload) {
  try {
    var auth = validatePin(payload.pin);
    if (auth && auth.valid && auth.role === 'TỐI CAO') {
      return generateMonthlySnapshot(payload.monthStr);
    } else {
      return { success: false, message: 'Chỉ Boss (TỐI CAO) mới được chốt sổ!' };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function generateMonthlySnapshot(monthStr) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận khóa sổ, vui lòng thử lại sau giây lát.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var snapSheet = ss.getSheetByName('Monthly_Snapshots');
    if (!snapSheet) {
      snapSheet = ss.insertSheet('Monthly_Snapshots');
      snapSheet.appendRow(SCHEMA_ERP.Monthly_Snapshots);
      snapSheet.setFrozenRows(1);
    }

    var snaps = readSheet('Monthly_Snapshots', function (s) { return s.month === monthStr; }, ss);
    if (snaps.length > 0) return { success: false, message: 'Tháng ' + monthStr + ' đã được khóa sổ.' };

    var userConfig = getUserConfig();
    var allUsers = userConfig.users || [];
    if (allUsers.length === 0) {
      allUsers = ['Đỗ Minh Ân', 'Trần Hữu Tâm', 'Nguyễn Hoàng Dương', 'Nguyễn Thị Diệu Hương'];
    }

    var prodData = readSheet('Production', function (p) { return (p.p1_endTime && p.p1_endTime.indexOf(monthStr) === 0) || (p.p2_endTime && p.p2_endTime.indexOf(monthStr) === 0); }, ss);
    var packData = readSheet('Packings', function (p) { return p.endTime && p.endTime.indexOf(monthStr) === 0; }, ss);
    var attData = readSheet('Attendance', function (a) { return a.date && a.date.indexOf(monthStr) === 0; }, ss);
    var bpData = readSheet('BonusPenalty', function (b) { return b.date && b.date.indexOf(monthStr) === 0; }, ss);
    var kpiProgressData = readSheet('KPI_Progress', function (k) { return k.endTime && k.endTime.indexOf(monthStr) === 0; }, ss);

    // Lấy nợ từ tháng trước
    var prevMonth = new Date(monthStr + '-01');
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    var prevMonthStr = prevMonth.getFullYear() + '-' + ('0' + (prevMonth.getMonth() + 1)).slice(-2);
    var prevSnaps = readSheet('Monthly_Snapshots', function (s) { return s.month === prevMonthStr; }, ss);
    var prevDebtMap = {};
    prevSnaps.forEach(function (s) {
      prevDebtMap[s.user] = Number(s.totalDebt) || 0;
    });

    var newRows = [];
    var createdAt = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    allUsers.forEach(function (u) {
      var salConfig = userConfig.salaries ? (userConfig.salaries[u] || {}) : {};
      var userAtts = attData.filter(function (a) { return a.user === u; });
      var userBPs = bpData.filter(function (b) { return b.user === u; });

      var totalGateHours = userAtts.reduce(function (sum, a) { return sum + (Number(a.totalHours) || 0); }, 0);
      var hoursWorked = totalGateHours;
      var daysWorked = userAtts.filter(function (a) { return Number(a.totalHours) > 0 || (a.morningIn && a.morningOut); }).length;

      var baseSalaryConfig = Number(salConfig.baseSalary) || Number(salConfig['Lương Cơ Bản']) || 0;
      var luongChinh = baseSalaryConfig > 0 ? (baseSalaryConfig / 208) * hoursWorked : hoursWorked * 20000;
      var luongLamThemGio = 0; // Đã bao hàm trong tổng giờ công

      // Thưởng sản xuất
      var prodSalary = 0;
      prodData.forEach(function (p) {
        if (p.p1_user === u && p.p1_endTime && p.p1_endTime.indexOf(monthStr) === 0) prodSalary += Number(p.p1_reward_vnd) || 0;
        if (p.p2_user === u && p.p2_endTime && p.p2_endTime.indexOf(monthStr) === 0) prodSalary += Number(p.p2_reward_vnd) || 0;
      });

      // Thưởng đóng gói
      var packSalary = 0;
      packData.forEach(function (pk) {
        if (pk.user === u) packSalary += Number(pk.reward_vnd) || 0;
      });

      var hoaHongSanXuat = prodSalary + packSalary;
      var hoTroSanLuong = 0;

      // Phụ cấp & KPI
      var userDevKpis = kpiProgressData.filter(function (k) {
        return k.user === u && String(k.unit).toLowerCase() !== 'xu' &&
          (k.isClaimed === true || String(k.isClaimed).toLowerCase() === 'true');
      });
      var dynamicFuncSalary = userDevKpis.reduce(function (sum, k) { return sum + (Number(k.reward) || 0); }, 0);
      var ceilingFuncSalary = Number(salConfig.funcSalary) || Number(salConfig['Lương Chức Vụ']) || 0;
      var funcSalary = ceilingFuncSalary > 0 ? Math.min(dynamicFuncSalary, ceilingFuncSalary) : dynamicFuncSalary;

      var allowanceConfig = Number(salConfig.allowance) || Number(salConfig['Phụ Cấp Xăng Xe']) || 0;
      var phuCapKhac = userBPs.filter(function (b) { return b.type === 'Phụ Cấp Khác'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
      var tongPhuCap = funcSalary + allowanceConfig + phuCapKhac;

      // Thưởng
      var thuongNong = userBPs.filter(function (b) { return b.type === 'Thưởng Nóng' || b.type === 'Thưởng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
      var manualChuyenCanRec = userBPs.find(function (b) { return b.type === 'Thưởng Chuyên Cần'; });
      var chuyenCan = manualChuyenCanRec ? Number(manualChuyenCanRec.amount) : ((daysWorked >= 28 || totalGateHours >= 216) ? 500000 : 0);
      var tongThuong = thuongNong + chuyenCan;

      var hoaHongBanHang = userBPs.filter(function (b) { return b.type === 'Hoa Hồng Bán Hàng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
      var cacKhoanThuKhac = userBPs.filter(function (b) { return b.type === 'Thu Nhập Khác' || b.type === 'Các Khoản Thu Khác'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);

      var tongThuNhap = luongChinh + luongLamThemGio + hoaHongSanXuat + hoTroSanLuong + tongPhuCap + tongThuong + hoaHongBanHang + cacKhoanThuKhac;

      // Giảm trừ
      var soNgayNghi = userAtts.filter(function (a) { return String(a.status || '').indexOf('Nghỉ') > -1 || String(a.shift || '').indexOf('Nghỉ') > -1; }).length;
      var phatVuotNgayNghi = soNgayNghi > 2 ? (soNgayNghi - 2) * 200000 : 0;
      var attPenalty = userAtts.reduce(function (sum, a) { return sum + (Number(a.penalty) || 0); }, 0);
      var phatQuyDinhBP = Math.abs(userBPs.filter(function (b) { return b.type === 'Phạt Quy Định' || b.type === 'Phạt'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var phatQuyDinh = phatQuyDinhBP + attPenalty + phatVuotNgayNghi;

      var phiCongDoan = 50000;
      var chiPhiBaoHanh = Math.abs(userBPs.filter(function (b) { return b.type === 'Chi Phí Bảo Hành'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var tamUng = Math.abs(userBPs.filter(function (b) { return b.type === 'Tạm Ứng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var excludeGiamTru = ['Phạt Quy Định', 'Phạt', 'Chi Phí Bảo Hành', 'Tạm Ứng', 'Thanh Toán Lương', 'Đã Trả'];
      var giamTruKhac = Math.abs(userBPs.filter(function (b) { return excludeGiamTru.indexOf(b.type) === -1 && Number(b.amount) < 0; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var noThangTruoc = prevDebtMap[u] || 0;

      var tongGiamTru = phatQuyDinh + phiCongDoan + chiPhiBaoHanh + tamUng + giamTruKhac + noThangTruoc;

      var netCalculated = tongThuNhap - tongGiamTru;
      var daTraNhanVien = Math.abs(userBPs.filter(function (b) { return b.type === 'Đã Trả' || b.type === 'Thanh Toán Lương'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
      var conCanTra = netCalculated - daTraNhanVien;

      var debt = 0;
      if (netCalculated < 0) {
        debt = Math.abs(netCalculated);
      }

      var detailedSnapshot = {
        user: u,
        month: monthStr,
        hoursWorked: hoursWorked,
        totalGateHours: totalGateHours,
        daysWorked: daysWorked,
        luongChinh: luongChinh,
        luongLamThemGio: luongLamThemGio,
        hoaHongSanXuat: hoaHongSanXuat,
        tongPhuCap: tongPhuCap,
        tongThuong: tongThuong,
        hoaHongBanHang: hoaHongBanHang,
        cacKhoanThuKhac: cacKhoanThuKhac,
        tongThuNhap: tongThuNhap,
        phatQuyDinh: phatQuyDinh,
        phiCongDoan: phiCongDoan,
        chiPhiBaoHanh: chiPhiBaoHanh,
        tamUng: tamUng,
        giamTruKhac: giamTruKhac,
        noThangTruoc: noThangTruoc,
        tongGiamTru: tongGiamTru,
        totalSalary: netCalculated,
        daTraNhanVien: daTraNhanVien,
        conCanTra: conCanTra,
        totalDebt: debt
      };

      var row = SCHEMA_ERP.Monthly_Snapshots.map(function (h) {
        if (h === 'id') return 'SNAP_' + monthStr + '_' + u.replace(/\s+/g, '') + '_' + Date.now();
        if (h === 'month') return monthStr;
        if (h === 'user') return u;
        if (h === 'totalSalary') return netCalculated;
        if (h === 'totalHours') return totalGateHours;
        if (h === 'totalAdvance') return tamUng;
        if (h === 'totalDebt') return debt;
        if (h === 'createdAt') return createdAt;
        if (h === 'snapshotData') return JSON.stringify(detailedSnapshot);
        return '';
      });
      newRows.push(row);
    });

    if (newRows.length > 0) {
      var range = snapSheet.getRange(snapSheet.getLastRow() + 1, 1, newRows.length, SCHEMA_ERP.Monthly_Snapshots.length);
      range.setValues(newRows);
    }

    return { success: true, message: 'Đã khóa sổ tháng ' + monthStr + ' thành công cho ' + newRows.length + ' nhân sự!' };
  } catch (err) {
    Logger.log('Lỗi generateMonthlySnapshot: ' + err.toString());
    return { success: false, message: 'Lỗi khóa sổ tháng: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}



function initDB() { var ss = SpreadsheetApp.getActiveSpreadsheet(); Object.keys(SCHEMA).forEach(function (s) { if (!ss.getSheetByName(s)) { var sheet = ss.insertSheet(s); sheet.appendRow(SCHEMA[s]); sheet.setFrozenRows(1); } }); }
function initDbERP() { var ss = SpreadsheetApp.getActiveSpreadsheet(); Object.keys(SCHEMA_ERP).forEach(function (s) { if (!ss.getSheetByName(s)) { var sheet = ss.insertSheet(s); sheet.appendRow(SCHEMA_ERP[s]); sheet.setFrozenRows(1); sheet.getRange(1, 1, 1, SCHEMA_ERP[s].length).setFontWeight("bold").setBackground("#e6f5f5"); } }); }

// =========================================================================
// HÀM ĐỌC GOOGLE SHEETS (ĐÃ ĐƯỢC NÂNG CẤP THÊM TÍNH NĂNG LỌC - FILTERING)
// =========================================================================
function readSheet(name, filterFn, ss) {
  try {
    var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
    var sheet = activeSs.getSheetByName(name); if (!sheet) return [];
    var lastRow = sheet.getLastRow(); if (lastRow <= 1) return [];

    var maxRows = 4000;
    var data;
    var headers;
    if (lastRow <= maxRows) {
      data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
      headers = data[0];
    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var startRow = lastRow - maxRows + 2; // Giữ header dòng 1, đọc tiếp các dòng mới nhất ở cuối
      var numRows = lastRow - startRow + 1;
      var values = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();
      data = [headers].concat(values);
    }
    var result = [];

    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j]; var header = headers[j];
        if (val instanceof Date) {
          var hours = val.getHours();
          var minutes = val.getMinutes();
          var seconds = val.getSeconds();
          var pad = function (n) { return n < 10 ? '0' + n : n; };
          if (val.getFullYear() === 1899) {
            if (hours === 0 && minutes === 0 && seconds === 0) {
              obj[header] = "";
            } else {
              obj[header] = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
            }
          } else if (hours === 0 && minutes === 0 && seconds === 0) {
            obj[header] = val.getFullYear() + "-" + pad(val.getMonth() + 1) + "-" + pad(val.getDate());
          } else {
            obj[header] = val.getFullYear() + "-" + pad(val.getMonth() + 1) + "-" + pad(val.getDate()) + " " + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
          }
        } else if (header === 'date' && val) {
          var str = String(val).trim(); if (str.includes('T')) str = str.split('T')[0];
          if (str.includes('/')) { var parts = str.split('/'); if (parts.length === 3) str = parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0'); }
          obj[header] = str;
        } else { obj[header] = String(val !== null && val !== undefined ? val : '').trim(); }
      }

      if (obj.id || name === 'Config_KPI' || name === 'Config_GiaLayout') {
        // ÁP DỤNG MÀNG LỌC DỮ LIỆU ĐỂ GIẢM TẢI BỘ NHỚ CHO TRÌNH DUYỆT
        if (!filterFn || filterFn(obj)) {
          result.push(obj);
        }
      }
    }
    return result;
  } catch (e) {
    console.error("Lỗi readSheet bảng " + name + ": ", e);
    return [];
  }
}

// =========================================================================
// HÀM GÓI DỮ LIỆU GỬI VỀ APP (LỌC BỎ RÁC VÀ DỮ LIỆU CŨ QUÁ 45 NGÀY)
// =========================================================================
function getAppData(pin) {
  var auth = validatePin(pin);
  if (auth && auth._debugMsg) { return { error: "LỖI HỆ THỐNG: " + auth._debugMsg }; }
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss.getSheetByName('Trainings')) {
      var trainingsSheet = ss.insertSheet('Trainings');
      trainingsSheet.appendRow(SCHEMA.Trainings);
      trainingsSheet.setFrozenRows(1);
    }
    if (!ss.getSheetByName('Models3D')) {
      var models3DSheet = ss.insertSheet('Models3D');
      models3DSheet.appendRow(SCHEMA.Models3D);
      models3DSheet.setFrozenRows(1);
    }
    if (!ss.getSheetByName('CTV_Finance')) {
      var ctvSheet = ss.insertSheet('CTV_Finance');
      ctvSheet.appendRow(['id', 'date', 'type', 'amount', 'note', 'user', 'status']);
      ctvSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
      ctvSheet.setFrozenRows(1);
    }
    if (!ss.getSheetByName('Config_GiaLayout')) {
      var configLayoutSheet = ss.insertSheet('Config_GiaLayout');
      configLayoutSheet.appendRow(['Size_Max', 'Do_Chi_Tiet', 'He_So_Gia', 'Phi_Gui_Xuong', 'Phi_Gan_Reu']);
      configLayoutSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#d4af37");
      configLayoutSheet.setFrozenRows(1);
      // Điền sẵn data mẫu
      const defaultLayoutData = [
        [30, 'Đơn giản', 740000, 10000, 10000],
        [30, 'Chi tiết cao', 860000, 10000, 10000],
        [50, 'Đơn giản', 540000, 15000, 20000],
        [50, 'Chi tiết cao', 660000, 15000, 20000],
        [70, 'Đơn giản', 560000, 30000, 25000],
        [70, 'Chi tiết cao', 680000, 30000, 30000],
        [90, 'Đơn giản', 490000, 40000, 45000],
        [90, 'Chi tiết cao', 630000, 45000, 50000],
        [120, 'Đơn giản', 490000, 45000, 65000],
        [120, 'Chi tiết cao', 660000, 50000, 65000]
      ];
      defaultLayoutData.forEach(function (row) { configLayoutSheet.appendRow(row); });
    }
    if (!ss.getSheetByName('Reimbursements')) {
      var reimbSheet = ss.insertSheet('Reimbursements');
      reimbSheet.appendRow(SCHEMA.Reimbursements);
      reimbSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
      reimbSheet.setFrozenRows(1);
    }
    if (!ss.getSheetByName('BOM_Config')) {
      var bomSheet = ss.insertSheet('BOM_Config');
      bomSheet.appendRow(SCHEMA_ERP.BOM_Config);
      bomSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#d4af37");
    }
    repairKPIProgressSheetHeaders();

    // 1. TẠO MỐC THỜI GIAN CẮT DỮ LIỆU (MẶC ĐỊNH LÀ NGÀY 1 THÁNG TRƯỚC) CHO HR & ERP
    var today = new Date();
    var cutoffDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    var cutoffStr = Utilities.formatDate(cutoffDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

    // 2. LỌC ĐƠN HÀNG: NẠP TOÀN BỘ ĐƠN ĐANG VẬN HÀNH VÀ CÁC ĐƠN ĐÃ ĐÓNG
    var orderIds = {};
    var orders = readSheet('Orders', function (o) {
      if (!o.id || String(o.id).trim() === '0' || String(o.id).trim() === '') return false;
      if (!o.orderCode || String(o.orderCode).trim() === '0' || String(o.orderCode).trim() === '') return false;

      // BỘ LỌC CHỐNG GHOST ORDERS (RCA v4 - Final):
      // Ghost orders từ VLOOKUP/ARRAYFORMULA luôn có customer = số 0 (chuyển thành chuỗi "0")
      // Đơn thật: customer = tên khách (VD: "a10bvu0p45") hoặc "" (rỗng, nếu chưa điền)
      // Không bao giờ có khách hàng thật tên là "0" → điều kiện này là bulletproof
      if (String(o.customer).trim() === '0') {
        return false;
      }

      var s = String(o.status || '').trim();
      if (s === '0' || s === '') return true;
      s = s.toUpperCase();
      var isTerminal = (s === 'ĐÃ BÀN GIAO' || s === 'ĐÃ GIAO' || s === 'HOÀN THÀNH' || s === 'ĐÃ HỦY' || s === 'ĐƠN HUỶ' || s === 'ĐỐI SOÁT THÀNH CÔNG' || s === 'HÀNG HOÀN' || s === 'CANCELLED');
      if (!isTerminal) return true; // Đang vận hành thì luôn lấy
      return true; // Giữ toàn bộ đơn để bộ lọc phía Frontend xử lý linh hoạt theo tháng
    }, ss).map(function (o) {
      var acc = o.accessories;
      if (acc && typeof acc === 'string') {
        try {
          var parsed = JSON.parse(acc);
          while (typeof parsed === 'string') { parsed = JSON.parse(parsed); }
          o.accessories = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Nếu không phải JSON hợp lệ, giữ nguyên chuỗi hoặc phân tách bằng dấu phẩy
          o.accessories = acc.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
        }
      } else if (!Array.isArray(acc)) {
        o.accessories = [];
      }
      o.hasProduction = (String(o.hasProduction).toUpperCase() === 'TRUE');
      o.shippingMethod = o.shippingMethod || '';
      if (o.id) {
        orderIds[String(o.id).trim()] = true;
      }
      return o;
    });

    // 3. LỌC LỆNH SẢN XUẤT: GIỮ LẠI LỆNH CỦA ĐƠN ĐANG VẬN HÀNH VÀ LỆNH HOÀN THÀNH TRONG 45 NGÀY (CHO KPI)
    var prodItems = readSheet('Production', function (p) {
      if (p.orderId) {
        var pRaw = String(p.orderId).trim();
        var matched = false;
        var multipleOrders = pRaw.split('|').map(function (s) { return s.trim(); });
        for (var mo = 0; mo < multipleOrders.length; mo++) {
          var singleOrderId = multipleOrders[mo];
          if (orderIds[singleOrderId] === true) {
            matched = true; break;
          } else {
            var parts = singleOrderId.split('_');
            while (parts.length > 1) {
              parts.pop();
              if (orderIds[parts.join('_')] === true) {
                matched = true; break;
              }
            }
            if (matched) break;
          }
        }
        if (matched) return true;
      }
      var s = String(p.status).toUpperCase().trim();
      var isTerminal = (s === 'DONE' || s === 'ĐÃ XONG' || s === 'ĐÃ HUỶ' || s === 'HỦY/VỠ' || s === 'HOÀN KHO ĐẠT' || p.fulfilledFromStock);
      if (!isTerminal) return false; // Lệnh mồ côi (đơn đã xoá hoặc quá cũ) thì loại bỏ

      // Giữ lại 45 ngày để tính lương/KPI
      var dStr = p.p2_endTime || p.p1_endTime || p.deadline;
      if (dStr) {
        var d = new Date(dStr);
        // Nếu parse lỗi (VD định dạng dd/mm/yyyy), ta thử split '/'
        if (isNaN(d.getTime()) && typeof dStr === 'string' && dStr.includes('/')) {
          var parts = dStr.split(' ')[0].split('/');
          if (parts.length >= 3) d = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (!isNaN(d.getTime()) && d >= cutoffDate) return true;
        // Fallback string compare if Date parsing fails entirely but it's yyyy-mm-dd
        if (String(dStr) >= cutoffStr) return true;
      }
      return false;
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, type: p.type, name: p.name, note: p.note, status: p.status, deadline: p.deadline, fulfilledFromStock: (String(p.fulfilledFromStock).toUpperCase() === 'TRUE'), qc_front_photo: p.qc_front_photo || '', qc_side_photo: p.qc_side_photo || '', qc_status: p.qc_status || '', qc_note: p.qc_note || '', phases: { phase1: { name: p.p1_name || '', status: p.p1_status || '', user: p.p1_user || '', start: p.p1_start || '', endTime: p.p1_endTime || '', photo: p.p1_photo || '', reward_vnd: p.p1_reward_vnd || 0 }, phase2: { name: p.p2_name || '', status: p.p2_status || '', user: p.p2_user || '', start: p.p2_start || '', endTime: p.p2_endTime || '', photo: p.p2_photo || '', reward_vnd: p.p2_reward_vnd || 0 } } }; });

    // 4. LỌC ĐÓNG GÓI: GIỮ LẠI ĐÓNG GÓI CỦA ĐƠN ĐANG VẬN HÀNH VÀ HOÀN THÀNH TRONG 45 NGÀY
    var packings = readSheet('Packings', function (p) {
      if (p.orderId) {
        var pRaw = String(p.orderId).trim();
        var matched = false;
        var multipleOrders = pRaw.split('|').map(function (s) { return s.trim(); });
        for (var mo = 0; mo < multipleOrders.length; mo++) {
          var singleOrderId = multipleOrders[mo];
          if (orderIds[singleOrderId] === true) {
            matched = true; break;
          } else {
            var parts = singleOrderId.split('_');
            while (parts.length > 1) {
              parts.pop();
              if (orderIds[parts.join('_')] === true) {
                matched = true; break;
              }
            }
            if (matched) break;
          }
        }
        if (matched) return true;
      }
      var s = String(p.status).toUpperCase().trim();
      var isTerminal = (s === 'DONE' || s === 'ĐÃ XONG');
      if (!isTerminal) return false;

      // Giữ lại 45 ngày để tính lương/KPI
      var dStr = p.endTime || p.end;
      if (dStr) {
        var d = new Date(dStr);
        if (isNaN(d.getTime()) && typeof dStr === 'string' && dStr.includes('/')) {
          var parts = dStr.split(' ')[0].split('/');
          if (parts.length >= 3) d = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (!isNaN(d.getTime()) && d >= cutoffDate) return true;
        if (String(dStr) >= cutoffStr) return true;
      }
      return false;
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, user: p.user || '', start: p.start || '', end: p.end || '', endTime: p.endTime || '', status: p.status || '', photo: p.photo || '', photoBefore: p.photoBefore || '', reward_vnd: Number(p.reward_vnd || 0) }; });


    // 5. LỌC CHẤM CÔNG (HR): Chỉ lấy đúng 45 ngày gần nhất để tính lương
    var attendance = readSheet('Attendance', function (a) {
      return (a.date >= cutoffStr);
    }, ss);

    var documentsRaw = readSheet('Documents', null, ss) || [];
    var parsedDocuments = documentsRaw.map(function (doc) {
      if (doc.attachments && typeof doc.attachments === 'string') { try { doc.attachments = JSON.parse(doc.attachments); } catch (e) { doc.attachments = []; } }
      if (doc.readBy && typeof doc.readBy === 'string') { try { doc.readBy = JSON.parse(doc.readBy); } catch (e) { doc.readBy = []; } }
      return doc;
    });

    var d = { orders: orders || [], prodItems: prodItems || [], packings: packings || [], attendance: attendance || [], kpiConfig: readSheet('Config_KPI', null, ss) || [], documents: parsedDocuments, trainings: readSheet('Trainings', null, ss) || [], models3D: readSheet('Models3D', null, ss) || [], ctvFinance: readSheet('CTV_Finance', null, ss) || [], configGiaLayout: readSheet('Config_GiaLayout', null, ss) || [], reimbursements: readSheet('Reimbursements', null, ss) || [], monthlySnapshots: readSheet('Monthly_Snapshots', null, ss) || [] };

    // 6. LỌC CÁC BẢNG ERP (Lịch sử giao dịch, Thu chi, Thưởng phạt)
    Object.keys(SCHEMA_ERP).forEach(function (n) {
      if (n === 'Transactions' || n === 'ImportExport' || n === 'BonusPenalty') {
        d[n] = readSheet(n, function (item) {
          // Chỉ kéo về app các giao dịch tài chính & kho vận trong 45 ngày qua
          return (item.date && String(item.date).substring(0, 10) >= cutoffStr);
        }, ss) || [];
      } else {
        // Hàng hoá (Products), Quỹ (Accounts) là dữ liệu Master nên giữ toàn bộ
        d[n] = readSheet(n, null, ss) || [];
      }
    });

    // === TÍNH TOÁN CÔNG NỢ NHÀ CUNG CẤP (DYNAMIC DEBT RECONCILIATION) ===
    if (d['Suppliers'] && d['Suppliers'].length > 0) {
      var fullIEData = ss.getSheetByName('ImportExport') ? ss.getSheetByName('ImportExport').getDataRange().getValues() : [];
      var fullTxData = ss.getSheetByName('Transactions') ? ss.getSheetByName('Transactions').getDataRange().getValues() : [];
      d['Suppliers'] = d['Suppliers'].map(function (s) {
        s.totalDebt = getRealSupplierDebt(s.name, fullIEData, fullTxData);
        return s;
      });
    }

    var props = PropertiesService.getScriptProperties();
    d.announcement = props.getProperty('RF_ANNOUNCEMENT') || "Tối nay 20:00 ngày 15/06/2026.\nĐào tạo nâng cao kỹ năng quản lý. Có mặt đúng giờ!";

    d.serverTime = new Date().getTime(); return d;
  } catch (e) { return { error: e.toString() }; }
}

// =========================================================================
// HÀM TẢI LỊCH SỬ KHI USER CÓ YÊU CẦU (ARCHIVE LOADER)
// =========================================================================
function getArchivedData(pin) {
  var auth = validatePin(pin);
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. TẢI CÁC ĐƠN HÀNG ĐÃ ĐÓNG (ARCHIVED)
    var archivedOrders = readSheet('Orders', function (o) {
      if (!o.status) return false;
      var s = String(o.status).toUpperCase().trim();
      var isTerminal = (s === 'ĐÃ BÀN GIAO' || s === 'ĐÃ GIAO' || s === 'HOÀN THÀNH' || s === 'ĐÃ HỦY' || s === 'ĐƠN HUỶ' || s === 'ĐỐI SOÁT THÀNH CÔNG' || s === 'HÀNG HOÀN' || s === 'CANCELLED');
      return isTerminal;
    }, ss).map(function (o) {
      try { var acc = o.accessories; while (typeof acc === 'string') { acc = JSON.parse(acc); } o.accessories = Array.isArray(acc) ? acc : []; } catch (e) { o.accessories = []; }
      o.hasProduction = (String(o.hasProduction).toUpperCase() === 'TRUE');
      o.shippingMethod = o.shippingMethod || '';
      return o;
    });

    // 2. TẢI CÁC LỆNH SẢN XUẤT ĐÃ ĐÓNG (ARCHIVED)
    var archivedProdItems = readSheet('Production', function (p) {
      var s = String(p.status).toUpperCase().trim();
      var isTerminal = (s === 'DONE' || s === 'ĐÃ XONG' || s === 'ĐÃ HUỶ' || s === 'HỦY/VỠ' || s === 'HOÀN KHO ĐẠT' || p.fulfilledFromStock);
      return isTerminal;
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, type: p.type, name: p.name, note: p.note, status: p.status, deadline: p.deadline, fulfilledFromStock: (String(p.fulfilledFromStock).toUpperCase() === 'TRUE'), qc_front_photo: p.qc_front_photo || '', qc_side_photo: p.qc_side_photo || '', qc_status: p.qc_status || '', qc_note: p.qc_note || '', phases: { phase1: { name: p.p1_name || '', status: p.p1_status || '', user: p.p1_user || '', start: p.p1_start || '', endTime: p.p1_endTime || '', photo: p.p1_photo || '', reward_vnd: p.p1_reward_vnd || 0 }, phase2: { name: p.p2_name || '', status: p.p2_status || '', user: p.p2_user || '', start: p.p2_start || '', endTime: p.p2_endTime || '', photo: p.p2_photo || '', reward_vnd: p.p2_reward_vnd || 0 } } }; });

    // 3. TẢI CÁC LỆNH ĐÓNG GÓI ĐÃ ĐÓNG (ARCHIVED)
    var archivedPackings = readSheet('Packings', function (p) {
      var s = String(p.status).toUpperCase().trim();
      return (s === 'DONE' || s === 'ĐÃ XONG');
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, user: p.user || '', start: p.start || '', end: p.end || '', endTime: p.endTime || '', status: p.status || '', photo: p.photo || '', photoBefore: p.photoBefore || '', reward_vnd: Number(p.reward_vnd || 0) }; });

    return {
      orders: archivedOrders,
      prodItems: archivedProdItems,
      packings: archivedPackings
    };
  } catch (e) { return { error: e.toString() }; }
}


function applyDeltasToSheet(sheetName, items, formatter, ss) {
  var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSs.getSheetByName(sheetName); if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var headers = data[0] || SCHEMA[sheetName] || SCHEMA_ERP[sheetName] || [];

  var expectedSchema = SCHEMA[sheetName] || SCHEMA_ERP[sheetName] || [];
  if (expectedSchema.length > 0 && data.length > 0) {
    var missing = [];
    expectedSchema.forEach(function (col) {
      if (headers.indexOf(col) === -1) {
        missing.push(col);
      }
    });
    if (missing.length > 0) {
      var lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing])
        .setFontWeight("bold").setBackground("#e6f5f5");
      data = sheet.getDataRange().getValues();
      headers = data[0];
    }
  }

  var modified = false;
  items.forEach(function (item) {
    var rowObject = formatter(item);
    var found = false;
    for (var i = 1; i < data.length; i++) {
      var isMatch = String(data[i][0]) === String(item.id);

      // Chống x2 phiếu nghỉ trùng lặp trên Google Sheets
      if (!isMatch && sheetName === 'Attendance' && item.id && (String(item.id).indexOf('ATT_LEAVE_') === 0 || String(item.leaveType || '').indexOf('Nghỉ') === 0)) {
        var userCol = headers.indexOf('user');
        var dateCol = headers.indexOf('date');
        if (userCol !== -1 && dateCol !== -1) {
          var rowUser = String(data[i][userCol]).trim();
          var rowDate = String(data[i][dateCol]).trim();
          var rowId = String(data[i][0]).trim();
          var shiftCol = headers.indexOf('shift');
          var statusCol = headers.indexOf('status');
          var rowShift = shiftCol !== -1 ? String(data[i][shiftCol]) : '';
          var rowStatus = statusCol !== -1 ? String(data[i][statusCol]) : '';
          var itemDate = String(item.date).trim();
          if (rowUser === String(item.user).trim() && rowDate.substring(0, 10) === itemDate.substring(0, 10)) {
            if (rowId.indexOf('ATT_LEAVE_') === 0 || rowShift.indexOf('Nghỉ') !== -1 || rowStatus.indexOf('Nghỉ') !== -1) {
              isMatch = true;
            }
          }
        }
      }

      if (isMatch) {

        var newRow = headers.map(function (h, colIdx) {
          if (sheetName === 'Products' && h === 'quantity' && item._diff !== undefined) {
            var currentQtyVal = Number(data[i][colIdx]);
            if (isNaN(currentQtyVal)) currentQtyVal = 0;
            var diffVal = Number(item._diff);
            if (isNaN(diffVal)) diffVal = 0;
            var finalQty = currentQtyVal + diffVal;

            var catColIdx = headers.indexOf('category');
            var category = catColIdx >= 0 ? String(data[i][catColIdx]).trim().toUpperCase() : '';
            if ((category.indexOf('BỂ KÍNH') > -1 || category.indexOf('LAYOUT') > -1) && finalQty < 0) {
              finalQty = 0;
            }
            return finalQty;
          }

          if (sheetName === 'Accounts' && h === 'balance') {
            return data[i][colIdx];
          }

          var hasField = item.hasOwnProperty(h);
          if (!hasField && sheetName === 'Production' && (h.indexOf('p1_') === 0 || h.indexOf('p2_') === 0)) {
            hasField = item.hasOwnProperty('phases');
          }

          if (hasField) {
            var newVal = rowObject[h];
            if (typeof newVal === 'number' && isNaN(newVal)) return 0;
            if (newVal === 'NaN' || newVal === 'undefined') return '';

            var finalVal = newVal !== undefined ? newVal : '';
            if (sheetName === 'Products' && h === 'quantity') {
              var catColIdx2 = headers.indexOf('category');
              var category2 = catColIdx2 >= 0 ? String(data[i][catColIdx2]).trim().toUpperCase() : '';
              if ((category2.indexOf('BỂ KÍNH') > -1 || category2.indexOf('LAYOUT') > -1)) {
                var qtyNum = Number(finalVal);
                if (qtyNum < 0) finalVal = 0;
              }
            }
            return finalVal;
          }

          return data[i][colIdx];
        });

        data[i] = newRow;
        found = true;
        modified = true;
        break;
      }
    }
    if (!found) {
      var newRow = headers.map(function (h) {
        var val = rowObject[h];
        if (typeof val === 'number' && isNaN(val)) return 0;
        return val !== undefined ? val : '';
      });
      data.push(newRow);
      modified = true;
    }
  });

  // Tối ưu hóa ghi theo lô (Batch Write)
  if (modified) {
    sheet.getRange(1, 1, data.length, headers.length).setValues(data);
  }
}

function deleteDeltas(sheetName, itemIds, ss) {
  if (!itemIds || itemIds.length === 0) return;
  var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSs.getSheetByName(sheetName); if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  var headers = data[0];
  var idCol = headers.indexOf('id');
  if (idCol === -1) idCol = 0; // Fallback

  var strItemIds = itemIds.map(function (id) { return String(id).trim(); });
  for (var i = data.length - 1; i >= 1; i--) {
    if (strItemIds.indexOf(String(data[i][idCol]).trim()) !== -1) {
      sheet.deleteRow(i + 1);
    }
  }
}

function formatOrder(o) { return { "id": o.id, "orderCode": o.orderCode || '', "channel": o.channel || '', "customer": o.customer || '', "phone": o.phone || '', "address": o.address || '', "note": o.note || '', "createdAt": o.createdAt || '', "deadline": o.deadline || '', "date": o.date || '', "status": o.status || '', "accessories": typeof o.accessories === 'string' ? o.accessories : JSON.stringify(o.accessories || []), "hasProduction": o.hasProduction || false, "isCarriedToWH": o.isCarriedToWH || '', "updatedBy": o.updatedBy || '', "revenue": o.revenue || 0, "prePaid": o.prePaid || 0, "cod": o.cod || 0, "costTotal": o.costTotal || 0, "responsibleUser": o.responsibleUser || '', "discount": o.discount || 0, "shippingMethod": o.shippingMethod || ((String(o.channel).includes('Bán Lẻ') || String(o.channel).includes('Cộng Tác Viên')) ? 'Gửi GHN' : ''), "sizeCoefficient": Number(o.sizeCoefficient || 1), "cogs": Number(o.cogs || 0), "feeFixed": Number(o.feeFixed || 0), "feeService": Number(o.feeService || 0), "feePayment": Number(o.feePayment || 0), "feeAffiliate": Number(o.feeAffiliate || 0), "shopVoucher": Number(o.shopVoucher || 0), "tax": Number(o.tax || 0), "reconciledAt": o.reconciledAt || '', "isReconciled": o.isReconciled || '' }; }
function formatProd(p) { var ph1 = (p.phases && p.phases.phase1) ? p.phases.phase1 : {}; var ph2 = (p.phases && p.phases.phase2) ? p.phases.phase2 : {}; return { "id": p.id, "orderId": p.orderId, "type": p.type || '', "name": p.name || '', "note": p.note || '', "status": p.status || '', "deadline": p.deadline || '', "fulfilledFromStock": p.fulfilledFromStock || false, "p1_name": ph1.name || '', "p1_status": ph1.status || '', "p1_user": ph1.user || '', "p1_start": ph1.start || '', "p1_endTime": ph1.endTime || '', "p1_photo": ph1.photo || '', "p1_reward_vnd": ph1.reward_vnd || 0, "p2_name": ph2.name || '', "p2_status": ph2.status || '', "p2_user": ph2.user || '', "p2_start": ph2.start || '', "p2_endTime": ph2.endTime || '', "p2_photo": ph2.photo || '', "p2_reward_vnd": ph2.reward_vnd || 0, "qc_front_photo": p.qc_front_photo || '', "qc_side_photo": p.qc_side_photo || '', "qc_status": p.qc_status || '', "qc_note": p.qc_note || '' }; }
function formatPacking(p) { return { "id": p.id, "orderId": p.orderId, "user": p.user || '', "start": p.start || '', "end": p.end || '', "endTime": p.endTime || '', "status": p.status || '', "photo": p.photo || '', "photoBefore": p.photoBefore || '', "reward_vnd": p.reward_vnd || 0 }; }
function formatAtt(a) {
  var shiftVal = a.shift || '';
  if (shiftVal === 'Nghỉ Phép' && a.leaveShift) {
    shiftVal = a.leaveShift;
  }
  var leaveTypeVal = a.leaveType || (String(a.status || '').includes('Nghỉ') ? 'Nghỉ Phép' : '');

  var tIn = a.timeIn ? String(a.timeIn).trim() : '';
  var tOut = a.timeOut ? String(a.timeOut).trim() : '';
  var totalHoursVal = a.totalHours;

  if ((totalHoursVal === undefined || totalHoursVal === null || totalHoursVal === '' || Number(totalHoursVal) === 0) && tIn && tOut) {
    try {
      var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
      var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
      var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
      var diffHours = diffMs / 3600000;
      if (diffHours < 0) diffHours += 24;
      totalHoursVal = Math.max(0, diffHours);
    } catch (e) {
      totalHoursVal = 0;
    }
  }

  return {
    "id": a.id, "user": a.user || '', "date": a.date || '',
    "morningIn": a.morningIn || '', "morningOut": a.morningOut || '',
    "afternoonIn": a.afternoonIn || '', "afternoonOut": a.afternoonOut || '',
    "leaveType": leaveTypeVal, "leaveReportAt": a.leaveReportAt || '',
    "shift": shiftVal, "timeIn": tIn, "timeOut": tOut,
    "totalHours": Number(totalHoursVal) || 0, "status": a.status || '', "penalty": Number(a.penalty) || 0,
    "isEdited": a.isEdited || false, "leaveStart": a.leaveStart || '', "leaveEnd": a.leaveEnd || '', "note": a.note || ''
  };
}

function formatProduct(p) {
  return {
    "id": p.id, "sku": p.sku || '', "name": p.name || '', "unit": p.unit || '', "image": p.image || '',
    "category": p.category || '', "sub_category": p.sub_category || '',
    "costPrice": p.costPrice || 0, "price": p.price || 0, "quantity": p.quantity || 0,
    "minStock": p.minStock || 0, "maxStock": p.maxStock || 0, "realImage": p.realImage || '',
    "importUnit": p.importUnit || '', "conversionRate": p.conversionRate || 1, "model3D": p.model3D || ''
  };
}

function formatAccount(a) { return { "id": a.id, "accountName": a.accountName || '', "balance": a.balance || 0, "type": a.type || '', "accountNumber": a.accountNumber || '', "accountOwner": a.accountOwner || '' }; }
function formatSupplier(s) { return { "id": s.id, "name": s.name || '', "phone": s.phone || '', "totalDebt": s.totalDebt || 0, "category": s.category || '', "note": s.note || '' }; }
function formatTransaction(t) { return { "id": t.id, "type": t.type || '', "category": t.category || '', "amount": t.amount || 0, "fromAccount": t.fromAccount || '', "toAccount": t.toAccount || '', "title": t.title || '', "date": t.date || '', "note": t.note || '', "isAuto": t.isAuto || '' }; }
function formatImportExport(i) { return { "id": i.id, "type": i.type || '', "target": i.target || '', "totalAmount": i.totalAmount || 0, "date": i.date || '', "note": i.note || '', "itemsData": i.itemsData || '' }; }
function formatDocument(d) { return { "id": d.id, "category": d.category || 'Khác', "title": d.title || '', "description": d.description || '', "link": d.link || '', "createdAt": d.createdAt || new Date().toISOString(), "createdBy": d.createdBy || '', "attachments": typeof d.attachments === 'string' ? d.attachments : JSON.stringify(d.attachments || []), "testLink": d.testLink || '', "readBy": typeof d.readBy === 'string' ? d.readBy : JSON.stringify(d.readBy || []) }; }
function formatTraining(t) { return { "id": t.id, "title": t.title || '', "content": t.content || '', "targetRole": t.targetRole || 'ALL', "createdAt": t.createdAt || new Date().toISOString(), "createdBy": t.createdBy || '', "readUsers": typeof t.readUsers === 'string' ? t.readUsers : JSON.stringify(t.readUsers || []) }; }
function formatProfitReport(r) { return { "id": r.id, "period": r.period || '', "channel": r.channel || '', "revenue": r.revenue || 0, "orderCount": r.orderCount || 0, "platformFee": r.platformFee || 0, "returns": r.returns || 0, "discount": r.discount || 0, "ads": r.ads || 0, "cogs": r.cogs || 0, "salary": r.salary || 0, "operation": r.operation || 0 }; }
function formatBonusPenalty(b) { return { "id": b.id, "user": b.user || '', "amount": b.amount || 0, "type": b.type || '', "note": b.note || '', "date": b.date || '', "orderCode": b.orderCode || '' }; }
function formatKPIProg(k) { return { "id": k.id, "user": k.user || '', "kpiName": k.kpiName || '', "current": k.current || 0, "target": k.target || 0, "unit": k.unit || '', "lastUpdated": k.lastUpdated || '', "startTime": k.startTime || '', "endTime": k.endTime || '', "reward": k.reward || 0, "isClaimed": k.isClaimed || false }; }
function formatReimbursement(r) { return { "id": r.id, "staffName": r.staffName || '', "reason": r.reason || '', "amount": r.amount || 0, "qrCodeUrl": r.qrCodeUrl || '', "status": r.status || '', "createdAt": r.createdAt || new Date().toISOString() }; }
function formatBOMConfig(b) { return { "id": b.id, "layoutCode": b.layoutCode || '', "materialSku": b.materialSku || '', "defaultQty": Number(b.defaultQty) || 0, "unit": b.unit || '' }; }

// HÀM LƯU PHÂN QUYỀN VÀ CẤU HÌNH NHÂN SỰ VỀ GOOGLE SHEETS
function updateUserConfigSheet(configPayload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config_NhanSu');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var pinsMap = configPayload.pins || {};
  var nameToPinData = {};
  Object.keys(pinsMap).forEach(function (pin) {
    var pData = pinsMap[pin];
    if (pData && pData.name) {
      nameToPinData[pData.name.trim()] = {
        pin: pin,
        role: pData.role,
        title: pData.title,
        avatar: pData.avatar
      };
    }
  });

  var newRows = [headers];
  var salariesMap = configPayload.salaries || {};
  var processedNames = {};

  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0] || '').trim();
    if (!name) continue;

    var updatedRow = [...data[i]];

    if (nameToPinData[name]) {
      var update = nameToPinData[name];
      var avatarColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'id ảnh' });
      var titleColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'chức danh' });
      var subTitleColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'trách nhiệm' });
      var roleColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'phân quyền' });
      var pinColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'mã pin' });

      if (avatarColIdx !== -1) updatedRow[avatarColIdx] = update.avatar || '';
      else updatedRow[1] = update.avatar || '';

      if (titleColIdx !== -1) updatedRow[titleColIdx] = update.title || '';
      else updatedRow[2] = update.title || '';

      if (subTitleColIdx !== -1 && update.subTitle !== undefined) updatedRow[subTitleColIdx] = update.subTitle || '';

      if (roleColIdx !== -1) updatedRow[roleColIdx] = update.role || '';
      else updatedRow[3] = update.role || '';

      if (pinColIdx !== -1) updatedRow[pinColIdx] = update.pin || '';
      else updatedRow[4] = update.pin || '';

      processedNames[name] = true;
    }

    if (salariesMap[name]) {
      var salUpdate = salariesMap[name];
      var baseSalIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'lương cơ bản'; });
      var funcSalIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'lương chức vụ'; });
      var allowanceIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'phụ cấp xăng xe'; });
      var penaltyIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'khoản trừ vi phạm'; });

      if (baseSalIdx !== -1 && salUpdate.baseSalary !== undefined) updatedRow[baseSalIdx] = salUpdate.baseSalary;
      if (funcSalIdx !== -1 && salUpdate.funcSalary !== undefined) updatedRow[funcSalIdx] = salUpdate.funcSalary;
      if (allowanceIdx !== -1 && salUpdate.allowance !== undefined) updatedRow[allowanceIdx] = salUpdate.allowance;
      if (penaltyIdx !== -1 && salUpdate.penalty !== undefined) updatedRow[penaltyIdx] = salUpdate.penalty;
    }

    newRows.push(updatedRow);
  }

  Object.keys(nameToPinData).forEach(function (name) {
    if (!processedNames[name]) {
      var update = nameToPinData[name];
      var newRow = [name, update.avatar || '', update.title || '', update.role || '', update.pin || '', 0, 0, 0, 0];
      newRows.push(newRow);
    }
  });

  sheet.clearContents();
  sheet.getRange(1, 1, newRows.length, headers.length).setValues(newRows);
  CacheService.getScriptCache().remove('USER_CONFIG');
}

function adjustAccountBalanceServer(ss, accountId, change) {
  if (!accountId || change === 0) return;
  var sheet = ss.getSheetByName('Accounts');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(accountId)) {
      var currentBalance = Number(data[i][2]) || 0;
      sheet.getRange(i + 1, 3).setValue(currentBalance + change);
      break;
    }
  }
}

function syncDeltas(payload, pin) {
  var auth = validatePin(pin);
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  if (!payload) return getAppData(pin);
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Hoàn trả số dư khi XOÁ giao dịch
    if (payload.deletes && payload.deletes.Transactions && payload.deletes.Transactions.length > 0) {
      var txSheet = ss.getSheetByName('Transactions');
      if (txSheet) {
        var txData = txSheet.getDataRange().getValues();
        var txHeaders = SCHEMA_ERP.Transactions;
        var idCol = txHeaders.indexOf('id');
        var amtCol = txHeaders.indexOf('amount');
        var fromCol = txHeaders.indexOf('fromAccount');
        var toCol = txHeaders.indexOf('toAccount');

        if (idCol !== -1 && amtCol !== -1 && fromCol !== -1 && toCol !== -1) {
          payload.deletes.Transactions.forEach(function (txId) {
            for (var i = 1; i < txData.length; i++) {
              if (String(txData[i][idCol]) === String(txId)) {
                var amt = Number(txData[i][amtCol]) || 0;
                var fromAcc = String(txData[i][fromCol]).trim();
                var toAcc = String(txData[i][toCol]).trim();

                if (fromAcc) adjustAccountBalanceServer(ss, fromAcc, amt);
                if (toAcc) adjustAccountBalanceServer(ss, toAcc, -amt);
                break;
              }
            }
          });
        }
      }
    }

    // 1b. XOÁ chấm công
    if (payload.deletes && payload.deletes.Attendance && payload.deletes.Attendance.length > 0) {
      deleteDeltas('Attendance', payload.deletes.Attendance, ss);
    }

    // 2. Cập nhật số dư khi THÊM/SỬA giao dịch
    if (payload.Transactions && payload.Transactions.length > 0) {
      var txSheet = ss.getSheetByName('Transactions');
      if (txSheet) {
        var txData = txSheet.getDataRange().getValues();
        var txHeaders = SCHEMA_ERP.Transactions;
        var idCol = txHeaders.indexOf('id');
        var amtCol = txHeaders.indexOf('amount');
        var fromCol = txHeaders.indexOf('fromAccount');
        var toCol = txHeaders.indexOf('toAccount');

        payload.Transactions.forEach(function (newTx) {
          var txId = newTx.id;
          var foundOld = false;

          if (idCol !== -1 && amtCol !== -1 && fromCol !== -1 && toCol !== -1) {
            for (var i = 1; i < txData.length; i++) {
              if (String(txData[i][idCol]) === String(txId)) {
                var oldAmt = Number(txData[i][amtCol]) || 0;
                var oldFrom = String(txData[i][fromCol]).trim();
                var oldTo = String(txData[i][toCol]).trim();

                if (oldFrom) adjustAccountBalanceServer(ss, oldFrom, oldAmt);
                if (oldTo) adjustAccountBalanceServer(ss, oldTo, -oldAmt);
                foundOld = true;
                break;
              }
            }
          }

          var newAmt = Number(newTx.amount) || 0;
          var newFrom = String(newTx.fromAccount || '').trim();
          var newTo = String(newTx.toAccount || '').trim();

          if (newFrom) adjustAccountBalanceServer(ss, newFrom, -newAmt);
          if (newTo) adjustAccountBalanceServer(ss, newTo, newAmt);
        });
      }
    }

    // =========================================================================
    // HỆ THỐNG TỰ ĐỘNG HÓA KHO & SẢN XUẤT CHO SẢN PHẨM LAYOUT & BỂ KÍNH
    // =========================================================================
    if (payload.prodItems && payload.prodItems.length > 0) {
      // 1. Tải danh sách ID lệnh sản xuất hiện tại để nhận dạng lệnh mới được thêm
      var prodSheet = ss.getSheetByName('Production');
      var existingPIds = {};
      if (prodSheet) {
        var pValues = prodSheet.getDataRange().getValues();
        for (var pi = 1; pi < pValues.length; pi++) {
          existingPIds[String(pValues[pi][0])] = true;
        }
      }
      var stockUpdates = {}; // { rowIndex: { qty: newQty, col: qtyColIndex + 1 } }

      // A. XỬ LÝ KHI BƠM ĐƠN / THÊM ĐƠN HÀNG MỚI
      // Xây dựng map Lệnh Sản Xuất và Đơn Hàng hiện tại để phục vụ Cướp Lệnh (Auto-link) và Quét Tồn Kho
      var existingOrderMap = {};
      var activeOrders = {};
      var oSheetToRead = ss.getSheetByName('Orders');
      if (oSheetToRead) {
        var oVals = oSheetToRead.getDataRange().getValues();
        var oHead = oVals[0];
        var oIdCol = oHead.indexOf('id');
        var oChanCol = oHead.indexOf('channel');
        var oStatusCol = oHead.indexOf('status');
        for (var oi = 1; oi < oVals.length; oi++) {
          var oId = String(oVals[oi][oIdCol]);
          existingOrderMap[oId] = { id: oId, channel: oVals[oi][oChanCol] };

          var oStat = String(oVals[oi][oStatusCol]).toUpperCase().trim();
          var isTerminal = (oStat === 'ĐÃ BÀN GIAO' || oStat === 'ĐÃ GIAO' || oStat === 'HOÀN THÀNH' || oStat === 'ĐÃ HỦY' || oStat === 'ĐƠN HUỶ' || oStat === 'HỦY' || oStat === 'HUỶ' || oStat === 'ĐỐI SOÁT THÀNH CÔNG' || oStat === 'HÀNG HOÀN' || oStat === 'CANCELLED');
          if (!isTerminal) {
            activeOrders[oId] = true;
          }
        }
      }

      var existingProdMap = {};
      var pendingAllocations = {};
      if (prodSheet) {
        var pVals = prodSheet.getDataRange().getValues();
        var pHead = pVals[0];
        var pIdCol = pHead.indexOf('id');
        var pOrderIdCol = pHead.indexOf('orderId');
        var pNameCol = pHead.indexOf('name');
        var pStatusCol = pHead.indexOf('status');
        var pFulCol = pHead.indexOf('fulfilledFromStock');
        var pQcCol = pHead.indexOf('qc_status');

        for (var pi = 1; pi < pVals.length; pi++) {
          var pId = String(pVals[pi][pIdCol]);
          var oId = String(pVals[pi][pOrderIdCol]);
          var pName = String(pVals[pi][pNameCol]);
          existingProdMap[pId] = {
            id: pId,
            orderId: oId,
            name: pName,
            status: pVals[pi][pStatusCol]
          };

          if (activeOrders[oId]) {
            var fStock = String(pVals[pi][pFulCol]).toUpperCase() === 'TRUE';
            var pStat = String(pVals[pi][pStatusCol]).toUpperCase();
            var qc = String(pVals[pi][pQcCol]).toUpperCase();
            var isKcsPassed = qc.indexOf('ĐÃ DUYỆT') > -1 || qc === 'ĐẠT';
            var isDone = pStat === 'DONE' || pStat === 'ĐÃ XONG' || pStat === 'HOÀN KHO ĐẠT';
            var isReady = isDone && isKcsPassed;

            if (fStock || isReady) {
              var nName = normalizeProdName(pName);
              if (!pendingAllocations[nName]) pendingAllocations[nName] = 0;
              pendingAllocations[nName]++;
            }
          }
        }
      }

      payload.prodItems.forEach(function (pItem) {
        var isNewProdItem = !existingPIds[pItem.id];
        if (isNewProdItem) {
          var pInfo = getProductInfoByName(ss, pItem.name);
          if (pInfo && pInfo.isEligible) {
            var orderObj = null;
            var isRepOrder = false;
            if (payload.orders) {
              for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                  orderObj = payload.orders[oIdx];
                  isRepOrder = (orderObj.channel === 'Sản Xuất Tồn' || orderObj.channel === 'Sản Xuất Bù Kho');
                  break;
                }
              }
            }
            if (!orderObj) {
              if (existingOrderMap[pItem.orderId]) {
                orderObj = existingOrderMap[pItem.orderId];
                isRepOrder = (orderObj.channel === 'Sản Xuất Tồn' || orderObj.channel === 'Sản Xuất Bù Kho');
              }
            }

            if (orderObj && !isRepOrder) {
              var isLayoutItem = String(pItem.type || '').toUpperCase() === 'LAYOUT' || /rừng|layout|đảo|bonsai|trang|nature|suối|vách|hẻm|núi|cầu|thác|hang|tiểu cảnh/i.test(pItem.name);
              var isCover = /cover/i.test(pItem.name);
              var isTargetItem = (String(pItem.type || '').toUpperCase() === 'BỂ KÍNH' || (isLayoutItem && !isCover));

              if (isTargetItem) {
                // Tồn kho hiện tại (đã trừ đi lượng hàng đang bị giam bởi các đơn chưa bàn giao)
                var lockedQty = pendingAllocations[normalizeProdName(pItem.name)] || 0;
                var realQty = pInfo.qty - lockedQty;
                if (realQty < 0) realQty = 0;
                var currentQty = stockUpdates[pInfo.rowIndex] !== undefined ? stockUpdates[pInfo.rowIndex].qty : realQty;
                var minStock = Number(pInfo.minStock) || 0;

                // 1. CƯỚP LỆNH TỒN (Chỉ dành cho Layout)
                var hijackedProdId = null;
                if (isLayoutItem && !isCover) {
                  for (var eId in existingProdMap) {
                    var ep = existingProdMap[eId];
                    var epO = existingOrderMap[ep.orderId];
                    if (ep.name === pItem.name && epO && (epO.channel === 'Sản Xuất Tồn' || epO.channel === 'Sản Xuất Bù Kho')) {
                      var epStatus = String(ep.status).toUpperCase();
                      if (epStatus !== 'DONE' && epStatus !== 'ĐÃ XONG' && epStatus !== 'HỦY/VỠ' && epStatus !== 'HOÀN KHO ĐẠT' && epStatus !== 'HỦY') {
                        if (!ep._isHijacked) {
                          hijackedProdId = ep.id;
                          ep._isHijacked = true; // Đánh dấu đã cướp
                          break;
                        }
                      }
                    }
                  }
                }

                if (hijackedProdId) {
                  // Cướp thành công, cập nhật lệnh tồn thành lệnh khách
                  payload.prodItems = payload.prodItems || [];
                  payload.prodItems.push({
                    id: hijackedProdId,
                    orderId: orderObj.id, // Gắn sang đơn mới
                    note: 'Được chuyển từ lệnh Tồn kho sang đơn khách'
                  });

                  // Đơn khách chờ sản xuất
                  if (payload.orders) {
                    for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                      if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                        var cStat = String(payload.orders[oIdx].status || '').toUpperCase().trim();
                        var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                        if (!isTerm) payload.orders[oIdx].status = 'Chờ Sản Xuất';
                        break;
                      }
                    }
                  } else {
                    var oSheetToUpdate = ss.getSheetByName('Orders');
                    if (oSheetToUpdate) {
                      var ovv = oSheetToUpdate.getDataRange().getValues();
                      var stCol = ovv[0].indexOf('status');
                      for (var k = 1; k < ovv.length; k++) {
                        if (String(ovv[k][0]) === String(pItem.orderId)) {
                          var cStat = String(ovv[k][stCol] || '').toUpperCase().trim();
                          var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                          if (!isTerm) oSheetToUpdate.getRange(k + 1, stCol + 1).setValue('Chờ Sản Xuất');
                          break;
                        }
                      }
                    }
                  }

                  // Hủy pItem mới (không tạo thêm lệnh mới)
                  pItem._skipInsert = true;

                } else {
                  // 2. KHÔNG CƯỚP ĐƯỢC -> XỬ LÝ THEO TỒN KHO HOẶC ĐƠN XUẤT KHẨU
                  var pItemChannel = '';
                  if (payload.orders) {
                    for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                      if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                        pItemChannel = String(payload.orders[oIdx].channel || '').toUpperCase();
                        break;
                      }
                    }
                  }
                  var isExportOrder = pItemChannel.indexOf('SHOPEE SG') !== -1 || pItemChannel.indexOf('SHOPEE MA') !== -1 ||
                    pItemChannel.indexOf('SHOPEE MY') !== -1 || pItemChannel.indexOf('SHOPEE TH') !== -1 ||
                    pItemChannel.indexOf('SHOPEE PH') !== -1 || pItemChannel.indexOf('SHOPEE TW') !== -1 ||
                    pItemChannel.indexOf('XUẤT KHẨU') !== -1 || pItemChannel.indexOf('EXPORT') !== -1 ||
                    pItemChannel.indexOf('QUỐC TẾ') !== -1;

                  if (currentQty <= 0 || isExportOrder) {
                    // KHO = 0 HOẶC LÀ ĐƠN XUẤT KHẨU: Bắt buộc tạo lệnh sản xuất mới
                    pItem.fulfilledFromStock = false;
                    pItem.status = 'Pending';
                    pItem.qc_status = 'Pending';
                    if (pItem.phases) {
                      for (var phKey in pItem.phases) {
                        if (pItem.phases[phKey]) pItem.phases[phKey].status = 'Pending';
                      }
                    }
                    if (isExportOrder) pItem.note = (pItem.note || '') + ' (Đơn Xuất Khẩu - Ép buộc tạo lệnh SX mới)';
                    if (payload.orders) {
                      for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                        if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                          var cStat = String(payload.orders[oIdx].status || '').toUpperCase().trim();
                          var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                          if (!isTerm) payload.orders[oIdx].status = 'Chờ Sản Xuất';
                          break;
                        }
                      }
                    } else {
                      var oSheetToUpdate2 = ss.getSheetByName('Orders');
                      if (oSheetToUpdate2) {
                        var ovv2 = oSheetToUpdate2.getDataRange().getValues();
                        var stCol2 = ovv2[0].indexOf('status');
                        for (var k2 = 1; k2 < ovv2.length; k2++) {
                          if (String(ovv2[k2][0]) === String(pItem.orderId)) {
                            var cStat = String(ovv2[k2][stCol2] || '').toUpperCase().trim();
                            var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                            if (!isTerm) oSheetToUpdate2.getRange(k2 + 1, stCol2 + 1).setValue('Chờ Sản Xuất');
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    // KHO > 0 & KHÔNG PHẢI ĐƠN XUẤT KHẨU: Lấy từ tồn kho
                    pItem.fulfilledFromStock = true;
                    pItem.status = 'Hoàn Kho Đạt';
                    pItem.note = 'Lấy từ tồn kho có sẵn';

                    if (payload.orders) {
                      for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                        if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                          var cStat = String(payload.orders[oIdx].status || '').toUpperCase().trim();
                          var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                          if (!isTerm) payload.orders[oIdx].status = 'Sẵn sàng đóng gói';
                          break;
                        }
                      }
                    } else {
                      var oSheetToUpdate3 = ss.getSheetByName('Orders');
                      if (oSheetToUpdate3) {
                        var ovv3 = oSheetToUpdate3.getDataRange().getValues();
                        var stCol3 = ovv3[0].indexOf('status');
                        for (var k3 = 1; k3 < ovv3.length; k3++) {
                          if (String(ovv3[k3][0]) === String(pItem.orderId)) {
                            var cStat = String(ovv3[k3][stCol3] || '').toUpperCase().trim();
                            var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                            if (!isTerm) oSheetToUpdate3.getRange(k3 + 1, stCol3 + 1).setValue('Sẵn sàng đóng gói');
                            break;
                          }
                        }
                      }
                    }

                    // Giảm biến ảo để tính cho đơn tiếp theo trong cùng payload
                    currentQty--;
                    stockUpdates[pInfo.rowIndex] = { qty: currentQty, col: pInfo.qtyColIndex + 1 };
                  }
                }
              }
            }
          }
        }
      });

      // Lọc bỏ những pItem bị skip (do cướp lệnh hoặc lấy từ kho)
      payload.prodItems = payload.prodItems.filter(function (p) { return !p._skipInsert; });

      // KHÔNG CẬP NHẬT KHO TRỰC TIẾP Ở ĐÂY NỮA (Chỉ trừ kho khi Đã Bàn Giao)

      // B. XỬ LÝ KHI LỆNH SẢN XUẤT HOÀN THÀNH (STATUS -> DONE)
      if (prodSheet) {
        var pData = prodSheet.getDataRange().getValues();
        var pHeaders = pData[0];
        var pIdCol = pHeaders.indexOf('id');
        var pStatusCol = pHeaders.indexOf('status');
        var pNameCol = pHeaders.indexOf('name');
        var pOrderIdCol = pHeaders.indexOf('orderId');
        var pFulfilledCol = pHeaders.indexOf('fulfilledFromStock');

        payload.prodItems.forEach(function (newP) {
          var pInfo = getProductInfoByName(ss, newP.name);
          if (pInfo && pInfo.isEligible) {
            var isNewDone = String(newP.status || '').toUpperCase() === 'DONE' || String(newP.status || '').toUpperCase() === 'ĐÃ XONG';
            var qcStr = String(newP.qc_status || '').toUpperCase();
            var isNewQC = qcStr.indexOf('ĐÃ DUYỆT') > -1 || qcStr === 'ĐẠT';

            var isReady = isNewDone && isNewQC;

            if (isReady) {
              // Tìm trạng thái cũ từ sheet để chỉ xử lý khi trạng thái chuyển từ Chưa Ready sang Ready
              var oldP = null;
              for (var rIdx = 1; rIdx < pData.length; rIdx++) {
                if (String(pData[rIdx][pIdCol]) === String(newP.id)) {
                  oldP = {
                    status: String(pData[rIdx][pStatusCol] || ''),
                    qc_status: String(pData[rIdx][pHeaders.indexOf('qc_status')] || ''),
                    orderId: String(pData[rIdx][pOrderIdCol] || ''),
                    fulfilledFromStock: String(pData[rIdx][pFulfilledCol]).toUpperCase() === 'TRUE'
                  };
                  break;
                }
              }

              var oldIsDone = oldP && (oldP.status.toUpperCase() === 'DONE' || oldP.status.toUpperCase() === 'ĐÃ XONG');
              var oldQcStr = oldP ? oldP.qc_status.toUpperCase() : '';
              var oldIsQC = oldQcStr.indexOf('ĐÃ DUYỆT') > -1 || oldQcStr === 'ĐẠT';
              var wasAlreadyReady = oldIsDone && oldIsQC;

              var isFulfilledFromStock = (newP.fulfilledFromStock === true || String(newP.fulfilledFromStock).toUpperCase() === 'TRUE') || (oldP && oldP.fulfilledFromStock);
              if (!wasAlreadyReady && !isFulfilledFromStock) {
                // 1. Tự động tạo phiếu nhập kho
                var cost = pInfo.costPrice;
                var logId = 'IE_AUTO_IMPORT_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                var itemsDataStr = JSON.stringify([{ name: newP.name, qty: 1, price: cost }]);
                payload.ImportExport = payload.ImportExport || [];
                payload.ImportExport.push({
                  id: logId,
                  type: 'Nhập',
                  target: 'Tự động nhập kho (Sản xuất xong)',
                  totalAmount: cost,
                  date: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss"),
                  note: 'Tự động nhập kho từ lệnh sản xuất hoàn thành: ' + newP.name,
                  itemsData: itemsDataStr
                });

                // Tăng số lượng tồn kho lên 1
                var tempProdSheet = ss.getSheetByName('Products');
                if (tempProdSheet) {
                  tempProdSheet.getRange(pInfo.rowIndex, pInfo.qtyColIndex + 1).setValue(pInfo.qty + 1);
                }

                // 2. Chuyển trạng thái đơn sang Sẵn sàng đóng gói
                var orderId = newP.orderId || (oldP ? oldP.orderId : '');
                if (orderId) {
                  var ordersSheet = ss.getSheetByName('Orders');
                  var oData = ordersSheet.getDataRange().getValues();
                  var oHeaders = oData[0];
                  var oIdCol = oHeaders.indexOf('id');
                  var oChannelCol = oHeaders.indexOf('channel');
                  var oStatusCol = oHeaders.indexOf('status');

                  var orderRowIndex = -1;
                  var orderChannel = '';
                  for (var oR = 1; oR < oData.length; oR++) {
                    if (String(oData[oR][oIdCol]) === String(orderId)) {
                      orderRowIndex = oR + 1;
                      orderChannel = String(oData[oR][oChannelCol]);
                      break;
                    }
                  }

                  if (orderChannel === 'Sản Xuất Tồn' || orderChannel === 'Sản Xuất Bù Kho') {
                    // Nếu lệnh sản xuất bù tồn kho xong trước -> đổi lệnh sản xuất của đơn chờ sang sản xuất tồn
                    var targetProdRowIndex = -1;
                    var targetOrderId = '';
                    for (var pr = 1; pr < pData.length; pr++) {
                      var nameMatch = normalizeProdName(pData[pr][pNameCol]) === normalizeProdName(newP.name);
                      var isPending = String(pData[pr][pStatusCol]).toUpperCase() !== 'DONE';
                      var pOrdId = String(pData[pr][pOrderIdCol]);
                      var isFulfillStock = String(pData[pr][pFulfilledCol]).toUpperCase() === 'TRUE';

                      if (nameMatch && isPending && !isFulfillStock) {
                        for (var oR = 1; oR < oData.length; oR++) {
                          if (String(oData[oR][oIdCol]) === pOrdId) {
                            var ch = String(oData[oR][oChannelCol]);
                            if (ch !== 'Sản Xuất Tồn' && ch !== 'Sản Xuất Bù Kho') {
                              targetProdRowIndex = pr + 1;
                              targetOrderId = pOrdId;
                              break;
                            }
                          }
                        }
                        if (targetProdRowIndex !== -1) break;
                      }
                    }

                    if (targetProdRowIndex !== -1) {
                      // Đổi lệnh sản xuất đơn hàng thường thành bốc tồn kho
                      prodSheet.getRange(targetProdRowIndex, pFulfilledCol + 1).setValue(true);
                      prodSheet.getRange(targetProdRowIndex, pStatusCol + 1).setValue('Done');

                      // Cập nhật đơn hàng bán lẻ liên kết sang Sẵn sàng đóng gói
                      for (var oR = 1; oR < oData.length; oR++) {
                        if (String(oData[oR][oIdCol]) === String(targetOrderId)) {
                          var cStat = String(oData[oR][oStatusCol] || '').toUpperCase().trim();
                          var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                          if (!isTerm) {
                            oData[oR][oStatusCol] = 'Sẵn sàng đóng gói';
                            ordersModified = true;
                          }
                          break;
                        }
                      }
                    }
                  } else {
                    // Lệnh sản xuất trực tiếp của đơn xong -> chuyển trạng thái đơn hàng
                    if (orderRowIndex !== -1) {
                      var cStat = String(oData[orderRowIndex - 1][oStatusCol] || '').toUpperCase().trim();
                      var isTerm = (cStat === 'ĐÃ BÀN GIAO' || cStat === 'ĐÃ GIAO' || cStat === 'HOÀN THÀNH' || cStat === 'ĐÃ HỦY' || cStat === 'ĐƠN HUỶ' || cStat === 'HỦY' || cStat === 'HUỶ' || cStat === 'ĐỐI SOÁT THÀNH CÔNG' || cStat === 'HÀNG HOÀN' || cStat === 'CANCELLED');
                      if (!isTerm) {
                        ordersSheet.getRange(orderRowIndex, oStatusCol + 1).setValue('Sẵn sàng đóng gói');
                      }
                    }
                  }
                }
              }
            }
          }
        });
      }
    }

    // === CHỐNG TRỪ KÉP KHO HÀNG (SAFE HANDOVER) ===
    if (payload.orders && payload.orders.length > 0) {
      var ordersSheetObj = ss.getSheetByName('Orders');
      var oldOrdersData = ordersSheetObj ? ordersSheetObj.getDataRange().getValues() : [];
      var oIdColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('id') : -1;
      var oStatusColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('status') : -1;
      var oCodeColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('orderCode') : -1;
      var oAccColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('accessories') : -1;
      var oChanColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('channel') : -1;

      var ordersToHandover = [];
      payload.orders.forEach(function (incomingOrder) {
        var isTargetHandover = String(incomingOrder.status || '').toUpperCase().trim() === 'ĐÃ BÀN GIAO';
        if (isTargetHandover && oIdColIdx !== -1 && oStatusColIdx !== -1) {
          var oldStatus = '';
          for (var r = 1; r < oldOrdersData.length; r++) {
            if (String(oldOrdersData[r][oIdColIdx]) === String(incomingOrder.id)) {
              oldStatus = String(oldOrdersData[r][oStatusColIdx]).toUpperCase().trim();
              if (!incomingOrder.orderCode && oCodeColIdx !== -1) incomingOrder.orderCode = oldOrdersData[r][oCodeColIdx];
              if (!incomingOrder.accessories && oAccColIdx !== -1) incomingOrder.accessories = oldOrdersData[r][oAccColIdx];
              if (!incomingOrder.channel && oChanColIdx !== -1) incomingOrder.channel = oldOrdersData[r][oChanColIdx];
              break;
            }
          }
          if (oldStatus !== 'ĐÃ BÀN GIAO' && oldStatus !== 'HÀNG HOÀN' && oldStatus !== 'ĐƠN HUỶ' && oldStatus !== 'ĐƠN HỦY' && oldStatus !== 'HỦY' && oldStatus !== 'HUỶ') {
            ordersToHandover.push(incomingOrder);
          }
        }
      });

      if (ordersToHandover.length > 0) {
        safeDeductInventoryOnHandover(ordersToHandover, ss);

        // Loại bỏ payload.Products và payload.ImportExport rác từ Frontend để tránh trừ kép
        if (payload.ImportExport) {
          payload.ImportExport = payload.ImportExport.filter(function (ie) {
            return !(ie.target === 'Bàn Giao Khách Hàng' && String(ie.id).includes('IE_OUT_BULK_'));
          });
        }
        if (payload.Products) {
          payload.Products = payload.Products.filter(function (p) {
            return p._diff === undefined;
          });
        }
      }

      applyDeltasToSheet('Orders', payload.orders, formatOrder, ss);
    }
    if (payload.prodItems && payload.prodItems.length > 0) {
      applyDeltasToSheet('Production', payload.prodItems, formatProd, ss);
    }
    if (payload.packings && payload.packings.length > 0) applyDeltasToSheet('Packings', payload.packings, formatPacking, ss);
    var attDeltas = payload.attendance || payload.Attendance;
    if (attDeltas && attDeltas.length > 0) applyDeltasToSheet('Attendance', attDeltas, formatAtt, ss);
    // === ĐỒNG BỘ TÊN HÀNG HÓA KHI ĐỔI TÊN/SKU TRONG KHO ===
    if (payload.Products && payload.Products.length > 0) {
      var prodSheet = ss.getSheetByName('Products');
      var orderSheetObj = ss.getSheetByName('Orders');
      var productionSheetObj = ss.getSheetByName('Production');

      if (prodSheet && orderSheetObj && productionSheetObj) {
        var pData = prodSheet.getDataRange().getValues();
        var pHeaders = pData[0];
        var idIdx = pHeaders.indexOf('id');
        var nameIdx = pHeaders.indexOf('name');

        var oData = orderSheetObj.getDataRange().getValues();
        var oHeaders = oData[0];
        var oAccIdx = oHeaders.indexOf('accessories');

        var prodData = productionSheetObj.getDataRange().getValues();
        var prodHeaders = prodData[0];
        var prodNameIdx = prodHeaders.indexOf('name');

        var ordersModified = false;
        var productionModified = false;

        payload.Products.forEach(function (newProd) {
          if (!newProd.id || !newProd.name) return;

          for (var i = 1; i < pData.length; i++) {
            if (String(pData[i][idIdx]) === String(newProd.id)) {
              var oldName = String(pData[i][nameIdx] || '').trim();
              var newName = String(newProd.name || '').trim();

              if (oldName && oldName !== newName) {
                // Đổi tên trong lệnh sản xuất
                for (var pr = 1; pr < prodData.length; pr++) {
                  if (String(prodData[pr][prodNameIdx] || '').trim() === oldName) {
                    prodData[pr][prodNameIdx] = newName;
                    productionModified = true;
                  }
                }

                // Đổi tên trong phụ kiện đơn hàng
                for (var or = 1; or < oData.length; or++) {
                  var accStr = String(oData[or][oAccIdx] || '');
                  if (accStr && accStr.indexOf(oldName) !== -1) {
                    try {
                      var accArr = JSON.parse(accStr);
                      var accChanged = false;
                      for (var a = 0; a < accArr.length; a++) {
                        if (String(accArr[a].name).trim() === oldName) {
                          accArr[a].name = newName;
                          accChanged = true;
                        }
                      }
                      if (accChanged) {
                        oData[or][oAccIdx] = JSON.stringify(accArr);
                        ordersModified = true;
                      }
                    } catch (e) { }
                  }
                }
              }
              break;
            }
          }
        });

        if (productionModified) productionSheetObj.getRange(1, 1, prodData.length, prodHeaders.length).setValues(prodData);
        if (ordersModified) orderSheetObj.getRange(1, 1, oData.length, oHeaders.length).setValues(oData);
      }
    }

    if (payload.Products && payload.Products.length > 0) applyDeltasToSheet('Products', payload.Products, formatProduct, ss);
    if (payload.Accounts && payload.Accounts.length > 0) applyDeltasToSheet('Accounts', payload.Accounts, formatAccount, ss);
    if (payload.Suppliers && payload.Suppliers.length > 0) applyDeltasToSheet('Suppliers', payload.Suppliers, formatSupplier, ss);
    if (payload.Transactions && payload.Transactions.length > 0) applyDeltasToSheet('Transactions', payload.Transactions, formatTransaction, ss);
    if (payload.ImportExport && payload.ImportExport.length > 0) applyDeltasToSheet('ImportExport', payload.ImportExport, formatImportExport, ss);
    if (payload.documents && payload.documents.length > 0) applyDeltasToSheet('Documents', payload.documents, formatDocument, ss);
    if (payload.trainings && payload.trainings.length > 0) applyDeltasToSheet('Trainings', payload.trainings, formatTraining, ss);
    if (payload.Reimbursements && payload.Reimbursements.length > 0) applyDeltasToSheet('Reimbursements', payload.Reimbursements, formatReimbursement, ss);
    if (payload.Models3D && payload.Models3D.length > 0) applyDeltasToSheet('Models3D', payload.Models3D, function (x) { return x; }, ss);
    if (payload.ProfitReports && payload.ProfitReports.length > 0) applyDeltasToSheet('ProfitReports', payload.ProfitReports, formatProfitReport, ss);
    if (payload.BonusPenalty && payload.BonusPenalty.length > 0) {
      applyDeltasToSheet('BonusPenalty', payload.BonusPenalty, formatBonusPenalty, ss);
      logBehavior('Cập nhật BonusPenalty', 'Nhân sự thực hiện: ' + (auth ? auth.user : 'Unknown') + ' | Cập nhật ' + payload.BonusPenalty.length + ' bản ghi.');
    }
    if (payload.KPI_Progress && payload.KPI_Progress.length > 0) applyDeltasToSheet('KPI_Progress', payload.KPI_Progress, formatKPIProg, ss);
    if (payload.BOM_Config && payload.BOM_Config.length > 0) applyDeltasToSheet('BOM_Config', payload.BOM_Config, formatBOMConfig, ss);
    // XỬ LÝ RIÊNG TÀI CHÍNH CỘNG TÁC VIÊN (CÁCH LY VỚI SỔ QUỸ CHÍNH)
    if (payload.ctvTransactions && payload.ctvTransactions.length > 0) {
      let financeSheet = ss.getSheetByName('CTV_Finance');

      // Tự động tạo Sheet "CTV_Finance" nếu chưa tồn tại
      if (!financeSheet) {
        financeSheet = ss.insertSheet('CTV_Finance');
        financeSheet.appendRow(['id', 'date', 'type', 'amount', 'note', 'user', 'status']);
        financeSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
      }

      // Nạp các phiếu tài chính vào Sheet riêng biệt
      var ctvRows = [];
      payload.ctvTransactions.forEach(t => {
        ctvRows.push([t.id, t.date, t.type, t.amount, t.note, t.user, t.status]);
      });
      if (ctvRows.length > 0) {
        financeSheet.getRange(financeSheet.getLastRow() + 1, 1, ctvRows.length, ctvRows[0].length).setValues(ctvRows);
      }
    }
    if (payload.UserConfigs && payload.UserConfigs.length > 0) {
      updateUserConfigSheet(payload.UserConfigs[0]);
      var updatedUser = payload.UserConfigs[0]['Tên Nhân Sự'] || 'N/A';
      logBehavior('Cập nhật Config_NhanSu', 'Nhân sự thực hiện: ' + (auth ? auth.user : 'Unknown') + ' | Sửa cấu hình của: ' + updatedUser);
    }

    var props = PropertiesService.getScriptProperties();
    if (payload.announcement !== undefined) {
      props.setProperty('RF_ANNOUNCEMENT', payload.announcement);
    }
    if (payload.deletes) {
      var keyMapping = {
        'orders': 'Orders',
        'Orders': 'Orders',
        'Production': 'Production',
        'prodItems': 'Production',
        'packings': 'Packings',
        'Packings': 'Packings',
        'Products': 'Products',
        'ImportExport': 'ImportExport',
        'Transactions': 'Transactions',
        'Accounts': 'Accounts',
        'Suppliers': 'Suppliers',
        'BonusPenalty': 'BonusPenalty',
        'KPI_Progress': 'KPI_Progress',
        'Attendance': 'Attendance',
        'attendance': 'Attendance',
        'Documents': 'Documents',
        'documents': 'Documents',
        'Trainings': 'Trainings',
        'trainings': 'Trainings',
        'Models3D': 'Models3D',
        'BOM_Config': 'BOM_Config'
      };
      Object.keys(payload.deletes).forEach(function (clientKey) {
        var sName = keyMapping[clientKey] || clientKey;
        if (SCHEMA[sName] || SCHEMA_ERP[sName]) {
          deleteDeltas(sName, payload.deletes[clientKey], ss);
        }
      });
    }
    SpreadsheetApp.flush();
    props.setProperty('RF_LAST_UPDATED', new Date().getTime().toString());

  } catch (err) {
    Logger.log('Lỗi syncDeltas: ' + err.toString());
    return { success: false, message: 'Lỗi đồng bộ dữ liệu: ' + err.toString() };
  } finally { lock.releaseLock(); }

  // Để đảm bảo tốc độ phản hồi siêu tốc "Bấm là nhận luôn" và không làm giao diện
  // nhảy loạn lên, chúng ta chỉ trả về tín hiệu thành công thay vì bắt Frontend tải lại toàn bộ 23 bảng.
  var d = { success: true };
  d.serverTime = new Date().getTime();
  return d;
}

const ADMIN_ROLES = ['TỐI CAO', 'QUẢN LÝ CẤP TRUNG', 'QUẢN LÝ SẢN XUẤT', 'SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'KHO VẬN', 'BÁN HÀNG', 'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ NHÂN SỰ', 'NHÂN SỰ', 'KẾ TOÁN', 'QUẢN LÝ KIỂM TOÁN', 'KIỂM TOÁN', 'NHÂN VIÊN', 'CỘNG TÁC VIÊN', 'CTV', 'KHÁCH'];
const BOSS_ROLES = ['TỐI CAO'];

function getUserConfig() {
  const cache = CacheService.getScriptCache();
  // BYPASS CACHE DE-BUG:
  // const cached = cache.get('USER_CONFIG');
  // if (cached) {
  //   try { return JSON.parse(cached); } catch (e) { console.warn('Cache corrupted...'); }
  // }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config_NhanSu');
    if (!sheet) { console.error('Sheet Config_NhanSu not found'); return getEmptyConfig("Lỗi: Không tìm thấy sheet Config_NhanSu"); }

    const data = sheet.getDataRange().getValues();
    const config = { avatars: {}, titles: {}, subTitles: {}, salaries: {}, pins: {}, users: [], roles: {} };

    if (data.length === 0) return getEmptyConfig("Lỗi: Sheet Config_NhanSu không có dữ liệu (data.length === 0)");
    const headers = data[0];
    const getCol = (names, fallback) => {
      for (let n of names) {
        let idx = headers.findIndex(h => String(h).trim().toLowerCase() === n.toLowerCase());
        if (idx !== -1) return idx;
      }
      return fallback;
    };

    const nameCol = getCol(['Tên Nhân Sự'], 0);
    const avatarCol = getCol(['ID Ảnh'], 1);
    const titleCol = getCol(['Chức Danh'], 2);
    const subTitleCol = getCol(['Chức Danh Phụ'], -1);
    const roleCol = getCol(['Phân Quyền'], 3);
    const pinCol = getCol(['Mã PIN'], 4);
    const baseSalCol = getCol(['Lương Cơ Bản'], -1);
    const funcSalCol = getCol(['Lương Chức Vụ'], -1);
    const allowCol = getCol(['Phụ Cấp Xăng Xe'], -1);
    const deductCol = getCol(['Khoản Trừ Vi Phạm'], -1);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = String(row[nameCol] || '').trim();
      if (!name) continue;

      config.users.push(name);
      const linkOrId = String(row[avatarCol] || '').trim();
      if (linkOrId) {
        const match = linkOrId.match(/[-\w]{25,}/);
        config.avatars[name] = match ? match[0] : linkOrId;
      }

      const title = String(row[titleCol] || '').trim();
      if (title) config.titles[name] = title;

      if (subTitleCol !== -1) {
        const subTitle = String(row[subTitleCol] || '').trim();
        if (subTitle) config.subTitles[name] = subTitle;
      }

      const role = String(row[roleCol] || '').trim().toUpperCase() || 'THỢ';
      config.roles[name] = role;

      var pin = String(row[pinCol] || '').trim();
      if (pin) {
        // Loại bỏ phần thập phân .0 nếu có (ví dụ "123456.0" -> "123456")
        pin = pin.replace(/\.0+$/, '');

        var pinObj = {
          name: name,
          role: role,
          title: title,
          subTitle: subTitleCol !== -1 ? String(row[subTitleCol] || '').trim() : '',
          avatar: config.avatars[name] || ''
        };

        // Lưu trữ mã PIN gốc đã chuẩn hóa
        config.pins[pin] = pinObj;

        // Nếu mã PIN chỉ chứa chữ số, xử lý thêm trường hợp mất số 0 đầu hoặc thừa số 0 đầu
        if (/^\d+$/.test(pin)) {
          // 1. Thêm số 0 đầu cho đủ 6 chữ số nếu độ dài < 6 (ví dụ: "12345" -> "012345")
          if (pin.length < 6) {
            var padded = pin.padStart(6, '0');
            config.pins[padded] = pinObj;
          }
          // 2. Bỏ số 0 đầu (ví dụ: "012345" -> "12345")
          var intVal = parseInt(pin, 10);
          if (!isNaN(intVal)) {
            config.pins[String(intVal)] = pinObj;
          }
        }
      }

      config.salaries[name] = {
        baseSalary: parseNumber(row[baseSalCol]),
        funcSalary: parseNumber(row[funcSalCol]),
        allowance: parseNumber(row[allowCol]),
        deduction: parseNumber(row[deductCol])
      };
    }

    cache.put('USER_CONFIG', JSON.stringify(config), 300);
    return config;

  } catch (e) {
    console.error('Error in getUserConfig:', e);
    return getEmptyConfig(e.toString());
  }
}

function parseNumber(val) {
  if (!val) return 0;
  const num = Number(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

function getEmptyConfig(debugMsg) {
  return { avatars: {}, titles: {}, salaries: {}, pins: {}, users: [], roles: {}, _debugMsg: debugMsg };
}

function validatePin(pin) {
  if (!pin) { return { valid: false, user: null, role: '', isAdmin: false, isBoss: false }; }
  const config = getUserConfig();

  if (config._debugMsg) {
    return { valid: false, _debugMsg: config._debugMsg };
  }

  var pinStr = String(pin).trim().replace(/\.0+$/, '');
  var userInfo = config.pins[pinStr];

  // Thử tìm theo chuỗi số nguyên (bỏ số 0 đầu)
  if (!userInfo && /^\d+$/.test(pinStr)) {
    var intVal = parseInt(pinStr, 10);
    if (!isNaN(intVal)) {
      userInfo = config.pins[String(intVal)];
    }
  }

  // Thử tìm theo chuỗi đã đệm số 0 đầu cho đủ 6 ký tự
  if (!userInfo && /^\d+$/.test(pinStr) && pinStr.length < 6) {
    var padded = pinStr.padStart(6, '0');
    userInfo = config.pins[padded];
  }

  if (!userInfo) {
    return { valid: false, _debugMsg: "PIN không tồn tại. Các mã PIN hệ thống đang đọc được là: " + Object.keys(config.pins).join(", ") };
  }
  const role = userInfo.role || 'THỢ';

  return {
    valid: true,
    user: userInfo.name,
    role: role,
    title: userInfo.title || '',
    isAdmin: ADMIN_ROLES.indexOf(role) > -1,
    isBoss: BOSS_ROLES.indexOf(role) > -1
  };
}

function uploadImage(base64Data, fileName) {
  try {
    var FOLDER_ID = "1zZ3PlDKLBzAgAK6oM-hgosfVF6T1Y3o0";
    var folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (folderErr) {
      // Fallback: Tìm hoặc tạo thư mục "RF_Production_Photos" ở thư mục gốc nếu ID cứng bị lỗi hoặc không có quyền truy cập
      var folderName = "RF_Production_Photos";
      var folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
    }

    var data = base64Data;
    if (base64Data.indexOf(",") > -1) { data = base64Data.split(",")[1]; }
    var blob = Utilities.newBlob(Utilities.base64Decode(data), "image/jpeg", fileName);
    var file = folder.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingErr) {
      console.warn("Không thể thiết lập quyền chia sẻ công khai: " + sharingErr.message);
    }

    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800";
  } catch (e) {
    console.error("Lỗi trong uploadImage:", e);
    return "";
  }
}

function uploadDocumentToDrive(base64Data, fileName, mimeType) {
  try {
    if (!base64Data) { throw new Error("Dữ liệu file (base64) bị thiếu"); }
    let data = base64Data;
    if (base64Data.indexOf(",") > -1) { data = base64Data.split(",")[1]; }
    if (!data) { throw new Error("Không thể tách dữ liệu base64"); }
    const blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType || "application/octet-stream", fileName);
    const file = DriveApp.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const previewUrl = file.getUrl().replace(/\/view.*$/, '/preview');
    return previewUrl;
  } catch (e) {
    console.error("Lỗi uploadDocumentToDrive:", e);
    throw new Error("Lỗi tải file lên Drive: " + e.message);
  }
}

function api_getActiveEmployees() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config_NhanSu');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const nameIdx = headers.indexOf('Tên Nhân Sự');
  if (nameIdx === -1) return [];

  let employees = [];
  for (let i = 1; i < data.length; i++) {
    let name = data[i][nameIdx];
    if (name && name.toString().trim() !== "") {
      employees.push(name.toString().trim());
    }
  }
  return employees;
}

function processOCR(base64Data) {
  try {
    var boundary = "xxxxxxxxxx";
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), "application/pdf", "temp_ocr.pdf");

    var metadata = {
      title: 'temp_ocr_doc',
      mimeType: 'application/pdf'
    };

    var requestBody = Utilities.newBlob(
      "--" + boundary + "\r\n" +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) + "\r\n" +
      "--" + boundary + "\r\n" +
      "Content-Type: application/pdf\r\n\r\n"
    ).getBytes().concat(blob.getBytes()).concat(Utilities.newBlob("\r\n--" + boundary + "--\r\n").getBytes());

    var url = "https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&ocr=true&ocrLanguage=vi";
    var options = {
      method: "post",
      contentType: "multipart/related; boundary=" + boundary,
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken()
      },
      payload: requestBody,
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var resText = response.getContentText();
    var resJson = JSON.parse(resText);

    if (resJson.error) {
      throw new Error(resJson.error.message);
    }

    var fileId = resJson.id;
    var doc = DocumentApp.openById(fileId);
    var text = doc.getBody().getText();

    // Delete temporary OCR file
    var deleteUrl = "https://www.googleapis.com/drive/v2/files/" + fileId;
    UrlFetchApp.fetch(deleteUrl, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken()
      },
      muteHttpExceptions: true
    });

    return text;
  } catch (e) {
    console.error("Lỗi processOCR: " + e.toString());
    throw new Error("Lỗi phân tích OCR PDF: " + e.message);
  }
}


function isExportChannel(channelStr) {
  if (!channelStr) return false;
  var raw = String(channelStr).trim().toUpperCase();
  if (raw.indexOf('XUẤT KHẨU') !== -1 || raw.indexOf('EXPORT') !== -1 || raw.indexOf('QUỐC TẾ') !== -1 || raw.indexOf('INTERNATIONAL') !== -1 || raw.indexOf('GLOBAL') !== -1) return true;
  if (/\b(MALAYSIA|THAILAND|PHILIPPINES|SINGAPORE|TAIWAN)\b/i.test(raw)) return true;
  if (/\bSHOPEE\s*[-_]?\s*(TH|MA|MY|SG|TW|PH)\b/i.test(raw)) return true;
  if (/\b(SHOPEE_TH|SHOPEE_MA|SHOPEE_MY|SHOPEE_SG|SHOPEE_TW|SHOPEE_PH)\b/i.test(raw)) return true;
  if (/\b(MY|TH|PH|SG|TW|MA)\b/i.test(raw) && raw.indexOf('SHOPEE') !== -1) return true;
  return false;
}

function getSopAndRewardBackend(item, phaseName, kpiConfig, channel = '') {
  if (!item?.name || !kpiConfig?.length) { return { time: 30, reward: 0 }; }
  const rawName = String(item.name).toLowerCase().trim();
  const phase = String(phaseName || '').toLowerCase();
  const itemType = String(item.type || '').toUpperCase();
  const isLayoutItem = itemType === 'LAYOUT' || /rừng|layout|đảo|bonsai|trang|cover|nature|suối|vách|hẻm|núi|cầu|thác|hang|tiểu cảnh/i.test(rawName);

  let matchedRow = kpiConfig.find(row => {
    const sku = String(row['Từ Khoá'] || '').toLowerCase().trim();
    const name = String(row['Tên Hàng'] || '').toLowerCase().trim();
    if (sku && rawName.includes(sku)) return true;
    if (name && (rawName === name || rawName.includes(name))) return true;
    return false;
  });

  if (!matchedRow && (rawName.includes('bể') || rawName.includes('terra')) && !isLayoutItem && !rawName.includes('combo') && !rawName.includes('setup')) {
    let reward = 0;
    let time = 30;
    if (phase.includes('phase1') || phase.includes('cắt') || phase.includes('dán') || phase.includes('dựng') || phase.includes('khâu 1') || phase === 'v1') {
      reward = 5000;
    } else if (phase.includes('phase2') || phase.includes('gọt') || phase.includes('keo') || phase.includes('gia cố') || phase.includes('khâu 2') || phase === 'v2') {
      reward = 2000;
    } else if (phase.includes('đóng gói') || phase.includes('pack')) {
      reward = 2000;
    }
    if (isExportChannel(channel)) reward *= 3;
    return { time, reward };
  }

  if (!matchedRow && isLayoutItem) {
    const sizeMatch = rawName.match(/size\s*(\d{2,3})|(\d{2,3})[x×]/);
    const size = sizeMatch ? parseInt(sizeMatch[1] || sizeMatch[2]) : 0;

    if (size > 0) {
      matchedRow = kpiConfig.find(row => {
        const rowGroup = String(row['Nhóm Hàng'] || '').toUpperCase().trim();
        if (rowGroup && !rowGroup.includes('LAYOUT')) return false;

        const rowName = String(row['Tên Hàng'] || '').toLowerCase();
        if (size >= 130) return rowName.includes('130');
        if (size >= 110) return rowName.includes('110') || rowName.includes('120');
        if (size >= 90) return rowName.includes('90') || rowName.includes('100');
        if (size >= 70) return rowName.includes('70') || rowName.includes('80');
        if (size >= 60) return rowName.includes('60');
        if (size >= 50) return rowName.includes('50');
        if (size >= 40) return rowName.includes('40');
        if (size >= 30) return rowName.includes('30');
        if (size > 0) return rowName.includes('20') || rowName.includes('15');
        return false;
      });
    }
  }

  if (!matchedRow) {
    const specialKeywords = ['rồng', 'đại bàng', 'phượng hoàng', 'cá voi', 'khủng long', 'tê giác'];
    if (specialKeywords.some(kw => rawName.includes(kw))) {
      matchedRow = kpiConfig.find(row =>
        String(row['Tên Hàng'] || '').toLowerCase().includes('đặc biệt') || String(row['Tên Hàng'] || '').toLowerCase().includes('special')
      );
    }
  }

  if (!matchedRow) return { time: 30, reward: 0 };

  let reward = 0;
  if (phase.includes('phase1') || phase.includes('cắt') || phase.includes('dán') || phase.includes('dựng') || phase.includes('khâu 1')) {
    reward = Number(matchedRow['Tiền Khâu 1']) || 0;
  }
  else if (phase.includes('phase2') || phase.includes('gọt') || phase.includes('keo') || phase.includes('gia cố') || phase.includes('khâu 2')) {
    reward = Number(matchedRow['Tiền Khâu 2']) || 0;
  }
  else if (phase.includes('đóng gói') || phase.includes('pack')) {
    reward = Number(matchedRow['Thưởng Đóng Gói']) || Number(matchedRow['Tiền Đóng Gói']) || 0;
  }

  if (isExportChannel(channel)) {
    reward *= 3;
  }

  return { time: 30, reward };
}


function getPackingReward(itemObj, kpiConfig, channel = '') {
  const mult = /SG|MY|TH|PH|MA|TW|Quốc Tế|Xuất Khẩu/i.test(channel) ? 3 : 1;
  if (!itemObj || !kpiConfig || kpiConfig.length === 0) return 1000 * mult;

  const itemName = typeof itemObj === 'string' ? itemObj : itemObj.name;
  const itemType = typeof itemObj === 'object' ? String(itemObj.type || '').toUpperCase() : '';
  const rawName = String(itemName).toLowerCase().trim();
  const isLayoutItem = itemType === 'LAYOUT' || /rừng|layout|đảo|bonsai|trang|cover|nature|suối|vách|hẻm|núi|cầu|thác|hang|tiểu cảnh/i.test(rawName);

  let matchedRow = kpiConfig.find(row => {
    const sku = String(row['Từ Khoá'] || '').toLowerCase().trim();
    const name = String(row['Tên Hàng'] || '').toLowerCase().trim();
    if (sku && rawName.includes(sku)) return true;
    if (name && (rawName === name || rawName.includes(name))) return true;
    return false;
  });

  if (!matchedRow && isLayoutItem) {
    const sizeMatch = rawName.match(/size\s*(\d{2,3})|(\d{2,3})[x×]/);
    const size = sizeMatch ? parseInt(sizeMatch[1] || sizeMatch[2]) : 0;

    if (size > 0) {
      matchedRow = kpiConfig.find(row => {
        const rowGroup = String(row['Nhóm Hàng'] || '').toUpperCase().trim();
        if (rowGroup && !rowGroup.includes('LAYOUT')) return false;

        const rowName = String(row['Tên Hàng'] || '').toLowerCase();
        if (size >= 130) return rowName.includes('130');
        if (size >= 110) return rowName.includes('110') || rowName.includes('120');
        if (size >= 90) return rowName.includes('90') || rowName.includes('100');
        if (size >= 70) return rowName.includes('70') || rowName.includes('80');
        if (size >= 60) return rowName.includes('60');
        if (size >= 50) return rowName.includes('50');
        if (size >= 40) return rowName.includes('40');
        if (size >= 30) return rowName.includes('30');
        if (size > 0) return rowName.includes('20') || rowName.includes('15');
        return false;
      });
    }
  }

  let reward = matchedRow ? (Number(matchedRow['Thưởng Đóng Gói']) || 1000) : 1000;
  return reward * mult;
}




function logBehavior(action, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(); const sheet = ss.getSheetByName("Tracking_Log");
    if (sheet) { sheet.appendRow([new Date(), action, details]); }
  } catch (e) { }
}

// =========================================================================
// HỆ THỐNG TỰ ĐỘNG QUÉT EMAIL VÀ ĐỐI SOÁT GIAO DỊCH TÀI CHÍNH (CASHFLOW)
// =========================================================================
function scanAutoEmails() {
  var lock = LockService.getScriptLock();
  try {
    // Đảm bảo đồng bộ hóa ghi đè đồng thời trên Google Sheets
    lock.waitLock(30000);

    var queries = [
      'is:unread from:cskh@ghn.vn subject:"thông báo thông tin chuyển tiền"',
      'is:unread from:info@mail.spxexpress.com subject:"biên bản trả hàng"',
      'is:unread subject:"biến động số dư"',
      'is:unread subject:"giao dịch"',
      'is:unread subject:"vietcombank"',
      'is:unread subject:"techcombank"',
      'is:unread subject:"mbbank"',
      'is:unread subject:"tpbank"',
      'is:unread subject:"acb"',
      'is:unread subject:"vpbank"'
    ];

    var threads = [];
    queries.forEach(function (query) {
      var found = GmailApp.search(query, 0, 10);
      threads = threads.concat(found);
    });

    if (threads.length === 0) return;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Transactions');
    if (!sheet) {
      sheet = ss.insertSheet('Transactions');
      sheet.appendRow(SCHEMA_ERP.Transactions);
      sheet.setFrozenRows(1);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0] || SCHEMA_ERP.Transactions;

    var txIds = {};
    for (var i = 1; i < data.length; i++) {
      var rowId = String(data[i][0]);
      if (rowId) txIds[rowId] = true;
    }

    var accountsSheet = ss.getSheetByName('Accounts');
    var accounts = accountsSheet ? accountsSheet.getDataRange().getValues() : [];

    threads.forEach(function (thread) {
      var messages = thread.getMessages();
      messages.forEach(function (message) {
        if (!message.isUnread()) return;

        var body = message.getPlainBody();
        var subject = message.getSubject();
        var date = message.getDate();
        var messageId = message.getId();
        var sender = message.getFrom();

        // Chống trùng lặp email đã xử lý
        if (txIds[messageId]) {
          message.markRead();
          return;
        }

        // Xử lý email đối soát từ GHN
        if (sender.toLowerCase().indexOf('cskh@ghn.vn') !== -1 && subject.toLowerCase().indexOf('thông báo thông tin chuyển tiền') !== -1) {
          processGHNEmail(subject, body, date, messageId, ss, sheet, headers, accounts);
          message.markRead();
          return;
        }

        // Xử lý email hoàn hàng từ SPX
        if (sender.toLowerCase().indexOf('spxexpress.com') !== -1 && subject.toLowerCase().indexOf('biên bản trả hàng') !== -1) {
          processSPXReturnEmail(message, ss);
          message.markRead();
          return;
        }

        var parsed = parseTransactionFromEmail(subject, body, date);
        if (parsed && parsed.amount > 0) {
          parsed.id = messageId;
          parsed.isAuto = "TRUE";

          // Tìm ID tài khoản quỹ tương ứng
          var accountName = parsed.accountName;
          var matchedAccountId = "";
          if (accountName && accounts.length > 1) {
            for (var a = 1; a < accounts.length; a++) {
              var accNameInSheet = String(accounts[a][1] || '').trim().toLowerCase();
              if (accNameInSheet.indexOf(accountName.toLowerCase()) !== -1) {
                matchedAccountId = accounts[a][0];
                break;
              }
            }
          }
          if (!matchedAccountId && accounts.length > 1) {
            matchedAccountId = accounts[1][0]; // Fallback tài khoản đầu tiên
          }

          if (parsed.type === "Thu") {
            parsed.toAccount = matchedAccountId;
            parsed.fromAccount = "";
          } else {
            parsed.fromAccount = matchedAccountId;
            parsed.toAccount = "";
          }

          var newRow = headers.map(function (h) {
            var val = parsed[h];
            if (typeof val === 'number' && isNaN(val)) return 0;
            return val !== undefined ? val : '';
          });

          sheet.appendRow(newRow);
          updateAccountBalance(ss, matchedAccountId, parsed.amount, parsed.type);
          txIds[messageId] = true;
        }

        // Đánh dấu đã đọc
        message.markRead();
      });
    });

    var props = PropertiesService.getScriptProperties();
    props.setProperty('RF_LAST_UPDATED', new Date().getTime().toString());
    SpreadsheetApp.flush();
  } catch (e) {
    console.error("Lỗi scanAutoEmails: " + e.toString());
    logBehavior("ERROR_SCAN_EMAILS", e.toString());
  } finally {
    lock.releaseLock();
  }
}

function parseTransactionFromEmail(subject, body, emailDate) {
  var content = body.replace(/\s+/g, ' ');
  var type = "Thu";
  var amount = 0;
  var note = "";
  var accountName = "";

  var text = (subject + " " + content).toLowerCase();

  // Xác định tài khoản
  if (/vietcombank/i.test(subject) || /vcb/i.test(content)) accountName = "Vietcombank";
  else if (/techcombank/i.test(subject) || /tcb/i.test(content)) accountName = "Techcombank";
  else if (/mbbank/i.test(subject) || /mb/i.test(content)) accountName = "MB Bank";
  else if (/tpbank/i.test(subject) || /tpb/i.test(content)) accountName = "TPBank";
  else if (/acb/i.test(subject)) accountName = "ACB";
  else if (/vpbank/i.test(subject)) accountName = "VPBank";
  else accountName = "Quỹ Chính";

  // Xác định dòng tiền Thu hay Chi
  if (text.indexOf('-') !== -1 ||
    /ghi nợ/i.test(text) ||
    /chuyển khoản đi/i.test(text) ||
    /trừ tiền/i.test(text) ||
    /thanh toán/i.test(text) ||
    /debit/i.test(text) ||
    /rút tiền/i.test(text)) {
    type = "Chi";
  }

  if (text.indexOf('+') !== -1 ||
    /ghi có/i.test(text) ||
    /cộng tiền/i.test(text) ||
    /nhận tiền/i.test(text) ||
    /chuyển khoản đến/i.test(text) ||
    /credit/i.test(text)) {
    type = "Thu";
  }

  // Quét tìm số tiền
  var p1 = /([+-])\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})\s*(?:vnd|đ|d|dong)?/i;
  var m1 = text.match(p1);
  if (m1) {
    if (m1[1] === '-') type = "Chi";
    else if (m1[1] === '+') type = "Thu";
    amount = Number(m1[2].replace(/[.,]/g, ''));
  } else {
    var p2 = /(?:ghi có|ghi no|ghi nợ|ghi co|số tiền|so tien|amount|biến động|bien dong|giao dịch|gd)\s*[:\-]?\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})/i;
    var m2 = text.match(p2);
    if (m2) {
      amount = Number(m2[1].replace(/[.,]/g, ''));
    } else {
      var p3 = /([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})\s*(?:vnd|đ|d|dong)/i;
      var m3 = text.match(p3);
      if (m3) {
        amount = Number(m3[1].replace(/[.,]/g, ''));
      }
    }
  }

  // Trích xuất nội dung giao dịch
  var noteRegex = /(?:nội dung|nội dung gd|nội dung giao dịch|nd|nd gd|mô tả|ly do|lý do|nội dung ck|noidung)\s*[:\-]?\s*([^.]+)/i;
  var matchNote = content.match(noteRegex);
  if (matchNote && matchNote[1]) {
    note = matchNote[1].trim();
  } else {
    note = subject;
  }

  if (note.length > 200) note = note.substring(0, 200) + "...";
  var category = classifyCategory(type, note);

  var dateStr = Utilities.formatDate(emailDate || new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  return {
    type: type,
    category: category,
    amount: amount,
    title: note || "Giao dịch tự động",
    date: dateStr,
    note: "Email Auto: " + note,
    accountName: accountName
  };
}

function processGHNEmail(subject, plainBody, emailDate, messageId, ss, txSheet, txHeaders, accounts) {
  try {
    var amountMatch = plainBody.match(/(?:Số tiền thực chuyển|Thực chuyển).*?([0-9]{1,3}(?:[.,][0-9]{3})+)/i);
    var totalAmount = amountMatch ? Number(amountMatch[1].replace(/[.,]/g, '')) : 0;

    var feeMatch = plainBody.match(/(?:Phí chuyển khoản).*?([0-9]{1,3}(?:[.,][0-9]{3})+)/i);
    var feeAmount = feeMatch ? Number(feeMatch[1].replace(/[.,]/g, '')) : 0;

    if (totalAmount <= 0) return;

    var ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) return;

    var ordersData = ordersSheet.getDataRange().getValues();
    var ordersHeaders = ordersData[0];

    var idIndex = ordersHeaders.indexOf('id');
    var codeIndex = ordersHeaders.indexOf('orderCode');
    var statusIndex = ordersHeaders.indexOf('status');

    if (idIndex === -1 || codeIndex === -1 || statusIndex === -1) return;

    var matchedOrders = [];
    var updatedRows = [];

    for (var i = 1; i < ordersData.length; i++) {
      var status = String(ordersData[i][statusIndex] || '');
      if (status !== 'Hoàn Thành' && status !== 'Đã Huỷ') {
        var orderCode = String(ordersData[i][codeIndex] || '');
        var mvdMatch = orderCode.match(/MVĐ:\s*([A-Za-z0-9]+)/i);
        var trackingCode = mvdMatch ? mvdMatch[1] : null;

        if (trackingCode && trackingCode.length >= 5 && plainBody.indexOf(trackingCode) !== -1) {
          matchedOrders.push({ code: trackingCode, fullCode: orderCode });
          updatedRows.push(i + 1);
        }
      }
    }

    if (matchedOrders.length > 0) {
      updatedRows.forEach(function (rowNum) {
        ordersSheet.getRange(rowNum, statusIndex + 1).setValue('Hoàn Thành');
      });

      var matchedAccountId = "";
      if (accounts && accounts.length > 1) {
        for (var a = 1; a < accounts.length; a++) {
          if (String(accounts[a][1] || '').toLowerCase().indexOf('bidv') !== -1) {
            matchedAccountId = accounts[a][0]; break;
          }
        }
        if (!matchedAccountId) matchedAccountId = accounts[1][0];
      }

      var dateStr = Utilities.formatDate(emailDate || new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      var joinedCodes = matchedOrders.map(function (m) { return m.code; }).join(', ');
      if (joinedCodes.length > 200) joinedCodes = joinedCodes.substring(0, 197) + "...";

      var txObj = {
        id: messageId,
        type: "Thu",
        category: "Doanh Thu Bán Hàng",
        amount: totalAmount,
        fromAccount: "",
        toAccount: matchedAccountId,
        title: "Đối soát GHN " + matchedOrders.length + " đơn",
        date: dateStr,
        note: "Các mã vận đơn: " + joinedCodes,
        isAuto: "TRUE"
      };

      var newRow = txHeaders.map(function (h) { return txObj[h] !== undefined ? txObj[h] : ''; });
      txSheet.appendRow(newRow);
      if (typeof updateAccountBalance === 'function') updateAccountBalance(ss, matchedAccountId, totalAmount, "Thu");

      if (feeAmount > 0) {
        var feeObj = {
          id: messageId + "_FEE",
          type: "Chi",
          category: "Phí Vận Hành",
          amount: feeAmount,
          fromAccount: matchedAccountId,
          toAccount: "",
          title: "Phí chuyển khoản GHN",
          date: dateStr,
          note: "Trừ phí đối soát",
          isAuto: "TRUE"
        };
        var feeRow = txHeaders.map(function (h) { return feeObj[h] !== undefined ? feeObj[h] : ''; });
        txSheet.appendRow(feeRow);
        if (typeof updateAccountBalance === 'function') updateAccountBalance(ss, matchedAccountId, feeAmount, "Chi");
      }
    }
  } catch (e) {
    console.error("Lỗi processGHNEmail: " + e.toString());
  }
}

function processSPXReturnEmail(message, ss) {
  try {
    if (typeof Drive === 'undefined' || typeof Drive.Files === 'undefined') {
      console.error("Vui lòng bật Drive API (v2 hoặc v3) trong phần Services của Apps Script để dùng OCR đọc PDF!");
      return;
    }

    var attachments = message.getAttachments();
    var pdfBlob = null;
    for (var i = 0; i < attachments.length; i++) {
      if (attachments[i].getContentType() === 'application/pdf') {
        pdfBlob = attachments[i];
        break;
      }
    }

    if (!pdfBlob) return;

    // Tải lên Drive dạng Google Doc để lấy text (OCR)
    var docFile;
    if (typeof Drive.Files.insert === 'function') {
      var resource = {
        title: pdfBlob.getName(),
        mimeType: pdfBlob.getContentType()
      };
      docFile = Drive.Files.insert(resource, pdfBlob, { ocr: true });
    } else if (typeof Drive.Files.create === 'function') {
      var resource = {
        name: pdfBlob.getName(),
        mimeType: 'application/vnd.google-apps.document'
      };
      docFile = Drive.Files.create(resource, pdfBlob);
    } else {
      console.error("Vui lòng sử dụng Drive API v2");
      return;
    }

    var doc = DocumentApp.openById(docFile.id);
    var fullText = doc.getBody().getText();

    // Xoá file doc tạm trên Drive
    if (typeof Drive.Files.remove === 'function') Drive.Files.remove(docFile.id);
    else if (typeof Drive.Files.trash === 'function') Drive.Files.trash(docFile.id);

    // Trích xuất mã SPXVN
    var spxMatches = fullText.match(/SPXVN[0-9]{10,15}/gi);
    if (!spxMatches || spxMatches.length === 0) return;

    var ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) return;

    var ordersData = ordersSheet.getDataRange().getValues();
    var headers = ordersData[0];

    var codeIndex = headers.indexOf('orderCode');
    var statusIndex = headers.indexOf('status');

    if (codeIndex === -1 || statusIndex === -1) return;

    var idIndex = headers.indexOf('id');
    var isCarriedIndex = headers.indexOf('isCarriedToWH');

    var packingsSheet = ss.getSheetByName('Packings');
    var packingsData = packingsSheet ? packingsSheet.getDataRange().getValues() : [];
    var pHeaders = packingsData.length > 0 ? packingsData[0] : [];
    var pOrderIdIdx = pHeaders.indexOf('orderId');
    var pStatusIdx = pHeaders.indexOf('status');

    var updatedRows = [];
    var matchedCodes = [];

    for (var j = 1; j < ordersData.length; j++) {
      var currentStatus = String(ordersData[j][statusIndex] || '');
      var currentStatusUpper = currentStatus.toUpperCase().trim();

      if (currentStatusUpper !== 'HÀNG HOÀN' && currentStatusUpper !== 'ĐÃ HỦY' && currentStatusUpper !== 'ĐƠN HUỶ' && currentStatusUpper !== 'ĐƠN HỦY') {
        var orderCode = String(ordersData[j][codeIndex] || '');
        var orderId = idIndex !== -1 ? String(ordersData[j][idIndex] || '') : orderCode;

        for (var k = 0; k < spxMatches.length; k++) {
          var spxCode = spxMatches[k];
          if (orderCode.indexOf(spxCode) !== -1) {
            // Kiểm tra xem đơn đã được đóng gói hoặc giao đi chưa
            var isPacked = false;
            if (pOrderIdIdx !== -1 && packingsData.length > 1) {
              for (var p = 1; p < packingsData.length; p++) {
                if (String(packingsData[p][pOrderIdIdx]).trim() === orderId.trim()) {
                  var pSt = pStatusIdx !== -1 ? String(packingsData[p][pStatusIdx] || '').toUpperCase() : '';
                  if (pSt === 'DONE' || pSt === 'HOÀN THÀNH' || pSt === 'ĐÃ XONG') {
                    isPacked = true;
                    break;
                  }
                }
              }
            }

            var isHandedOver = ['ĐÃ BÀN GIAO', 'CHỜ BÀN GIAO', 'ĐÃ ĐÓNG GÓI'].indexOf(currentStatusUpper) > -1 || (isCarriedIndex !== -1 && (ordersData[j][isCarriedIndex] === true || String(ordersData[j][isCarriedIndex]).toUpperCase() === 'TRUE'));

            var targetStatus = (isPacked || isHandedOver) ? 'Hàng Hoàn' : 'Đơn Huỷ';

            updatedRows.push({ rowNum: j + 1, targetStatus: targetStatus, orderId: orderId });
            matchedCodes.push(spxCode + '➔' + targetStatus);
            break;
          }
        }
      }
    }

    if (updatedRows.length > 0) {
      updatedRows.forEach(function (item) {
        ordersSheet.getRange(item.rowNum, statusIndex + 1).setValue(item.targetStatus);
        processCascadeCancelOrder(item.orderId, item.targetStatus === 'Hàng Hoàn');
      });
      console.log("Đã tự động phân loại " + updatedRows.length + " đơn từ SPX Email: " + matchedCodes.join(', '));
    }

  } catch (e) {
    console.error("Lỗi processSPXReturnEmail: " + e.toString());
  }
}

function classifyCategory(type, title) {
  var t = String(title).toLowerCase();
  if (type === "Chi") {
    if (t.indexOf("lương") !== -1 || t.indexOf("luong") !== -1) return "Trả Lương";
    if (t.indexOf("nguyên liệu") !== -1 || t.indexOf("nguyen lieu") !== -1 || t.indexOf("vật liệu") !== -1 || t.indexOf("vat lieu") !== -1) return "Mua Nguyên Liệu";
    if (t.indexOf("vật tư") !== -1 || t.indexOf("vat tu") !== -1) return "Mua Vật Tư";
    if (t.indexOf("điện") !== -1 || t.indexOf("nước") !== -1 || t.indexOf("internet") !== -1 || t.indexOf("wifi") !== -1 || t.indexOf("hoá đơn") !== -1 || t.indexOf("hoa don") !== -1) return "Thanh Toán Hoá Đơn";
    if (t.indexOf("quảng cáo") !== -1 || t.indexOf("quang cao") !== -1 || t.indexOf("ads") !== -1 || t.indexOf("fb") !== -1 || t.indexOf("facebook") !== -1 || t.indexOf("marketing") !== -1) return "Quảng Cáo & Marketing";
    if (t.indexOf("thiết bị") !== -1 || t.indexOf("thiet bi") !== -1) return "Trang Thiết Bị";
    if (t.indexOf("máy móc") !== -1 || t.indexOf("may moc") !== -1 || t.indexOf("công cụ") !== -1 || t.indexOf("cong cu") !== -1) return "Máy Móc & Công Cụ";
    return "Chi Phí Khác";
  } else {
    if (t.indexOf("thu nợ") !== -1 || t.indexOf("thuno") !== -1 || t.indexOf("nợ khách") !== -1 || t.indexOf("no khach") !== -1) return "Thu Nợ Khách";
    if (t.indexOf("phế liệu") !== -1 || t.indexOf("phe lieu") !== -1) return "Bán Phế Liệu";
    if (t.indexOf("đầu tư") !== -1 || t.indexOf("dau tu") !== -1) return "Lợi Nhuận Đầu Tư";
    return "Doanh Thu Bán Hàng";
  }
}

function updateAccountBalance(ss, accountId, amount, type) {
  if (!accountId) return;
  var sheet = ss.getSheetByName('Accounts');
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(accountId)) {
      var currentBalance = Number(data[i][2]) || 0;
      var change = Number(amount) || 0;
      var newBalance = currentBalance;

      if (type === "Thu") {
        newBalance += change;
      } else if (type === "Chi") {
        newBalance -= change;
      }

      sheet.getRange(i + 1, 3).setValue(newBalance);
      break;
    }
  }
}


function normalizeProdName(str) {
  return String(str || '').toLowerCase().replace(/[-\s]+/g, ' ').trim();
}

function getProductInfoByName(ss, pName) {
  var sheet = ss.getSheetByName('Products');
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var nameCol = headers.indexOf('name');
  var qtyCol = headers.indexOf('quantity');
  var minCol = headers.indexOf('minStock');
  var costCol = headers.indexOf('costPrice');
  var idCol = headers.indexOf('id');
  var catCol = headers.indexOf('category');

  if (nameCol === -1) return null;
  var searchName = normalizeProdName(pName);
  for (var i = 1; i < data.length; i++) {
    var rowName = normalizeProdName(data[i][nameCol]);
    if (rowName === searchName) {
      var category = catCol !== -1 ? String(data[i][catCol]).toUpperCase().trim() : '';
      var isEligible = true; // Luôn kiểm tra tồn kho, không phụ thuộc vào category
      return {
        rowIndex: i + 1,
        id: data[i][idCol],
        name: data[i][nameCol],
        qty: qtyCol !== -1 ? (Number(data[i][qtyCol]) || 0) : 0,
        minStock: minCol !== -1 ? (Number(data[i][minCol]) || 0) : 0,
        costPrice: costCol !== -1 ? (Number(data[i][costCol]) || 0) : 0,
        category: category,
        isEligible: isEligible,
        qtyColIndex: qtyCol
      };
    }
  }
  return null;
}

function syncBIDVEmails() {
  try {
    var query = 'bidvsmartbanking@bidv.com.vn is:unread';
    var threads = GmailApp.search(query, 0, 50);
    if (threads.length === 0) return { success: true, count: 0, message: 'Không có biến động số dư mới' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetTrans = ss.getSheetByName('Transactions');
    if (!sheetTrans) return { success: false, message: 'Chưa có sheet Transactions' };

    var sheetAccounts = ss.getSheetByName('Accounts');
    var accData = [];
    if (sheetAccounts) {
      accData = sheetAccounts.getDataRange().getValues();
    }

    var count = 0;

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];
        if (msg.isUnread()) {
          var body = msg.getPlainBody();

          var sourceMatch = body.match(/Tài khoản nguồn[^\d]*(\d+)/i) || body.match(/Debit account[^\d]*(\d+)/i);
          var amountMatch = body.match(/Số tiền giao dịch[^\d]*([\d,]+)/i) || body.match(/Transaction amount[^\d]*([\d,]+)/i);
          var benMatch = body.match(/Người thụ hưởng[^\w]*([^\n\r]+)/i) || body.match(/Beneficiary name[^\w]*([^\n\r]+)/i);
          var dateMatch = body.match(/Thời gian giao dịch[^\d]*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i) || body.match(/Transaction time[^\d]*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i);

          if (sourceMatch && amountMatch) {
            var debitAcc = sourceMatch[1].trim();
            var amountStr = amountMatch[1].replace(/,/g, '').trim();
            var amount = Number(amountStr);
            var beneficiary = benMatch ? benMatch[1].trim() : 'Không rõ';

            var fromAccountSearch = '';
            if (debitAcc === '8600428268') {
              fromAccountSearch = 'TÀI KHOẢN CÔNG TY';
            } else if (debitAcc === '2686688286') {
              fromAccountSearch = 'TÀI KHOẢN GIÁM ĐỐC';
            } else if (debitAcc === '4550900734') {
              msg.markRead();
              continue;
            } else {
              msg.markRead();
              continue;
            }

            var fromAccountId = '';
            var fromAccountRowIndex = -1;
            if (sheetAccounts && accData.length > 1) {
              for (var row = 1; row < accData.length; row++) {
                var accName = String(accData[row][1] || '').toUpperCase().trim();
                if (accName === fromAccountSearch || accName.includes(fromAccountSearch)) {
                  fromAccountId = accData[row][0]; // ID của tài khoản
                  fromAccountRowIndex = row;
                  break;
                }
              }
            }
            if (!fromAccountId) fromAccountId = fromAccountSearch; // Fallback

            var transId = Utilities.getUuid();
            var tDate = new Date();
            if (dateMatch) {
              var dateStr = dateMatch[1].trim();
              var parts = dateStr.split(' ');
              var dparts = parts[0].split('/');
              var tparts = parts[1].split(':');
              tDate = new Date(dparts[2], dparts[1] - 1, dparts[0], tparts[0], tparts[1], tparts[2]);
            }

            var newRow = [
              transId,
              'Chi',
              'Chuyển tiền',
              amount,
              fromAccountId,
              '',
              'Chuyển tiền: ' + beneficiary,
              tDate.toISOString(),
              'Tự động từ BIDV ' + debitAcc,
              true
            ];

            sheetTrans.appendRow(newRow);

            if (fromAccountRowIndex > 0) {
              var currentBal = Number(accData[fromAccountRowIndex][2]) || 0;
              var newBal = currentBal - amount;
              sheetAccounts.getRange(fromAccountRowIndex + 1, 3).setValue(newBal);
              accData[fromAccountRowIndex][2] = newBal;
            }
            count++;
          }
          msg.markRead();
        }
      }
    }
    return { success: true, count: count, message: 'Đã đồng bộ ' + count + ' giao dịch BIDV.' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// =========================================================================
// HÀM LƯU VÀ LẤY CẤU HÌNH GHN
// =========================================================================
function saveGHNConfig(token, shopId) {
  try {
    PropertiesService.getScriptProperties().setProperties({
      'GHN_API_TOKEN': token,
      'GHN_SHOP_ID': shopId
    });
    return { success: true, message: 'Đã lưu cấu hình GHN thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function getGHNConfig() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    token: props['GHN_API_TOKEN'] || '5c588da0-1d0a-11ef-b3d7-824e1db0c320',
    shopId: props['GHN_SHOP_ID'] || '5478054'
  };
}

// =========================================================================
// HÀM ĐỒNG BỘ ĐỐI SOÁT GHN QUA API
// =========================================================================
function syncGHNViaAPI() {
  try {
    var config = getGHNConfig();
    if (!config.token || !config.shopId) {
      return { success: false, message: 'Bạn chưa cấu hình Token và Shop ID của GHN! Vui lòng vào Cấu Hình GHN để nhập trước.' };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var headers = oData[0];
    var idCol = headers.indexOf('id');
    var codeCol = headers.indexOf('orderCode');
    var statusCol = headers.indexOf('status');
    var channelCol = headers.indexOf('channel');
    var codCol = headers.indexOf('cod');
    var custCol = headers.indexOf('customer');
    var respCol = headers.indexOf('responsibleUser');
    var updCol = headers.indexOf('updatedBy');

    if (idCol === -1 || codeCol === -1 || statusCol === -1) return { success: false, message: 'Sheet Orders thiếu cột chuẩn' };

    var ordersToSync = [];
    for (var i = 1; i < oData.length; i++) {
      var status = String(oData[i][statusCol] || '').trim();
      var code = String(oData[i][codeCol] || '').trim();
      var channel = String(oData[i][channelCol] || '').trim();

      // Chỉ đồng bộ những đơn Đang Giao, Đã Bàn Giao và mã đơn bắt đầu bằng GHN hoặc kênh GHN
      if ((status === 'Đang Giao' || status === 'Đã Bàn Giao' || status === 'Chờ Bàn Giao') && code.length > 5) {
        if (code.toUpperCase().startsWith('GHN') || channel.toUpperCase().includes('GHN')) {
          ordersToSync.push({
            rowIndex: i + 1,
            code: code,
            id: oData[i][idCol],
            cod: Number(oData[i][codCol]) || 0,
            channel: channel,
            customer: custCol !== -1 ? oData[i][custCol] : '',
            responsibleUser: respCol !== -1 ? oData[i][respCol] : '',
            updatedBy: updCol !== -1 ? oData[i][updCol] : ''
          });
        }
      }
    }

    if (ordersToSync.length === 0) {
      return { success: true, count: 0, message: 'Không có đơn hàng nào đang giao cần đồng bộ.' };
    }

    var countSuccess = 0;
    var modifiedOrders = false;
    var financeTransactions = [];
    var ctvTransactionsToAppend = [];

    for (var j = 0; j < ordersToSync.length; j++) {
      var item = ordersToSync[j];
      var cleanCode = item.code.replace(/[^a-zA-Z0-9]/g, ''); // GHN code usually alphanumeric

      var options = {
        'method': 'post',
        'headers': {
          'Token': config.token,
          'Content-Type': 'application/json'
        },
        'payload': JSON.stringify({
          "order_code": cleanCode
        }),
        'muteHttpExceptions': true
      };

      var response = UrlFetchApp.fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail', options);
      if (response.getResponseCode() === 200) {
        var resData = JSON.parse(response.getContentText());
        if (resData && resData.code === 200 && resData.data) {
          var ghnStatus = resData.data.status;
          var totalFee = resData.data.logistics_fee || 0;
          var codAmount = resData.data.cod_amount || 0;

          // Map GHN Status
          // ready_to_pick, picking, delivering, delivered, returned, returned
          var newStatus = '';
          var needsFinance = false;

          if (ghnStatus === 'delivered') {
            newStatus = 'Hoàn Thành';
            needsFinance = true;
          } else if (ghnStatus === 'returned' || ghnStatus === 'cancel') {
            newStatus = 'Hàng Hoàn';
          } else if (ghnStatus === 'delivering') {
            newStatus = 'Đang Giao';
          }

          if (newStatus && newStatus !== String(oData[item.rowIndex - 1][statusCol]).trim()) {
            oSheet.getRange(item.rowIndex, statusCol + 1).setValue(newStatus);
            modifiedOrders = true;
            countSuccess++;

            // Record Finance if delivered
            if (needsFinance) {
              var netAmount = codAmount - totalFee;
              financeTransactions.push([
                Utilities.getUuid(),
                'Thu',
                'COD Đối Tác Giao Hàng',
                netAmount,
                '', // fromAccount
                'Ví GHN', // toAccount
                'Thu COD Đơn: ' + item.code,
                new Date().toISOString(),
                'Tổng thu hộ: ' + codAmount + ', Phí giao hàng: ' + totalFee,
                true
              ]);
            }

            // Ghi nhận Phí Vận Chuyển / Hoàn Hàng cho CTV
            var isCTV = String(item.channel).toUpperCase().includes('CTV') || String(item.channel).toUpperCase().includes('CỘNG TÁC VIÊN');
            var ctvUser = String(item.responsibleUser || item.updatedBy || item.customer || '').trim();
            if (isCTV && ctvUser && totalFee > 0) {
              if (newStatus === 'Hoàn Thành') {
                ctvTransactionsToAppend.push([
                  Utilities.getUuid(),
                  new Date().toISOString().substring(0, 10),
                  'PHÍ VẬN CHUYỂN',
                  totalFee,
                  'Phí giao hàng GHN: ' + item.code,
                  ctvUser,
                  'Hoàn Thành'
                ]);
              } else if (newStatus === 'Hàng Hoàn') {
                ctvTransactionsToAppend.push([
                  Utilities.getUuid(),
                  new Date().toISOString().substring(0, 10),
                  'PHÍ HOÀN HÀNG',
                  totalFee,
                  'Phí hoàn/chuyển hoàn GHN: ' + item.code,
                  ctvUser,
                  'Hoàn Thành'
                ]);
              }
            }
          }
        }
      }
    }

    if (ctvTransactionsToAppend.length > 0) {
      var ctvSheet = ss.getSheetByName('CTV_Finance');
      if (!ctvSheet) {
        ctvSheet = ss.insertSheet('CTV_Finance');
        ctvSheet.appendRow(['id', 'date', 'type', 'amount', 'note', 'user', 'status']);
        ctvSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
      }
      ctvSheet.getRange(ctvSheet.getLastRow() + 1, 1, ctvTransactionsToAppend.length, ctvTransactionsToAppend[0].length).setValues(ctvTransactionsToAppend);
    }

    if (financeTransactions.length > 0) {
      var tSheet = ss.getSheetByName('Transactions');
      var accSheet = ss.getSheetByName('Accounts');

      if (!tSheet) initDbERP(); // fallback
      if (tSheet) {
        tSheet.getRange(tSheet.getLastRow() + 1, 1, financeTransactions.length, financeTransactions[0].length).setValues(financeTransactions);

        // Update Wallet
        var totalGHNIncome = financeTransactions.reduce(function (sum, row) { return sum + Number(row[3]); }, 0);

        var accData = accSheet.getDataRange().getValues();
        var ghnWalletId = '';
        var ghnWalletRowIndex = -1;
        for (var r = 1; r < accData.length; r++) {
          if (String(accData[r][1]).trim().toUpperCase() === 'VÍ GHN') {
            ghnWalletId = accData[r][0];
            ghnWalletRowIndex = r;
            break;
          }
        }
        if (ghnWalletRowIndex !== -1) {
          var oldBalance = Number(accData[ghnWalletRowIndex][2]) || 0;
          accSheet.getRange(ghnWalletRowIndex + 1, 3).setValue(oldBalance + totalGHNIncome);
        } else {
          // Create Wallet
          var newWalletId = 'ACC_GHN_' + Date.now();
          accSheet.appendRow([newWalletId, 'Ví GHN', totalGHNIncome]);
          // Update transaction toAccount to ID
          var lastRows = tSheet.getRange(tSheet.getLastRow() - financeTransactions.length + 1, 1, financeTransactions.length, financeTransactions[0].length).getValues();
          for (var z = 0; z < lastRows.length; z++) {
            if (lastRows[z][5] === 'Ví GHN') {
              tSheet.getRange(tSheet.getLastRow() - financeTransactions.length + 1 + z, 6).setValue(newWalletId);
            }
          }
        }
      }
    }

    return { success: true, count: countSuccess, message: 'Đã đồng bộ ' + countSuccess + ' đơn hàng GHN.' };
  } catch (e) {
    return { success: false, message: 'Lỗi đồng bộ GHN: ' + e.toString() };
  }
}

// =========================================================================
// HÀM ĐỒNG BỘ ĐƠN HUỶ TỪ EMAIL (SHOPEE/TIKTOK...)
// =========================================================================
function scanCancelledOrdersFromEmail() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var pSheet = ss.getSheetByName('Packings');
    var pData = pSheet ? pSheet.getDataRange().getValues() : [];

    var prodSheet = ss.getSheetByName('Production');
    var prodData = prodSheet ? prodSheet.getDataRange().getValues() : [];
    var prodModified = false;

    var labelName = "RF_Processed";
    var label = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

    // Quét tối đa 25 email mới nhất trong 3 ngày qua chưa gắn nhãn để tối ưu tốc độ (< 2s)
    var threads = GmailApp.search('(newer_than:3d) -label:' + labelName + ' (subject:"hủy đơn hàng" OR subject:"huỷ đơn hàng" OR subject:"rút yêu cầu")', 0, 25);
    if (threads.length === 0) return { success: true, count: 0, message: 'Không có email huỷ đơn mới nào cần xử lý' };

    var count = 0;
    var modified = false;

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];
        var subject = msg.getSubject();
        var codes = subject.match(/[A-Z0-9]{8,25}/ig);
        if (codes && codes.length > 0) {
          for (var k = 0; k < codes.length; k++) {
            var extractedCode = codes[k].toUpperCase();

            for (var r = 1; r < oData.length; r++) {
              var orderCodeRaw = String(oData[r][1] || '').toUpperCase();
              var cleanOrderCode = orderCodeRaw.replace(/[^A-Z0-9]/g, '');

              if (orderCodeRaw.includes(extractedCode) || cleanOrderCode.includes(extractedCode)) {
                var currentStatus = String(oData[r][7] || '').toUpperCase().trim();
                var subjectLower = subject.toLowerCase();
                var isWithdraw = subjectLower.includes('rút yêu cầu') || subjectLower.includes('rút lại');

                if (isWithdraw) {
                  if (currentStatus === 'ĐƠN HUỶ' || currentStatus === 'HÀNG HOÀN' || currentStatus === 'ĐƠN HỦY' || currentStatus === 'HUỶ') {
                    oData[r][7] = 'Đã Bàn Giao';
                    modified = true;
                    count++;
                  }
                } else {
                  if (currentStatus !== 'ĐƠN HUỶ' && currentStatus !== 'HÀNG HOÀN' && currentStatus !== 'ĐƠN HỦY' && currentStatus !== 'HUỶ') {
                    var orderId = String(oData[r][0]);
                    var hasPacked = false;
                    for (var pr = 1; pr < pData.length; pr++) {
                      if (String(pData[pr][1]) === orderId) {
                        hasPacked = true;
                        break;
                      }
                    }
                    var newStatus = hasPacked ? 'Hàng Hoàn' : 'Đơn Huỷ';
                    oData[r][7] = newStatus;
                    modified = true;
                    count++;

                    // Tự động hủy lệnh sản xuất liên quan nếu chưa hoàn thành
                    if (prodData && prodData.length > 1) {
                      for (var prIdx = 1; prIdx < prodData.length; prIdx++) {
                        var pOrdId = String(prodData[prIdx][1] || '').trim();
                        if (pOrdId && (pOrdId === orderId || pOrdId === orderCodeRaw || pOrdId.includes(extractedCode) || orderCodeRaw.includes(pOrdId))) {
                          var pCurStatus = String(prodData[prIdx][5] || '').toUpperCase().trim();
                          if (pCurStatus !== 'DONE' && pCurStatus !== 'ĐÃ XONG') {
                            prodData[prIdx][5] = 'Đã Huỷ';
                            prodModified = true;
                          }
                        }
                      }
                    }
                  }
                }
                break;
              }
            }
          }
        }
      }
      threads[i].addLabel(label);
      threads[i].markRead();
    }

    if (modified) {
      oSheet.getRange(1, 1, oData.length, oData[0].length).setValues(oData);
    }
    if (prodModified && prodSheet) {
      prodSheet.getRange(1, 1, prodData.length, prodData[0].length).setValues(prodData);
    }

    return { success: true, count: count, message: 'Đã xử lý ' + count + ' đơn huỷ/hoàn từ email & cập nhật lệnh sản xuất.' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    try { lock.releaseLock(); } catch(err) {}
  }
}

// =========================================================================
// HÀM ĐỒNG BỘ ĐƠN HOÀN TỪ EMAIL (SHOPEE/TIKTOK... HOẶC FILE PDF CỦA SPX)
// =========================================================================
function scanReturnedOrdersFromEmail() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var pSheet = ss.getSheetByName('Packings');
    var pData = pSheet ? pSheet.getDataRange().getValues() : [];

    var labelName = "RF_Processed";
    var label = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

    // Quét mail hoàn chưa được xử lý trong 3 ngày
    var threads = GmailApp.search('(newer_than:3d) -label:' + labelName + ' (subject:"trả hàng" OR subject:"hàng hoàn" OR subject:"hoàn trả" OR subject:"chuyển hoàn" OR (has:attachment filename:pdf "SPX"))');
    if (threads.length === 0) return { success: true, count: 0, message: 'Không có email hoàn trả mới' };

    var count = 0;
    var modified = false;

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];

        var subject = msg.getSubject();
        var codes = subject.match(/[A-Z0-9]{8,25}/ig) || [];

        // Trích xuất mã từ tên file đính kèm (PDF) và OCR nội dung PDF
        var attachments = msg.getAttachments();
        for (var a = 0; a < attachments.length; a++) {
          var attName = attachments[a].getName().toLowerCase();
          if (attName.indexOf('.pdf') !== -1) {
            var attCodes = attName.match(/[A-Z0-9]{8,25}/ig);
            if (attCodes) codes = codes.concat(attCodes);

            // Cố gắng dùng Drive API để đọc chữ bên trong PDF
            try {
              var blob = attachments[a].copyBlob();
              var resource = {
                name: attachments[a].getName(),
                mimeType: 'application/vnd.google-apps.document'
              };
              var tempFile = Drive.Files.create(resource, blob);
              var doc = DocumentApp.openById(tempFile.id);
              var text = doc.getBody().getText();

              var ocrCodes = text.match(/[A-Z0-9]{8,25}/ig);
              if (ocrCodes) codes = codes.concat(ocrCodes);

              Drive.Files.remove(tempFile.id);
            } catch (e) {
              // Bỏ qua nếu có lỗi OCR (Ví dụ: file quá lớn hoặc lỗi hạn mức)
            }
          }
        }

        if (codes && codes.length > 0) {
          var uniqueCodes = [];
          for (var c = 0; c < codes.length; c++) {
            if (uniqueCodes.indexOf(codes[c].toUpperCase()) === -1) uniqueCodes.push(codes[c].toUpperCase());
          }

          for (var k = 0; k < uniqueCodes.length; k++) {
            var extractedCode = uniqueCodes[k];
            for (var r = 1; r < oData.length; r++) {
              var orderCodeRaw = String(oData[r][1] || '').toUpperCase();
              var cleanOrderCode = orderCodeRaw.replace(/[^A-Z0-9]/g, '');

              if (orderCodeRaw.includes(extractedCode) || cleanOrderCode.includes(extractedCode)) {
                var currentStatus = String(oData[r][7] || '').toUpperCase().trim();
                if (currentStatus !== 'ĐƠN HUỶ' && currentStatus !== 'HÀNG HOÀN' && currentStatus !== 'ĐƠN HỦY' && currentStatus !== 'HUỶ') {
                  var orderId = String(oData[r][0]);
                  var hasPacked = false;
                  for (var pr = 1; pr < pData.length; pr++) {
                    if (String(pData[pr][1]) === orderId) {
                      hasPacked = true;
                      break;
                    }
                  }
                  var newStatus = hasPacked ? 'Hàng Hoàn' : 'Đơn Huỷ';
                  oData[r][7] = newStatus;
                  modified = true;
                  count++;
                }
                break;
              }
            }
          }
        }
        // msg.markRead();
      }
      threads[i].addLabel(label);
      threads[i].markRead();
    }

    if (modified) {
      oSheet.getRange(1, 1, oData.length, oData[0].length).setValues(oData);
    }

    return { success: true, count: count, message: 'Đã xử lý tự động ' + count + ' đơn hoàn trả từ email.' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// =========================================================================
// HÀM KHỞI TẠO TRIGGER TỰ ĐỘNG CHẠY HÀM QUÉT EMAIL MỖI 30 PHÚT
// =========================================================================
function setupEmailScannerTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'scanCancelledOrdersFromEmail') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('scanCancelledOrdersFromEmail')
    .timeBased()
    .everyMinutes(30)
    .create();
}


// =========================================================================
// HÀM TỰ ĐỘNG PHẠT NHÂN SỰ ĐÓNG GÓI CHẬM
// =========================================================================
function dailyCheckPackingsAndPenalize() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Đối tượng bị phạt (Lấy từ Config_NhanSu có Trách nhiệm là Nhân Viên Đóng Gói)
    var packingStaffs = [];
    var hrSheet = ss.getSheetByName('Config_NhanSu');
    if (hrSheet) {
      var hrData = hrSheet.getDataRange().getValues();
      var hrHeaders = hrData[0] || [];
      var roleColIdx = hrHeaders.findIndex(function (h) { return String(h).trim().toLowerCase() === 'trách nhiệm'; });
      var nameColIdx = 0; // Cột đầu tiên là Tên nhân sự
      if (roleColIdx !== -1) {
        for (var i = 1; i < hrData.length; i++) {
          if (String(hrData[i][roleColIdx]).trim().toLowerCase() === 'nhân viên đóng gói') {
            var staffName = String(hrData[i][nameColIdx]).trim();
            if (staffName) packingStaffs.push(staffName);
          }
        }
      }
    }

    Logger.log("Số nhân viên bị phạt: " + packingStaffs.length + " - " + packingStaffs.join(", "));

    // 2. Lấy danh sách đơn hàng
    var ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) {
      Logger.log("Không tìm thấy sheet Orders");
      return;
    }
    var ordersData = ordersSheet.getDataRange().getValues();
    var orderHeaders = ordersData[0];
    var statusColIdx = orderHeaders.indexOf('status');
    var channelColIdx = orderHeaders.indexOf('channel');
    var orderCodeColIdx = orderHeaders.indexOf('orderCode');
    var idColIdx = orderHeaders.indexOf('id');

    Logger.log("Chỉ số cột: status=" + statusColIdx + ", channel=" + channelColIdx + ", orderCode=" + orderCodeColIdx);

    var packingsSheet = ss.getSheetByName('Packings');
    var penaltySheet = ss.getSheetByName('BonusPenalty');
    if (!packingsSheet || !penaltySheet) return;

    var packingsData = packingsSheet.getDataRange().getValues();
    var packingHeaders = packingsData[0];
    var pOrderIdCol = packingHeaders.indexOf('orderId');
    var pPhotoCol = packingHeaders.indexOf('photo');
    var pPhotoBeforeCol = packingHeaders.indexOf('photoBefore');
    var pIdCol = packingHeaders.indexOf('id');

    var WARNING_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Warning_icon.svg/512px-Warning_icon.svg.png'; // Ảnh cảnh báo mặc định
    var PENALTY_AMOUNT = -50000;
    var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    var ordersModified = false;
    var countMatchedOrders = 0;

    for (var i = 1; i < ordersData.length; i++) {
      var statusUpper = String(ordersData[i][statusColIdx]).trim().toUpperCase();
      var channelUpper = String(ordersData[i][channelColIdx]).trim().toUpperCase();

      if (statusUpper === 'SẴN SÀNG ĐÓNG GÓI') {
        Logger.log("Tìm thấy đơn SẴN SÀNG ĐÓNG GÓI: " + ordersData[i][orderCodeColIdx] + " | Kênh: " + channelUpper);
      }

      // BẢO VỆ LUỒNG ĐÓNG GÓI: Không tự động chuyển đơn sang 'Chờ Bàn Giao' khi chưa có ảnh đóng gói thực tế.
      // Đơn hàng bắt buộc phải giữ ở 'Sẵn Sàng Đóng Gói' để nhân sự đóng gói chụp ảnh và bấm đóng đơn.
      /* 
      if (statusUpper === 'SẴN SÀNG ĐÓNG GÓI' && channelUpper === 'SHOPEE VN') {
        // Tự động chuyển đơn & phạt đã bị vô hiệu hóa để tránh đứt gãy luồng đóng gói
      }
      */
    }

    Logger.log("Tổng số đơn đã phạt và cập nhật: " + countMatchedOrders);

    if (ordersModified) {
      ordersSheet.getRange(1, 1, ordersData.length, orderHeaders.length).setValues(ordersData);
      Logger.log("Đã lưu ordersData xuống Sheet");
    }

  } catch (e) {
    Logger.log("Lỗi dailyCheckPackingsAndPenalize: " + e.toString());
  } finally {
    // Luôn lên lịch tiếp cho ngày hôm sau hoặc đúng 19:30 tiếp theo
    scheduleNextPenaltyCheck();
    lock.releaseLock();
  }
}

function scheduleNextPenaltyCheck() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'dailyCheckPackingsAndPenalize') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  var now = new Date();
  var nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 31, 0, 0); // Đặt 19:31 để đảm bảo đã qua 19:30

  // Nếu bây giờ đã qua 19:31, thì hẹn vào ngày mai
  if (now.getTime() > nextRun.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  ScriptApp.newTrigger('dailyCheckPackingsAndPenalize')
    .timeBased()
    .at(nextRun)
    .create();
}



// =========================================================================
// CRON: 23:30 DAILY PENALTY FOR INCOMPLETE TASKS (PRODUCTION)
// =========================================================================
function cronCheckIncompleteTasks() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    Logger.log("Không thể lock cronCheckIncompleteTasks");
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodItems = readSheet('Production', null, ss);
    if (!prodItems || prodItems.length === 0) return;

    var penaltyMap = {};
    var now = new Date();
    var todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    var existingBPs = readSheet('BonusPenalty', function (b) {
      return b.date === todayStr && b.type === 'Phạt Vi Phạm' && String(b.note || '').indexOf('Lỗi không hoàn thành') !== -1;
    }, ss);

    if (existingBPs && existingBPs.length > 0) {
      existingBPs.forEach(function (bp) {
        penaltyMap[bp.user] = true;
      });
    }

    var newPenalties = [];

    for (var i = 0; i < prodItems.length; i++) {
      var item = prodItems[i];
      if (!item.phases) continue;

      ['phase1', 'phase2'].forEach(function (phaseKey) {
        var phase = item.phases[phaseKey];
        if (phase && phase.status === 'In Progress' && phase.user && String(phase.user).trim() !== '') {
          var user = String(phase.user).trim();
          if (!penaltyMap[user]) {
            penaltyMap[user] = true;
            newPenalties.push({
              id: 'BP_INCOMPLETE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              user: user,
              amount: -100000,
              type: 'Phạt Vi Phạm',
              note: 'Lỗi không hoàn thành khâu trong ngày (Đơn ' + (item.orderId || '') + ')',
              date: todayStr,
              orderCode: item.orderId || ''
            });
          }
        }
      });
    }

    if (newPenalties.length > 0) {
      applyDeltasToSheet('BonusPenalty', newPenalties, formatBonusPenalty, ss);
      Logger.log("Đã phạt " + newPenalties.length + " nhân viên quên hoàn thành khâu.");
    }

  } catch (e) {
    Logger.log("Lỗi cronCheckIncompleteTasks: " + e.toString());
  } finally {
    scheduleNextIncompletePenaltyCheck();
    lock.releaseLock();
  }
}

function scheduleNextIncompletePenaltyCheck() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'cronCheckIncompleteTasks') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  var now = new Date();
  var nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0, 0);

  if (now.getTime() > nextRun.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  ScriptApp.newTrigger('cronCheckIncompleteTasks')
    .timeBased()
    .at(nextRun)
    .create();
}

// =========================================================================
// HÀM UPLOAD ẢNH QC (DUYỆT KHUNG) TÁCH BIỆT THƯ MỤC
// =========================================================================
function uploadQCImage(base64Data, fileName) {
  try {
    var folderName = "RF_QC_Photos";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    var data = base64Data;
    if (base64Data.indexOf(",") > -1) { data = base64Data.split(",")[1]; }
    var blob = Utilities.newBlob(Utilities.base64Decode(data), "image/jpeg", fileName);
    var file = folder.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingErr) {
      console.warn("Không thể thiết lập quyền chia sẻ công khai: " + sharingErr.message);
    }

    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800";
  } catch (e) {
    console.error("Lỗi trong uploadQCImage:", e);
    return "";
  }
}



// =========================================================================
// CHỐT SỔ CUỐI THÁNG & LƯU TRỮ DỮ LIỆU LẠNH
// =========================================================================
function closeMonthAndArchive(pin, monthString, snapshotData) {
  var auth = validatePin(pin);
  if (!auth || !auth.valid) return { success: false, message: 'Sai mã PIN!' };
  if (auth.role !== 'BOSS') return { success: false, message: 'Chỉ Boss mới có quyền chốt sổ!' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Lưu Snapshot
  var snapSheet = ss.getSheetByName('Monthly_Snapshots');
  if (!snapSheet) {
    snapSheet = ss.insertSheet('Monthly_Snapshots');
    snapSheet.appendRow(SCHEMA_ERP.Monthly_Snapshots);
    snapSheet.setFrozenRows(1);
  }

  var nowStr = new Date().toISOString();

  // Check if already closed
  var snapData = snapSheet.getDataRange().getValues();
  for (var i = 1; i < snapData.length; i++) {
    if (snapData[i][1] === monthString) {
      return { success: false, message: 'Tháng ' + monthString + ' đã được chốt sổ trước đó!' };
    }
  }

  // 2. Chuyển số dư & Ghi Snapshot
  var bpSheet = ss.getSheetByName('BonusPenalty');
  var bpHeaders = bpSheet.getRange(1, 1, 1, bpSheet.getLastColumn()).getValues()[0];
  var parts = monthString.split('-');
  var nextMonthObj = new Date(parseInt(parts[0]), parseInt(parts[1]), 1); // 1st day of next month
  var nextMonthStr = Utilities.formatDate(nextMonthObj, Session.getScriptTimeZone(), "yyyy-MM-dd");

  snapshotData.forEach(function (userSnap) {
    snapSheet.appendRow([
      Utilities.getUuid(),
      monthString,
      userSnap.user,
      userSnap.totalSalary || 0,
      userSnap.totalHours || 0,
      userSnap.totalAdvance || 0,
      userSnap.totalDebt || 0,
      nowStr,
      JSON.stringify(userSnap)
    ]);

    // Nợ luỹ kế
    if (userSnap.netSalary < 0) {
      var rowData = [];
      for (var j = 0; j < bpHeaders.length; j++) {
        if (bpHeaders[j] === 'id') rowData.push(Utilities.getUuid());
        else if (bpHeaders[j] === 'user') rowData.push(userSnap.user);
        else if (bpHeaders[j] === 'amount') rowData.push(Math.abs(userSnap.netSalary));
        else if (bpHeaders[j] === 'type') rowData.push('Tạm ứng');
        else if (bpHeaders[j] === 'note') rowData.push('Nợ luỹ kế chuyển từ ' + monthString);
        else if (bpHeaders[j] === 'date') rowData.push(nextMonthStr);
        else rowData.push('');
      }
      bpSheet.appendRow(rowData);
    }
  });

  // 3. Tạo Archive File
  var archiveName = "RF_Archive_Thang_" + monthString.replace('-', '_');
  var archiveSs = SpreadsheetApp.create(archiveName);

  // 4. Move rows from working sheets
  var sheetsToArchive = ['Attendance', 'KPI_Progress', 'BonusPenalty', 'Reimbursements'];

  sheetsToArchive.forEach(function (sheetName) {
    var sourceSheet = ss.getSheetByName(sheetName);
    if (!sourceSheet) return;

    var data = sourceSheet.getDataRange().getValues();
    if (data.length <= 1) return;

    var headers = data[0];
    var destSheet = archiveSs.getSheetByName(sheetName);
    if (!destSheet) {
      destSheet = archiveSs.insertSheet(sheetName);
      destSheet.appendRow(headers);
    }

    var rowsToKeep = [headers];
    var rowsToArchive = [];
    var dateColIdx = headers.indexOf('date');
    if (dateColIdx === -1) dateColIdx = headers.indexOf('startTime');
    if (dateColIdx === -1) dateColIdx = headers.indexOf('createdAt');

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowDate = "";
      var dateVal = row[dateColIdx];

      if (dateVal instanceof Date) {
        rowDate = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        rowDate = String(dateVal || '');
      }

      if (rowDate.indexOf(monthString) !== -1) {
        rowsToArchive.push(row);
      } else {
        rowsToKeep.push(row);
      }
    }

    if (rowsToArchive.length > 0) {
      destSheet.getRange(destSheet.getLastRow() + 1, 1, rowsToArchive.length, headers.length).setValues(rowsToArchive);
      sourceSheet.clearContents();
      sourceSheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
    }
  });

  var sheet1 = archiveSs.getSheetByName('Sheet1');
  if (sheet1 && archiveSs.getSheets().length > 1) {
    archiveSs.deleteSheet(sheet1);
  }

  return { success: true, message: 'Đã chốt sổ thành công! Dữ liệu đã lưu sang file: ' + archiveName };
}

// =========================================================================
// HÀM ĐỐI SOÁT HÀNG LOẠT (BATCH RECONCILIATION)
// =========================================================================
function processReconciliationBatch(matchedOrders, targetAccountId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    if (!matchedOrders || matchedOrders.length === 0) return { success: true, count: 0, message: 'Không có dữ liệu đối soát.' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var headers = oData[0];
    var codeCol = headers.indexOf('orderCode');
    var statusCol = headers.indexOf('status');
    var idCol = headers.indexOf('id');
    var recAtCol = headers.indexOf('reconciledAt');
    var isRecCol = headers.indexOf('isReconciled');
    var revCol = headers.indexOf('revenue');
    var chanCol = headers.indexOf('channel');

    var feeFixedCol = headers.indexOf('feeFixed');
    var feeServiceCol = headers.indexOf('feeService');
    var feePaymentCol = headers.indexOf('feePayment');
    var feeAffiliateCol = headers.indexOf('feeAffiliate');
    var shopVoucherCol = headers.indexOf('shopVoucher');
    var taxCol = headers.indexOf('tax');

    if (codeCol === -1 || statusCol === -1 || idCol === -1) {
      return { success: false, message: 'Thiếu cột chuẩn trong bảng Orders' };
    }

    var hasRecCols = (recAtCol !== -1 && isRecCol !== -1);
    var countSuccess = 0;
    var notFoundCount = 0;
    var modifiedOrders = false;
    var financeTransactions = [];
    var dStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    for (var k = 0; k < matchedOrders.length; k++) {
      var item = matchedOrders[k];
      var searchCode = String(item.code || '').trim().toUpperCase();
      if (!searchCode) continue;

      var foundRowIndex = -1;
      for (var r = 1; r < oData.length; r++) {
        var rowCode = String(oData[r][codeCol] || '').toUpperCase();
        var cleanRowCode = rowCode.replace(/[^A-Z0-9]/g, '');
        var cleanSearchCode = searchCode.replace(/[^A-Z0-9]/g, '');

        if (rowCode.includes(searchCode) || (cleanSearchCode.length >= 8 && cleanRowCode.includes(cleanSearchCode))) {
          foundRowIndex = r;
          break;
        }
      }

      if (foundRowIndex !== -1) {
        var currentStatus = String(oData[foundRowIndex][statusCol] || '').trim();
        if (currentStatus !== 'Đối Soát Thành Công' && currentStatus !== 'Hàng Hoàn' && currentStatus !== 'Đơn Huỷ') {
          oData[foundRowIndex][statusCol] = 'Đối Soát Thành Công';
          modifiedOrders = true;
        }

        if (hasRecCols) {
          if (!oData[foundRowIndex][isRecCol]) {
            oData[foundRowIndex][isRecCol] = true;
            oData[foundRowIndex][recAtCol] = dStr;
            modifiedOrders = true;
          }
        }

        if (feeFixedCol !== -1 && item.feeFixed) oData[foundRowIndex][feeFixedCol] = Math.abs(item.feeFixed);
        if (feeServiceCol !== -1 && item.feeService) oData[foundRowIndex][feeServiceCol] = Math.abs(item.feeService);
        if (feePaymentCol !== -1 && item.feePayment) oData[foundRowIndex][feePaymentCol] = Math.abs(item.feePayment);
        if (feeAffiliateCol !== -1 && item.feeAffiliate) oData[foundRowIndex][feeAffiliateCol] = Math.abs(item.feeAffiliate);
        if (shopVoucherCol !== -1 && item.shopVoucher) oData[foundRowIndex][shopVoucherCol] = Math.abs(item.shopVoucher);
        if (taxCol !== -1 && item.tax) oData[foundRowIndex][taxCol] = Math.abs(item.tax);

        var amt = Number(item.amount) || 0;
        if (amt > 0 && targetAccountId) {
          var dateColIdx = headers.indexOf('createdAt') !== -1 ? headers.indexOf('createdAt') : headers.indexOf('date');
          var orderTxDate = (dateColIdx !== -1 && oData[foundRowIndex][dateColIdx]) ? String(oData[foundRowIndex][dateColIdx]) : new Date().toISOString();
          financeTransactions.push([
            Utilities.getUuid(),
            'Thu',
            'Sàn TMĐT',
            amt,
            '',
            targetAccountId,
            'Đối soát: ' + searchCode,
            orderTxDate,
            'Đối soát tự động (Batch)',
            true
          ]);
        }
        countSuccess++;
      } else {
        notFoundCount++;
      }
    }

    if (modifiedOrders) {
      oSheet.getRange(1, 1, oData.length, headers.length).setValues(oData);
    }

    if (financeTransactions.length > 0) {
      var tSheet = ss.getSheetByName('Transactions');
      if (tSheet) {
        tSheet.getRange(tSheet.getLastRow() + 1, 1, financeTransactions.length, financeTransactions[0].length).setValues(financeTransactions);
      }
    }

    return { success: true, updatedCount: countSuccess, notFoundCount: notFoundCount, message: 'Đã đối soát ' + countSuccess + ' đơn hàng.' };
  } catch (e) {
    return { success: false, message: 'Lỗi processReconciliationBatch: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// HÀM DỌN DẸP GIAO DỊCH RÁC CŨ (ĐỐI SOÁT TỰ ĐỘNG BATCH HOẶC LỖI TẠO TAY)
// =========================================================================
function cleanUpOldReconciliationJunk() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Transactions');
    if (!sheet) return { success: false, message: 'Không tìm thấy Sổ Quỹ (Transactions)' };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, count: 0, message: 'Không có dữ liệu để dọn dẹp' };

    var headers = data[0];
    var noteCol = headers.indexOf('note');
    var categoryCol = headers.indexOf('category');
    var idCol = headers.indexOf('id');

    var rowsToKeep = [headers];
    var deletedCount = 0;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var note = noteCol >= 0 ? String(row[noteCol]) : '';
      var cat = categoryCol >= 0 ? String(row[categoryCol]) : '';
      var id = idCol >= 0 ? String(row[idCol]) : '';

      var isJunk = false;
      // Xoá rác đối soát cũ và phiếu tự động trùng lặp
      if (note.indexOf('Đối soát tự động (Batch)') > -1) isJunk = true;
      if (note.indexOf('Nhóm') > -1 && note.indexOf('=> THỰC NHẬN') > -1) isJunk = true;
      if (cat.indexOf('Đối soát') > -1) isJunk = true;
      if (note.indexOf('Doanh thu Shopee') > -1) isJunk = true;
      if (id.indexOf('TX_SHPINC') > -1 || id.indexOf('SHPINC') > -1) isJunk = true;
      if (note.indexOf('Order.all') > -1) isJunk = true;
      if (id.indexOf('TX_PRE_') > -1) isJunk = true;
      if (note.indexOf('Tự động từ BIDV') > -1) isJunk = true;

      if (!isJunk) {
        rowsToKeep.push(row);
      } else {
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      sheet.clearContents();
      sheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
    }

    return { success: true, count: deletedCount, message: 'Đã dọn dẹp sạch sẽ ' + deletedCount + ' giao dịch rác thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// =========================================================================
// HÀM CHUẨN HOÁ DỮ LIỆU ĐƠN HÀNG (Dọn dẹp rác, fix JSON, tên khách...)
// =========================================================================
function autoCleanOrdersData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Orders');
    if (!sheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, message: 'Không có dữ liệu để chuẩn hóa' };

    var headers = data[0];
    var customerCol = headers.indexOf('customer');
    var accCol = headers.indexOf('accessories');
    var prodCol = headers.indexOf('products');
    var codeCol = headers.indexOf('orderCode');
    var totalCol = headers.indexOf('totalAmount');
    var statusCol = headers.indexOf('status');

    var rowsToKeep = [headers];
    var deletedCount = 0;
    var modifiedCount = 0;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var isModified = false;

      var cust = customerCol >= 0 ? String(row[customerCol] || '').trim() : '';
      var prods = prodCol >= 0 ? String(row[prodCol] || '').trim() : '';
      var accs = accCol >= 0 ? String(row[accCol] || '').trim() : '';
      var total = totalCol >= 0 ? (Number(row[totalCol]) || 0) : 0;
      var status = statusCol >= 0 ? String(row[statusCol] || '').trim() : '';

      // 0. Xóa các đơn rác (không có khách hàng, không có sản phẩm, không có tiền)
      if (!cust && (prods === '' || prods === '[]') && (accs === '' || accs === '[]') && total === 0) {
        deletedCount++;
        continue;
      }

      // 1. Lọc ghi chú khỏi cột khách hàng (độ dài > 30)
      if (cust.length > 30) {
        row[customerCol] = 'Khách';
        isModified = true;
      }

      // 2. Sửa lỗi định dạng JSON phụ kiện ("price":"25000" -> "price":25000)
      if (accCol >= 0) {
        var accStr = String(row[accCol] || '');
        if (accStr.indexOf('"price":"') > -1) {
          var fixedAcc = accStr.replace(/"price":"(\d+)"/g, '"price":$1');
          row[accCol] = fixedAcc;
          isModified = true;
        }
      }

      // 3. (Đã bỏ) Không tách Mã Vận Đơn nữa vì hệ thống lưu mã vận đơn chung với orderCode.

      if (isModified) {
        modifiedCount++;
      }
      rowsToKeep.push(row);
    }

    if (deletedCount > 0 || modifiedCount > 0) {
      sheet.clearContents();
      sheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
    }

    return { success: true, message: 'Đã chuẩn hóa ' + modifiedCount + ' đơn, xoá ' + deletedCount + ' đơn rác!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * BLOCK CODE AN TOÀN: TRUY XUẤT HỒ SƠ KHIẾU NẠI SHOPEE
 * @param {string} shopeeOrderCode - Mã đơn hàng trên Shopee
 */
function getAppealEvidence(shopeeOrderCode) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Tìm Order ID gốc
    const ordersSheet = ss.getSheetByName("Orders");
    const orderData = ordersSheet.getDataRange().getValues();
    const orderHeaders = orderData[0];

    const idIdx = orderHeaders.indexOf("id");
    const codeIdx = orderHeaders.indexOf("orderCode");

    let targetOrderId = null;
    for (let i = 1; i < orderData.length; i++) {
      if (orderData[i][codeIdx] && String(orderData[i][codeIdx]).includes(shopeeOrderCode)) {
        targetOrderId = orderData[i][idIdx];
        break;
      }
    }

    if (!targetOrderId) throw new Error("Không tìm thấy mã đơn hàng Shopee này trên hệ thống.");

    // 2. Lấy bằng chứng Đóng Gói (Packings)
    const packData = ss.getSheetByName("Packings").getDataRange().getValues();
    let packEvidence = { photoBefore: "", photoPacked: "" };
    for (let i = 1; i < packData.length; i++) {
      if (packData[i][1] === targetOrderId) { // Cột B là orderId
        packEvidence.photoPacked = packData[i][7]; // Cột photo
        packEvidence.photoBefore = packData[i][9]; // Cột photoBefore
        break;
      }
    }

    // 3. Lấy bằng chứng Sản Xuất (Production - QC)
    const prodData = ss.getSheetByName("Production").getDataRange().getValues();
    let prodEvidence = { qcFront: "", qcSide: "" };
    for (let i = 1; i < prodData.length; i++) {
      if (prodData[i][1] === targetOrderId) {
        prodEvidence.qcFront = prodData[i][22]; // qc_front_photo
        prodEvidence.qcSide = prodData[i][23];  // qc_side_photo
        break;
      }
    }

    return {
      status: "success",
      data: {
        orderCode: shopeeOrderCode,
        productionQC: prodEvidence,
        packingEvidence: packEvidence
      }
    };

  } catch (error) {
    return { status: "error", message: error.message };
  }
}

/**
 * BLOCK CODE AN TOÀN: CẬP NHẬT TRẠNG THÁI VÀ LƯU LINK VIDEO
 */
function updateAppealStatus(orderId, newStatus, videoLink) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const idIdx = headers.indexOf("id");
    const statusIdx = headers.indexOf("status");
    const noteIdx = headers.indexOf("note");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === orderId) {
        // Ghi nối link video vào cột note hiện tại
        let currentNote = data[i][noteIdx] || "";
        let newNote = videoLink ? `[Video Hoàn]: ${videoLink} \n${currentNote}` : currentNote;

        // Cập nhật Database
        sheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
        sheet.getRange(i + 1, noteIdx + 1).setValue(newNote);

        return { success: true, message: "Đã lưu hồ sơ khiếu nại thành công!" };
      }
    }
    throw new Error("Không tìm thấy ID đơn hàng để cập nhật.");
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * BLOCK CODE AN TOÀN: XÓA CỨNG ĐƠN HÀNG VÀ DỮ LIỆU LIÊN QUAN (CASCADING DELETE)
 * Yêu cầu: Chỉ thực thi với quyền Founder.
 * @param {string} orderId - ID của đơn hàng cần xóa
 */
function hardDeleteOrderAndRelatedData(orderId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Quét và xóa Lệnh Sản Xuất (Production)
    deleteRowsByMatch(ss, "Production", "orderId", orderId);

    // 2. Quét và xóa Lệnh Đóng Gói (Packings)
    deleteRowsByMatch(ss, "Packings", "orderId", orderId);

    // 3. Quét và xóa Phiếu Thu/Chi liên quan (Transactions)
    deleteTransactionsByOrderId(ss, orderId);

    // 4. Xóa Đơn Hàng gốc (Orders)
    deleteRowsByMatch(ss, "Orders", "id", orderId);

    return {
      status: "success",
      message: "Đã tiêu hủy toàn bộ dữ liệu (Sản xuất, Đóng gói, Sổ quỹ) của đơn hàng: " + orderId
    };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

/**
 * HÀM HỖ TRỢ: Xóa dòng an toàn (Quét từ dưới lên để bảo toàn Index)
 */
function deleteRowsByMatch(ss, sheetName, colName, matchValue) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  const header = data[0];
  const colIdx = header.indexOf(colName);
  if (colIdx === -1) return;

  // Vòng lặp Bottom-Up
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][colIdx] === matchValue) {
      sheet.deleteRow(i + 1);
    }
  }
}

/**
 * HÀM HỖ TRỢ: Tìm và xóa dòng trong Sổ quỹ (Transactions)
 */
function deleteTransactionsByOrderId(ss, orderId) {
  const sheet = ss.getSheetByName("Transactions");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  const header = data[0];
  const titleIdx = header.indexOf("title");
  const noteIdx = header.indexOf("note");

  // Vòng lặp Bottom-Up
  for (let i = data.length - 1; i > 0; i--) {
    let title = String(data[i][titleIdx] || "");
    let note = String(data[i][noteIdx] || "");

    // Nhận diện mã đơn hàng lồng trong tiêu đề hoặc ghi chú của phiếu Kế toán
    if (title.includes(orderId) || note.includes(orderId)) {
      sheet.deleteRow(i + 1);
    }
  }
}
/**
 * BLOCK CODE AN TOÀN: TỰ ĐỘNG TÍNH TOÁN ĐỊNH MỨC (BOM) VÀ GIÁ VỐN CHO BỂ KÍNH
 * Yêu cầu: Chạy hàm này khi có mã bể mới hoặc khi cập nhật giá Kính/Silicon đầu vào.
 */
function autoCalculateGlassTankBOM() {
  return autoCalculateGlassTankBOM_Dual();
}

// =========================================================================
// HÀM TÍNH TOÁN CÔNG NỢ NHÀ CUNG CẤP (DYNAMIC DEBT)
// =========================================================================
function getRealSupplierDebt(supplierName, fullIEData, fullTxData) {
  if (!supplierName) return 0;
  var totalImport = 0;
  var totalPaid = 0;
  var sName = String(supplierName).toLowerCase().trim();

  if (fullIEData && fullIEData.length > 1) {
    for (var i = 1; i < fullIEData.length; i++) {
      var type = String(fullIEData[i][1]).trim();
      var target = String(fullIEData[i][2]).trim().toLowerCase();
      if (type === 'Nhập' && target === sName) {
        totalImport += Number(fullIEData[i][3]) || 0;
      }
    }
  }

  if (fullTxData && fullTxData.length > 1) {
    for (var j = 1; j < fullTxData.length; j++) {
      var type = String(fullTxData[j][1]).trim();
      if (type === 'Chi') {
        var title = String(fullTxData[j][6]).toLowerCase();
        var note = String(fullTxData[j][8]).toLowerCase();
        if (title.indexOf(sName) !== -1 || note.indexOf(sName) !== -1) {
          totalPaid += Number(fullTxData[j][3]) || 0;
        }
      }
    }
  }
  return totalImport - totalPaid;
}

// =========================================================================
// HÀM CHỐNG TRỪ KÉP KHO HÀNG (SAFE DEDUCT INVENTORY ON HANDOVER)
// =========================================================================
function safeDeductInventoryOnHandover(ordersToHandover, ss) {
  if (!ordersToHandover) return;
  if (!Array.isArray(ordersToHandover)) {
    ordersToHandover = [ordersToHandover];
  }
  if (ordersToHandover.length === 0) return;

  var prodSheet = ss.getSheetByName('Production');
  var prodData = prodSheet ? readSheet('Production', null, ss) : [];
  var productsSheet = ss.getSheetByName('Products');
  var productsData = productsSheet ? productsSheet.getDataRange().getValues() : [];
  if (productsData.length === 0) return;

  var pHeaders = productsData[0];
  var pIdCol = pHeaders.indexOf('id');
  var pNameCol = pHeaders.indexOf('name');
  var pQtyCol = pHeaders.indexOf('quantity');
  var pCostCol = pHeaders.indexOf('costPrice');
  var catColIdx = pHeaders.indexOf('category');
  var subCatColIdx = pHeaders.indexOf('sub_category');

  var productsModified = false;
  var totalExportValue = 0;
  var allItemsToExport = [];
  var orderCodes = [];

  ordersToHandover.forEach(function (order) {
    if (!order) return;
    var oCode = (order.orderCode || '').split(' | ')[0] || (order.id ? String(order.id).substring(0, 5) : '');
    if (oCode) orderCodes.push(oCode);

    // 1. Sản phẩm từ Production (Bể Kính / Layout): Trừ kho cho các món có lệnh sản xuất
    var orderProds = prodData.filter(function (p) {
      if (!p || String(p.orderId) !== String(order.id)) return false;
      var status = String(p.status).trim().toUpperCase();
      if (status === 'HỦY/VỠ' || status === 'ĐÃ HUỶ' || status === 'HỦY' || status === 'HUỶ' || status.indexOf('HỦY') > -1 || status.indexOf('HUỶ') > -1) return false;
      if (p.fulfilledFromStock === true || String(p.fulfilledFromStock).toUpperCase() === 'TRUE') return false;
      return true;
    });
    var prodNamesAdded = {};
    orderProds.forEach(function (rp) {
      if (rp && rp.name) {
        var pNameStr = String(rp.name).trim();
        // Layout dạng "Cover" phải luôn bypass cơ chế trừ kho thành phẩm tự động
        if (pNameStr.toLowerCase().indexOf('cover') > -1) {
          return;
        }
        allItemsToExport.push({ name: rp.name, qty: 1 });
        var k = pNameStr.toLowerCase();
        prodNamesAdded[k] = (prodNamesAdded[k] || 0) + 1;
      }
    });

    // 2. Phụ kiện đóng gói: Chỉ trừ những món CHƯA được tính trong Production
    var accs = [];
    if (typeof order.accessories === 'string') {
      try { accs = JSON.parse(order.accessories); } catch (e) { }
    } else {
      accs = order.accessories || [];
    }
    if (Array.isArray(accs)) {
      accs.forEach(function (a) {
        if (!a) return;
        var aName = typeof a === 'string' ? a : (a.name || a.Name || '');
        var qty = typeof a === 'object' ? (Number(a.quantity || a.qty) || 1) : 1;
        var aNameKey = String(aName).trim().toLowerCase();

        // Bỏ qua nếu là cover hoặc có fulfilledFromStock
        if (typeof a === 'object' && (a.fulfilledFromStock === true || String(a.fulfilledFromStock).toUpperCase() === 'TRUE')) {
          return;
        }
        if (aNameKey.indexOf('cover') > -1) {
          return;
        }

        // Nếu món này đã được đưa vào danh sách xuất từ lệnh Production tương ứng thì trừ bớt
        if (prodNamesAdded[aNameKey] && prodNamesAdded[aNameKey] > 0) {
          var remainingQty = Math.max(0, qty - prodNamesAdded[aNameKey]);
          prodNamesAdded[aNameKey] -= (qty - remainingQty);
          if (remainingQty > 0) {
            allItemsToExport.push({ name: aName, qty: remainingQty });
          }
        } else if (typeof a === 'object' && (a.hasProduction === true || a.hasProduction === 'true') && orderProds.length > 0) {
          // Bỏ qua nếu là món hàng sản xuất nhưng đã có Production xử lý
          return;
        } else if (aName) {
          allItemsToExport.push({ name: aName, qty: qty });
        }
      });
    }
  });

  // Gom nhóm và trừ kho cho TẤT CẢ các đơn
  if (allItemsToExport.length > 0) {
    var groupedItems = {};
    allItemsToExport.forEach(function (item) {
      var n = String(item.name).trim();
      if (!groupedItems[n]) groupedItems[n] = { name: n, qty: 0, price: 0 };
      groupedItems[n].qty += item.qty;
    });

    Object.keys(groupedItems).forEach(function (pName) {
      var gItem = groupedItems[pName];
      for (var i = 1; i < productsData.length; i++) {
        if (String(productsData[i][pNameCol]).trim().toLowerCase() === pName.toLowerCase()) {
          var cost = Number(productsData[i][pCostCol]) || 0;
          gItem.price = cost;
          var currentQty = Number(productsData[i][pQtyCol]) || 0;
          var category = catColIdx >= 0 ? String(productsData[i][catColIdx]).trim().toUpperCase() : '';
          var subCategory = subCatColIdx >= 0 ? String(productsData[i][subCatColIdx]).trim().toUpperCase() : '';

          if (pName.toLowerCase().indexOf('cover') > -1 || subCategory === 'COVER') {
            delete groupedItems[pName];
            break; // Bỏ qua tự động trừ kho cho Layout "Cover"
          }

          var newQty = currentQty - gItem.qty;
          if ((category.indexOf('BỂ KÍNH') > -1 || category.indexOf('LAYOUT') > -1) && newQty < 0) {
            newQty = 0;
          }
          productsData[i][pQtyCol] = newQty;
          totalExportValue += gItem.qty * cost;
          productsModified = true;
          break;
        }
      }
    });

    var validGroupedList = Object.values(groupedItems);
    if (validGroupedList.length > 0) {
      // Ghi note gom danh sách đơn
      var codesStr = orderCodes.join(', ');
      if (codesStr.length > 80) codesStr = codesStr.substring(0, 75) + '...';

      var logId = 'IE_SAFE_OUT_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      var targetName = ordersToHandover.length > 1 ? 'Bàn Giao Khách Hàng (Hàng Loạt)' : 'Bàn Giao Khách Hàng';

      var ieRow = SCHEMA_ERP.ImportExport.map(function (h) {
        if (h === 'id') return logId;
        if (h === 'type') return 'Xuất';
        if (h === 'target') return targetName;
        if (h === 'totalAmount') return totalExportValue;
        if (h === 'date') return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
        if (h === 'note') return 'Xuất kho an toàn cho đơn: ' + codesStr;
        if (h === 'itemsData') return JSON.stringify(validGroupedList);
        return '';
      });

      var ieSheet = ss.getSheetByName('ImportExport');
      if (ieSheet) {
        ieSheet.getRange(ieSheet.getLastRow() + 1, 1, 1, ieRow.length).setValues([ieRow]);
      }
    }
  }

  if (productsModified && productsSheet) {
    productsSheet.getRange(1, 1, productsData.length, pHeaders.length).setValues(productsData);
  }
}

function repairKPIProgressSheetHeaders() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('KPI_Progress');
    if (!sheet) return;

    var expectedSchema = ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide'];

    // Ghi chuẩn tiêu đề hàng 1 theo đúng Schema 23 bảng
    sheet.getRange(1, 1, 1, expectedSchema.length).setValues([expectedSchema]);
    sheet.getRange(1, 1, 1, expectedSchema.length).setFontWeight("bold");

    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      var lastCol = Math.max(sheet.getLastColumn(), 13);
      var range = sheet.getRange(2, 1, lastRow - 1, lastCol);
      var values = range.getValues();
      var isChanged = false;

      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        if (row[13] !== undefined && String(row[13]).trim() !== '' && (!row[12] || String(row[12]).trim() === '' || String(row[12]) === '0')) {
          row[12] = row[13];
          row[13] = '';
          isChanged = true;
        }
      }
      if (isChanged) {
        range.setValues(values);
      }
    }
  } catch (err) {
    Logger.log('Err repairKPIProgressSheetHeaders: ' + err.toString());
  }
}

// [REMOVED] api_insertManualKPI bản cũ (dead code — đã bị shadow bởi bản mới ở dưới có validation + tryLock tốt hơn)
// Xem hàm api_insertManualKPI chính thức tại block "THÊM KPI THỦ CÔNG VÀO BẢNG KPI_Progress"

/**
 * =========================================================================
 * API NHẬN DỮ LIỆU TỪ MODAL: GIAO NHIỆM VỤ (Vào bảng BonusPenalty làm XU)
 * =========================================================================
 */
function api_insertManualTask(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('KPI_Progress');
    if (!sheet) {
      sheet = ss.insertSheet('KPI_Progress');
      sheet.appendRow(SCHEMA_ERP.KPI_Progress);
      sheet.setFrozenRows(1);
    }

    var now = new Date();
    var startTime = payload.startTime ? new Date(payload.startTime) : new Date(now.getFullYear(), now.getMonth(), 1);
    var endTime = payload.endTime ? new Date(payload.endTime) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    var targetVal = Number(payload.target);
    if (isNaN(targetVal) || targetVal <= 0) targetVal = 1;
    var unitVal = payload.unit ? String(payload.unit).trim() : 'Xu';

    // ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide']
    var newRow = [
      'KPI_XU_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      payload.user,
      payload.title || 'Nhiệm vụ Xu',
      0, // current
      targetVal, // target (chỉ tiêu mục tiêu)
      unitVal, // unit (Bộ, Lần, SP, VNĐ...)
      now,
      startTime,
      endTime,
      Number(payload.amount) || 0, // Số Xu
      false, // Chưa claim
      Number(payload.penalty) || 0, // Tiền phạt
      payload.note || '' // Mô tả / Hướng dẫn
    ];

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    return { success: true, message: 'Đã giao nhiệm vụ thành công! Nhân sự cần báo cáo hoàn thành để nhận Xu.' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * API XỬ LÝ DƯ NỢ LƯƠNG ÂM THEO CHUẨN ERP
 */
function api_settleMonthlyDebt(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (!bpSheet) {
      bpSheet = ss.insertSheet('BonusPenalty');
      bpSheet.appendRow(SCHEMA_ERP.BonusPenalty);
    }

    var parts = payload.monthStr.split('-');
    var nextMonthObj = new Date(parseInt(parts[0]), parseInt(parts[1]), 1); // Ngày 1 tháng sau
    var nextMonthStr = Utilities.formatDate(nextMonthObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    // 1. Tạo phiếu Reset số dư tháng hiện tại về 0 trên Bảng Lương
    var resetRow = [
      'BP_RESET_' + Date.now(),
      payload.user,
      payload.amount, // Số tiền dương để bù trừ hoàn toàn khoản âm tháng này
      'Thu Nhập Khác',
      'Điều chỉnh kết chuyển dư nợ kỳ lương ' + payload.monthStr,
      todayStr,
      ''
    ];
    bpSheet.appendRow(resetRow);

    // 2. Tạo phiếu nợ/vay cho tháng tiếp theo
    if (payload.mode === 'LOAN_INSTALLMENT') {
      // Chuyển thành Khoản Vay Nội Bộ
      var noteText = 'Khoản vay nội bộ kết chuyển từ dư nợ ' + payload.monthStr;
      if (payload.monthlyDeduction > 0) {
        noteText += ' (Quy định trừ ' + Number(payload.monthlyDeduction).toLocaleString('vi-VN') + 'đ/tháng)';
      }

      var loanRow = [
        'LOAN_' + Date.now(),
        payload.user,
        -payload.amount, // Đánh dấu nợ âm ở sổ cho vay
        'Khoản Vay Nội Bộ',
        noteText,
        nextMonthStr,
        ''
      ];
      bpSheet.appendRow(loanRow);

    } else {
      // Chuyển thành Nợ Tháng Trước (Trừ sạch kỳ sau)
      var debtRow = [
        'DEBT_' + Date.now(),
        payload.user,
        -payload.amount,
        'Nợ Tháng Trước',
        'Dư nợ lũy kế kết chuyển từ kỳ lương ' + payload.monthStr,
        nextMonthStr,
        ''
      ];
      bpSheet.appendRow(debtRow);
    }

    SpreadsheetApp.flush();
    return { success: true, message: 'Đã xử lý dư nợ thành công!' };

  } catch (error) {
    return { success: false, message: 'Lỗi Backend: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * API HOÀN THÀNH LÔ BỂ KÍNH (Batch Production)
 */
function api_completeBatchProduction(idList) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    if (!sheet) return { success: false, message: 'Không tìm thấy bảng Production' };

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    var statusCol = headers.indexOf('status');
    var p1_statusCol = headers.indexOf('p1_status');
    var p2_statusCol = headers.indexOf('p2_status');
    var p1_endTimeCol = headers.indexOf('p1_endTime');
    var p2_endTimeCol = headers.indexOf('p2_endTime');

    if (idCol === -1 || statusCol === -1) return { success: false, message: 'Lỗi cấu trúc bảng' };

    var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var modified = false;

    for (var i = 1; i < data.length; i++) {
      if (idList.indexOf(String(data[i][idCol])) !== -1) {
        // Cập nhật trạng thái cho cả dòng
        sheet.getRange(i + 1, statusCol + 1).setValue('Done');

        if (p1_statusCol !== -1) sheet.getRange(i + 1, p1_statusCol + 1).setValue('Done');
        if (p2_statusCol !== -1) sheet.getRange(i + 1, p2_statusCol + 1).setValue('Done');
        if (p1_endTimeCol !== -1 && data[i][p1_endTimeCol] === '') sheet.getRange(i + 1, p1_endTimeCol + 1).setValue(nowStr);
        if (p2_endTimeCol !== -1 && data[i][p2_endTimeCol] === '') sheet.getRange(i + 1, p2_endTimeCol + 1).setValue(nowStr);
        modified = true;
      }
    }

    if (modified) SpreadsheetApp.flush();

    return { success: true, message: 'Đã cập nhật ' + idList.length + ' lệnh' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * THUẬT TOÁN BƠM ĐƠN BỂ KÍNH: GỘP LỆNH CHƯA LÀM, TÁCH LỆNH ĐÃ LÀM
 * @param {Object} ss - Spreadsheet Active
 * @param {Object} newProdItem - Thông tin sản phẩm bể kính mới từ đơn hàng
 */
function processSmartGlassTankDispatch(ss, newProdItem) {
  var prodSheet = ss.getSheetByName('Production');
  if (!prodSheet) return;

  var prodData = prodSheet.getDataRange().getValues();
  var headers = prodData[0];

  var idIdx = headers.indexOf('id');
  var nameIdx = headers.indexOf('name');
  var statusIdx = headers.indexOf('status');
  var p1StatusIdx = headers.indexOf('p1_status');
  var orderIdIdx = headers.indexOf('orderId');
  var noteIdx = headers.indexOf('note');

  var searchName = String(newProdItem.name).trim().toLowerCase();
  var targetRowIndex = -1;

  // 1. Quét tìm Lệnh cũ có cùng Tên Bể Kính VÀ chưa bắt đầu làm (p1_status === 'Pending' hoặc rỗng)
  for (var i = 1; i < prodData.length; i++) {
    var rowName = String(prodData[i][nameIdx]).trim().toLowerCase();
    var rowStatus = String(prodData[i][statusIdx]).trim().toUpperCase();
    var rowP1Status = String(prodData[i][p1StatusIdx]).trim().toUpperCase();

    var isSameProduct = (rowName === searchName);
    var isUnstarted = (rowP1Status === 'PENDING' || rowP1Status === '' || rowStatus === 'PENDING' || rowStatus === 'CHỜ SẢN XUẤT');

    if (isSameProduct && isUnstarted) {
      targetRowIndex = i + 1; // Tìm thấy dòng Lệnh Cũ chưa làm!
      break;
    }
  }

  // 2. PHÂN NHÁNH XỬ LÝ
  if (targetRowIndex !== -1) {
    // === TRƯỜNG HỢP A: LỆNH CŨ CHƯA LÀM -> GỘP ĐƠN VÀO LỆNH CŨ ===
    var currentOrderId = String(prodData[targetRowIndex - 1][orderIdIdx] || '');
    var currentNote = String(prodData[targetRowIndex - 1][noteIdx] || '');

    // Nối thêm ID đơn mới và Cập nhật Ghi chú Lô
    var updatedOrderId = currentOrderId + (newProdItem.orderId ? ' | ' + newProdItem.orderId : '');
    var updatedNote = currentNote + ' [Gộp đơn: ' + (newProdItem.orderId || 'SXT') + ']';

    prodSheet.getRange(targetRowIndex, orderIdIdx + 1).setValue(updatedOrderId);
    prodSheet.getRange(targetRowIndex, noteIdx + 1).setValue(updatedNote);

  } else {
    // === TRƯỜNG HỢP B: ĐÃ CẮT MÀI DÁN HOẶC CHƯA CÓ LỆNH -> TẠO LỆNH MỚI ĐỘC LẬP ===
    var newProdId = newProdItem.id || ('PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
    var newRow = headers.map(function (h) {
      if (h === 'id') return newProdId;
      if (h === 'orderId') return newProdItem.orderId || '';
      if (h === 'type') return newProdItem.type || 'Bể Kính';
      if (h === 'name') return newProdItem.name || '';
      if (h === 'status') return 'Pending';
      if (h === 'p1_name') return (newProdItem.phases && newProdItem.phases.phase1 && newProdItem.phases.phase1.name) ? newProdItem.phases.phase1.name : 'Cắt Dán';
      if (h === 'p1_status') return 'Pending';
      if (h === 'p2_name') return (newProdItem.phases && newProdItem.phases.phase2 && newProdItem.phases.phase2.name) ? newProdItem.phases.phase2.name : 'Gọt Keo';
      if (h === 'p2_status') return 'Pending';
      if (h === 'note') return newProdItem.note || 'Lệnh sản xuất mới';
      if (h === 'deadline') return newProdItem.deadline || '';
      if (h === 'p1_user') return newProdItem.p1_user || newProdItem.responsibleUser || '';
      return '';
    });

    prodSheet.appendRow(newRow);
  }
}


/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG DỰA TRÊN DỮ LIỆU ĐƠN HÀNG
 */
function updateKpiProgressData() {
  try {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) return;

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const ordersSheet = ss.getSheetByName('Orders');

      if (!kpiSheet || !ordersSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      const ordersData = ordersSheet.getDataRange().getValues();

      if (kpiData.length < 2 || ordersData.length < 2) return;

      const kpiHeaders = kpiData[0];
      const idIdx = kpiHeaders.indexOf('id');
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const unitIdx = kpiHeaders.indexOf('unit');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      const orderHeaders = ordersData[0];
      const oStatusIdx = orderHeaders.indexOf('status');
      const oIsReconciledIdx = orderHeaders.indexOf('isReconciled');
      const oNoteIdx = orderHeaders.indexOf('note');
      const oRevenueIdx = orderHeaders.indexOf('revenue');
      const oReconciledAtIdx = orderHeaders.indexOf('reconciledAt');
      let oDateIdx = orderHeaders.indexOf('createdAt');
      if (oDateIdx === -1) oDateIdx = orderHeaders.indexOf('date');

      // Convert orders to objects for easier filtering
      const orders = ordersData.slice(1).map(row => {
        const recAt = row[oReconciledAtIdx];
        const rawDate = row[oDateIdx];
        return {
          status: row[oStatusIdx],
          isReconciled: String(row[oIsReconciledIdx]).toLowerCase() === 'true' || row[oIsReconciledIdx] === true,
          note: row[oNoteIdx] || '',
          revenue: Number(row[oRevenueIdx]) || 0,
          date: rawDate,
          reconciledAt: recAt || rawDate
        };
      });

      const updates = [];

      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        const user = String(kpi[userIdx] || '').trim();
        const unit = String(kpi[unitIdx] || '').trim().toLowerCase();
        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase();

        // CHỈ quét tự động cho Diệu Hương (Sales & QC Đóng gói) với các KPI doanh thu/khiếu nại/hàng hoàn cụ thể
        // Tuyệt đối không đè các nhiệm vụ Xu, nhiệm vụ thủ công của nhân sự khác (như Trần Duy Tân, Hoàng Dương, v.v.)
        const userLower = user.toLowerCase();
        if (!userLower.includes('diệu hương') && !userLower.includes('hương')) continue;
        if (unit === 'xu' || unit === 'bộ' || unit === 'cái' || unit === 'checklist' || unit === 'lần') continue;

        function parseDateFlex(d, isEnd) {
          if (!d) return null;
          if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
          var str = String(d).trim().split(' ')[0].split('T')[0];
          var curYear = new Date().getFullYear();
          if (str.indexOf('/') !== -1) {
            var parts = str.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 4) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
              if (parts[0].length === 4) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            } else if (parts.length === 2) {
              if (parts[1].length === 4) {
                var m = Number(parts[0]) - 1;
                var y = Number(parts[1]);
                if (isEnd) return new Date(y, m + 1, 0, 23, 59, 59, 999);
                return new Date(y, m, 1, 0, 0, 0, 0);
              }
              return new Date(curYear, Number(parts[1]) - 1, Number(parts[0]));
            }
          } else if (str.indexOf('-') !== -1) {
            var parts = str.split('-');
            if (parts.length === 3) {
              if (parts[0].length === 4) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              if (parts[2].length === 4) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            } else if (parts.length === 2) {
              if (parts[0].length === 4) {
                var y = Number(parts[0]);
                var m = Number(parts[1]) - 1;
                if (isEnd) return new Date(y, m + 1, 0, 23, 59, 59, 999);
                return new Date(y, m, 1, 0, 0, 0, 0);
              }
              return new Date(curYear, Number(parts[0]) - 1, Number(parts[1]));
            }
          }
          var dt = new Date(d);
          return isNaN(dt.getTime()) ? null : dt;
        }

        var start = parseDateFlex(kpi[startTimeIdx], false) || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        var end = parseDateFlex(kpi[endTimeIdx], true) || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        // Filter orders within KPI timeframe
        const periodOrders = orders.filter(o => {
          var oDate = parseDateFlex(o.date || o.createdAt);
          return oDate && oDate >= start && oDate <= end;
        });
        // Filter reconciled/completed orders by their actual process date
        const reconciledPeriodOrders = orders.filter(o => {
          var rDate = parseDateFlex(o.reconciledAt || o.date);
          return rDate && rDate >= start && rDate <= end;
        });

        // Logic 2: Returned Item Processing (> 80%)
        if (kpiName.includes('xử lý hàng hoàn') || (kpiName.includes('hàng hoàn') && unit === '%')) {
          const totalReturns = reconciledPeriodOrders.filter(o => o.status === 'Hàng Hoàn');
          const reconciledReturns = totalReturns.filter(o => o.isReconciled);
          if (totalReturns.length > 0) {
            newVal = Math.round((reconciledReturns.length / totalReturns.length) * 100);
          } else {
            newVal = 100; // No returns = 100% processing
          }
        }

        // Logic 3: Dispute Win Rate (> 60%)
        else if (kpiName.includes('tỷ lệ thắng khiếu nại') || (kpiName.includes('khiếu nại') && unit === '%')) {
          const orderPool = (periodOrders.length > 0) ? periodOrders : orders;
          const winCount = orderPool.filter(o => {
            const noteLower = String(o.note || '').toLowerCase();
            const statusLower = String(o.status || '').toLowerCase();
            return noteLower.includes('[kn-thang]') || noteLower.includes('thắng khiếu nại') || noteLower.includes('khiếu nại hợp lệ') || statusLower.includes('thắng khiếu nại');
          }).length;

          const loseCount = orderPool.filter(o => {
            const noteLower = String(o.note || '').toLowerCase();
            const statusLower = String(o.status || '').toLowerCase();
            return noteLower.includes('[kn-thua]') || noteLower.includes('thua khiếu nại') || noteLower.includes('khiếu nại không hợp lệ') || statusLower.includes('thua khiếu nại');
          }).length;

          const totalDisputes = winCount + loseCount;
          if (totalDisputes > 0) {
            newVal = Math.round((winCount / totalDisputes) * 100);
          } else {
            newVal = 0;
          }
        }

        // Logic 4: Sales Revenue Target
        else if (kpiName.includes('doanh thu') && (unit.includes('vnd') || unit.includes('vnđ') || unit.includes('đ'))) {
          newVal = periodOrders.reduce((sum, o) => {
            const st = String(o.status || '').trim();
            const ch = String(o.channel || '').trim();
            const chLower = ch.toLowerCase();
            if (ch === 'Sản Xuất Tồn' || ch === 'Sản Xuất Bù Kho' || chLower.includes('cộng tác viên') || ch === 'CTV') return sum;

            const oUser = String(o.responsibleUser || o.sale || '').toLowerCase().trim();
            const isUserDirectMatch = oUser.includes('diệu hương') || oUser.includes('hương');
            const isDirectChannel = chLower.includes('bán lẻ') || chLower.includes('ban le') ||
              chLower.includes('bán sỉ') || chLower.includes('ban si') ||
              chLower.includes('facebook') || chLower.includes('fb') ||
              chLower.includes('zalo') || chLower.includes('tư vấn') ||
              chLower.includes('hotline') || chLower.includes('trực tiếp') ||
              chLower.includes('khách lẻ') || chLower.includes('cửa hàng') ||
              chLower.includes('messenger');

            if ((isUserDirectMatch || (!oUser && isDirectChannel)) && !st.includes('Hủy') && !st.includes('Huỷ') && !st.includes('Hoàn') && !st.includes('Thất bại') && st !== 'Cancelled' && st !== 'Returned') {
              let rev = Number(o.revenue) || 0;
              const chUpper = ch.toUpperCase();
              if (chUpper.includes('USD') || (chUpper.includes('XUẤT KHẨU') && rev < 10000)) rev *= 25500;
              return sum + Math.round(rev);
            }
            return sum;
          }, 0);
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Apply updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Updated ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs in KPI_Progress.`);
      }

    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData: ' + err.toString());
  }
}

/**
 * TỰ ĐỘNG THIẾT LẬP TIME-DRIVEN TRIGGER QUÉT KPI
 * Chạy hàm này 1 lần duy nhất trong Google Apps Script Editor
 */
function setupKpiCronTrigger() {
  // Xóa các trigger cũ trùng tên để tránh chạy đúp
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    const handler = triggers[i].getHandlerFunction();
    if (
      handler === 'updateKpiProgressData' || 
      handler === 'updateKpiProgressData_Duong' || 
      handler === 'updateKpiProgressData_Tam' ||
      handler === 'updateKpiProgressData_Trang'
    ) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Tạo trigger mới: Chạy tự động mỗi 1 giờ
  ScriptApp.newTrigger('updateKpiProgressData')
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger('updateKpiProgressData_Duong')
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger('updateKpiProgressData_Tam')
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger('updateKpiProgressData_Trang')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('🟢 ĐÃ KHỞI TẠO TRIGGER TỰ ĐỘNG CẬP NHẬT KPI MỖI 1 GIỜ thành công!');
}

/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG CHO NGUYỄN HOÀNG DƯƠNG (Quản lý kho & Bể Kính)
 */
function updateKpiProgressData_Duong() {
  try {
    const lock = LockService.getScriptLock();
    // Chờ tối đa 15s để tránh đụng độ dữ liệu
    if (!lock.tryLock(15000)) return;

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const prodSheet = ss.getSheetByName('Production');
      const productsSheet = ss.getSheetByName('Products');
      const importExportSheet = ss.getSheetByName('ImportExport');

      if (!kpiSheet || !prodSheet || !productsSheet || !importExportSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      const prodData = prodSheet.getDataRange().getValues();
      const productsData = productsSheet.getDataRange().getValues();
      const ieData = importExportSheet.getDataRange().getValues();

      if (kpiData.length < 2) return;

      const kpiHeaders = kpiData[0];
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      // Parse Production
      const prodHeaders = prodData[0];
      const p1UserIdx = prodHeaders.indexOf('p1_user');
      const p1StatusIdx = prodHeaders.indexOf('p1_status');
      const p1EndTimeIdx = prodHeaders.indexOf('p1_endTime');

      // Parse Products
      const prdHeaders = productsData[0];
      const skuIdx = prdHeaders.indexOf('sku');
      const categoryIdx = prdHeaders.indexOf('category');
      const quantityIdx = prdHeaders.indexOf('quantity');
      const minStockIdx = prdHeaders.indexOf('minStock');

      // Parse ImportExport (Caching O(N))
      const ieHeaders = ieData[0];
      const ieDateIdx = ieHeaders.indexOf('date');
      const ieItemsDataIdx = ieHeaders.indexOf('itemsData');

      // Khởi tạo thời gian hiện tại
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

      // Cache ImportExport trong 24h qua thành chuỗi khổng lồ để quét (O(N))
      let recentIEString = "";
      for (let i = 1; i < ieData.length; i++) {
        const ieDate = new Date(ieData[i][ieDateIdx]);
        if (ieDate >= twentyFourHoursAgo) {
          recentIEString += String(ieData[i][ieItemsDataIdx] || "");
        }
      }

      const updates = [];

      // Bắt đầu quét KPI
      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        if (String(kpi[userIdx]) !== 'Nguyễn Hoàng Dương') continue;

        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase();
        const start = new Date(kpi[startTimeIdx]);
        const end = new Date(kpi[endTimeIdx]);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        // KPI 4: Cân bằng Kho 5S -> BYPASSED
        if (kpiName.includes('cân bằng kho') || kpiName.includes('5s')) {
          // Bypassed: Quản lý sẽ có toàn quyền kiểm tra thực tế kho và gõ % trực tiếp
          continue;
        }

        // Lọc dữ liệu Production trong tháng cho Dương
        const duongProds = [];
        for (let j = 1; j < prodData.length; j++) {
          const row = prodData[j];
          if (row[p1UserIdx] === 'Nguyễn Hoàng Dương' && row[p1StatusIdx] === 'Done') {
            const endTime = new Date(row[p1EndTimeIdx]);
            if (endTime >= start && endTime <= end) {
              duongProds.push(endTime);
            }
          }
        }

        // KPI 1: Năng suất Cắt & Dán Bể Kính Hoàn Thành (Target: 180 Bể)
        if (kpiName.includes('cắt & dán') || kpiName.includes('năng suất')) {
          newVal = duongProds.length;
        }

        // KPI 2: SLA Cấp Phôi Kính Ca Sáng (Đạt trước 11:30 AM)
        else if (kpiName.includes('sla') || kpiName.includes('ca sáng')) {
          let onTimeCount = 0;
          duongProds.forEach(dt => {
            // Sử dụng set múi giờ bằng format (GMT+7)
            const hourStr = Utilities.formatDate(dt, 'Asia/Ho_Chi_Minh', 'HH');
            const minStr = Utilities.formatDate(dt, 'Asia/Ho_Chi_Minh', 'mm');
            const hh = parseInt(hourStr, 10);
            const mm = parseInt(minStr, 10);

            // <= 11:30:59
            if (hh < 11 || (hh === 11 && mm <= 30)) {
              onTimeCount++;
            }
          });

          if (duongProds.length > 0) {
            newVal = Math.round((onTimeCount / duongProds.length) * 100);
          } else {
            newVal = 100; // Chưa làm gì trong tháng thì coi như SLA 100%
          }
        }

        // KPI 3: Cảnh báo Chống Đứt gãy Vật tư (Target: 0)
        else if (kpiName.includes('đứt gãy') || kpiName.includes('vật tư')) {
          let violationCount = 0;

          for (let p = 1; p < productsData.length; p++) {
            const prdRow = productsData[p];
            if (prdRow[categoryIdx] === 'DANH MỤC SẢN XUẤT') {
              const qty = Number(prdRow[quantityIdx]) || 0;
              const minStock = Number(prdRow[minStockIdx]) || 0;

              if (qty <= minStock) {
                const sku = String(prdRow[skuIdx]);
                // Kiểm tra xem SKU cạn này có nằm trong chuỗi JSON ImportExport 24h qua không
                if (!recentIEString.includes(sku)) {
                  violationCount++;
                }
              }
            }
          }
          newVal = violationCount;
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Áp dụng updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Đã cập nhật ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs cho Nguyễn Hoàng Dương.`);
      }

    } catch (innerErr) {
      Logger.log('Lỗi updateKpiProgressData_Duong (inner): ' + innerErr.toString());
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData_Duong: ' + err.toString());
  }
}

/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG CHO LẠI TRƯỜNG TÂM (Quản lý Nhân sự & Khâu 2)
 */
function updateKpiProgressData_Tam() {
  try {
    const lock = LockService.getScriptLock();
    // Chờ tối đa 15s để chống ghi đè đồng thời
    if (!lock.tryLock(15000)) return;

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const attSheet = ss.getSheetByName('Attendance');
      const prodSheet = ss.getSheetByName('Production');

      if (!kpiSheet || !attSheet || !prodSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      const attData = attSheet.getDataRange().getValues();
      const prodData = prodSheet.getDataRange().getValues();

      if (kpiData.length < 2) return;

      const kpiHeaders = kpiData[0];
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      // Parse Attendance
      const attHeaders = attData[0];
      const attUserIdx = attHeaders.indexOf('user');
      const attDateIdx = attHeaders.indexOf('date');
      const attStatusIdx = attHeaders.indexOf('status');
      const attPenaltyIdx = attHeaders.indexOf('penalty');

      // Parse Production
      const prodHeaders = prodData[0];
      const p2UserIdx = prodHeaders.indexOf('p2_user');
      const p2StatusIdx = prodHeaders.indexOf('p2_status');
      const p2EndTimeIdx = prodHeaders.indexOf('p2_endTime');
      const qcStatusIdx = prodHeaders.indexOf('qc_status');
      const prodStatusIdx = prodHeaders.indexOf('status');

      const updates = [];

      // Bắt đầu quét KPI cho Lại Trường Tâm
      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        const user = String(kpi[userIdx] || '').trim();
        if (user !== 'Lại Trường Tâm') continue;

        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase().trim();
        const start = new Date(kpi[startTimeIdx]);
        const end = new Date(kpi[endTimeIdx]);
        end.setHours(23, 59, 59, 999);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        // 1. KPI Kỷ luật chấm công & giờ giấc xưởng (Target: 100%)
        if (kpiName.includes('kỷ luật') || kpiName.includes('chấm công') || kpiName.includes('giờ giấc') || kpiName.includes('5s')) {
          let totalShifts = 0;
          let violationShifts = 0;

          for (let a = 1; a < attData.length; a++) {
            const attRow = attData[a];
            if (!attRow[attUserIdx]) continue;

            const attDate = new Date(attRow[attDateIdx]);
            if (isNaN(attDate.getTime()) || attDate < start || attDate > end) continue;

            totalShifts++;

            const st = String(attRow[attStatusIdx] || '').toLowerCase();
            const pen = Number(attRow[attPenaltyIdx] || 0);

            // Ca vi phạm: quên chấm ra, đi muộn, muộn >1h, nghỉ không phép, hoặc có tiền phạt vi phạm
            if (
              st.includes('quên chấm') || 
              st.includes('đi muộn') || 
              st.includes('muộn') || 
              st.includes('không phép') || 
              st.includes('vi phạm') || 
              pen > 0
            ) {
              violationShifts++;
            }
          }

          if (totalShifts > 0) {
            newVal = Math.max(0, Math.round((1 - (violationShifts / totalShifts)) * 100));
          } else {
            newVal = 100; // Chưa phát sinh dữ liệu chấm công -> 100%
          }
        }

        // 2. KPI Năng suất Khâu 2 (Gọt Keo & Gia Cố)
        else if (kpiName.includes('năng suất') || kpiName.includes('khâu 2') || kpiName.includes('gọt keo') || kpiName.includes('gia cố')) {
          if (!kpiName.includes('kcs') && !kpiName.includes('vòng 1') && !kpiName.includes('đạt chuẩn')) {
            let tamDoneCount = 0;
            for (let p = 1; p < prodData.length; p++) {
              const pRow = prodData[p];
              const p2U = String(pRow[p2UserIdx] || '').trim();
              const p2St = String(pRow[p2StatusIdx] || '').trim();
              if (p2U === 'Lại Trường Tâm' && (p2St === 'Done' || p2St === 'ĐÃ XONG')) {
                const p2End = new Date(pRow[p2EndTimeIdx]);
                if (!isNaN(p2End.getTime()) && p2End >= start && p2End <= end) {
                  tamDoneCount++;
                }
              }
            }
            newVal = tamDoneCount;
          }
        }

        // 3. KPI Tỷ lệ đạt chuẩn KCS Khâu 2 vòng 1 (Target: 95%)
        if (kpiName.includes('kcs') || kpiName.includes('vòng 1') || kpiName.includes('đạt chuẩn')) {
          let totalTamProds = 0;
          let passFirstRound = 0;

          for (let p = 1; p < prodData.length; p++) {
            const pRow = prodData[p];
            const p2U = String(pRow[p2UserIdx] || '').trim();
            const p2St = String(pRow[p2StatusIdx] || '').trim();
            if (p2U === 'Lại Trường Tâm' && (p2St === 'Done' || p2St === 'ĐÃ XONG')) {
              const p2End = new Date(pRow[p2EndTimeIdx]);
              if (!isNaN(p2End.getTime()) && p2End >= start && p2End <= end) {
                totalTamProds++;

                const qcSt = String(pRow[qcStatusIdx] || '').toUpperCase().trim();
                const pSt = String(pRow[prodStatusIdx] || '').toUpperCase().trim();

                // Đạt KCS ngay lần đầu: qc_status không bị FAIL / Lỗi / Hỏng và không bị trả lại sửa
                if (qcSt !== 'FAIL' && qcSt !== 'LỖI' && qcSt !== 'SỬA LẠI' && !pSt.includes('LỖI')) {
                  passFirstRound++;
                }
              }
            }
          }

          if (totalTamProds > 0) {
            newVal = Math.min(100, Math.max(0, Math.round((passFirstRound / totalTamProds) * 100)));
          } else {
            newVal = 100;
          }
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Áp dụng updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Đã cập nhật ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs cho Lại Trường Tâm.`);
      }

    } catch (innerErr) {
      Logger.log('Lỗi updateKpiProgressData_Tam (inner): ' + innerErr.toString());
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData_Tam: ' + err.toString());
  }
}

/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG CHO NGUYỄN THỊ HUYỀN TRANG (Kế Toán)
 */
function updateKpiProgressData_Trang() {
  try {
    const lock = LockService.getScriptLock();
    // Chờ tối đa 15s để chống ghi đè đồng thời
    if (!lock.tryLock(15000)) return;

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const txSheet = ss.getSheetByName('Transactions');
      const suppSheet = ss.getSheetByName('Suppliers');
      const ieSheet = ss.getSheetByName('ImportExport');
      const snapSheet = ss.getSheetByName('Monthly_Snapshots');

      if (!kpiSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      if (kpiData.length < 2) return;

      const txData = txSheet ? txSheet.getDataRange().getValues() : [];
      const suppData = suppSheet ? suppSheet.getDataRange().getValues() : [];
      const ieData = ieSheet ? ieSheet.getDataRange().getValues() : [];
      const snapData = snapSheet ? snapSheet.getDataRange().getValues() : [];

      const kpiHeaders = kpiData[0];
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      // Parse Transactions
      const txHeaders = txData.length > 0 ? txData[0] : [];
      const txTypeIdx = txHeaders.indexOf('type');
      const txDateIdx = txHeaders.indexOf('date');
      const txClearedIdx = txHeaders.indexOf('isCleared');
      const txNoteIdx = txHeaders.indexOf('note');
      const txTitleIdx = txHeaders.indexOf('title');
      const txAmtIdx = txHeaders.indexOf('amount');

      // Parse Suppliers
      const suppHeaders = suppData.length > 0 ? suppData[0] : [];
      const suppNameIdx = suppHeaders.indexOf('name');
      const suppDebtIdx = suppHeaders.indexOf('totalDebt');

      // Parse ImportExport
      const ieHeaders = ieData.length > 0 ? ieData[0] : [];
      const ieTypeIdx = ieHeaders.indexOf('type');
      const ieTargetIdx = ieHeaders.indexOf('target');
      const ieTotalAmtIdx = ieHeaders.indexOf('totalAmount');
      const ieDateIdx = ieHeaders.indexOf('date');

      // Parse Monthly_Snapshots
      const snapHeaders = snapData.length > 0 ? snapData[0] : [];
      const snapMonthIdx = snapHeaders.indexOf('month');

      const updates = [];

      // Bắt đầu quét KPI cho Nguyễn Thị Huyền Trang
      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        const user = String(kpi[userIdx] || '').trim();
        if (user !== 'Nguyễn Thị Huyền Trang') continue;

        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase().trim();
        const start = new Date(kpi[startTimeIdx]);
        const end = new Date(kpi[endTimeIdx]);
        end.setHours(23, 59, 59, 999);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        // 1. KPI Khớp lệnh đối soát dòng tiền tự động (Target: 100%)
        if (kpiName.includes('đối soát') || kpiName.includes('dòng tiền') || kpiName.includes('khớp lệnh') || kpiName.includes('sao kê')) {
          let totalTx = 0;
          let clearedTx = 0;

          if (txData.length > 1 && txDateIdx > -1) {
            for (let t = 1; t < txData.length; t++) {
              const txRow = txData[t];
              const txDate = new Date(txRow[txDateIdx]);
              if (isNaN(txDate.getTime()) || txDate < start || txDate > end) continue;

              totalTx++;
              const isClr = txClearedIdx > -1 ? txRow[txClearedIdx] : null;
              if (isClr === true || isClr === 'true' || isClr === 1 || isClr === '1') {
                clearedTx++;
              }
            }
          }

          if (totalTx > 0) {
            newVal = Math.min(100, Math.max(0, Math.round((clearedTx / totalTx) * 100)));
          } else {
            newVal = 100; // Chưa có giao dịch trong kỳ -> 100%
          }
        }

        // 2. KPI Khóa sổ kế toán & bảng lương đúng hạn (Target: 1 Kỳ)
        else if (kpiName.includes('khóa sổ') || kpiName.includes('bảng lương') || kpiName.includes('snapshot') || kpiName.includes('kỳ lương')) {
          let isLocked = false;
          const kpiMonthStr = Utilities.formatDate(start, 'Asia/Ho_Chi_Minh', 'yyyy-MM');

          if (snapData.length > 1 && snapMonthIdx > -1) {
            for (let s = 1; s < snapData.length; s++) {
              const sMonth = String(snapData[s][snapMonthIdx] || '').trim();
              if (sMonth === kpiMonthStr || sMonth.startsWith(kpiMonthStr)) {
                isLocked = true;
                break;
              }
            }
          }
          newVal = isLocked ? 1 : 0;
        }

        // 3. KPI Quản trị công nợ Nhà Cung Cấp (Target: 100%)
        else if (kpiName.includes('công nợ') || kpiName.includes('nhà cung cấp') || kpiName.includes('ncc')) {
          let totalSuppliers = 0;
          let validSuppliers = 0;

          if (suppData.length > 1 && suppNameIdx > -1) {
            for (let sp = 1; sp < suppData.length; sp++) {
              const spRow = suppData[sp];
              const spName = String(spRow[suppNameIdx] || '').trim();
              if (!spName) continue;

              totalSuppliers++;
              const trackedDebt = suppDebtIdx > -1 ? Number(spRow[suppDebtIdx] || 0) : 0;

              // Tính tổng nhập hàng từ NCC này
              let totalImportAmt = 0;
              if (ieData.length > 1 && ieTargetIdx > -1 && ieTypeIdx > -1) {
                for (let ie = 1; ie < ieData.length; ie++) {
                  const ieRow = ieData[ie];
                  const ieTarget = String(ieRow[ieTargetIdx] || '').trim();
                  const ieType = String(ieRow[ieTypeIdx] || '').trim();
                  if (ieTarget === spName && ieType.toLowerCase().includes('nhập')) {
                    totalImportAmt += Number(ieRow[ieTotalAmtIdx] || 0);
                  }
                }
              }

              // Tính tổng chi thanh toán cho NCC này
              let totalPaidAmt = 0;
              if (txData.length > 1 && txTypeIdx > -1) {
                for (let tx = 1; tx < txData.length; tx++) {
                  const txRow = txData[tx];
                  const txType = String(txRow[txTypeIdx] || '').trim();
                  const txNote = String(txRow[txNoteIdx] || '') + ' ' + String(txRow[txTitleIdx] || '');
                  if (txType.toLowerCase().includes('chi') && txNote.includes(spName)) {
                    totalPaidAmt += Number(txRow[txAmtIdx] || 0);
                  }
                }
              }

              // Công nợ hợp lệ: Không bị âm vô lý và khớp logic quản trị
              const calculatedDebt = totalImportAmt - totalPaidAmt;
              if (trackedDebt >= 0 && (totalImportAmt === 0 || Math.abs(trackedDebt - calculatedDebt) < 1000000 || trackedDebt === calculatedDebt)) {
                validSuppliers++;
              }
            }
          }

          if (totalSuppliers > 0) {
            newVal = Math.min(100, Math.max(0, Math.round((validSuppliers / totalSuppliers) * 100)));
          } else {
            newVal = 100;
          }
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Áp dụng updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Đã cập nhật ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs cho Nguyễn Thị Huyền Trang.`);
      }

    } catch (innerErr) {
      Logger.log('Lỗi updateKpiProgressData_Trang (inner): ' + innerErr.toString());
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData_Trang: ' + err.toString());
  }
}


// =========================================================================
// MODULE: RCA RESOLVER & AUTO-BOM / SLA / LOAD BALANCING AUTOMATION
// Tác giả: AI Operations Leader - Rich Fish Aquarium
// =========================================================================



/**
 * 2. SLA AUTOMATION (processSlaAutomation)
 * Tự động chuyển Orders.status sang 'Sẵn sàng đóng gói' khi KCS Passed và đủ phụ kiện
 */
function processSlaAutomation(orderId) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { success: false, message: 'Hệ thống bận.' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Products');
    if (!oSheet || !prodSheet) return { success: false, message: 'Không tìm thấy sheet Orders hoặc Products!' };

    var oData = oSheet.getDataRange().getValues();
    var oHead = oData[0];
    var idCol = oHead.indexOf('id');
    var stCol = oHead.indexOf('status');
    var accCol = oHead.indexOf('accessories');

    var targetOrderRow = -1;
    var targetOrder = null;
    for (var i = 1; i < oData.length; i++) {
      if (String(oData[i][idCol]) === String(orderId)) {
        targetOrderRow = i + 1;
        targetOrder = {
          id: oData[i][idCol],
          status: oData[i][stCol],
          accessories: oData[i][accCol]
        };
        break;
      }
    }

    if (!targetOrder) return { success: false, message: 'Không tìm thấy orderId: ' + orderId };

    // Giải mã phụ kiện an toàn
    var accList = [];
    try {
      if (typeof targetOrder.accessories === 'string' && targetOrder.accessories.trim() !== '') {
        accList = JSON.parse(targetOrder.accessories);
      }
    } catch (e) {
      accList = [];
    }

    // Đọc tồn kho các phụ kiện từ Products
    var prData = prodSheet.getDataRange().getValues();
    var prHead = prData[0];
    var prNameCol = prHead.indexOf('name');
    var prQtyCol = prHead.indexOf('quantity');

    var isAllAccAvailable = true;
    if (Array.isArray(accList) && accList.length > 0) {
      accList.forEach(function (acc) {
        if (!acc) return;
        if (acc.hasProduction === true || acc.hasProduction === 'true') return;

        var accName = typeof acc === 'string' ? acc : (acc.name || acc.Name || '');
        var accQty = typeof acc === 'object' ? (Number(acc.quantity || acc.qty) || 1) : 1;

        var foundStock = 0;
        var foundCat = '';
        var foundProd = false;
        var cleanAccName = String(accName).trim().toLowerCase().replace(/\s+/g, ' ');
        for (var p = 1; p < prData.length; p++) {
          var cleanPrName = String(prData[p][prNameCol]).trim().toLowerCase().replace(/\s+/g, ' ');
          if (cleanPrName === cleanAccName) {
            foundProd = true;
            foundStock = Number(prData[p][prQtyCol]) || 0;
            var catCol = prHead.indexOf('category');
            var subCatCol = prHead.indexOf('sub_category');
            if (catCol !== -1) foundCat = String(prData[p][catCol]).toUpperCase().trim();
            if (subCatCol !== -1 && (!foundCat || foundCat === 'LAYOUT' || foundCat === 'BỂ KÍNH')) {
              var sCat = String(prData[p][subCatCol]).toUpperCase().trim();
              if (sCat === 'LAYOUT' || sCat === 'BỂ KÍNH') foundCat = sCat;
            }
            break;
          }
        }
        if (foundCat === 'LAYOUT' || foundCat === 'BỂ KÍNH') return;

        if (foundProd && foundStock < accQty) {
          isAllAccAvailable = false;
        }
      });
    }

    if (isAllAccAvailable) {
      oSheet.getRange(targetOrderRow, stCol + 1).setValue('Sẵn sàng đóng gói');
      return { success: true, message: 'Đã tự động chuyển đơn ' + orderId + ' sang Sẵn sàng đóng gói' };
    } else {
      oSheet.getRange(targetOrderRow, stCol + 1).setValue('Chờ Phụ Kiện');
      return { success: true, message: 'Đơn ' + orderId + ' đang Chờ Phụ Kiện' };
    }
  } catch (err) {
    Logger.log('Lỗi processSlaAutomation: ' + err.toString());
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 3. DYNAMIC LOAD BALANCING (processDynamicLoadBalancing)
 * Quét Attendance để tự phân bổ nhân sự active tại xưởng cho p2_user khi Khâu 1 Done
 */
function processDynamicLoadBalancing(prodId) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { success: false, message: 'Hệ thống bận.' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var pSheet = ss.getSheetByName('Production');
    var attSheet = ss.getSheetByName('Attendance');
    if (!pSheet || !attSheet) return { success: false, message: 'Không tìm thấy sheet Production hoặc Attendance!' };

    var pData = pSheet.getDataRange().getValues();
    var pHead = pData[0];
    var idCol = pHead.indexOf('id');
    var p1StCol = pHead.indexOf('p1_status');
    var p2StCol = pHead.indexOf('p2_status');
    var p2UserCol = pHead.indexOf('p2_user');

    var pRowIdx = -1;
    for (var i = 1; i < pData.length; i++) {
      if (String(pData[i][idCol]) === String(prodId)) {
        pRowIdx = i + 1;
        break;
      }
    }
    if (pRowIdx === -1) return { success: false, message: 'Không tìm thấy prodId: ' + prodId };

    // Đọc danh sách nhân sự đang có mặt tại xưởng hôm nay
    var attData = attSheet.getDataRange().getValues();
    var attHead = attData[0];
    var userCol = attHead.indexOf('user');
    var dateCol = attHead.indexOf('date');
    var timeInCol = attHead.indexOf('timeIn');
    var timeOutCol = attHead.indexOf('timeOut');
    var stCol = attHead.indexOf('status');

    var todayStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
    var activeWorkers = [];

    for (var a = 1; a < attData.length; a++) {
      var rDate = attData[a][dateCol];
      var rDateStr = typeof rDate === 'object' ? Utilities.formatDate(rDate, 'GMT+7', 'yyyy-MM-dd') : String(rDate).slice(0, 10);

      if (rDateStr === todayStr) {
        var tIn = attData[a][timeInCol];
        var tOut = attData[a][timeOutCol];
        var aSt = String(attData[a][stCol] || '').toUpperCase();

        if (tIn && (!tOut || String(tOut).trim() === '') && aSt !== 'NGHỈ') {
          activeWorkers.push(String(attData[a][userCol]).trim());
        }
      }
    }

    if (activeWorkers.length === 0) {
      return { success: false, message: 'Không có thợ nào đang điểm danh Active tại xưởng.' };
    }

    // Phân bổ nhân sự đầu tiên trong danh sách Active
    var assignedUser = activeWorkers[0];
    pSheet.getRange(pRowIdx, p2UserCol + 1).setValue(assignedUser);

    return { success: true, message: 'Đã phân bổ động thợ ' + assignedUser + ' vào Khâu 2 cho lệnh ' + prodId };
  } catch (err) {
    Logger.log('Lỗi processDynamicLoadBalancing: ' + err.toString());
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * TỔNG HỢP RCA RESOLVER RUNNER (processRcaResolver)
 * Tự động chạy cả 3 luồng tối ưu hóa cho lệnh sản xuất
 */
function processRcaResolver(payload) {
  var results = {
    autoBom: null,
    slaAuto: null,
    loadBalancing: null
  };

  try {
    if (payload && payload.prodId) {
      results.autoBom = processMaterialDeduction(payload.prodId, payload.materialUsageData);
      results.loadBalancing = processDynamicLoadBalancing(payload.prodId);
    }
    if (payload && payload.orderId) {
      results.slaAuto = processSlaAutomation(payload.orderId);
    }
    return { success: true, results: results, message: 'Đã hoàn thành chạy RCA Resolver thành công!' };
  } catch (err) {
    Logger.log('Lỗi processRcaResolver: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * THÊM KPI THỦ CÔNG VÀO BẢNG KPI_Progress
 * Schema: id, user, kpiName, current, target, unit, lastUpdated, startTime, endTime, reward, isClaimed, penalty, guide
 */
function api_insertManualKPI(payload) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) {
      return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau vài giây!' };
    }

    if (!payload || !payload.user || !payload.kpiName) {
      return { success: false, message: 'Thiếu thông tin bắt buộc (Nhân sự hoặc Tên KPI)!' };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!kpiSheet) {
      return { success: false, message: 'Không tìm thấy bảng KPI_Progress trong CSDL!' };
    }

    var now = new Date();
    var kpiId = 'KPI_' + Date.now();
    var user = String(payload.user).trim();
    var kpiName = String(payload.kpiName).trim();
    var current = 0;
    var target = Number(payload.target) || 0;
    var unit = String(payload.unit || '%').trim();
    var lastUpdated = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    // Ngày đầu tháng & cuối tháng hiện tại (GMT+7)
    var year = now.getFullYear();
    var month = now.getMonth();
    var startDateObj = new Date(year, month, 1, 0, 0, 0);
    var endDateObj = new Date(year, month + 1, 0, 23, 59, 59);

    var startTime = Utilities.formatDate(startDateObj, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
    var endTime = Utilities.formatDate(endDateObj, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    var reward = Number(payload.reward) || 0;
    var isClaimed = false;
    var penalty = Number(payload.penalty) || 0;
    var guide = String(payload.guide || '').trim();

    // Map theo đúng cột trong Schema KPI_Progress:
    // ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide']
    var rowData = [
      kpiId,
      user,
      kpiName,
      current,
      target,
      unit,
      lastUpdated,
      startTime,
      endTime,
      reward,
      isClaimed,
      penalty,
      guide
    ];

    kpiSheet.appendRow(rowData);

    return {
      success: true,
      message: 'Đã tạo KPI thành công cho ' + user + '!',
      id: kpiId,
      rowData: rowData
    };

  } catch (err) {
    Logger.log('Lỗi api_insertManualKPI: ' + err.toString());
    return { success: false, message: 'Lỗi Server: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🚀 ENGINE TỰ ĐỘNG HÓA REALTIME & BATCH UPDATE (ON-EDIT TRIGGER)
// Schema match 100%: Orders, Production, Products, ImportExport, BOM_Config
// =========================================================================

/**
 * Trigger tự động kích hoạt khi có thao tác sửa trực tiếp (onEdit) trên Google Sheets
 */
function onEdit(e) {
  if (!e || !e.range) return;
  try {
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    var row = e.range.getRow();
    var col = e.range.getColumn();
    if (row < 2) return; // Bỏ qua dòng tiêu đề

    // 1. Thao tác trên bảng Production
    if (sheetName === 'Production') {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var p1StatusCol = headers.indexOf('p1_status') + 1;
      var statusCol = headers.indexOf('status') + 1;
      var idCol = headers.indexOf('id') + 1;
      var orderIdCol = headers.indexOf('orderId') + 1;

      var newVal = String(e.value || '').trim().toUpperCase();

      // Nghiệp vụ A: Trừ Kho BOM khi p1_status = 'Done' hoặc status = 'Done'
      if ((col === p1StatusCol || col === statusCol) && (newVal === 'DONE' || newVal === 'ĐÃ XONG')) {
        var prodId = sheet.getRange(row, idCol).getValue();
        if (prodId) {
          processMaterialDeduction(prodId, null);
        }
      }

      // Nghiệp vụ B: Kiểm tra Auto-Forward SLA khi status hoặc p1_status chuyển thành Done
      if ((col === statusCol || col === p1StatusCol) && newVal === 'DONE') {
        var orderId = sheet.getRange(row, orderIdCol).getValue();
        if (orderId) {
          processBatchAutoForwardSLA(orderId);
        }
      }
    }

    // 2. Thao tác trên bảng Orders
    if (sheetName === 'Orders') {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var statusCol = headers.indexOf('status') + 1;
      var idCol = headers.indexOf('id') + 1;

      var newVal = String(e.value || '').trim().toUpperCase();

      // Nghiệp vụ C: Xử lý Đơn Hủy khi status = 'Đơn Huỷ' hoặc 'Đã Huỷ'
      if (col === statusCol && (newVal === 'ĐƠN HUỶ' || newVal === 'ĐÃ HỦY' || newVal === 'ĐƠN HỦY' || newVal === 'CANCELLED')) {
        var orderId = sheet.getRange(row, idCol).getValue();
        if (orderId) {
          processCascadeCancelOrder(orderId, false);
        }
      }
    }
  } catch (err) {
    console.error("Lỗi Realtime onEdit Trigger:", err);
  }
}



/**
 * Nâng cấp Batch-Update: Cập nhật SLA Đơn Hàng tự động
 */
function processBatchAutoForwardSLA(orderId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return;
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var prodSheet = ss.getSheetByName('Production');
    if (!prodSheet) return;
    var prodData = prodSheet.getDataRange().getValues();
    var pHeaders = prodData[0];
    var pOrderIdIdx = pHeaders.indexOf('orderId');
    var pStatusIdx = pHeaders.indexOf('status');
    var pStockIdx = pHeaders.indexOf('fulfilledFromStock');

    var childProds = [];
    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][pOrderIdIdx]).trim() === String(orderId).trim()) {
        var rawStatus = String(prodData[i][pStatusIdx] || '').trim();
        var statusUpper = rawStatus.toUpperCase();
        if (statusUpper === 'HỦY/VỠ' || statusUpper === 'HỦY / VỠ' || statusUpper === 'HUỶ/VỠ' || statusUpper === 'HUỶ / VỠ' ||
            statusUpper === 'ĐÃ HUỶ' || statusUpper === 'ĐÃ HỦY' || statusUpper === 'HỦY' || statusUpper === 'HUỶ' ||
            statusUpper.indexOf('HỦY') > -1 || statusUpper.indexOf('HUỶ') > -1) {
          continue;
        }
        var isStock = prodData[i][pStockIdx] === true || String(prodData[i][pStockIdx]).toUpperCase() === 'TRUE';
        childProds.push({
          status: statusUpper,
          fulfilledFromStock: isStock
        });
      }
    }
    if (childProds.length === 0) return;

    var isAllReady = childProds.every(function (p) {
      return p.status === 'DONE' || p.status === 'ĐÃ XONG' || p.status === 'HOÀN KHO ĐẠT' || p.fulfilledFromStock === true;
    });

    if (isAllReady) {
      var ordSheet = ss.getSheetByName('Orders');
      if (!ordSheet) return;
      var ordRange = ordSheet.getDataRange();
      var ordData = ordRange.getValues();
      var oHeaders = ordData[0];
      var oIdIdx = oHeaders.indexOf('id');
      var oStatusIdx = oHeaders.indexOf('status');

      var isOrderChanged = false;
      for (var o = 1; o < ordData.length; o++) {
        if (String(ordData[o][oIdIdx]).trim() === String(orderId).trim()) {
          var curSt = String(ordData[o][oStatusIdx] || '').trim();
          if (['Chờ Sản Xuất', 'Đang Sản Xuất', 'Quét Tự Động'].indexOf(curSt) > -1) {
            ordData[o][oStatusIdx] = 'Sẵn sàng đóng gói';
            isOrderChanged = true;
          }
          break;
        }
      }
      if (isOrderChanged) {
        ordRange.setValues(ordData);
      }
    }
  } catch (e) {
    console.error("Lỗi processBatchAutoForwardSLA:", e);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Nâng cấp Batch-Update: Xử lý Đơn Hủy (Cascade Cancel) mượt mà không deadlock
 * Khi Đơn hàng bị HỦY (Orders.status = 'Đơn Huỷ'):
 * - Nếu p1_status = 'Pending' (chưa dán/làm): Hủy lệnh sản xuất (status = 'Đã Huỷ')
 * - Nếu p1_status = 'Done' (đã hoàn thành): Ngắt orderId, chuyển lệnh thành 'SẢN XUẤT TỒN' để làm tài sản kho
 */
function processCascadeCancelOrder(orderId, isHandedOver) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Production');

    if (!ordSheet || !prodSheet) return { success: false, message: 'Thiếu bảng CSDL Orders/Production' };

    // 1. Cập nhật bảng Orders sang trạng thái 'Đơn Huỷ'
    var ordRange = ordSheet.getDataRange();
    var ordData = ordRange.getValues();
    var oHeaders = ordData[0];
    var oIdIdx = oHeaders.indexOf('id');
    var oStatusIdx = oHeaders.indexOf('status');

    var isOrdChanged = false;
    for (var o = 1; o < ordData.length; o++) {
      if (String(ordData[o][oIdIdx]).trim() === String(orderId).trim()) {
        ordData[o][oStatusIdx] = 'Đơn Huỷ';
        isOrdChanged = true;
        break;
      }
    }
    if (isOrdChanged) ordRange.setValues(ordData);

    // 2. Quét và bẻ gãy liên kết / xử lý lệnh con trong Production
    var prodRange = prodSheet.getDataRange();
    var prodData = prodRange.getValues();
    var pHeaders = prodData[0];
    var orderIdIdx = pHeaders.indexOf('orderId');
    var statusIdx = pHeaders.indexOf('status');
    var p1StatusIdx = pHeaders.indexOf('p1_status');
    var noteIdx = pHeaders.indexOf('note');

    var isProdChanged = false;
    var canceledCount = 0;
    var stockConvertedCount = 0;

    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][orderIdIdx]).trim() === String(orderId).trim()) {
        var p1Status = String(prodData[i][p1StatusIdx] || '').trim().toUpperCase();
        var curNote = String(prodData[i][noteIdx] || '');

        if (p1Status === 'DONE' || p1Status === 'ĐÃ XONG' || p1Status === 'HOÀN KHO ĐẠT') {
          // Thợ đã dán xong -> Ngắt liên kết orderId, đổi thành tài sản tồn kho xưởng
          prodData[i][orderIdIdx] = 'SẢN XUẤT TỒN';
          prodData[i][noteIdx] = curNote + ' [Ngắt liên kết do đơn gốc ' + orderId + ' bị HỦY - Chuyển thành sản xuất bù tồn kho]';
          stockConvertedCount++;
        } else {
          // Chưa dán xong -> Hủy lệnh để thợ không làm nữa
          prodData[i][statusIdx] = 'Đã Huỷ';
          prodData[i][noteIdx] = curNote + ' [Hủy tự động theo đơn gốc ' + orderId + ']';
          canceledCount++;
        }
        isProdChanged = true;
      }
    }

    if (isProdChanged) {
      prodRange.setValues(prodData);
    }

    return {
      success: true,
      message: 'Đã hủy ' + canceledCount + ' lệnh chưa làm và chuyển ' + stockConvertedCount + ' lệnh hoàn thành thành tài sản bù kho!',
      canceledCount: canceledCount,
      stockConvertedCount: stockConvertedCount
    };

  } catch (e) {
    console.error("Lỗi processCascadeCancelOrder:", e);
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}



/**
 * Cấn trừ Vật tư Tự động (BOM Deduction)
 * Trừ số lượng vật tư trong bảng Products theo BOM_Config khi p1_status = 'Done' hoặc status = 'Done'
 * Ghi log xuất kho vào bảng ImportExport
 */
function processMaterialDeduction(prodId, materialUsageData) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, thử lại sau!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodSheet = ss.getSheetByName('Production');
    var bomSheet = ss.getSheetByName('BOM_Config');
    var productSheet = ss.getSheetByName('Products');
    var ieSheet = ss.getSheetByName('ImportExport');

    if (!prodSheet || !productSheet || !bomSheet || !ieSheet) {
      return { success: false, message: 'Thiếu bảng dữ liệu!' };
    }

    var prodData = prodSheet.getDataRange().getValues();
    var prodHeaders = prodData[0];
    var pIdIdx = prodHeaders.indexOf('id');
    var pNameIdx = prodHeaders.indexOf('name');
    var pOrderIdIdx = prodHeaders.indexOf('orderId');

    var targetProd = null;
    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][pIdIdx]).trim() === String(prodId).trim()) {
        targetProd = {
          id: prodData[i][pIdIdx],
          name: prodData[i][pNameIdx],
          orderId: prodData[i][pOrderIdIdx]
        };
        break;
      }
    }

    if (!targetProd) {
      return { success: false, message: 'Không tìm thấy lệnh sản xuất: ' + prodId };
    }

    var layoutName = String(targetProd.name || '').trim();
    var layoutNameLower = layoutName.toLowerCase();

    // Tìm SKU của sản phẩm tương ứng trong Products nếu có
    var pRange = productSheet.getDataRange();
    var pData = pRange.getValues();
    var prHeaders = pData[0];
    var prSkuIdx = prHeaders.indexOf('sku');
    var prNameIdx = prHeaders.indexOf('name');
    var prQtyIdx = prHeaders.indexOf('quantity');
    var prCostIdx = prHeaders.indexOf('costPrice');
    var prUnitIdx = prHeaders.indexOf('unit');

    var targetSku = '';
    for (var p = 1; p < pData.length; p++) {
      var pN = String(pData[p][prNameIdx] || '').trim().toLowerCase();
      var pS = String(pData[p][prSkuIdx] || '').trim().toLowerCase();
      if (pN === layoutNameLower || pS === layoutNameLower || (pS && layoutNameLower.indexOf(pS) !== -1)) {
        targetSku = String(pData[p][prSkuIdx] || '').trim();
        break;
      }
    }

    // 1. Quét BOM_Config
    var bomData = bomSheet.getDataRange().getValues();
    var bHeaders = bomData[0];
    var bLayoutIdx = bHeaders.indexOf('layoutCode');
    var bSkuIdx = bHeaders.indexOf('materialSku');
    var bQtyIdx = bHeaders.indexOf('defaultQty');
    var bUnitIdx = bHeaders.indexOf('unit');

    var bomMap = {};
    for (var b = 1; b < bomData.length; b++) {
      var layoutCode = String(bomData[b][bLayoutIdx] || '').trim();
      var layoutCodeLower = layoutCode.toLowerCase();

      // Khớp theo SKU, Tên hoặc Mã Ver
      var isMatch = layoutCode && (
        layoutCodeLower === layoutNameLower ||
        (targetSku && layoutCodeLower === targetSku.toLowerCase()) ||
        (layoutNameLower.indexOf(layoutCodeLower) !== -1)
      );

      if (isMatch) {
        var sku = String(bomData[b][bSkuIdx] || '').trim();
        var q = Number(bomData[b][bQtyIdx]) || 0;
        var u = String(bomData[b][bUnitIdx] || '').trim();
        if (sku && q > 0) {
          if (!bomMap[sku]) bomMap[sku] = { qty: 0, unit: u };
          bomMap[sku].qty += q;
        }
      }
    }

    if (Object.keys(bomMap).length === 0) {
      // Tự động kiểm tra nếu là Bể Kính / Terrarium (có kích thước DxRxC) thì tính BOM & tạo BOM tức thì
      var glassSpecs = calculateGlassTankSpecs(layoutName);
      if (glassSpecs) {
        ensureGlassTankBOM(layoutName, glassSpecs.thickness);
        bomMap[glassSpecs.bottomMat] = { qty: glassSpecs.bottomArea, unit: 'm2' };
        bomMap[glassSpecs.sideMat] = { qty: glassSpecs.sideArea, unit: 'm2' };
        bomMap['SILICON'] = { qty: glassSpecs.siliconLength, unit: 'met' };
      } else {
        return { success: false, message: 'Không tìm thấy BOM cho Layout: ' + layoutName };
      }
    }

    // 2. Trừ tồn kho trong Products
    var itemsDeducted = [];
    var totalCost = 0;
    var isProductChanged = false;

    for (var p = 1; p < pData.length; p++) {
      var pSku = String(pData[p][prSkuIdx] || '').trim();
      var pName = String(pData[p][prNameIdx] || '').trim();

      // Khớp theo SKU hoặc Tên (nếu được map)
      var deductQty = 0;
      var bomUnit = '';
      var matchedSkuKey = pSku;
      if (bomMap[pSku]) {
        deductQty = bomMap[pSku].qty;
        bomUnit = bomMap[pSku].unit;
      } else if (bomMap[pName]) {
        deductQty = bomMap[pName].qty;
        bomUnit = bomMap[pName].unit;
        matchedSkuKey = pName;
      }

      if (deductQty > 0) {
        var curQty = Number(pData[p][prQtyIdx]);
        if (isNaN(curQty)) curQty = 0; // Trừ kho với ô rỗng được coi là 0
        var cost = Number(pData[p][prCostIdx]) || 0;
        var matUnit = String(pData[p][prUnitIdx] || '').toLowerCase().trim();
        bomUnit = bomUnit ? bomUnit.toLowerCase().trim() : matUnit;

        var matNameLower = String(pData[p][prNameIdx] || '').toLowerCase();
        var isMatKg = matUnit === 'kg' || matUnit === 'cân' || matUnit === 'kí' || matUnit === 'kilogram' ||
          matNameLower.indexOf('(kg)') !== -1 || matNameLower.indexOf(' kg') !== -1 || matNameLower.indexOf('/kg') !== -1;
        var isBomGram = bomUnit === 'gam' || bomUnit === 'g' || bomUnit === 'gram' || bomUnit === 'gr';

        var isMatLit = matUnit === 'lít' || matUnit === 'lit' || matUnit === 'l' || matNameLower.indexOf('(l)') !== -1 || matNameLower.indexOf('(lít)') !== -1;
        var isBomMl = bomUnit === 'ml' || bomUnit === 'mililit' || bomUnit === 'cc';

        var isMatMet = matUnit === 'm' || matUnit === 'mét' || matUnit === 'met' || matNameLower.indexOf('(m)') !== -1 || matNameLower.indexOf('(mét)') !== -1;
        var isBomCm = bomUnit === 'cm' || bomUnit === 'centimet';
        var isBomMm = bomUnit === 'mm' || bomUnit === 'milimet';

        var isKeo502 = pSku.toLowerCase().indexOf('502') !== -1 || matNameLower.indexOf('502') !== -1 || matNameLower.indexOf('keo') !== -1;
        var isMatChai162 = matUnit.indexOf('162') !== -1 || matUnit === 'chai' || matNameLower.indexOf('162') !== -1 || matNameLower.indexOf('chai') !== -1;

        if (isKeo502 && isMatChai162 && isBomGram) {
          convertedDeductQty = deductQty / 162;
          convertedCost = cost / 162;
        } else if (isMatKg && isBomGram) {
          convertedDeductQty = deductQty / 1000;
          convertedCost = cost / 1000;
        } else if (isMatLit && isBomMl) {
          convertedDeductQty = deductQty / 1000;
          convertedCost = cost / 1000;
        } else if (isMatMet && isBomCm) {
          convertedDeductQty = deductQty / 100;
          convertedCost = cost / 100;
        } else if (isMatMet && isBomMm) {
          convertedDeductQty = deductQty / 1000;
          convertedCost = cost / 1000;
        }

        var newQty = Math.max(0, curQty - convertedDeductQty);

        pData[p][prQtyIdx] = newQty;
        isProductChanged = true;

        var lineTotal = deductQty * convertedCost;
        totalCost += lineTotal;
        itemsDeducted.push({
          sku: pSku,
          name: pName || pSku,
          quantity: deductQty + ' ' + (bomUnit || ''),
          costPrice: cost,
          amount: lineTotal
        });

        // Trừ xong thì xóa để biết là đã xử lý
        delete bomMap[matchedSkuKey];
      }
    }

    if (isProductChanged) {
      pRange.setValues(pData);
    }

    // 3. Ghi Log vào ImportExport
    if (itemsDeducted.length > 0) {
      var safeDate = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
      var logId = 'IE_BOM_' + Date.now();
      var note = 'Trừ vật tư BOM đơn ' + (targetProd.orderId || 'Không xác định');

      // 'id', 'type', 'target', 'totalAmount', 'date', 'note', 'itemsData'
      ieSheet.appendRow([
        logId,
        'Xuất',
        'Sản Xuất Layout',
        totalCost,
        safeDate,
        note,
        JSON.stringify(itemsDeducted)
      ]);
    }

    return {
      success: true,
      message: 'Đã cấn trừ vật tư BOM tự động cho lệnh sản xuất ' + layoutName,
      deducted: itemsDeducted
    };

  } catch (err) {
    console.error("Lỗi processMaterialDeduction:", err);
    return { success: false, message: 'Lỗi: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Auto-Allocation (Bơm Đơn & Định Tuyến Tự Động)
 * Khi có đơn hàng mới hoặc chạy tự động:
 * Quét Products.quantity. Nếu quantity >= 1:
 * Đặt fulfilledFromStock = true ở Production và chuyển Orders.status = 'Sẵn sàng đóng gói'
 */
function processAutoAllocation(orderId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Script locked' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Production');
    var pSheet = ss.getSheetByName('Products');

    if (!ordSheet || !prodSheet || !pSheet) return { success: false, message: 'Thiếu bảng CSDL!' };

    var pData = pSheet.getDataRange().getValues();
    var pHeaders = pData[0];
    var pNameIdx = pHeaders.indexOf('name');
    var pSkuIdx = pHeaders.indexOf('sku');
    var pQtyIdx = pHeaders.indexOf('quantity');
    var pCostIdx = pHeaders.indexOf('costPrice');

    var stockMap = {};
    for (var p = 1; p < pData.length; p++) {
      var nameKey = String(pData[p][pNameIdx] || '').trim().toLowerCase();
      var skuKey = String(pData[p][pSkuIdx] || '').trim().toLowerCase();
      var qty = Number(pData[p][pQtyIdx] || 0);
      var cost = Number(pData[p][pCostIdx] || 0);

      var stockObj = { qty: qty, rowIndex: p, sku: String(pData[p][pSkuIdx] || ''), name: String(pData[p][pNameIdx] || ''), cost: cost };
      if (nameKey) stockMap[nameKey] = stockObj;
      if (skuKey) stockMap[skuKey] = stockObj;
    }

    var prodRange = prodSheet.getDataRange();
    var prodData = prodRange.getValues();
    var prHeaders = prodData[0];
    var prOrderIdIdx = prHeaders.indexOf('orderId');
    var prNameIdx = prHeaders.indexOf('name');
    var prStockIdx = prHeaders.indexOf('fulfilledFromStock');
    var prStatusIdx = prHeaders.indexOf('status');
    var prP1StatusIdx = prHeaders.indexOf('p1_status');

    var isProdChanged = false;
    var isProductChanged = false;
    var allocatedCount = 0;
    var itemsDeducted = [];
    var totalCost = 0;

    for (var i = 1; i < prodData.length; i++) {
      var rowOrdId = String(prodData[i][prOrderIdIdx] || '').trim();
      if (!orderId || rowOrdId === String(orderId).trim()) {
        var itemProdName = String(prodData[i][prNameIdx] || '').trim().toLowerCase();
        var isStockFulfilled = prodData[i][prStockIdx] === true || String(prodData[i][prStockIdx]).toUpperCase() === 'TRUE';

        var stockObj = stockMap[itemProdName];
        if (!isStockFulfilled && stockObj && stockObj.qty >= 1) {
          prodData[i][prStockIdx] = true;
          prodData[i][prStatusIdx] = 'Done';
          prodData[i][prP1StatusIdx] = 'HOÀN KHO ĐẠT';
          isProdChanged = true;
          allocatedCount++;

          // Trừ trực tiếp số lượng để các đơn sau không lấy được nữa
          stockObj.qty -= 1;
          pData[stockObj.rowIndex][pQtyIdx] = stockObj.qty;
          isProductChanged = true;

          totalCost += stockObj.cost;
          itemsDeducted.push({
            sku: stockObj.sku,
            name: stockObj.name,
            quantity: 1,
            costPrice: stockObj.cost,
            amount: stockObj.cost
          });
        }
      }
    }

    if (isProdChanged) {
      prodRange.setValues(prodData);
    }

    if (isProductChanged) {
      pSheet.getDataRange().setValues(pData);

      var ieSheet = ss.getSheetByName('ImportExport');
      if (ieSheet && itemsDeducted.length > 0) {
        var safeDate = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
        var logId = 'IE_ALLOC_' + Date.now();
        var logNote = 'Xuất kho thành phẩm bù đơn ' + (orderId || 'hàng loạt');
        ieSheet.appendRow([
          logId,
          'Xuất',
          'Xuất Đơn Hàng',
          totalCost,
          safeDate,
          logNote,
          JSON.stringify(itemsDeducted)
        ]);
      }
    }

    if (orderId) {
      processBatchAutoForwardSLA(orderId);
    }

    return { success: true, message: 'Đã tự động bơm đơn và xuất kho cho ' + allocatedCount + ' sản phẩm!' };

  } catch (err) {
    console.error("Lỗi processAutoAllocation:", err);
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * TỰ ĐỘNG CHUẨN HÓA BOM KÍNH ĐÁY + KÍNH MVT VÀ GIÁ VỐN CHUẨN
 * Tác giả: AI Operations Leader - Rich Fish Aquarium
 */
// =========================================================================
// THUẬT TOÁN ĐỊNH MỨC & COGS BỂ KÍNH ĐÁY + KÍNH THÀNH MVT + KEO SILICON
// =========================================================================

/**
 * 1. Thuật toán tính toán định mức bóc tách diện tích Kính Đáy, Kính MVT và Keo Silicon
 * @param {string} nameOrDimensions Tên sản phẩm hoặc chuỗi kích thước (vd: "40x30x30", "Bể 50x30x30 5li", "TERA_35_20_20")
 * @param {string|number} customThickness Độ dày kính (tùy chọn: 3, 4, 5, 8 li)
 * @returns {object|null}
 */
function calculateGlassTankSpecs(nameOrDimensions, customThickness) {
  if (!nameOrDimensions) return null;
  var str = String(nameOrDimensions).toLowerCase();

  // Bóc tách kích thước Dài x Rộng x Cao
  var match = str.match(/(\d+(?:\.\d+)?)\s*(?:x|\*|_|\s)\s*(\d+(?:\.\d+)?)\s*(?:x|\*|_|\s)\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;

  var L = parseFloat(match[1]); // cm
  var W = parseFloat(match[2]);
  var H = parseFloat(match[3]);

  if (L <= 0 || W <= 0 || H <= 0) return null;

  // Bóc tách độ dày kính (mặc định 4li nếu không chỉ định)
  var thickness = 4;
  if (customThickness) {
    thickness = parseInt(String(customThickness).replace(/\D/g, '')) || 4;
  } else if (str.indexOf('8li') !== -1 || str.indexOf('8 li') !== -1 || str.indexOf('8mm') !== -1) {
    thickness = 8;
  } else if (str.indexOf('5li') !== -1 || str.indexOf('5 li') !== -1 || str.indexOf('5mm') !== -1) {
    thickness = 5;
  } else if (str.indexOf('3li') !== -1 || str.indexOf('3 li') !== -1 || str.indexOf('3mm') !== -1) {
    thickness = 3;
  }

  // Đơn giá vật tư theo độ dày
  var priceBottom = 165000;
  var priceSide = 180000;
  if (thickness === 3) {
    priceBottom = 135000; priceSide = 150000;
  } else if (thickness === 5) {
    priceBottom = 250000; priceSide = 280000;
  } else if (thickness === 8) {
    priceBottom = 400000; priceSide = 450000;
  }

  var PRICE_GRINDING_PER_M = 25000; // Phí mài 25k/m dài miệng bể
  var PRICE_SILICON_PER_M = 5000;   // Keo 5k/m
  var LABOR_COST = 15000;           // Công khoán mài/dán

  var l_m = L / 100;
  var w_m = W / 100;
  var h_m = H / 100;

  // Định mức tiêu hao (+10% hao hụt theo chuẩn Lean)
  var bottomArea = Number(((l_m * w_m) * 1.1).toFixed(4));
  var sideArea = Number(((2 * (l_m * h_m) + 2 * (w_m * h_m)) * 1.1).toFixed(4));
  var totalGlassArea = Number((bottomArea + sideArea).toFixed(4));
  var grindingLength = Number((2 * (l_m + w_m)).toFixed(3));
  var siliconLength = Number(((2 * l_m) + (2 * w_m) + (4 * h_m)).toFixed(2));

  var bottomCost = bottomArea * priceBottom;
  var sideCost = sideArea * priceSide;
  var grindingCost = grindingLength * PRICE_GRINDING_PER_M;
  var siliconCost = siliconLength * PRICE_SILICON_PER_M;

  var totalCOGS = Math.round(bottomCost + sideCost + grindingCost + siliconCost + LABOR_COST);

  var bottomMat = "KINH" + thickness + "LI_DAY";
  var sideMat = "KINH" + thickness + "LI_MVT";

  return {
    L: L, W: W, H: H,
    dimensionsStr: L + 'x' + W + 'x' + H,
    thickness: thickness,
    bottomArea: bottomArea,
    sideArea: sideArea,
    totalGlassArea: totalGlassArea,
    grindingLength: grindingLength,
    siliconLength: siliconLength,
    bottomMat: bottomMat,
    sideMat: sideMat,
    bottomCost: bottomCost,
    sideCost: sideCost,
    grindingCost: grindingCost,
    siliconCost: siliconCost,
    laborCost: LABOR_COST,
    totalCOGS: totalCOGS
  };
}

/**
 * 2. Tự động kiểm tra & ghi định mức BOM_Config cho bất kỳ bể kính nào (kể cả bể lẻ size mới)
 */
function ensureGlassTankBOM(tankNameOrSku, customThickness) {
  if (!tankNameOrSku) return null;
  var specs = calculateGlassTankSpecs(tankNameOrSku, customThickness);
  if (!specs) return null;

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bomSheet = ss.getSheetByName("BOM_Config");
    if (!bomSheet) return specs;

    var layoutKey = String(tankNameOrSku).trim();
    var bomData = bomSheet.getDataRange().getValues();
    var bomHeaders = bomData[0];
    var idIdx = bomHeaders.indexOf("id");
    var layoutIdx = bomHeaders.indexOf("layoutCode");
    var matIdx = bomHeaders.indexOf("materialSku");
    var qtyIdx = bomHeaders.indexOf("defaultQty");
    var unitIdx = bomHeaders.indexOf("unit");

    var existingRows = {};
    for (var i = 1; i < bomData.length; i++) {
      var lCode = String(bomData[i][layoutIdx] || "").trim();
      var bId = String(bomData[i][idIdx] || "").trim();
      if (lCode.toLowerCase() === layoutKey.toLowerCase() || bId.toLowerCase() === ("BOM_" + layoutKey).toLowerCase()) {
        var mSku = String(bomData[i][matIdx] || "").trim();
        existingRows[mSku] = i + 1;
      }
    }

    var items = [
      { id: "BOM_" + layoutKey + "_BOTTOM", mat: specs.bottomMat, qty: specs.bottomArea, unit: "m2" },
      { id: "BOM_" + layoutKey + "_SIDE", mat: specs.sideMat, qty: specs.sideArea, unit: "m2" },
      { id: "BOM_" + layoutKey + "_SILICON", mat: "SILICON", qty: specs.siliconLength, unit: "met" }
    ];

    items.forEach(function(item) {
      if (existingRows[item.mat]) {
        var row = existingRows[item.mat];
        bomSheet.getRange(row, qtyIdx + 1).setValue(item.qty);
        if (unitIdx >= 0) bomSheet.getRange(row, unitIdx + 1).setValue(item.unit);
      } else {
        bomSheet.appendRow([item.id, layoutKey, item.mat, item.qty, item.unit]);
      }
    });

    return specs;
  } catch (e) {
    Logger.log("Lỗi ensureGlassTankBOM: " + e.toString());
    return specs;
  } finally {
    lock.releaseLock();
  }
}

/**
 * 3. Tự động quét toàn diện Products, Production và Orders để chuẩn hóa BOM & COGS bể kính
 */
function autoCalculateGlassTankBOM_Dual() {
  const lock = LockService.getScriptLock();

  try {
    // 1. Kỷ luật An Toàn: Khóa tiến trình 15s để chống đè dữ liệu (Concurrency)
    lock.waitLock(15000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const prodSheet = ss.getSheetByName("Products");
    const bomSheet = ss.getSheetByName("BOM_Config");
    const ordSheet = ss.getSheetByName("Orders");
    const pSheet = ss.getSheetByName("Production");

    if (!prodSheet || !bomSheet) {
      throw new Error("Không tìm thấy sheet 'Products' hoặc 'BOM_Config'!");
    }

    const prodData = prodSheet.getDataRange().getValues();
    const prodHeaders = prodData[0];

    const skuIdx = prodHeaders.indexOf("sku");
    const nameIdx = prodHeaders.indexOf("name");
    const costIdx = prodHeaders.indexOf("costPrice");

    // Đọc dữ liệu BOM cũ để thực hiện Upsert (chống trùng lặp)
    const bomData = bomSheet.getDataRange().getValues();
    const bomHeaders = bomData[0];
    const bomIdIdx = bomHeaders.indexOf("id");
    const bomLayoutIdx = bomHeaders.indexOf("layoutCode");
    const bomQtyIdx = bomHeaders.indexOf("defaultQty");
    const bomMatIdx = bomHeaders.indexOf("materialSku");
    const bomUnitIdx = bomHeaders.indexOf("unit");

    const bomRowMap = {};
    for (let j = 1; j < bomData.length; j++) {
      const bomId = String(bomData[j][bomIdIdx]).trim();
      const lCode = String(bomData[j][bomLayoutIdx]).trim();
      const mSku = String(bomData[j][bomMatIdx]).trim();
      if (bomId) bomRowMap[bomId] = j + 1;
      if (lCode && mSku) bomRowMap[lCode + '_' + mSku] = j + 1;
    }

    let updatedCount = 0;

    // A. Quét toàn bộ bảng Products
    for (let i = 1; i < prodData.length; i++) {
      const sku = String(prodData[i][skuIdx] || "").trim();
      const name = String(prodData[i][nameIdx] || "").trim();

      const specs = calculateGlassTankSpecs(name) || calculateGlassTankSpecs(sku);
      if (specs && (sku.startsWith("BE") || sku.startsWith("TERA") || name.toLowerCase().includes("bể") || name.toLowerCase().includes("hồ"))) {
        // Cập nhật giá vốn chuẩn vào Products
        if (costIdx >= 0) {
          prodSheet.getRange(i + 1, costIdx + 1).setValue(specs.totalCOGS);
        }

        // Cập nhật BOM_Config (3 dòng: Kính Đáy + Kính Thành MVT + Silicon)
        const itemsToUpdate = [
          { id: `BOM_${sku || specs.dimensionsStr}_BOTTOM`, layout: sku || name, mat: specs.bottomMat, qty: specs.bottomArea, unit: "m2" },
          { id: `BOM_${sku || specs.dimensionsStr}_SIDE`, layout: sku || name, mat: specs.sideMat, qty: specs.sideArea, unit: "m2" },
          { id: `BOM_${sku || specs.dimensionsStr}_SILICON`, layout: sku || name, mat: "SILICON", qty: specs.siliconLength, unit: "met" }
        ];

        itemsToUpdate.forEach(item => {
          const rowKey = bomRowMap[item.id] || bomRowMap[item.layout + '_' + item.mat];
          if (rowKey) {
            bomSheet.getRange(rowKey, bomQtyIdx + 1).setValue(item.qty);
            if (bomMatIdx >= 0) bomSheet.getRange(rowKey, bomMatIdx + 1).setValue(item.mat);
            if (bomUnitIdx >= 0) bomSheet.getRange(rowKey, bomUnitIdx + 1).setValue(item.unit);
          } else {
            bomSheet.appendRow([item.id, item.layout, item.mat, item.qty, item.unit]);
          }
        });

        updatedCount++;
      }
    }

    // B. Quét các lệnh sản xuất bể lẻ trong Production nếu có kích thước mới
    if (pSheet) {
      const pData = pSheet.getDataRange().getValues();
      const pHeaders = pData[0];
      const pNameIdx = pHeaders.indexOf("name");

      for (let p = 1; p < pData.length; p++) {
        const prodName = String(pData[p][pNameIdx] || "").trim();
        const specs = calculateGlassTankSpecs(prodName);
        if (specs) {
          const itemsToUpdate = [
            { id: `BOM_${prodName}_BOTTOM`, layout: prodName, mat: specs.bottomMat, qty: specs.bottomArea, unit: "m2" },
            { id: `BOM_${prodName}_SIDE`, layout: prodName, mat: specs.sideMat, qty: specs.sideArea, unit: "m2" },
            { id: `BOM_${prodName}_SILICON`, layout: prodName, mat: "SILICON", qty: specs.siliconLength, unit: "met" }
          ];

          itemsToUpdate.forEach(item => {
            const rowKey = bomRowMap[item.id] || bomRowMap[item.layout + '_' + item.mat];
            if (rowKey) {
              bomSheet.getRange(rowKey, bomQtyIdx + 1).setValue(item.qty);
              if (bomMatIdx >= 0) bomSheet.getRange(rowKey, bomMatIdx + 1).setValue(item.mat);
            } else {
              bomSheet.appendRow([item.id, item.layout, item.mat, item.qty, item.unit]);
              bomRowMap[item.id] = bomSheet.getLastRow();
            }
          });
        }
      }
    }

    // C. Cập nhật COGS cho các đơn hàng trong Orders nếu đang cogs = 0
    if (ordSheet) {
      const ordData = ordSheet.getDataRange().getValues();
      const ordHeaders = ordData[0];
      const accIdx = ordHeaders.indexOf("accessories");
      const cogsIdx = ordHeaders.indexOf("cogs");

      if (accIdx >= 0 && cogsIdx >= 0) {
        for (let o = 1; o < ordData.length; o++) {
          const currentCogs = Number(ordData[o][cogsIdx]) || 0;
          const accStr = String(ordData[o][accIdx] || "");
          if (currentCogs === 0 && accStr) {
            const specs = calculateGlassTankSpecs(accStr);
            if (specs) {
              ordSheet.getRange(o + 1, cogsIdx + 1).setValue(specs.totalCOGS);
            }
          }
        }
      }
    }

    SpreadsheetApp.flush();
    const msg = `🟢 Đã chuẩn hóa thành công BOM (Kính Đáy + Kính MVT + Keo Silicon) & Giá vốn cho ${updatedCount} mã bể.`;
    Logger.log(msg);
    return { success: true, message: msg };

  } catch (e) {
    Logger.log("Lỗi hệ thống autoCalculateGlassTankBOM_Dual: " + e.message);
    throw e;
  } finally {
    // Luôn nhả Lock dù có báo lỗi
    lock.releaseLock();
  }
}

/**
 * CRONJOB: Kiểm tra phạt trễ đóng gói (19:30 hằng ngày)
 * Lọc các đơn đang ở trạng thái 'Sẵn sàng đóng gói' nhưng chưa có Packings DONE
 * Phạt 50,000 VND vào quỹ của Nguyễn Thị Diệu Hương
 */
function cronCheckUnpackedOrdersAt1930() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordSheet = ss.getSheetByName('Orders');
    const packSheet = ss.getSheetByName('Packings');
    const bpSheet = ss.getSheetByName('BonusPenalty');

    if (!ordSheet || !packSheet || !bpSheet) return;

    const ordData = ordSheet.getDataRange().getValues();
    const ordHeaders = ordData[0];
    const oIdIdx = ordHeaders.indexOf('id');
    const oStatusIdx = ordHeaders.indexOf('status');
    const oCodeIdx = ordHeaders.indexOf('orderCode');

    const packData = packSheet.getDataRange().getValues();
    const packHeaders = packData[0];
    const pOrderIdIdx = packHeaders.indexOf('orderId');
    const pStatusIdx = packHeaders.indexOf('status');

    // Lọc ra danh sách Order ID đã đóng gói xong (Done / ĐÃ XONG)
    const donePacks = {};
    for (let i = 1; i < packData.length; i++) {
      const pStat = String(packData[i][pStatusIdx] || '').toUpperCase().trim();
      const pOrdId = String(packData[i][pOrderIdIdx] || '').trim();
      if (pStat === 'DONE' || pStat === 'ĐÃ XONG') {
        donePacks[pOrdId] = true;
      }
    }

    const safeDate = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");

    // Lấy danh sách các đơn đã bị phạt hôm nay để tránh phạt trùng lặp
    const bpData = bpSheet.getDataRange().getValues();
    const bpHeaders = bpData[0];
    const bpOrderCodeIdx = bpHeaders.indexOf('orderCode');
    const bpDateIdx = bpHeaders.indexOf('date');
    const bpTypeIdx = bpHeaders.indexOf('type');

    const existingPenalties = {};
    for (let b = 1; b < bpData.length; b++) {
      const bDate = String(bpData[b][bpDateIdx] || '').slice(0, 10);
      const bCode = String(bpData[b][bpOrderCodeIdx] || '').trim();
      const bType = String(bpData[b][bpTypeIdx] || '').trim();
      if (bDate === safeDate && (bType === 'Phạt' || bType === 'Phạt Quy Định')) {
        existingPenalties[bCode] = true;
      }
    }

    let penaltyCount = 0;
    const newPenaltyRows = [];

    for (let i = 1; i < ordData.length; i++) {
      const oId = String(ordData[i][oIdIdx] || '').trim();
      const oCode = String(ordData[i][oCodeIdx] || '').trim();
      const oStat = String(ordData[i][oStatusIdx] || '').trim();
      const oStatUpper = oStat.toUpperCase();

      if (oStatUpper === 'SẴN SÀNG ĐÓNG GÓI' || oStat === 'Sẵn sàng đóng gói') {
        if (!donePacks[oId]) {
          const targetCode = oCode || oId;
          if (!existingPenalties[targetCode]) {
            const bpId = 'PENALTY_SLA_' + Date.now() + '_' + penaltyCount;
            // Schema BonusPenalty: id, user, amount, type, note, date, orderCode
            newPenaltyRows.push([
              bpId,
              'Nguyễn Thị Diệu Hương',
              -50000,
              'Phạt',
              'Phạt trễ đóng gói trước 19:30 - Đơn ' + targetCode,
              safeDate,
              targetCode
            ]);
            existingPenalties[targetCode] = true;
            penaltyCount++;
          }
        }
      }
    }

    if (newPenaltyRows.length > 0) {
      bpSheet.getRange(bpSheet.getLastRow() + 1, 1, newPenaltyRows.length, newPenaltyRows[0].length).setValues(newPenaltyRows);
      Logger.log('Đã phạt ' + penaltyCount + ' đơn trễ đóng gói SLA lúc 19:30');
    }

  } catch (e) {
    Logger.log('Lỗi cronCheckUnpackedOrdersAt1930: ' + e.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * RESTORE LỖI LẤY TỪ KHO
 * Khôi phục lại trạng thái "Đã xong" cho các lệnh đã lấy từ kho nhưng bị nhầm thành Pending
 */
function restoreFulfilledFromStock() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = ss.getSheetByName('Production');
  if (!prodSheet) return;
  var data = prodSheet.getDataRange().getValues();
  var headers = data[0];

  var statusCol = headers.indexOf('status');
  var fulCol = headers.indexOf('fulfilledFromStock');
  var noteCol = headers.indexOf('note');
  var p1StatusCol = headers.indexOf('p1_status');
  var p2StatusCol = headers.indexOf('p2_status');
  var qcStatusCol = headers.indexOf('qc_status');

  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var status = String(data[i][statusCol]).trim();
    var note = String(data[i][noteCol]).trim();

    // Nếu có chữ lấy từ tồn kho hoặc các cụm từ tương tự, nhưng lại KHÔNG có dòng Sửa về Chờ Sản Xuất do kho âm
    var isFulfilledNote = (note.indexOf('Lấy từ tồn kho có sẵn') !== -1 ||
      note.indexOf('Có sẵn ở kho') !== -1 ||
      note.indexOf('Tự động bốc từ kho') !== -1 ||
      note.indexOf('LẤY TỪ TỒN KHO') !== -1);

    if (isFulfilledNote && note.indexOf('Sửa về Chờ Sản Xuất do kho âm') === -1) {
      // Dù cho thợ có lỡ ấn nhận việc hay làm xong rồi (do lỗi reset nhầm),
      // thì bản chất lệnh này là lấy từ kho, nên ta sẽ ép nó về đúng bản chất.
      prodSheet.getRange(i + 1, fulCol + 1).setValue(true);
      prodSheet.getRange(i + 1, statusCol + 1).setValue('Hoàn Kho Đạt');

      // Trả lại các khâu về Done để hệ thống hiểu là không cần làm nữa
      if (p1StatusCol !== -1) prodSheet.getRange(i + 1, p1StatusCol + 1).setValue('Done');
      if (p2StatusCol !== -1) prodSheet.getRange(i + 1, p2StatusCol + 1).setValue('Done');
      if (qcStatusCol !== -1) prodSheet.getRange(i + 1, qcStatusCol + 1).setValue('Done');

      count++;
    }
  }

  SpreadsheetApp.getUi().alert('Đã khôi phục thành công ' + count + ' lệnh bị lỗi hiển thị "Chờ nhận việc"!');
}

/**
 * THUẬT TOÁN GỘP LỆNH BỂ KÍNH THÔNG MINH
 * Quét toàn bộ Production đang Pending có chứa từ khoá "Bể kính" (hoặc type là Bể kính).
 * Gom các lệnh cùng name (kích thước) vào và phân công cho cùng một thợ (tự động chọn thợ đang active).
 * Đổi trạng thái p1_status = 'In Progress'.
 */
function batchDispatchSmartGlassTanks() {
  // YÊU CẦU CỦA USER: "không gộp lệnh như này. làm logic bên bể kính giống bên layout ấy"
  // Áp dụng triết lý One-Piece Flow, vô hiệu hoá thuật toán gộp và tự động giao việc.
  // Bể Kính sẽ do thợ tự vào ứng dụng bấm "Nhận làm" cho từng lệnh đơn lẻ giống Layout.
  return { success: true, message: 'Đã chuyển sang One-Piece Flow. Lệnh bể kính không còn tự động gộp.' };
}

/**
 * RICH FISH AQUARIUM - ENGINE TỰ ĐỘNG TÍNH ĐỊNH MỨC & ĐỒNG BỘ BOM LAYOUT
 * Tác giả: AI Operations Leader
 */
function autoGenerateAndSyncLayoutBOM() {
  const notifyUi = function (msg) {
    Logger.log(msg);
    try {
      SpreadsheetApp.getUi().alert(msg);
    } catch (e) {
      // Chạy từ Apps Script Editor, Trigger hoặc WebApp không có container UI
    }
  };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    notifyUi('⚠️ Hệ thống đang bận, vui lòng thử lại sau vài giây!');
    return { success: false, message: 'Hệ thống đang bận' };
  }

  try {
    const activeSs = SpreadsheetApp.getActiveSpreadsheet();
    let sheetEstimate = null;

    // 1. Tìm trong chính file hiện tại (active spreadsheet)
    const activeSheets = activeSs.getSheets();
    sheetEstimate = activeSheets.find(s => {
      const n = s.getName().toLowerCase().trim();
      return n.includes('bản để làm') || n.includes('định mức bom') || n === 'layout';
    });

    // 2. Nếu không có, mở file BẢNG GIÁ HÀNG HOÁ RF AQUARIUM bên ngoài
    if (!sheetEstimate) {
      const extFileId = '1485FsgYjTXA1EkqsaEQ-kCI1EyFUsVueAd9GirhFis';
      try {
        const extSs = SpreadsheetApp.openById(extFileId);
        const extSheets = extSs.getSheets();
        sheetEstimate = extSheets.find(s => {
          const n = s.getName().toLowerCase().trim();
          return n.includes('bản để làm') || n.includes('app') || n.includes('định mức');
        }) || extSheets[extSheets.length - 1];
      } catch (extErr) {
        Logger.log('Lỗi mở file Bảng Giá ngoài (' + extFileId + '): ' + extErr.toString());
      }
    }

    if (!sheetEstimate) {
      const guideMsg = "⚠️ Không tìm thấy bảng định mức!\n\nCách xử lý đơn giản nhất:\nAnh hãy mở file 'BẢNG GIÁ HÀNG HOÁ RF AQUARIUM', nhấp chuột phải vào tab 'Bản để làm appp không sài đến' -> Chọn 'Sao chép vào (Copy to)' -> Chọn file 'RF Workspace Pro (Bản Chính Thức Chuẩn)' này, sau đó bấm Chạy lại là xong ngay!";
      notifyUi(guideMsg);
      return { success: false, message: guideMsg };
    }

    const data = sheetEstimate.getDataRange().getValues();
    if (data.length < 5) {
      throw new Error("Bảng định mức '" + sheetEstimate.getName() + "' không đủ số dòng dữ liệu!");
    }

    // 1. Ánh xạ các cột trên bảng tính định mức (Dòng 2 & 4: Cột C đến T)
    const COL = {
      SAN_MIENG: 2,   // C - Lũa San Miếng (gam)
      TAI_MEO: 3,     // D - Đá Tai Mèo (gam)
      NHAM_XANH: 4,   // E - Đá Nham Xanh (gam)
      CUOI: 5,        // F - Đá Cuội (gam)
      SAN: 6,         // G - Đá San (gam)
      VIA: 7,         // H - Đá Vỉa (gam)
      DA_VOI: 8,      // I - Đá Da Voi (gam)
      SAN_CANH: 9,    // J - Lũa San Cành (gam)
      DO_QUYEN: 10,   // K - Lũa Đỗ Quyên (gam)
      RE_RUNG: 11,    // L - Rễ Rừng (gam)
      THACH_SUNG: 12, // M - Lũa Thạch Sùng (gam)
      NHO_NOI: 13,    // N - Lũa Nhọ Nồi (gam)
      REU_XANH: 14,   // O - Rêu Xanh A04 (gam)
      REU_DO: 15,     // P - Rêu Đỏ (gam)
      FOMEX_8LI: 16,  // Q - Fomex 8li (m²)
      FOMEX_10LI: 17, // R - Fomex 10li (m²)
      KEO_DK: 18,     // S - Keo Dựng Khung (Chai 162g / gam)
      KEO_GC: 19      // T - Keo Gia Cố (Chai 162g / gam)
    };

    const woodCols = [COL.SAN_MIENG, COL.SAN_CANH, COL.DO_QUYEN, COL.RE_RUNG, COL.THACH_SUNG, COL.NHO_NOI];
    const stoneCols = [COL.TAI_MEO, COL.NHAM_XANH, COL.CUOI, COL.SAN, COL.VIA, COL.DA_VOI];
    const mossCols = [COL.REU_XANH, COL.REU_DO];

    // Hệ số chuẩn hóa (Từ Size 30 làm mốc chuẩn)
    const SCALE_FROM_30 = {
      TO_20: { stone: 0.8000, wood: 0.4286, moss: 0.8000, fomex8li: 0.0255, fomex10li: 0, keoDK: 40, keoGC: 120 },
      TO_40: { stone: 1.4667, wood: 1.5714, moss: 1.6000, fomex8li: 0, fomex10li: 0.0920, keoDK: 140, keoGC: 230 }
    };

    // Hệ số chuẩn hóa (Từ Size 20 làm mốc chuẩn)
    const SCALE_FROM_20 = {
      TO_30: { stone: 1.2500, wood: 2.3333, moss: 1.2500, fomex8li: 0.0405, fomex10li: 0, keoDK: 60, keoGC: 190 },
      TO_40: { stone: 1.8333, wood: 3.6667, moss: 2.0000, fomex8li: 0, fomex10li: 0.0920, keoDK: 140, keoGC: 230 }
    };

    // Xử lý ô trống là 0
    for (let r = 4; r < data.length; r++) {
      for (let c = 2; c <= 19; c++) {
        if (data[r][c] === '' || data[r][c] === null || isNaN(Number(data[r][c]))) {
          data[r][c] = 0;
        } else {
          data[r][c] = Number(data[r][c]);
        }
      }
    }

    // 2. Thuật toán tự động sinh số liệu cho Size 20, Size 30, Size 40
    let updatedRowsCount = 0;
    for (let r = 4; r < data.length; r++) {
      const sku = String(data[r][0] || '').trim();
      if (!sku) continue;

      // TRƯỜNG HỢP A: Có sẵn mẫu Size 30 (-302020)
      if (sku.endsWith('-302020')) {
        const prefix = sku.replace('-302020', '');
        const row30 = data[r];
        const hasData = woodCols.concat(stoneCols, mossCols).some(c => Number(row30[c]) > 0);
        if (!hasData) continue;

        // Điền cố định Fomex & Keo cho Size 30 nếu chưa có
        if (row30[COL.FOMEX_8LI] === 0) row30[COL.FOMEX_8LI] = 0.0405;
        if (row30[COL.KEO_DK] === 0) row30[COL.KEO_DK] = 40;
        if (row30[COL.KEO_GC] === 0) row30[COL.KEO_GC] = 120;

        for (let targetR = 4; targetR < data.length; targetR++) {
          const targetSku = String(data[targetR][0] || '').trim();

          // Tính Size 20
          if (targetSku === `${prefix}-202020`) {
            woodCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_20.wood); });
            stoneCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_20.stone); });
            mossCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_20.moss); });

            data[targetR][COL.FOMEX_8LI] = SCALE_FROM_30.TO_20.fomex8li;
            data[targetR][COL.FOMEX_10LI] = SCALE_FROM_30.TO_20.fomex10li;
            data[targetR][COL.KEO_DK] = SCALE_FROM_30.TO_20.keoDK;
            data[targetR][COL.KEO_GC] = SCALE_FROM_30.TO_20.keoGC;
            updatedRowsCount++;
          }

          // Tính Size 40
          if (targetSku === `${prefix}-402325`) {
            woodCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_40.wood); });
            stoneCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_40.stone); });
            mossCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_40.moss); });

            data[targetR][COL.FOMEX_8LI] = SCALE_FROM_30.TO_40.fomex8li;
            data[targetR][COL.FOMEX_10LI] = SCALE_FROM_30.TO_40.fomex10li;
            data[targetR][COL.KEO_DK] = SCALE_FROM_30.TO_40.keoDK;
            data[targetR][COL.KEO_GC] = SCALE_FROM_30.TO_40.keoGC;
            updatedRowsCount++;
          }
        }
      }
    }

    // Ghi lại toàn bộ bảng tính định mức 1 lần duy nhất (Batch Write)
    if (sheetEstimate.getMaxColumns() >= data[0].length) {
      sheetEstimate.getRange(1, 1, data.length, data[0].length).setValues(data);
    }

    // 3. ĐỒNG BỘ TRỰC TIẾP VÀO BẢNG BOM_Config
    const BOM_HEADERS = ['id', 'layoutCode', 'materialSku', 'defaultQty', 'unit'];
    let bomSheet = activeSs.getSheetByName('BOM_Config');
    if (!bomSheet) {
      bomSheet = activeSs.insertSheet('BOM_Config');
      bomSheet.appendRow(BOM_HEADERS);
      bomSheet.setFrozenRows(1);
    }

    // Bảng SKU & Đơn Vị Tính Mapping chuẩn khớp 100% Dòng 4
    const SKU_MAP = {
      [COL.SAN_MIENG]: { sku: 'NLSX-LUASANMIENG', unit: 'gam' },
      [COL.TAI_MEO]: { sku: 'NLSX-TAIMEO', unit: 'gam' },
      [COL.NHAM_XANH]: { sku: 'NLSX-NHAM', unit: 'gam' },
      [COL.CUOI]: { sku: 'NLSX-CUOI', unit: 'gam' },
      [COL.SAN]: { sku: 'NLSX-SAN', unit: 'gam' },
      [COL.VIA]: { sku: 'NLSX-VIA', unit: 'gam' },
      [COL.DA_VOI]: { sku: 'NLSX-DAVOI', unit: 'gam' },
      [COL.SAN_CANH]: { sku: 'NLSX-LUASANCANH', unit: 'gam' },
      [COL.DO_QUYEN]: { sku: 'NLSX-DOQUYEN', unit: 'gam' },
      [COL.RE_RUNG]: { sku: 'NLSX-RE', unit: 'gam' },
      [COL.THACH_SUNG]: { sku: 'NLSX-THACHSUNG', unit: 'gam' },
      [COL.NHO_NOI]: { sku: 'NLSX-NOIN', unit: 'gam' },
      [COL.REU_XANH]: { sku: 'NLSX-REU-A04', unit: 'gam' },
      [COL.REU_DO]: { sku: 'NLSX-REU-A11', unit: 'gam' },
      [COL.FOMEX_8LI]: { sku: 'NLSX-FOMEX-8li', unit: 'm²' },
      [COL.FOMEX_10LI]: { sku: 'NLSX-FOMEX10-54', unit: 'm²' }
    };

    // Giữ lại các BOM Bể Kính đã có sẵn
    const existingBomData = bomSheet.getDataRange().getValues();
    const newBomRows = [BOM_HEADERS];

    if (existingBomData && existingBomData.length > 1) {
      for (let b = 1; b < existingBomData.length; b++) {
        const row = existingBomData[b];
        const code = String(row[1] || '').trim();
        if (code.startsWith('BE') || code.startsWith('TERA') || code.includes('Bể Kính')) {
          newBomRows.push([
            row[0] || `BOM_${code}`,
            code,
            row[2] || '',
            Number(row[3]) || 0,
            row[4] || ''
          ]);
        }
      }
    }

    // Nạp toàn bộ định mức Layout mới vào
    for (let r = 4; r < data.length; r++) {
      const layoutSku = String(data[r][0] || '').trim();
      const layoutName = String(data[r][1] || '').trim();
      if (!layoutSku) continue;

      const targetCodes = [layoutSku];
      if (layoutName && layoutName !== layoutSku) targetCodes.push(layoutName);

      targetCodes.forEach(targetCode => {
        // Gom Keo 502 (Dựng Khung + Gia Cố)
        const totalKeoGrams = (Number(data[r][COL.KEO_DK]) || 0) + (Number(data[r][COL.KEO_GC]) || 0);
        if (totalKeoGrams > 0) {
          const bottleQty = Number((totalKeoGrams / 162).toFixed(2));
          newBomRows.push([
            `BOM_${targetCode}_502`,
            targetCode,
            'NLSX-502-1CHAI',
            bottleQty,
            'Chai 162g'
          ]);
        }

        // Nạp các nguyên liệu còn lại (Giữ nguyên giá trị gam / m2 chuẩn từ bảng tính)
        Object.keys(SKU_MAP).forEach(colIdx => {
          const c = Number(colIdx);
          const val = Number(data[r][c]) || 0;
          if (val > 0) {
            const mat = SKU_MAP[c];
            newBomRows.push([
              `BOM_${targetCode}_${mat.sku}`,
              targetCode,
              mat.sku,
              val,
              mat.unit
            ]);
          }
        });
      });
    }

    // Ghi đè BOM_Config an toàn (Cố định đúng 5 cột)
    bomSheet.clearContents();
    bomSheet.getRange(1, 1, newBomRows.length, 5).setValues(newBomRows);

    // 4. ĐỒNG BỘ GIÁ VỐN TỪ DÒNG SỐ 3 VÀO BẢNG Products (ERP)
    let priceSyncCount = 0;
    try {
      const prodSheet = activeSs.getSheetByName('Products');
      if (prodSheet) {
        const prodData = prodSheet.getDataRange().getValues();
        const priceMap = {};

        // Parse giá từ dòng 3 (index 2) - Lọc lấy phần số (ví dụ: "35000 / 1kg" -> 35000)
        Object.keys(SKU_MAP).forEach(colIdx => {
          const c = Number(colIdx);
          const rawPriceStr = String(data[2][c] || '');
          const cleanStr = rawPriceStr.replace(/\./g, '').replace(/,/g, '');
          const match = cleanStr.match(/\d+/);
          if (match) priceMap[SKU_MAP[c].sku] = Number(match[0]);
        });

        // Đặc thù Keo 502
        const keoRaw = String(data[2][COL.KEO_DK] || '');
        const keoMatch = keoRaw.replace(/\./g, '').replace(/,/g, '').match(/\d+/);
        if (keoMatch) priceMap['NLSX-502-1CHAI'] = Number(keoMatch[0]);

        let costPriceColIdx = -1;
        let skuColIdx = -1;
        for (let i = 0; i < prodData[0].length; i++) {
          if (prodData[0][i] === 'costPrice') costPriceColIdx = i;
          if (prodData[0][i] === 'sku') skuColIdx = i;
        }

        if (costPriceColIdx !== -1 && skuColIdx !== -1) {
          let hasChanges = false;
          for (let r = 1; r < prodData.length; r++) {
            const rowSku = String(prodData[r][skuColIdx] || '').trim();
            if (priceMap[rowSku] !== undefined && priceMap[rowSku] > 0) {
              if (Number(prodData[r][costPriceColIdx]) !== priceMap[rowSku]) {
                prodData[r][costPriceColIdx] = priceMap[rowSku];
                hasChanges = true;
                priceSyncCount++;
              }
            }
          }
          if (hasChanges) {
            prodSheet.getRange(1, 1, prodData.length, prodData[0].length).setValues(prodData);
          }
        }
      }
    } catch (err) {
      Logger.log('Lỗi đồng bộ giá vốn: ' + err.message);
    }

    SpreadsheetApp.flush();
    const successMsg = `✅ Thành công!\n- Đã tự động tính toán hoàn tất ${updatedRowsCount} phân loại kích thước.\n- Đã đồng bộ ${newBomRows.length - 1} bản ghi định mức vào bảng BOM_Config.\n- Đã tự động cập nhật Giá Vốn cho ${priceSyncCount} mã vật tư từ Bảng Chuẩn sang Kho!`;
    notifyUi(successMsg);
    return { success: true, message: successMsg, updatedRows: updatedRowsCount, bomRecords: newBomRows.length - 1 };


  } catch (err) {
    const errMsg = '❌ Lỗi xử lý: ' + err.toString();
    notifyUi(errMsg);
    return { success: false, error: errMsg };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// API DASHBOARD LỖI KCS & TỒN KHO
// =========================================================================
function getDashboardErrors(params) {
  return api_getDashboardErrors(params);
}

function api_getDashboardErrors(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Lấy lỗi KCS (Từ chối)
    var prodSheet = ss.getSheetByName('Production');
    var kcsErrors = [];
    if (prodSheet) {
      var pData = prodSheet.getDataRange().getValues();
      var pHead = pData[0];
      var qcStatusCol = pHead.indexOf('qc_status');
      var p1StatusCol = pHead.indexOf('p1_status');
      var p2StatusCol = pHead.indexOf('p2_status');
      var statusCol = pHead.indexOf('status');

      for (var i = 1; i < pData.length; i++) {
        var qc = String(pData[i][qcStatusCol] || '').toUpperCase().trim();
        var p1 = String(pData[i][p1StatusCol] || '').toUpperCase().trim();
        var p2 = String(pData[i][p2StatusCol] || '').toUpperCase().trim();
        var st = String(pData[i][statusCol] || '').toUpperCase().trim();

        var isQcError = (qc === 'FAIL' || qc === 'REJECT' || qc.indexOf('TỪ CHỐI') > -1 || qc.indexOf('LỖI') > -1 || p1 === 'REJECT' || p2 === 'REJECT' || st.indexOf('LỖI') > -1 || st.indexOf('SỬA') > -1);
        if (isQcError) {
          var rowObj = {};
          pHead.forEach(function (h, idx) {
            rowObj[h] = pData[i][idx];
          });
          kcsErrors.push(rowObj);
        }
      }
    }

    // 2. Lấy lỗi Tồn Kho (Lệch Tồn hoặc Cảnh Báo)
    var invSheet = ss.getSheetByName('Products');
    var invErrors = [];
    if (invSheet) {
      var iData = invSheet.getDataRange().getValues();
      var iHead = iData[0];
      var qtyCol = iHead.indexOf('quantity');
      var minCol = iHead.indexOf('minStock');
      var maxCol = iHead.indexOf('maxStock');
      if (qtyCol > -1 && minCol > -1) {
        for (var j = 1; j < iData.length; j++) {
          var qty = Number(iData[j][qtyCol]) || 0;
          var min = Number(iData[j][minCol]) || 0;
          var max = Number(iData[j][maxCol]) || 0;
          if (qty < 0 || (min > 0 && qty <= min)) {
            var rObj = {};
            iHead.forEach(function (h, idx) {
              rObj[h] = iData[j][idx];
            });
            rObj._errorType = qty < 0 ? 'ÂM KHO' : 'CHẠM ĐÁY TỒN KHO';
            invErrors.push(rObj);
          }
        }
      }
    }

    return { success: true, data: { kcsErrors: kcsErrors, invErrors: invErrors } };
  } catch (err) {
    return { success: false, message: 'Lỗi tải Dashboard: ' + err.message };
  }
}

/**
 * RICH FISH AQUARIUM - AUTO GENERATE BOM & COGS ENGINE
 * Tự động tính số vật tư và gán thẳng giá vốn vào Products từ Sheet Định Mức Mẫu
 */
function autoCalculateBOMAndProductCosts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { success: false, message: '⚠️ Hệ thống đang bận, vui lòng thử lại sau vài giây!' };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const estimateSheet = ss.getSheetByName('Bản để làm appp không sài đến') || ss.getSheetByName('DinhMuc_Mau') || ss.getActiveSheet();
    const prodSheet = ss.getSheetByName('Products');
    const bomSheet = ss.getSheetByName('BOM_Config');

    if (!estimateSheet || !prodSheet || !bomSheet) {
      return { success: false, message: '❌ Không tìm thấy đủ các sheet: Products, BOM_Config, hoặc Sheet Định Mức!' };
    }

    const estData = estimateSheet.getDataRange().getValues();
    const prodData = prodSheet.getDataRange().getValues();
    const prodHeaders = prodData[0];
    const skuIdx = prodHeaders.indexOf('sku');
    const nameIdx = prodHeaders.indexOf('name');
    const costIdx = prodHeaders.indexOf('costPrice');
    const catIdx = prodHeaders.indexOf('category');

    // 1. ÁNH XẠ CỘT TRÊN SHEET ĐỊNH MỨC MẪU
    // Cột mặc định theo sheet "Bản để làm appp không sài đến":
    // C (2): San Miếng, D (3): Tai Mèo, E (4): Nham Xanh, F (5): Cuội, G (6): Sạn, H (7): Vỉa, I (8): Da Voi
    // J (9): San Cành, K (10): Đỗ Quyên, L (11): Rễ Rừng, M (12): Thạch Sùng, N (13): Nhọ Nồi
    // O (14): Rêu Xanh, P (15): Rêu Đỏ, Q (16): Fomex 8li, R (17): Fomex 10li, S (18): Keo DK, T (19): Keo GC
    const colMap = {
      sanMieng: 2, taiMeo: 3, nhamXanh: 4, cuoi: 5, san: 6, via: 7, daVoi: 8,
      sanCanh: 9, doQuyen: 10, reRung: 11, thachSung: 12, nhoNoi: 13,
      reuXanh: 14, reuDo: 15, fomex8: 16, fomex10: 17, keoDK: 18, keoGC: 19
    };

    // Quét 6 dòng đầu tiên để map động nếu các cột có dịch chuyển
    for (let c = 0; c < (estData[0] ? estData[0].length : 25); c++) {
      let combinedHeader = '';
      for (let r = 0; r < Math.min(6, estData.length); r++) {
        combinedHeader += ' ' + String(estData[r][c] || '');
      }
      const hStr = combinedHeader.toLowerCase();
      if (hStr.includes('san miếng') || hStr.includes('san mieng')) colMap.sanMieng = c;
      else if (hStr.includes('tai mèo') || hStr.includes('tai meo')) colMap.taiMeo = c;
      else if (hStr.includes('nham xanh') || hStr.includes('nham')) colMap.nhamXanh = c;
      else if (hStr.includes('cuội') || hStr.includes('cuoi')) colMap.cuoi = c;
      else if (hStr.includes('sạn') || hStr.includes('san')) colMap.san = c;
      else if (hStr.includes('vỉa') || hStr.includes('via')) colMap.via = c;
      else if (hStr.includes('da voi')) colMap.daVoi = c;
      else if (hStr.includes('san cành') || hStr.includes('san canh')) colMap.sanCanh = c;
      else if (hStr.includes('đỗ quyên') || hStr.includes('do quyen')) colMap.doQuyen = c;
      else if (hStr.includes('rễ rừng') || hStr.includes('re rung')) colMap.reRung = c;
      else if (hStr.includes('thạch sùng') || hStr.includes('thach sung')) colMap.thachSung = c;
      else if (hStr.includes('nhọ nồi') || hStr.includes('nho noi')) colMap.nhoNoi = c;
      else if (hStr.includes('rêu xanh') || hStr.includes('reu xanh')) colMap.reuXanh = c;
      else if (hStr.includes('rêu đỏ') || hStr.includes('reu do')) colMap.reuDo = c;
      else if (hStr.includes('fomex 8li') || hStr.includes('fomex 8')) colMap.fomex8 = c;
      else if (hStr.includes('fomex 10li') || hStr.includes('fomex 10')) colMap.fomex10 = c;
      else if (hStr.includes('dựng khung') || hStr.includes('dung khung')) colMap.keoDK = c;
      else if (hStr.includes('gia cố') || hStr.includes('gia co')) colMap.keoGC = c;
    }

    // Đơn giá vật tư gốc
    const MATERIAL_COST = {
      'NLSX-LUASANMIENG': 35000, 'NLSX-TAIMEO': 5000, 'NLSX-NHAM': 5000,
      'NLSX-CUOI': 5000, 'NLSX-SAN': 5000, 'NLSX-VIA': 7000, 'NLSX-DAVOI': 7000,
      'NLSX-LUASANCANH': 35000, 'NLSX-DOQUYEN': 120000, 'NLSX-RE': 100000,
      'NLSX-THACHSUNG': 35000, 'NLSX-NOIN': 70000, 'NLSX-REU-A04': 450,
      'NLSX-REU-A11': 450, 'NLSX-FOMEX-8li': 100779, 'NLSX-FOMEX10-54': 117576,
      'NLSX-502-1CHAI': 22000
    };

    // 2. BÓC TÁCH MẪU CHUẨN TỪ CÁC DÒNG SIZE 30x20x20 (hoặc dòng mẫu đầu tiên của mã)
    const baseMap = {};
    for (let r = 0; r < estData.length; r++) {
      const sku = String(estData[r][0] || '').trim().toUpperCase();
      if (!sku || sku === 'MÃ' || sku === 'MA' || sku.startsWith('TÊN')) continue;

      const parts = sku.split('-');
      const prefix = parts.length >= 2 ? parts.slice(0, 2).join('-') : parts[0];
      const row = estData[r];

      const parsedData = {
        sanMieng: Number(row[colMap.sanMieng]) || 0,
        taiMeo: Number(row[colMap.taiMeo]) || 0,
        nhamXanh: Number(row[colMap.nhamXanh]) || 0,
        cuoi: Number(row[colMap.cuoi]) || 0,
        san: Number(row[colMap.san]) || 0,
        via: Number(row[colMap.via]) || 0,
        daVoi: Number(row[colMap.daVoi]) || 0,
        sanCanh: Number(row[colMap.sanCanh]) || 0,
        doQuyen: Number(row[colMap.doQuyen]) || 0,
        reRung: Number(row[colMap.reRung]) || 0,
        thachSung: Number(row[colMap.thachSung]) || 0,
        nhoNoi: Number(row[colMap.nhoNoi]) || 0,
        reuXanh: Number(row[colMap.reuXanh]) || 0,
        reuDo: Number(row[colMap.reuDo]) || 0,
        keoDK: Number(row[colMap.keoDK]) || 40,
        keoGC: Number(row[colMap.keoGC]) || 120
      };

      // Ưu tiên dòng 302020 làm chuẩn gốc
      if (sku.includes('302020') || !baseMap[prefix]) {
        baseMap[prefix] = parsedData;
      }
    }

    // 3. TỰ ĐỘNG TÍNH TOÁN CHO TẤT CẢ SẢN PHẨM LAYOUT TRONG PRODUCTS
    const newBomRows = [['id', 'layoutCode', 'materialSku', 'defaultQty', 'unit']];
    let updatedProductsCount = 0;

    // Giữ lại BOM Bể Kính cũ
    const oldBom = bomSheet.getDataRange().getValues();
    for (let b = 1; b < oldBom.length; b++) {
      const code = String(oldBom[b][1] || '').trim();
      if (code.startsWith('BE') || code.startsWith('TERA') || code.startsWith('BETTA')) {
        newBomRows.push(oldBom[b]);
      }
    }

    for (let p = 1; p < prodData.length; p++) {
      const cat = String(prodData[p][catIdx] || '').toUpperCase();
      if (cat !== 'LAYOUT') continue;

      const prodSku = String(prodData[p][skuIdx] || '').trim();
      const prodName = String(prodData[p][nameIdx] || '').trim();
      if (!prodSku) continue;

      // Phân tích mã ver và kích thước
      let match = prodSku.match(/^([A-Z]+-\d{3})-(\d{2,3})(\d{2})(\d{2})$/);
      let prefix = '';
      let L = 30, W = 20, H = 20;

      if (match) {
        prefix = match[1];
        L = parseInt(match[2]);
        W = parseInt(match[3]);
        H = parseInt(match[4]);
      } else {
        const nameDimMatch = prodName.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i);
        const namePrefixMatch = prodSku.match(/^([A-Z]+-\d{3})/);
        if (nameDimMatch && namePrefixMatch) {
          prefix = namePrefixMatch[1];
          L = parseInt(nameDimMatch[1]);
          W = parseInt(nameDimMatch[2]);
          H = parseInt(nameDimMatch[3]);
        }
      }

      const base = baseMap[prefix];
      if (!base) continue;

      // Hệ số mở rộng theo thể tích và diện tích đáy
      const V0 = 30 * 20 * 20;
      const S0 = 30 * 20;
      const V = L * W * H;
      const S = L * W;

      const kStone = Math.pow(V / V0, 0.65);
      const kWood = Math.pow(V / V0, 0.75);
      const kMoss = Math.pow(S / S0, 0.65);
      const kKeo = Math.pow(V / V0, 0.70);

      // Fomex
      const isBigTank = (L >= 40 || W >= 23);
      const fomexAreaM2 = Number(((S * 0.9) / 10000).toFixed(4));
      const fomexSku = isBigTank ? 'NLSX-FOMEX10-54' : 'NLSX-FOMEX-8li';
      const fomexPrice = isBigTank ? MATERIAL_COST['NLSX-FOMEX10-54'] : MATERIAL_COST['NLSX-FOMEX-8li'];

      let totalCOGS = 0;

      // A. Tính Đá (gam -> Kg)
      const stoneList = [
        { sku: 'NLSX-TAIMEO', val: base.taiMeo },
        { sku: 'NLSX-NHAM', val: base.nhamXanh },
        { sku: 'NLSX-CUOI', val: base.cuoi },
        { sku: 'NLSX-SAN', val: base.san },
        { sku: 'NLSX-VIA', val: base.via },
        { sku: 'NLSX-DAVOI', val: base.daVoi }
      ];

      stoneList.forEach(st => {
        if (st.val > 0) {
          const qtyKg = Number(((st.val * kStone) / 1000).toFixed(3));
          totalCOGS += qtyKg * (MATERIAL_COST[st.sku] || 5000);
          newBomRows.push([`BOM_${prodSku}_${st.sku}`, prodSku, st.sku, qtyKg, 'Cân']);
        }
      });

      // B. Tính Lũa (gam -> Kg)
      const woodList = [
        { sku: 'NLSX-LUASANMIENG', val: base.sanMieng },
        { sku: 'NLSX-LUASANCANH', val: base.sanCanh },
        { sku: 'NLSX-DOQUYEN', val: base.doQuyen },
        { sku: 'NLSX-RE', val: base.reRung },
        { sku: 'NLSX-THACHSUNG', val: base.thachSung },
        { sku: 'NLSX-NOIN', val: base.nhoNoi }
      ];

      woodList.forEach(w => {
        if (w.val > 0) {
          const qtyKg = Number(((w.val * kWood) / 1000).toFixed(3));
          totalCOGS += qtyKg * (MATERIAL_COST[w.sku] || 45000);
          newBomRows.push([`BOM_${prodSku}_${w.sku}`, prodSku, w.sku, qtyKg, 'Cân']);
        }
      });

      // C. Tính Rêu (gam)
      if (base.reuXanh > 0) {
        const qtyG = Math.round(base.reuXanh * kMoss);
        totalCOGS += qtyG * MATERIAL_COST['NLSX-REU-A04'];
        newBomRows.push([`BOM_${prodSku}_REU_XANH`, prodSku, 'NLSX-REU-A04', qtyG, 'Gam']);
      }
      if (base.reuDo > 0) {
        const qtyG = Math.round(base.reuDo * kMoss);
        totalCOGS += qtyG * MATERIAL_COST['NLSX-REU-A11'];
        newBomRows.push([`BOM_${prodSku}_REU_DO`, prodSku, 'NLSX-REU-A11', qtyG, 'Gam']);
      }

      // D. Tính Fomex
      totalCOGS += fomexAreaM2 * fomexPrice;
      newBomRows.push([`BOM_${prodSku}_FOMEX`, prodSku, fomexSku, fomexAreaM2, 'm²']);

      // E. Tính Keo 502 (Quy đổi ra chai 160g)
      const totalKeoGrams = (base.keoDK + base.keoGC) * kKeo;
      const totalBottles = Number((totalKeoGrams / 160).toFixed(2));
      totalCOGS += totalBottles * MATERIAL_COST['NLSX-502-1CHAI'];
      newBomRows.push([`BOM_${prodSku}_KEO502`, prodSku, 'NLSX-502-1CHAI', totalBottles, 'Chai']);

      // Cập nhật giá vốn trực tiếp vào dòng của bảng Products
      const finalCOGS = Math.round(totalCOGS);
      prodData[p][costIdx] = finalCOGS;
      updatedProductsCount++;
    }

    // 4. BATCH WRITE TRỞ LẠI SHEETS (Tối ưu chống tràn Quota)
    prodSheet.getRange(1, 1, prodData.length, prodHeaders.length).setValues(prodData);
    bomSheet.clearContents();
    bomSheet.getRange(1, 1, newBomRows.length, newBomRows[0].length).setValues(newBomRows);

    SpreadsheetApp.flush();
    return {
      success: true,
      message: `✅ HOÀN TẤT THÀNH CÔNG!\n- Đã tự động nhân bản & gán giá vốn (costPrice) cho ${updatedProductsCount} SKU Layout.\n- Đã đồng bộ ${newBomRows.length - 1} bản ghi BOM chuẩn vào BOM_Config.`
    };

  } catch (err) {
    return { success: false, message: '❌ Lỗi xử lý: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// RF_WORKSPACE_PRO - WEB PUSH NOTIFICATION BACKEND ENGINE
// ============================================================================

/**
 * 0. Khởi tạo bảng Push_Subscriptions trên Google Spreadsheet nếu chưa tồn tại
 */
function initPushSubscriptionsSheet() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = 'Push_Subscriptions';
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['id', 'user', 'subscription', 'userAgent', 'updatedAt']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#E2E8F0');
      Logger.log('✅ Đã khởi tạo thành công bảng Push_Subscriptions');
    } else {
      Logger.log('ℹ️ Bảng Push_Subscriptions đã tồn tại');
    }
    return sheet;
  } catch (e) {
    Logger.log('❌ Lỗi initPushSubscriptionsSheet: ' + e.toString());
    return null;
  } finally {
    lock.releaseLock();
  }
}

/**
 * 1. Lưu hoặc Cập nhật Push Subscription của nhân sự (Bảo vệ LockService)
 */
function saveUserPushSubscription(data) {
  if (!data || !data.user || !data.subscription) {
    return { success: false, message: 'Dữ liệu không hợp lệ' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = 'Push_Subscriptions';
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['id', 'user', 'subscription', 'userAgent', 'updatedAt']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#E2E8F0');
    }

    var values = sheet.getDataRange().getValues();
    var user = String(data.user).trim();
    var subscriptionStr = String(data.subscription).trim();
    var foundRow = -1;

    for (var i = 1; i < values.length; i++) {
      if (String(values[i][1]).trim() === user && String(values[i][2]).trim() === subscriptionStr) {
        foundRow = i + 1;
        break;
      }
    }

    var nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');

    if (foundRow > 0) {
      sheet.getRange(foundRow, 4).setValue(data.userAgent || '');
      sheet.getRange(foundRow, 5).setValue(nowStr);
    } else {
      var newId = 'SUB_' + Utilities.getUuid().substring(0, 8);
      sheet.appendRow([newId, user, subscriptionStr, data.userAgent || '', nowStr]);
    }

    return { success: true };
  } catch (e) {
    Logger.log('❌ Lỗi saveUserPushSubscription: ' + e.toString());
    return { success: false, error: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 2. Gửi thông báo đẩy Web Push tới nhân sự cụ thể hoặc ALL
 * @param {string} targetUserName Tên nhân sự hoặc "ALL"
 * @param {string} title Tiêu đề thông báo
 * @param {string} message Nội dung tóm tắt
 * @param {string} targetUrl Đường dẫn khi nhấp vào banner
 */
function sendPushNotificationToStaff(targetUserName, title, message, targetUrl) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var subSheet = ss.getSheetByName('Push_Subscriptions');
    if (!subSheet) {
      Logger.log('⚠️ Bảng Push_Subscriptions chưa có, đang tự động khởi tạo...');
      subSheet = initPushSubscriptionsSheet();
    }
    if (!subSheet) {
      return { success: false, message: 'Không thể khởi tạo bảng Push_Subscriptions' };
    }

    var data = subSheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: 'Chưa có đăng ký subscription nào' };

    var targetUser = String(targetUserName).trim();
    var subsToSend = [];

    for (var i = 1; i < data.length; i++) {
      var staffName = String(data[i][1]).trim();
      var rawSub = String(data[i][2]).trim();

      if ((targetUser === 'ALL' || staffName === targetUser) && rawSub) {
        try {
          subsToSend.push({
            staff: staffName,
            sub: JSON.parse(rawSub)
          });
        } catch (err) {
          Logger.log('Lỗi parse subscription dòng ' + (i + 1));
        }
      }
    }

    if (subsToSend.length === 0) {
      Logger.log('ℹ️ Không có token subscription nào khớp cho: ' + targetUser);
      return { success: false, count: 0 };
    }

    var RELAY_ENDPOINT = PropertiesService.getScriptProperties().getProperty('PUSH_RELAY_URL') || 'https://floral-poetry-4aadrf-push-relay.nicezin-98.workers.dev/';
    var AUTH_TOKEN = PropertiesService.getScriptProperties().getProperty('PUSH_AUTH_TOKEN') || 'RF_WORK_PRO_SECURE_TOKEN_2026';

    var sentCount = 0;
    subsToSend.forEach(function (item) {
      var payload = {
        title: title || 'Rich Fish Aquarium',
        body: message || '',
        url: targetUrl || '',
        tag: 'rf-alert-' + new Date().getTime()
      };

      var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + AUTH_TOKEN
        },
        payload: JSON.stringify({
          subscription: item.sub,
          payload: payload
        }),
        muteHttpExceptions: true
      };

      try {
        var response = UrlFetchApp.fetch(RELAY_ENDPOINT, options);
        if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
          sentCount++;
        }
      } catch (errReq) {
        Logger.log('❌ Lỗi UrlFetchApp Push tới [' + item.staff + ']: ' + errReq.toString());
      }
    });

    return { success: true, count: sentCount, total: subsToSend.length };
  } catch (e) {
    Logger.log('❌ Lỗi tổng quát sendPushNotificationToStaff: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * 3. Kích hoạt thông báo đẩy cảnh báo đơn trễ / tiến độ 19:30
 */
function triggerDailyPackSlaAlert() {
  var title = '🚨 CẢNH BÁO TIẾN ĐỘ 19:30';
  var message = 'Còn đơn hàng Shopee/TikTok cần đóng gói trước giờ xe lấy. Kiểm tra ngay!';
  var targetUrl = 'https://script.google.com/macros/s/exec?tab=packings';

  sendPushNotificationToStaff('Diệu Hương', title, message, targetUrl);
  sendPushNotificationToStaff('Nguyễn Hoàng Dương', title, message, targetUrl);
}

/**
 * 4. Hàm Test thử nghiệm bắn thông báo tức thì tới tất cả thiết bị đã đăng ký
 */
function testSendPushNotification() {
  var title = '🔔 TEST THÔNG BÁO RF WORKSPACE PRO';
  var message = 'Hệ thống thông báo đẩy 24/7 khi tắt app đã hoạt động thành công!';
  var result = sendPushNotificationToStaff('ALL', title, message, 'https://script.google.com/macros/s/exec');
  Logger.log('Kết quả test Web Push: ' + JSON.stringify(result));
  return result;
}

/**
 * =========================================================================
 * 🔍 HÀM PHÂN TÍCH TỶ LỆ LỖI SẢN XUẤT THEO THỢ (REWORK / KCS REJECT RATE)
 * =========================================================================
 */
function analyzeReworkRate(monthStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = ss.getSheetByName('Production');
  if (!prodSheet) {
    Logger.log('❌ Lỗi: Không tìm thấy sheet Production');
    return [];
  }

  var targetMonth = '';
  if (monthStr && typeof monthStr === 'string' && monthStr.trim() !== '') {
    targetMonth = monthStr.trim().slice(0, 7);
  } else {
    targetMonth = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM");
  }

  var data = prodSheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var deadlineCol = headers.indexOf('deadline');
  var fulfilledCol = headers.indexOf('fulfilledFromStock');
  var p1UserCol = headers.indexOf('p1_user');
  var p1StatusCol = headers.indexOf('p1_status');
  var p2UserCol = headers.indexOf('p2_user');
  var p2StatusCol = headers.indexOf('p2_status');
  var qcStatusCol = headers.indexOf('qc_status');

  if (deadlineCol === -1 || p1UserCol === -1 || p2UserCol === -1 || qcStatusCol === -1) {
    Logger.log('❌ Lỗi: Thiếu cột cốt lõi trong Schema bảng Production');
    return [];
  }

  var workerMap = {};

  function initWorker(userName) {
    if (!workerMap[userName]) {
      workerMap[userName] = { total: 0, fails: 0 };
    }
  }

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    var isFulfilledFromStock = String(row[fulfilledCol] || '').toUpperCase() === 'TRUE';
    if (isFulfilledFromStock) continue;

    var rawDeadline = row[deadlineCol];
    if (!rawDeadline) continue;

    var rowMonth = '';
    if (rawDeadline instanceof Date) {
      rowMonth = Utilities.formatDate(rawDeadline, "Asia/Ho_Chi_Minh", "yyyy-MM");
    } else {
      var d = new Date(rawDeadline);
      if (!isNaN(d.getTime())) {
        rowMonth = Utilities.formatDate(d, "Asia/Ho_Chi_Minh", "yyyy-MM");
      } else {
        rowMonth = String(rawDeadline).slice(0, 7);
      }
    }

    if (rowMonth !== targetMonth) continue;

    var qcStat = String(row[qcStatusCol] || '').toUpperCase().trim();
    var isQcFail = /FAIL|TỪ CHỐI|TU CHOI|REJECT/i.test(qcStat);

    var p1User = String(row[p1UserCol] || '').trim();
    var p1Status = String(row[p1StatusCol] || '').toUpperCase().trim();
    var isP1Done = (p1Status === 'DONE' || p1Status === 'ĐÃ XONG' || p1Status === 'HOÀN KHO ĐẠT');

    if (p1User && isP1Done) {
      initWorker(p1User);
      workerMap[p1User].total += 1;
      if (isQcFail) {
        workerMap[p1User].fails += 1;
      }
    }

    var p2User = String(row[p2UserCol] || '').trim();
    var p2Status = String(row[p2StatusCol] || '').toUpperCase().trim();
    var isP2Done = (p2Status === 'DONE' || p2Status === 'ĐÃ XONG' || p2Status === 'HOÀN KHO ĐẠT');

    if (p2User && isP2Done) {
      initWorker(p2User);
      workerMap[p2User].total += 1;
      if (isQcFail) {
        workerMap[p2User].fails += 1;
      }
    }
  }

  var results = [];
  Object.keys(workerMap).forEach(function (user) {
    var stats = workerMap[user];
    var errorRate = stats.total > 0 ? Number(((stats.fails / stats.total) * 100).toFixed(1)) : 0.0;

    results.push({
      user: user,
      total: stats.total,
      fails: stats.fails,
      errorRate: errorRate
    });
  });

  results.sort(function (a, b) {
    if (b.errorRate !== a.errorRate) {
      return b.errorRate - a.errorRate;
    }
    return b.fails - a.fails;
  });

  Logger.log('📊 [BÁO CÁO KCS SẢN XUẤT THÁNG ' + targetMonth + ']:\n' + JSON.stringify(results, null, 2));
  return results;
}

/**
 * =========================================================================
 * 🛡️ HÀM KIỂM ĐỊNH TỒN KHO TRƯỚC KHI HOÀN TẤT ĐÓNG GÓI
 * =========================================================================
 */
function validateInventoryBeforePacking(orderId) {
  if (!orderId) {
    return { success: false, errorType: 'INVALID_ORDER_ID', message: 'Thiếu mã đơn hàng' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var ordersSheet = ss.getSheetByName('Orders');
  if (!ordersSheet) {
    return { success: false, errorType: 'SHEET_NOT_FOUND', message: 'Không tìm thấy sheet Orders' };
  }

  var oData = ordersSheet.getDataRange().getValues();
  if (oData.length <= 1) {
    return { success: false, errorType: 'ORDER_NOT_FOUND', message: 'Sheet Orders rỗng' };
  }

  var oHeaders = oData[0];
  var oIdCol = oHeaders.indexOf('id');
  var oAccCol = oHeaders.indexOf('accessories');

  if (oIdCol === -1 || oAccCol === -1) {
    return { success: false, errorType: 'SCHEMA_ERROR', message: 'Thiếu cột id hoặc accessories trong sheet Orders' };
  }

  var targetOrder = null;
  for (var i = 1; i < oData.length; i++) {
    if (String(oData[i][oIdCol]).trim() === String(orderId).trim()) {
      targetOrder = {
        id: String(oData[i][oIdCol]).trim(),
        accessoriesRaw: oData[i][oAccCol]
      };
      break;
    }
  }

  if (!targetOrder) {
    return { success: false, errorType: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng với ID: ' + orderId };
  }

  var accessoriesList = [];
  try {
    if (typeof targetOrder.accessoriesRaw === 'string' && targetOrder.accessoriesRaw.trim() !== '') {
      accessoriesList = JSON.parse(targetOrder.accessoriesRaw);
    } else if (Array.isArray(targetOrder.accessoriesRaw)) {
      accessoriesList = targetOrder.accessoriesRaw;
    }
  } catch (e) {
    Logger.log('⚠️ Cảnh báo lỗi parse JSON accessories đơn ' + orderId + ': ' + e.message);
    accessoriesList = [];
  }

  var prodSheet = ss.getSheetByName('Production');
  var producedItemsMap = {};

  if (prodSheet) {
    var pData = prodSheet.getDataRange().getValues();
    if (pData.length > 1) {
      var pHeaders = pData[0];
      var pOrderIdCol = pHeaders.indexOf('orderId');
      var pNameCol = pHeaders.indexOf('name');
      var pFulfilledCol = pHeaders.indexOf('fulfilledFromStock');

      for (var p = 1; p < pData.length; p++) {
        var pRow = pData[p];
        var pOrdId = String(pRow[pOrderIdCol]).trim();
        var pName = String(pRow[pNameCol]).trim().toLowerCase();
        var isFulfilledFromStock = String(pRow[pFulfilledCol]).toUpperCase() === 'TRUE';

        if ((pOrdId === targetOrder.id || pOrdId.indexOf(targetOrder.id + '_') === 0) && !isFulfilledFromStock) {
          producedItemsMap[pName] = (producedItemsMap[pName] || 0) + 1;
        }
      }
    }
  }

  var requiredQtyMap = {};

  if (Array.isArray(accessoriesList)) {
    accessoriesList.forEach(function (item) {
      if (!item) return;
      var itemName = typeof item === 'string' ? item : (item.name || item.Name || '');
      var itemQty = typeof item === 'object' ? (Number(item.quantity || item.qty) || 1) : 1;
      var hasProdFlag = typeof item === 'object' && (item.hasProduction === true || item.hasProduction === 'true');
      var cleanName = String(itemName).trim().toLowerCase();

      if (!cleanName) return;

      if (producedItemsMap[cleanName] && producedItemsMap[cleanName] > 0) {
        var remainingAfterProd = Math.max(0, itemQty - producedItemsMap[cleanName]);
        producedItemsMap[cleanName] -= (itemQty - remainingAfterProd);
        if (remainingAfterProd > 0) {
          requiredQtyMap[cleanName] = (requiredQtyMap[cleanName] || 0) + remainingAfterProd;
        }
      } else if (!hasProdFlag) {
        requiredQtyMap[cleanName] = (requiredQtyMap[cleanName] || 0) + itemQty;
      }
    });
  }

  if (Object.keys(requiredQtyMap).length === 0) {
    return { success: true };
  }

  var productsSheet = ss.getSheetByName('Products');
  if (!productsSheet) {
    return { success: false, errorType: 'SHEET_NOT_FOUND', message: 'Không tìm thấy sheet Products' };
  }

  var prodData = productsSheet.getDataRange().getValues();
  if (prodData.length <= 1) {
    return { success: false, errorType: 'PRODUCTS_EMPTY', message: 'Sheet Products rỗng' };
  }

  var prHeaders = prodData[0];
  var prNameCol = prHeaders.indexOf('name');
  var prQtyCol = prHeaders.indexOf('quantity');
  var prMinStockCol = prHeaders.indexOf('minStock');

  if (prNameCol === -1 || prQtyCol === -1) {
    return { success: false, errorType: 'SCHEMA_ERROR', message: 'Thiếu cột name hoặc quantity trong sheet Products' };
  }

  var catalogMap = {};
  for (var k = 1; k < prodData.length; k++) {
    var rName = String(prodData[k][prNameCol]).trim();
    if (!rName) continue;

    var rQty = Number(prodData[k][prQtyCol]) || 0;
    var rMinStock = prMinStockCol !== -1 ? (Number(prodData[k][prMinStockCol]) || 0) : 0;

    catalogMap[rName.toLowerCase()] = {
      realName: rName,
      quantity: rQty,
      minStock: rMinStock
    };
  }

  var lowStockItems = [];

  Object.keys(requiredQtyMap).forEach(function (reqNameKey) {
    var neededQty = requiredQtyMap[reqNameKey];
    var productInStock = catalogMap[reqNameKey];

    if (productInStock) {
      var currentStock = productInStock.quantity;
      var minStock = productInStock.minStock;
      var afterDeductStock = currentStock - neededQty;

      if (afterDeductStock < 0 || afterDeductStock <= minStock || currentStock <= minStock) {
        lowStockItems.push(productInStock.realName + ' (Tồn: ' + currentStock + ', Cần: ' + neededQty + ', Min: ' + minStock + ')');
      }
    }
  });

  if (lowStockItems.length > 0) {
    return {
      success: false,
      errorType: 'LOW_STOCK',
      items: lowStockItems,
      message: 'Không đủ tồn kho an toàn để đóng gói đơn hàng ' + orderId
    };
  }

  return { success: true };
}

/**
 * =========================================================================
 * 💰 HÀM AUDIT DÒNG TIỀN & LỢI NHUẬN GỘP (FINANCIAL AUDIT)
 * Yêu cầu: Chạy tự động 23:00 hàng ngày
 * =========================================================================
 */
function auditMissingCashflowAndMargin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var transSheet = ss.getSheetByName('Transactions');
  if (!transSheet) {
    Logger.log('❌ Lỗi: Không tìm thấy sheet Transactions');
    return;
  }
  var tData = transSheet.getDataRange().getValues();
  var tHeaders = tData[0];
  var tTypeCol = tHeaders.indexOf('type');
  var tTitleCol = tHeaders.indexOf('title');
  var tNoteCol = tHeaders.indexOf('note');

  var allReceiptsText = "";
  for (var i = 1; i < tData.length; i++) {
    if (String(tData[i][tTypeCol]).trim() === 'Thu') {
      allReceiptsText += String(tData[i][tTitleCol] || '') + " " + String(tData[i][tNoteCol] || '') + " | ";
    }
  }

  var ordersSheet = ss.getSheetByName('Orders');
  if (!ordersSheet) return;
  var oData = ordersSheet.getDataRange().getValues();
  var oHeaders = oData[0];

  var col = {
    id: oHeaders.indexOf('id'),
    orderCode: oHeaders.indexOf('orderCode'),
    date: oHeaders.indexOf('date'),
    status: oHeaders.indexOf('status'),
    revenue: oHeaders.indexOf('revenue'),
    prePaid: oHeaders.indexOf('prePaid'),
    costTotal: oHeaders.indexOf('costTotal'),
    cogs: oHeaders.indexOf('cogs'),
    feeFixed: oHeaders.indexOf('feeFixed'),
    feeService: oHeaders.indexOf('feeService'),
    feePayment: oHeaders.indexOf('feePayment'),
    feeAffiliate: oHeaders.indexOf('feeAffiliate'),
    shopVoucher: oHeaders.indexOf('shopVoucher'),
    tax: oHeaders.indexOf('tax')
  };

  var thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  var negativeMarginOrders = [];
  var missingCodOrders = [];

  for (var r = 1; r < oData.length; r++) {
    var row = oData[r];
    var status = String(row[col.status]).toUpperCase().trim();

    if (status !== 'HOÀN THÀNH' && status !== 'ĐÃ BÀN GIAO' && status !== 'ĐỐI SOÁT THÀNH CÔNG') continue;

    var orderDate = new Date(row[col.date]);
    if (isNaN(orderDate.getTime()) || orderDate < thirtyDaysAgo) continue;

    var oId = String(row[col.id]).trim();
    var oCode = String(row[col.orderCode]).trim();
    var rev = Number(row[col.revenue]) || 0;
    var prePaid = Number(row[col.prePaid]) || 0;

    var cogs = Number(row[col.cogs]) || 0;
    var shippingFee = Number(row[col.costTotal]) || 0;
    var feeF = Number(row[col.feeFixed]) || 0;
    var feeS = Number(row[col.feeService]) || 0;
    var feeP = Number(row[col.feePayment]) || 0;
    var feeA = Number(row[col.feeAffiliate]) || 0;
    var voucher = Number(row[col.shopVoucher]) || 0;
    var tax = Number(row[col.tax]) || 0;

    var netProfit = rev - cogs - shippingFee - (feeF + feeS + feeP + feeA + voucher + tax);

    if (netProfit < 0) {
      negativeMarginOrders.push({
        id: oId,
        orderCode: oCode,
        revenue: rev,
        netProfit: netProfit,
        reason: 'Lợi nhuận gộp âm'
      });
    }

    var unpaidCod = rev - prePaid;
    if (unpaidCod > 0) {
      var isReceiptFound = allReceiptsText.indexOf(oId) > -1 || (oCode && allReceiptsText.indexOf(oCode) > -1);

      if (!isReceiptFound) {
        missingCodOrders.push({
          id: oId,
          orderCode: oCode,
          revenue: rev,
          prePaid: prePaid,
          unpaidCod: unpaidCod,
          reason: 'Chưa có phiếu Thu trong Transactions'
        });
      }
    }
  }

  if (negativeMarginOrders.length === 0 && missingCodOrders.length === 0) {
    Logger.log('✅ Audit hoàn tất. Không phát hiện rủi ro thất thoát.');
    return;
  }

  var reportData = {
    totalNegativeMargin: negativeMarginOrders.length,
    totalMissingCOD: missingCodOrders.length,
    negativeMarginOrders: negativeMarginOrders,
    missingCodOrders: missingCodOrders
  };

  var trackSheet = ss.getSheetByName('Tracking_Log');
  if (trackSheet) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);

      var newRow = [];
      var trackHeaders = trackSheet.getDataRange().getValues()[0];

      trackHeaders.forEach(function (header) {
        if (header === 'Thời gian') newRow.push(new Date());
        else if (header === 'Tên nhân sự') newRow.push('HỆ THỐNG KIỂM TOÁN TỰ ĐỘNG');
        else if (header === 'Hoàn thành') newRow.push(false);
        else if (header === 'Hỏi AI') newRow.push('Cảnh báo rủi ro tài chính & thất thoát dòng tiền (Audit)');
        else if (header === 'Ghi chú thêm') newRow.push(JSON.stringify(reportData, null, 2));
        else newRow.push('');
      });

      trackSheet.appendRow(newRow);
      SpreadsheetApp.flush();
    } catch (e) {
      Logger.log('❌ Lỗi ghi Tracking_Log: ' + e.message);
    } finally {
      lock.releaseLock();
    }
  }

  Logger.log('⚠️ Phát hiện rủi ro. Đã ghi log cảnh báo vào Tracking_Log');
}

function setupAuditTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'auditMissingCashflowAndMargin') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('auditMissingCashflowAndMargin')
    .timeBased()
    .everyDays(1)
    .atHour(23)
    .create();

  Logger.log('✅ Đã thiết lập CronJob auditMissingCashflowAndMargin thành công lúc 23:00 hàng ngày.');
}

/**
 * =========================================================================
 * ⏱️ HÀM ĐÁNH GIÁ HIỆU SUẤT & THỜI GIAN LÀM VIỆC THỰC TẾ CỦA THỢ
 * =========================================================================
 */
function calculateRealWorkingHours(dateStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var targetDate = '';
  if (dateStr && typeof dateStr === 'string' && dateStr.trim() !== '') {
    targetDate = dateStr.trim().slice(0, 10);
  } else {
    targetDate = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  }

  var attendanceMap = {};
  var workerActiveHours = {};
  var ghostWorkers = [];

  function getHoursDiff(start, end) {
    if (!start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) return 0;
    var s = new Date(start).getTime();
    var e = new Date(end).getTime();
    if (e <= s) return 0;
    return (e - s) / (1000 * 60 * 60);
  }

  function getDateString(d) {
    if (!d || isNaN(new Date(d).getTime())) return '';
    return Utilities.formatDate(new Date(d), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  }

  var attSheet = ss.getSheetByName('Attendance');
  if (attSheet) {
    var attData = attSheet.getDataRange().getValues();
    var attHeaders = attData[0];
    var aUserCol = attHeaders.indexOf('user');
    var aDateCol = attHeaders.indexOf('date');
    var aTimeInCol = attHeaders.indexOf('timeIn');
    var aTimeOutCol = attHeaders.indexOf('timeOut');
    var aTotalHrsCol = attHeaders.indexOf('totalHours');

    for (var i = 1; i < attData.length; i++) {
      var rDate = getDateString(attData[i][aDateCol]);
      if (rDate === targetDate) {
        var user = String(attData[i][aUserCol] || '').trim();
        if (user) {
          attendanceMap[user] = {
            timeIn: attData[i][aTimeInCol],
            timeOut: attData[i][aTimeOutCol],
            totalHours: Number(attData[i][aTotalHrsCol]) || 0
          };
          workerActiveHours[user] = 0;
        }
      }
    }
  }

  var prodSheet = ss.getSheetByName('Production');
  if (prodSheet) {
    var pData = prodSheet.getDataRange().getValues();
    var pHeaders = pData[0];

    var col = {
      p1User: pHeaders.indexOf('p1_user'),
      p1Status: pHeaders.indexOf('p1_status'),
      p1Start: pHeaders.indexOf('p1_start'),
      p1End: pHeaders.indexOf('p1_endTime'),
      p2User: pHeaders.indexOf('p2_user'),
      p2Status: pHeaders.indexOf('p2_status'),
      p2Start: pHeaders.indexOf('p2_start'),
      p2End: pHeaders.indexOf('p2_endTime')
    };

    for (var r = 1; r < pData.length; r++) {
      var row = pData[r];

      var p1User = String(row[col.p1User] || '').trim();
      var p1Stat = String(row[col.p1Status] || '').toUpperCase().trim();
      if (p1User && getDateString(row[col.p1End]) === targetDate) {
        var attP1 = attendanceMap[p1User];
        if (p1Stat === 'DONE' && (!attP1 || !attP1.timeIn || String(attP1.timeIn).trim() === '')) {
          if (ghostWorkers.indexOf(p1User) === -1) ghostWorkers.push(p1User);
        }
        workerActiveHours[p1User] = (workerActiveHours[p1User] || 0) + getHoursDiff(row[col.p1Start], row[col.p1End]);
      }

      var p2User = String(row[col.p2User] || '').trim();
      var p2Stat = String(row[col.p2Status] || '').toUpperCase().trim();
      if (p2User && getDateString(row[col.p2End]) === targetDate) {
        workerActiveHours[p2User] = (workerActiveHours[p2User] || 0) + getHoursDiff(row[col.p2Start], row[col.p2End]);
      }
    }
  }

  var packSheet = ss.getSheetByName('Packings');
  if (packSheet) {
    var pkData = packSheet.getDataRange().getValues();
    var pkHeaders = pkData[0];

    var pkUserCol = pkHeaders.indexOf('user');
    var pkStartCol = pkHeaders.indexOf('start');
    var pkEndCol = pkHeaders.indexOf('endTime');

    for (var k = 1; k < pkData.length; k++) {
      var pkUser = String(pkData[k][pkUserCol] || '').trim();
      if (pkUser && getDateString(pkData[k][pkEndCol]) === targetDate) {
        workerActiveHours[pkUser] = (workerActiveHours[pkUser] || 0) + getHoursDiff(pkData[k][pkStartCol], pkData[k][pkEndCol]);
      }
    }
  }

  var idleStats = [];

  Object.keys(attendanceMap).forEach(function (user) {
    var totalHrs = attendanceMap[user].totalHours;
    var activeHrs = workerActiveHours[user] || 0;

    var idleTime = totalHrs - activeHrs;
    if (idleTime < 0) idleTime = 0;

    var isLazyFlag = false;
    if (totalHrs > 0) {
      if ((idleTime / totalHrs) > 0.4) {
        isLazyFlag = true;
      }
    }

    idleStats.push({
      user: user,
      totalHours: Number(totalHrs.toFixed(2)),
      activeHours: Number(activeHrs.toFixed(2)),
      idleTime: Number(idleTime.toFixed(2)),
      isLazy: isLazyFlag
    });
  });

  idleStats.sort(function (a, b) {
    return b.idleTime - a.idleTime;
  });

  var resultObj = {
    ghostWorkers: ghostWorkers,
    idleStats: idleStats
  };

  Logger.log('📊 [ĐÁNH GIÁ HIỆU SUẤT NGÀY ' + targetDate + ']:\n' + JSON.stringify(resultObj, null, 2));
  return resultObj;
}

/**
 * =========================================================================
 * 💥 HÀM XỬ LÝ KHỦNG HOẢNG HÀNG VỠ/HỎNG (DAMAGE CONTROL)
 * Trigger từ giao diện khi QC hoặc thợ báo cáo vỡ hàng.
 * =========================================================================
 */
function processDamageControl(prodId, faultReason, penaltyUser) {
  if (!prodId) return { success: false, message: 'Thiếu Production ID' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);

    var prodSheet = ss.getSheetByName('Production');
    var productsSheet = ss.getSheetByName('Products');
    var ieSheet = ss.getSheetByName('ImportExport');
    var bpSheet = ss.getSheetByName('BonusPenalty');

    if (!prodSheet || !productsSheet || !ieSheet || !bpSheet) {
      return { success: false, message: 'Lỗi cấu trúc: Không tìm thấy một trong các sheet cần thiết.' };
    }

    var pData = prodSheet.getDataRange().getValues();
    var pHeaders = pData[0];
    var pIdCol = pHeaders.indexOf('id');
    var pOrderIdCol = pHeaders.indexOf('orderId');
    var pNameCol = pHeaders.indexOf('name');
    var pStatusCol = pHeaders.indexOf('status');

    var targetProdRowIndex = -1;
    var targetName = '';
    var targetOrderId = '';

    for (var i = 1; i < pData.length; i++) {
      if (String(pData[i][pIdCol]).trim() === String(prodId).trim()) {
        targetProdRowIndex = i + 1;
        targetName = String(pData[i][pNameCol]).trim();
        targetOrderId = String(pData[i][pOrderIdCol]).trim();
        break;
      }
    }

    if (targetProdRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy lệnh sản xuất ID: ' + prodId };
    }

    var prData = productsSheet.getDataRange().getValues();
    var prHeaders = prData[0];
    var prNameCol = prHeaders.indexOf('name');
    var prCostCol = prHeaders.indexOf('costPrice');
    var prQtyCol = prHeaders.indexOf('quantity');
    var prSkuCol = prHeaders.indexOf('sku');

    var targetProductsRowIndex = -1;
    var costPrice = 0;
    var currentQty = 0;
    var skuStr = '';

    if (targetName) {
      for (var j = 1; j < prData.length; j++) {
        if (String(prData[j][prNameCol]).trim().toLowerCase() === targetName.toLowerCase()) {
          targetProductsRowIndex = j + 1;
          costPrice = Number(prData[j][prCostCol]) || 0;
          currentQty = Number(prData[j][prQtyCol]) || 0;
          skuStr = String(prData[j][prSkuCol] || '');
          break;
        }
      }
    }

    if (targetProductsRowIndex !== -1) {
      var newQty = currentQty - 1;
      productsSheet.getRange(targetProductsRowIndex, prQtyCol + 1).setValue(newQty);
    }

    var today = new Date();
    var newIeId = 'IE_' + Utilities.getUuid().slice(0, 8).toUpperCase();
    var itemJson = JSON.stringify([{
      name: targetName,
      sku: skuStr,
      qty: 1,
      price: costPrice
    }]);

    var ieHeaders = ieSheet.getDataRange().getValues()[0];
    var ieNewRow = [];
    ieHeaders.forEach(function (header) {
      if (header === 'id') ieNewRow.push(newIeId);
      else if (header === 'type') ieNewRow.push('Xuất');
      else if (header === 'target') ieNewRow.push('Hủy Hàng');
      else if (header === 'totalAmount') ieNewRow.push(0);
      else if (header === 'date') ieNewRow.push(today);
      else if (header === 'note') ieNewRow.push('Xuất hủy vỡ do ' + (faultReason || 'Lỗi KCS'));
      else if (header === 'itemsData') ieNewRow.push(itemJson);
      else ieNewRow.push('');
    });
    ieSheet.appendRow(ieNewRow);

    if (penaltyUser) {
      var newBpId = 'BP_' + Utilities.getUuid().slice(0, 8).toUpperCase();
      var bpHeaders = bpSheet.getDataRange().getValues()[0];
      var bpNewRow = [];
      bpHeaders.forEach(function (header) {
        if (header === 'id') bpNewRow.push(newBpId);
        else if (header === 'user') bpNewRow.push(penaltyUser);
        else if (header === 'amount') bpNewRow.push(-costPrice);
        else if (header === 'type') bpNewRow.push('Phạt Vi Phạm');
        else if (header === 'note') bpNewRow.push('Đền bù hàng vỡ/hỏng: ' + targetName);
        else if (header === 'date') bpNewRow.push(today);
        else if (header === 'orderCode') bpNewRow.push(targetOrderId);
        else bpNewRow.push('');
      });
      bpSheet.appendRow(bpNewRow);
    }

    prodSheet.getRange(targetProdRowIndex, pStatusCol + 1).setValue('Hủy/Vỡ');

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Đã xử lý hủy hỏng: Trừ kho ' + targetName + ', tạo phiếu xuất và ghi phạt đền bù ' + penaltyUser
    };

  } catch (err) {
    Logger.log('❌ Lỗi processDamageControl: ' + err.toString());
    return { success: false, message: 'Lỗi hệ thống: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * 🏦 HÀM TỰ ĐỘNG CẤN TRỪ CÔNG NỢ NHÀ CUNG CẤP (SUPPLIER RECONCILIATION)
 * =========================================================================
 * @param {string} txId - ID của giao dịch chi tiền trong Transactions.
 * @param {Array<string>} importIdsArray - Mảng chứa các ID phiếu nhập (ImportExport).
 * @param {string} supplierName - Tên nhà cung cấp.
 * @return {Object} { success, message }
 */
function autoReconcileSupplierDebt(txId, importIdsArray, supplierName) {
  if (!txId || !importIdsArray || importIdsArray.length === 0 || !supplierName) {
    return { success: false, message: 'Thiếu dữ liệu đầu vào để đối soát.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);

    var transSheet = ss.getSheetByName('Transactions');
    var ieSheet = ss.getSheetByName('ImportExport');
    var supSheet = ss.getSheetByName('Suppliers');

    if (!transSheet || !ieSheet || !supSheet) {
      return { success: false, message: 'Lỗi cấu trúc: Không tìm thấy sheet Transactions, ImportExport hoặc Suppliers.' };
    }

    // 1. KIỂM TRA TRANSACTIONS
    var tData = transSheet.getDataRange().getValues();
    var tHeaders = tData[0];
    var tIdCol = tHeaders.indexOf('id');
    var tAmountCol = tHeaders.indexOf('amount');
    var tNoteCol = tHeaders.indexOf('note');

    var txRowIndex = -1;
    var txNoteVal = '';

    for (var i = 1; i < tData.length; i++) {
      if (String(tData[i][tIdCol]).trim() === String(txId).trim()) {
        txRowIndex = i + 1;
        txNoteVal = String(tData[i][tNoteCol] || '');
        break;
      }
    }

    if (txRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy mã giao dịch: ' + txId };
    }

    // 2. TÍNH TỔNG NỢ & CẬP NHẬT PHIẾU NHẬP (IMPORT/EXPORT)
    var ieData = ieSheet.getDataRange().getValues();
    var ieHeaders = ieData[0];
    var ieIdCol = ieHeaders.indexOf('id');
    var ieTypeCol = ieHeaders.indexOf('type');
    var ieTotalCol = ieHeaders.indexOf('totalAmount');
    var ieStatusCol = ieHeaders.indexOf('isPaid');
    var iePaidAtCol = ieHeaders.indexOf('paidAt');

    var totalImportAmount = 0;
    var matchedImportIds = 0;

    for (var j = 1; j < ieData.length; j++) {
      var rowId = String(ieData[j][ieIdCol]).trim();
      var rowType = String(ieData[j][ieTypeCol]).trim();

      if (rowType === 'Nhập' && importIdsArray.indexOf(rowId) !== -1) {
        totalImportAmount += (Number(ieData[j][ieTotalCol]) || 0);
        matchedImportIds++;

        if (ieStatusCol !== -1) ieSheet.getRange(j + 1, ieStatusCol + 1).setValue(true);
        if (iePaidAtCol !== -1) ieSheet.getRange(j + 1, iePaidAtCol + 1).setValue(new Date());
      }
    }

    if (matchedImportIds === 0) {
      return { success: false, message: 'Không tìm thấy phiếu nhập kho nào hợp lệ để đối soát.' };
    }

    // 3. CẬP NHẬT GHI CHÚ VÀO TRANSACTIONS
    var newTxNote = txNoteVal ? (txNoteVal + ' | [Đã đối soát công nợ: ' + supplierName + ']') : '[Đã đối soát công nợ: ' + supplierName + ']';
    transSheet.getRange(txRowIndex, tNoteCol + 1).setValue(newTxNote);

    // 4. TRỪ CÔNG NỢ NHÀ CUNG CẤP (SUPPLIERS)
    var sData = supSheet.getDataRange().getValues();
    var sHeaders = sData[0];
    var sNameCol = sHeaders.indexOf('name');
    var sDebtCol = sHeaders.indexOf('totalDebt');

    var supRowIndex = -1;
    var currentDebt = 0;

    for (var k = 1; k < sData.length; k++) {
      if (String(sData[k][sNameCol]).trim() === String(supplierName).trim()) {
        supRowIndex = k + 1;
        currentDebt = Number(sData[k][sDebtCol]) || 0;
        break;
      }
    }

    if (supRowIndex !== -1 && sDebtCol !== -1) {
      var newDebt = currentDebt - totalImportAmount;
      supSheet.getRange(supRowIndex, sDebtCol + 1).setValue(newDebt);
    }

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Đã đối soát thành công. Tổng nợ giảm: ' + totalImportAmount + 'đ cho ' + supplierName
    };

  } catch (err) {
    Logger.log('❌ Lỗi autoReconcileSupplierDebt: ' + err.toString());
    return { success: false, message: 'Lỗi hệ thống: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * 🚑 HÀM KHÔI PHỤC DỮ LIỆU BẢNG PRODUCTION BỊ MẤT/XOÁ
 * =========================================================================
 */
function recoverLostProduction() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    Logger.log('Hệ thống đang bận. Thử lại sau!');
    try { SpreadsheetApp.getUi().alert('Hệ thống đang bận. Thử lại sau!'); } catch (errUi) { }
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var pSheet = ss.getSheetByName('Production');
    if (!pSheet) return;

    var pData = pSheet.getDataRange().getValues();
    var pHeaders = pData[0];
    var pIdCol = pHeaders.indexOf('id');

    var activeMap = {};
    for (var j = 1; j < pData.length; j++) {
      var pId = String(pData[j][pIdCol]).trim();
      if (pId) activeMap[pId] = j;
    }

    var backupId = '1Fpbv32kw-EqJGeGOwNv6lPWtlfhGvCIkjlbyFskpU8E';
    var backupSs = SpreadsheetApp.openById(backupId);
    var bSheet = backupSs.getSheetByName('Production');
    if (!bSheet) {
      Logger.log('File Backup không có sheet Production!');
      try { SpreadsheetApp.getUi().alert('File Backup không có sheet Production!'); } catch (errUi) { }
      return;
    }

    var bData = bSheet.getDataRange().getValues();
    var bHeaders = bData[0];
    var bIdCol = bHeaders.indexOf('id');

    var restoredCount = 0;
    var appendedCount = 0;
    var newRowsToAppend = [];

    for (var i = 1; i < bData.length; i++) {
      var bId = String(bData[i][bIdCol]).trim();
      if (!bId) continue;

      if (activeMap[bId] !== undefined) {
        var activeRowIdx = activeMap[bId];
        var isModified = false;

        for (var col = 0; col < pHeaders.length; col++) {
          var headerName = pHeaders[col];
          var bColIdx = bHeaders.indexOf(headerName);
          if (bColIdx !== -1) {
            var activeVal = String(pData[activeRowIdx][col] || '').trim();
            var backupVal = String(bData[i][bColIdx] || '').trim();

            // Nếu ô bên file gốc bị trống/xoá, nhưng file backup có dữ liệu thì đắp lại
            if (activeVal === '' && backupVal !== '') {
              pData[activeRowIdx][col] = bData[i][bColIdx];
              isModified = true;
            }
          }
        }
        if (isModified) restoredCount++;
      } else {
        // Lệnh sản xuất bị xoá mất hoàn toàn -> Chèn lại
        var newRow = [];
        for (var col = 0; col < pHeaders.length; col++) {
          var headerName = pHeaders[col];
          var bColIdx = bHeaders.indexOf(headerName);
          if (bColIdx !== -1) {
            newRow.push(bData[i][bColIdx]);
          } else {
            newRow.push('');
          }
        }
        newRowsToAppend.push(newRow);
        appendedCount++;
      }
    }

    if (restoredCount > 0) {
      pSheet.getRange(1, 1, pData.length, pHeaders.length).setValues(pData);
    }
    if (newRowsToAppend.length > 0) {
      pSheet.getRange(pSheet.getLastRow() + 1, 1, newRowsToAppend.length, pHeaders.length).setValues(newRowsToAppend);
    }

    var msg = '✅ Đã khôi phục thành công Production!\n- Lấp đầy dữ liệu bị trống cho: ' + restoredCount + ' lệnh.\n- Khôi phục (chèn thêm) các lệnh bị xoá mất: ' + appendedCount + ' lệnh.';
    Logger.log(msg);
    try { SpreadsheetApp.getUi().alert(msg); } catch (errUi) { }

  } catch (err) {
    Logger.log('Lỗi khôi phục: ' + err.message);
    try { SpreadsheetApp.getUi().alert('Lỗi khôi phục: ' + err.message); } catch (errUi) { }
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * 🏷️ HÀM TỰ ĐỘNG TÍNH & CẬP NHẬT GIÁ BÁN CHO HÀNG HOÁ LAYOUT
 * - Chỉ áp dụng cho hàng hoá thuộc nhóm LAYOUT
 * - Tuyệt đối không can thiệp vào Bể Kính, Phụ Kiện
 * - Loại trừ các kích thước: 20x20x20cm, 30x20x20cm, 40x23x25cm
 * - Tự động dò cột theo Schema: category, sub_category, name, costPrice, price
 * - Áp dụng LockService chống xung đột ghi đè dữ liệu
 * - Làm tròn giá bán đến hàng nghìn (1,000 VND)
 * =========================================================================
 */
function updateSellingPriceForSpecificSizes() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    try {
      SpreadsheetApp.getUi().alert("⚠️ Hệ thống đang bận xử lý dữ liệu khác, vui lòng thử lại sau vài giây.");
    } catch (uiErr) {
      Logger.log("⚠️ Hệ thống đang bận: " + e.message);
    }
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Products";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      var notFoundMsg = "❌ Lỗi: Không tìm thấy sheet '" + sheetName + "'.";
      Logger.log(notFoundMsg);
      try { SpreadsheetApp.getUi().alert(notFoundMsg); } catch (uiErr) {}
      return;
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    if (values.length < 2) {
      var emptyMsg = "⚠️ Bảng 'Products' chưa có dữ liệu để tính toán.";
      Logger.log(emptyMsg);
      try { SpreadsheetApp.getUi().alert(emptyMsg); } catch (uiErr) {}
      return;
    }
    
    var headers = values[0].map(function(h) { return h.toString().trim(); });
    var nameColIdx = headers.indexOf("name");
    var costPriceColIdx = headers.indexOf("costPrice");
    var priceColIdx = headers.indexOf("price");
    var categoryColIdx = headers.indexOf("category");
    var subCategoryColIdx = headers.indexOf("sub_category");
    
    if (nameColIdx === -1 || costPriceColIdx === -1 || priceColIdx === -1) {
      var schemaErrMsg = "❌ Lỗi: Thiếu cột bắt buộc trong sheet Products!\n" +
        "- 'name' (tìm thấy: " + (nameColIdx !== -1) + ")\n" +
        "- 'costPrice' (tìm thấy: " + (costPriceColIdx !== -1) + ")\n" +
        "- 'price' (tìm thấy: " + (priceColIdx !== -1) + ")";
      Logger.log(schemaErrMsg);
      try { SpreadsheetApp.getUi().alert(schemaErrMsg); } catch (uiErr) {}
      return;
    }
    
    // Danh sách kích thước không áp dụng nhân giá tự động (chuẩn hóa không dấu, viết liền)
    var excludedSizePatterns = ["20x20x20", "30x20x20", "40x23x25"];
    var marginMultiplier = 1.5; 
    
    var updateCount = 0;
    var skippedExcludedCount = 0;
    var skippedNotLayoutCount = 0;
    var skippedNoCostCount = 0;
    
    for (var i = 1; i < values.length; i++) {
      var productName = values[i][nameColIdx] ? values[i][nameColIdx].toString() : "";
      var category = (categoryColIdx !== -1 && values[i][categoryColIdx]) ? values[i][categoryColIdx].toString() : "";
      var subCategory = (subCategoryColIdx !== -1 && values[i][subCategoryColIdx]) ? values[i][subCategoryColIdx].toString() : "";
      var rawCostPrice = values[i][costPriceColIdx];
      var costPrice = Number(rawCostPrice);
      
      var normName = productName.toUpperCase();
      var normCat = category.toUpperCase();
      var normSubCat = subCategory.toUpperCase();
      
      // 1. Kiểm tra có phải hàng hoá LAYOUT không
      var isLayout = normCat.indexOf("LAYOUT") > -1 || 
                     normSubCat.indexOf("LAYOUT") > -1 || 
                     normName.indexOf("LAYOUT") > -1;
      
      // 2. Kiểm tra có phải là Bể Kính hoặc Phụ Kiện không (nếu là bể kính/phụ kiện thì TUYỆT ĐỐI không sửa)
      var isTank = normCat.indexOf("BỂ KÍNH") > -1 || normCat.indexOf("BE KINH") > -1 || 
                   normSubCat.indexOf("BỂ KÍNH") > -1 || normSubCat.indexOf("BE KINH") > -1 ||
                   (normName.indexOf("BỂ KÍNH") > -1 && normCat.indexOf("LAYOUT") === -1) ||
                   (normName.indexOf("BE KINH") > -1 && normCat.indexOf("LAYOUT") === -1);
                   
      var isAccessory = normCat.indexOf("PHỤ KIỆN") > -1 || normCat.indexOf("PHU KIEN") > -1 ||
                        normCat.indexOf("ĐÈN") > -1 || normCat.indexOf("LỌC") > -1 || normCat.indexOf("VẬT LIỆU") > -1 ||
                        normSubCat.indexOf("PHỤ KIỆN") > -1 || normSubCat.indexOf("PHU KIEN") > -1;
      
      if (!isLayout || isTank || isAccessory) {
        skippedNotLayoutCount++;
        continue;
      }
      
      // 3. Kiểm tra xem tên sản phẩm có chứa kích thước nằm trong danh sách đen không
      var cleanNameNoSpace = productName.toLowerCase().replace(/\s+/g, "");
      var isExcludedSize = excludedSizePatterns.some(function(pattern) {
        return cleanNameNoSpace.indexOf(pattern) > -1;
      });
      
      if (isExcludedSize) {
        skippedExcludedCount++;
        continue;
      }
      
      // 4. Nếu có giá vốn hợp lệ > 0 thì cập nhật giá bán
      if (!isNaN(costPrice) && costPrice > 0) {
        var calculatedPrice = costPrice * marginMultiplier;
        var finalSellingPrice = Math.round(calculatedPrice / 1000) * 1000;
        values[i][priceColIdx] = finalSellingPrice;
        updateCount++;
      } else {
        skippedNoCostCount++;
      }
    }
    
    // 5. Ghi dữ liệu xuống Google Sheet
    if (updateCount > 0) {
      dataRange.setValues(values);
      var finishMsg = "✅ HOÀN TẤT CẬP NHẬT GIÁ BÁN LAYOUT!\n\n" +
        "• Đã cập nhật giá bán cho: " + updateCount + " sản phẩm LAYOUT.\n" +
        "• Bỏ qua (kích thước loại trừ 20x20x20, 30x20x20, 40x23x25): " + skippedExcludedCount + " sản phẩm.\n" +
        "• Bỏ qua (bể kính / phụ kiện / không phải layout): " + skippedNotLayoutCount + " sản phẩm.\n" +
        "• Bỏ qua (chưa có giá vốn/giá vốn = 0): " + skippedNoCostCount + " sản phẩm.";
      Logger.log(finishMsg);
      try { SpreadsheetApp.getUi().alert(finishMsg); } catch (uiErr) {}
    } else {
      var noMatchMsg = "⚠️ Không có sản phẩm LAYOUT nào thỏa mãn điều kiện để cập nhật giá.";
      Logger.log(noMatchMsg);
      try { SpreadsheetApp.getUi().alert(noMatchMsg); } catch (uiErr) {}
    }
    
  } catch (err) {
    var errMsg = "❌ Có lỗi xảy ra trong quá trình cập nhật: " + err.message;
    Logger.log(errMsg);
    try { SpreadsheetApp.getUi().alert(errMsg); } catch (uiErr) {}
  } finally {
    lock.releaseLock();
  }
}

/**
 * API CẬP NHẬT TRẠNG THÁI NGHỈ PHÉP / CHẤM CÔNG VÀ ĐỒNG BỘ PHẠT
 */
function api_updateLeaveStatus(attendanceId, newStatus, penaltyAmount, note) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.waitLock(15000)) return { success: false, message: 'Hệ thống bận.' };
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var attSheet = ss.getSheetByName('Attendance');
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (!attSheet) return { success: false, message: 'Không tìm thấy sheet Attendance.' };

    var attData = attSheet.getDataRange().getValues();
    var headers = attData[0];
    var idIdx = headers.indexOf('id');
    var userIdx = headers.indexOf('user');
    var dateIdx = headers.indexOf('date');
    var statusIdx = headers.indexOf('status');
    var penaltyIdx = headers.indexOf('penalty');
    var isEditedIdx = headers.indexOf('isEdited');
    var noteIdx = headers.indexOf('note');
    var leaveTypeIdx = headers.indexOf('leaveType');

    var targetRow = -1;
    var targetUser = '';
    var targetDate = '';

    for (var i = 1; i < attData.length; i++) {
      if (String(attData[i][idIdx]).trim() === String(attendanceId).trim()) {
        targetRow = i + 1;
        targetUser = String(attData[i][userIdx]).trim();
        targetDate = String(attData[i][dateIdx]).trim();
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, message: 'Không tìm thấy bản ghi chấm công.' };
    }

    var lType = newStatus.includes('có phép') ? 'Có phép' : (newStatus.includes('không phép') ? 'Không phép' : '');
    var penVal = Number(penaltyAmount) || 0;

    if (statusIdx > -1) attSheet.getRange(targetRow, statusIdx + 1).setValue(newStatus);
    if (penaltyIdx > -1) attSheet.getRange(targetRow, penaltyIdx + 1).setValue(penVal);
    if (isEditedIdx > -1) attSheet.getRange(targetRow, isEditedIdx + 1).setValue(true);
    if (leaveTypeIdx > -1) attSheet.getRange(targetRow, leaveTypeIdx + 1).setValue(lType);
    if (noteIdx > -1 && note !== undefined) attSheet.getRange(targetRow, noteIdx + 1).setValue(note);

    // Đồng bộ vào BonusPenalty nếu có phạt
    if (bpSheet) {
      var bpData = bpSheet.getDataRange().getValues();
      var bpH = bpData[0];
      var bpUserIdx = bpH.indexOf('user');
      var bpDateIdx = bpH.indexOf('date');
      var bpTypeIdx = bpH.indexOf('type');
      var bpAmtIdx = bpH.indexOf('amount');
      var bpNoteIdx = bpH.indexOf('note');

      var existingBpRow = -1;
      for (var b = 1; b < bpData.length; b++) {
        var bRow = bpData[b];
        if (
          String(bRow[bpUserIdx]).trim() === targetUser &&
          String(bRow[bpDateIdx]).trim().startsWith(targetDate.substring(0, 10)) &&
          String(bRow[bpTypeIdx]).includes('Phạt')
        ) {
          existingBpRow = b + 1;
          break;
        }
      }

      if (penVal > 0) {
        if (existingBpRow > -1) {
          if (bpAmtIdx > -1) bpSheet.getRange(existingBpRow, bpAmtIdx + 1).setValue(-Math.abs(penVal));
          if (bpNoteIdx > -1) bpSheet.getRange(existingBpRow, bpNoteIdx + 1).setValue(note || ('Phạt vi phạm ngày ' + targetDate));
        } else {
          var newBpId = 'BP_PEN_' + Date.now();
          bpSheet.appendRow([newBpId, targetUser, -Math.abs(penVal), 'Phạt Quy Định', note || ('Phạt vi phạm ngày ' + targetDate), targetDate, '']);
        }
      } else if (existingBpRow > -1 && penVal === 0) {
        bpSheet.deleteRow(existingBpRow);
      }
    }

    return { success: true, message: 'Đã cập nhật trạng thái lịch nghỉ thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}