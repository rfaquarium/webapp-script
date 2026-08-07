var SCHEMA = {
  Orders: ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'],
  Production: ['id', 'orderId', 'type', 'name', 'note', 'status', 'deadline', 'fulfilledFromStock', 'p1_name', 'p1_status', 'p1_user', 'p1_start', 'p1_endTime', 'p1_photo', 'p1_reward_vnd', 'p2_name', 'p2_status', 'p2_user', 'p2_start', 'p2_endTime', 'p2_photo', 'p2_reward_vnd', 'qc_front_photo', 'qc_side_photo', 'qc_status', 'qc_note'],
  Packings: ['id', 'orderId', 'user', 'start', 'end', 'endTime', 'status', 'photo', 'reward_vnd', 'photoBefore'],
  Attendance: ['id', 'user', 'date', 'morningIn', 'morningOut', 'afternoonIn', 'afternoonOut', 'leaveType', 'leaveReportAt', 'shift', 'timeIn', 'timeOut', 'totalHours', 'status', 'penalty', 'isEdited', 'leaveStart', 'leaveEnd', 'note'],
  Documents: ['id', 'category', 'title', 'description', 'link', 'createdAt', 'createdBy', 'attachments', 'testLink', 'readBy'],
  Trainings: ['id', 'title', 'content', 'targetRole', 'createdAt', 'createdBy', 'readUsers'],
  Models3D: ['id', 'name', 'url', 'productId', 'materials', 'createdAt', 'createdBy'],
  Reimbursements: ['id', 'staffName', 'reason', 'amount', 'qrCodeUrl', 'status', 'createdAt'],
  Monthly_Snapshots: ['id', 'month', 'user', 'totalSalary', 'totalHours', 'totalAdvance', 'totalDebt', 'createdAt', 'snapshotData']
};

var SCHEMA_ERP = {
  Products: ['id', 'sku', 'name', 'unit', 'image', 'category', 'sub_category', 'costPrice', 'price', 'quantity', 'minStock', 'maxStock', 'realImage', 'importUnit', 'conversionRate', 'model3D'],
  Accounts: ['id', 'accountName', 'balance'],
  Suppliers: ['id', 'name', 'phone', 'totalDebt', 'category', 'note'],
  Transactions: ['id', 'type', 'category', 'amount', 'fromAccount', 'toAccount', 'title', 'date', 'note', 'isAuto'],
  ImportExport: ['id', 'type', 'target', 'totalAmount', 'date', 'note', 'itemsData'],
  ProfitReports: ['id', 'period', 'channel', 'revenue', 'orderCount', 'platformFee', 'returns', 'discount', 'ads', 'cogs', 'salary', 'operation'],
  BonusPenalty: ['id', 'user', 'amount', 'type', 'note', 'date', 'orderCode'],
  KPI_Progress: ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide'],
  PurchasedServices: ['id', 'invoiceCode', 'supplier', 'taxCode', 'category', 'date', 'amount', 'payer', 'paymentMethod', 'note', 'expiryDate', 'createdAt', 'createdBy'],
  BOM_Config: ['id', 'layoutCode', 'materialSku', 'defaultQty', 'unit'],
  Monthly_Snapshots: ['id', 'month', 'user', 'totalSalary', 'totalHours', 'totalAdvance', 'totalDebt', 'createdAt', 'snapshotData']
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
        response.success = true;
        var deltaPayload = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
        response.data = syncDeltas(deltaPayload, pin);
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
  var content = HtmlService.createHtmlOutputFromFile(filename).getContent();
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

function processMaterialDeduction(prodId, materialUsageData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = ss.getSheetByName('Production');
  var prodData = prodSheet.getDataRange().getValues();
  var pHeaders = prodData[0];
  var prodRow = -1;
  var prodObj = {};
  for (var i = 1; i < prodData.length; i++) {
    if (String(prodData[i][pHeaders.indexOf('id')]) === String(prodId)) {
      prodRow = i + 1;
      for (var h = 0; h < pHeaders.length; h++) prodObj[pHeaders[h]] = prodData[i][h];
      break;
    }
  }
  if (prodRow === -1) return { success: false, message: 'Không tìm thấy lệnh sản xuất' };

  var bomSheet = ss.getSheetByName('BOM_Config');
  if (!bomSheet) return { success: false, message: 'Thiếu bảng BOM_Config' };
  var bomData = readSheet('BOM_Config', null, ss);

  var layoutCode = prodObj.name;
  var boms = bomData.filter(function (b) { return b.layoutCode === layoutCode; });

  var prodSheetErp = ss.getSheetByName('Products');
  var prodErpData = prodSheetErp.getDataRange().getValues();
  var pErpHeaders = prodErpData[0];
  var qtyCol = pErpHeaders.indexOf('quantity');
  var skuCol = pErpHeaders.indexOf('sku');

  var deductions = materialUsageData || {};
  if (Object.keys(deductions).length === 0) {
    boms.forEach(function (b) { deductions[b.materialSku] = Number(b.defaultQty); });
  }

  var logEntries = [];
  Object.keys(deductions).forEach(function (sku) {
    var qtyToDeduct = Number(deductions[sku]) || 0;
    if (qtyToDeduct <= 0) return;
    for (var j = 1; j < prodErpData.length; j++) {
      if (String(prodErpData[j][skuCol]) === sku) {
        var oldQty = Number(prodErpData[j][qtyCol]) || 0;
        prodSheetErp.getRange(j + 1, qtyCol + 1).setValue(oldQty - qtyToDeduct);
        logEntries.push({ name: sku, qty: qtyToDeduct, price: 0 });
        break;
      }
    }
  });

  var ieLogSheet = ss.getSheetByName('ImportExport');
  if (ieLogSheet && logEntries.length > 0) {
    var logId = 'IE_BOM_' + Date.now();
    var ieRow = SCHEMA_ERP.ImportExport.map(function (h) {
      if (h === 'id') return logId;
      if (h === 'type') return 'Xuất';
      if (h === 'target') return 'Sản Xuất Layout';
      if (h === 'date') return new Date().toISOString().slice(0, 19).replace('T', ' ');
      if (h === 'note') return 'Tự động trừ vật tư BOM cho đơn: ' + prodObj.orderId;
      if (h === 'itemsData') return JSON.stringify(logEntries);
      return '';
    });
    ieLogSheet.appendRow(ieRow);
  }

  return { success: true, message: 'Đã cấn trừ thành công vật tư BOM' };
}

function processQCApproval(prodId, approverName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Production');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('id');
  var statusCol = headers.indexOf('qc_status');
  var approverCol = headers.indexOf('qc_approved_by');
  if (idCol === -1 || statusCol === -1) return { success: false, message: 'Thiếu cột schema' };
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(prodId)) {
      sheet.getRange(i + 1, statusCol + 1).setValue('Passed');
      if (approverCol !== -1) sheet.getRange(i + 1, approverCol + 1).setValue(approverName);
      return { success: true, message: 'Đã duyệt QC' };
    }
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
    if (String(row[kpiNameCol]).indexOf('[PHAT_TRIEN]') !== 0) continue;

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
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  var totalMin = 0;
  var cur = new Date(start.getTime());
  while (cur < end) {
    var h = cur.getHours();
    var d = cur.getDay();
    if (d >= 1 && d <= 6 && h >= 8 && h < 17) {
      totalMin++;
    }
    cur.setMinutes(cur.getMinutes() + 1);
  }
  return totalMin;
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var snapSheet = ss.getSheetByName('Monthly_Snapshots');
  if (!snapSheet) {
    snapSheet = ss.insertSheet('Monthly_Snapshots');
    snapSheet.appendRow(SCHEMA_ERP.Monthly_Snapshots);
    snapSheet.setFrozenRows(1);
  }

  var snaps = readSheet('Monthly_Snapshots', function (s) { return s.month === monthStr; }, ss);
  if (snaps.length > 0) return { success: false, message: 'Tháng ' + monthStr + ' đã được khóa sổ.' };

  var prodData = readSheet('Production', function (p) { return (p.p1_endTime && p.p1_endTime.indexOf(monthStr) === 0) || (p.p2_endTime && p.p2_endTime.indexOf(monthStr) === 0); }, ss);
  var packData = readSheet('Packings', function (p) { return p.endTime && p.endTime.indexOf(monthStr) === 0; }, ss);
  var attData = readSheet('Attendance', function (a) { return a.date && a.date.indexOf(monthStr) === 0; }, ss);
  var bpData = readSheet('BonusPenalty', function (b) { return b.date && b.date.indexOf(monthStr) === 0; }, ss);

  // Lấy nợ từ tháng trước
  var prevMonth = new Date(monthStr + '-01');
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  var prevMonthStr = prevMonth.getFullYear() + '-' + ('0' + (prevMonth.getMonth() + 1)).slice(-2);
  var prevSnaps = readSheet('Monthly_Snapshots', function (s) { return s.month === prevMonthStr; }, ss);

  var users = {};
  function getUser(u) {
    if (!u) return null;
    if (!users[u]) users[u] = { totalSalary: 0, totalHours: 0, totalAdvance: 0, totalDebt: 0, penalty: 0 };
    return users[u];
  }

  prevSnaps.forEach(function (s) {
    var u = getUser(s.user);
    if (u) u.penalty += Number(s.totalDebt) || 0; // Nợ tháng trước chuyển thành khoản phải trừ tháng này
  });

  prodData.forEach(function (p) {
    if (p.p1_endTime && p.p1_endTime.indexOf(monthStr) === 0) {
      var u = getUser(p.p1_user); if (u) u.totalSalary += Number(p.p1_reward_vnd) || 0;
    }
    if (p.p2_endTime && p.p2_endTime.indexOf(monthStr) === 0) {
      var u = getUser(p.p2_user); if (u) u.totalSalary += Number(p.p2_reward_vnd) || 0;
    }
  });
  packData.forEach(function (p) {
    var u = getUser(p.user); if (u) u.totalSalary += Number(p.reward_vnd) || 0;
  });
  attData.forEach(function (a) {
    var u = getUser(a.user);
    if (u) {
      u.totalHours += Number(a.totalHours) || 0;
      u.penalty += Number(a.penalty) || 0;
    }
  });
  bpData.forEach(function (b) {
    var u = getUser(b.user);
    if (u) {
      if (b.type === 'Tạm Ứng') u.totalAdvance += Number(b.amount) || 0;
      else if (b.type === 'Phạt Quy Định' || b.type === 'Phạt') u.penalty += Number(b.amount) || 0;
      else if (b.type === 'Thưởng') u.totalSalary += Number(b.amount) || 0;
    }
  });

  var newRows = [];
  var createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  Object.keys(users).forEach(function (u) {
    var data = users[u];
    var netPay = data.totalSalary - data.totalAdvance - data.penalty;
    var debt = 0;
    if (netPay < 0) {
      debt = Math.abs(netPay);
      netPay = 0; // Thực lĩnh = 0 nếu âm
    }
    data.totalDebt = debt;

    var row = SCHEMA_ERP.Monthly_Snapshots.map(function (h) {
      if (h === 'id') return 'SNAP_' + monthStr + '_' + u + '_' + Date.now();
      if (h === 'month') return monthStr;
      if (h === 'user') return u;
      if (h === 'totalSalary') return data.totalSalary;
      if (h === 'totalHours') return data.totalHours;
      if (h === 'totalAdvance') return data.totalAdvance;
      if (h === 'totalDebt') return debt;
      if (h === 'createdAt') return createdAt;
      if (h === 'snapshotData') return JSON.stringify(data);
      return '';
    });
    newRows.push(row);
  });

  if (newRows.length > 0) {
    var range = snapSheet.getRange(snapSheet.getLastRow() + 1, 1, newRows.length, SCHEMA_ERP.Monthly_Snapshots.length);
    range.setValues(newRows);
  }

  return { success: true, message: 'Đã khóa sổ tháng ' + monthStr + ' thành công!' };
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
      bomSheet.setFrozenRows(1);
    }
    // 1. TẠO MỐC THỜI GIAN CẮT DỮ LIỆU (MẶC ĐỊNH LÀ NGÀY 1 THÁNG TRƯỚC) CHO HR & ERP
    var today = new Date();
    var cutoffDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    var cutoffStr = Utilities.formatDate(cutoffDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

    // 2. LỌC ĐƠN HÀNG: CHỈ LẤY CÁC ĐƠN ĐANG VẬN HÀNH VÀ CÁC ĐƠN ĐÃ ĐÓNG TỪ THÁNG TRƯỚC
    var orderIds = {};
    var orders = readSheet('Orders', function (o) {
      if (!o.status) return true;
      var s = String(o.status).toUpperCase().trim();
      var isTerminal = (s === 'ĐÃ BÀN GIAO' || s === 'ĐÃ GIAO' || s === 'HOÀN THÀNH' || s === 'ĐÃ HỦY' || s === 'ĐƠN HUỶ' || s === 'ĐỐI SOÁT THÀNH CÔNG' || s === 'HÀNG HOÀN' || s === 'CANCELLED');
      if (!isTerminal) return true; // Đang vận hành thì luôn lấy
      // Nếu đã đóng, giữ lại các đơn từ tháng trước (theo cutoffDate) để có data cho bộ lọc Tháng Này/Tháng Trước
      var dateToCheck = o.reconciledAt || o.createdAt || o.date;
      if (dateToCheck) {
        var d = new Date(dateToCheck);
        if (!isNaN(d.getTime()) && d >= cutoffDate) return true;
      }
      return false;
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
      if (String(data[i][0]) === String(item.id)) {

        var newRow = headers.map(function (h, colIdx) {
          if (sheetName === 'Products' && h === 'quantity' && item._diff !== undefined) {
            var currentQtyVal = Number(data[i][colIdx]);
            if (isNaN(currentQtyVal)) currentQtyVal = 0;
            var diffVal = Number(item._diff);
            if (isNaN(diffVal)) diffVal = 0;
            return currentQtyVal + diffVal;
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
            return newVal !== undefined ? newVal : '';
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
  for (var i = data.length - 1; i >= 1; i--) { if (itemIds.indexOf(String(data[i][0])) !== -1) sheet.deleteRow(i + 1); }
}

function formatOrder(o) { return { "id": o.id, "orderCode": o.orderCode || '', "channel": o.channel || '', "customer": o.customer || '', "phone": o.phone || '', "address": o.address || '', "note": o.note || '', "createdAt": o.createdAt || '', "deadline": o.deadline || '', "date": o.date || '', "status": o.status || '', "accessories": typeof o.accessories === 'string' ? o.accessories : JSON.stringify(o.accessories || []), "hasProduction": o.hasProduction || false, "isCarriedToWH": o.isCarriedToWH || '', "updatedBy": o.updatedBy || '', "revenue": o.revenue || 0, "prePaid": o.prePaid || 0, "cod": o.cod || 0, "costTotal": o.costTotal || 0, "responsibleUser": o.responsibleUser || '', "discount": o.discount || 0, "shippingMethod": o.shippingMethod || ((String(o.channel).includes('Bán Lẻ') || String(o.channel).includes('Cộng Tác Viên')) ? 'Gửi GHN' : ''), "sizeCoefficient": Number(o.sizeCoefficient || 1), "cogs": Number(o.cogs || 0), "feeFixed": Number(o.feeFixed || 0), "feeService": Number(o.feeService || 0), "feePayment": Number(o.feePayment || 0), "feeAffiliate": Number(o.feeAffiliate || 0), "shopVoucher": Number(o.shopVoucher || 0), "tax": Number(o.tax || 0), "reconciledAt": o.reconciledAt || '', "isReconciled": o.isReconciled || '' }; }
function formatProd(p) { var ph1 = (p.phases && p.phases.phase1) ? p.phases.phase1 : {}; var ph2 = (p.phases && p.phases.phase2) ? p.phases.phase2 : {}; return { "id": p.id, "orderId": p.orderId, "type": p.type || '', "name": p.name || '', "note": p.note || '', "status": p.status || '', "deadline": p.deadline || '', "fulfilledFromStock": p.fulfilledFromStock || false, "p1_name": ph1.name || '', "p1_status": ph1.status || '', "p1_user": ph1.user || '', "p1_start": ph1.start || '', "p1_endTime": ph1.endTime || '', "p1_photo": ph1.photo || '', "p1_reward_vnd": ph1.reward_vnd || 0, "p2_name": ph2.name || '', "p2_status": ph2.status || '', "p2_user": ph2.user || '', "p2_start": ph2.start || '', "p2_endTime": ph2.endTime || '', "p2_photo": ph2.photo || '', "p2_reward_vnd": ph2.reward_vnd || 0, "qc_front_photo": p.qc_front_photo || '', "qc_side_photo": p.qc_side_photo || '', "qc_status": p.qc_status || '', "qc_note": p.qc_note || '' }; }
function formatPacking(p) { return { "id": p.id, "orderId": p.orderId, "user": p.user || '', "start": p.start || '', "end": p.end || '', "endTime": p.endTime || '', "status": p.status || '', "photo": p.photo || '', "photoBefore": p.photoBefore || '', "reward_vnd": p.reward_vnd || 0 }; }
function formatAtt(a) {
  return {
    "id": a.id, "user": a.user || '', "date": a.date || '',
    "morningIn": a.morningIn || '', "morningOut": a.morningOut || '',
    "afternoonIn": a.afternoonIn || '', "afternoonOut": a.afternoonOut || '',
    "leaveType": a.leaveType || '', "leaveReportAt": a.leaveReportAt || '',
    "shift": a.shift || '', "timeIn": a.timeIn || '', "timeOut": a.timeOut || '',
    "totalHours": a.totalHours || 0, "status": a.status || '', "penalty": a.penalty || 0,
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

function formatAccount(a) { return { "id": a.id, "accountName": a.accountName || '', "balance": a.balance || 0 }; }
function formatSupplier(s) { return { "id": s.id, "name": s.name || '', "phone": s.phone || '', "totalDebt": s.totalDebt || 0, "category": s.category || '', "note": s.note || '' }; }
function formatTransaction(t) { return { "id": t.id, "type": t.type || '', "category": t.category || '', "amount": t.amount || 0, "fromAccount": t.fromAccount || '', "toAccount": t.toAccount || '', "title": t.title || '', "date": t.date || '', "note": t.note || '', "isAuto": t.isAuto || '' }; }
function formatImportExport(i) { return { "id": i.id, "type": i.type || '', "target": i.target || '', "totalAmount": i.totalAmount || 0, "date": i.date || '', "note": i.note || '', "itemsData": i.itemsData || '' }; }
function formatDocument(d) { return { "id": d.id, "category": d.category || 'Khác', "title": d.title || '', "description": d.description || '', "link": d.link || '', "createdAt": d.createdAt || new Date().toISOString(), "createdBy": d.createdBy || '', "attachments": typeof d.attachments === 'string' ? d.attachments : JSON.stringify(d.attachments || []), "testLink": d.testLink || '', "readBy": typeof d.readBy === 'string' ? d.readBy : JSON.stringify(d.readBy || []) }; }
function formatTraining(t) { return { "id": t.id, "title": t.title || '', "content": t.content || '', "targetRole": t.targetRole || 'ALL', "createdAt": t.createdAt || new Date().toISOString(), "createdBy": t.createdBy || '', "readUsers": typeof t.readUsers === 'string' ? t.readUsers : JSON.stringify(t.readUsers || []) }; }
function formatProfitReport(r) { return { "id": r.id, "period": r.period || '', "channel": r.channel || '', "revenue": r.revenue || 0, "orderCount": r.orderCount || 0, "platformFee": r.platformFee || 0, "returns": r.returns || 0, "discount": r.discount || 0, "ads": r.ads || 0, "cogs": r.cogs || 0, "salary": r.salary || 0, "operation": r.operation || 0 }; }
function formatBonusPenalty(b) { return { "id": b.id, "user": b.user || '', "amount": b.amount || 0, "type": b.type || '', "note": b.note || '', "date": b.date || '', "orderCode": b.orderCode || '' }; }
function formatKPIProg(k) { return { "id": k.id, "user": k.user || '', "kpiName": k.kpiName || '', "current": k.current || 0, "target": k.target || 0, "unit": k.unit || '', "lastUpdated": k.lastUpdated || '', "startTime": k.startTime || '', "endTime": k.endTime || '', "reward": k.reward || 0, "isClaimed": k.isClaimed || false }; }
function formatReimbursement(r) { return { "id": r.id, "staffName": r.staffName || '', "reason": r.reason || '', "amount": r.amount || 0, "qrCodeUrl": r.qrCodeUrl || '', "status": r.status || '', "createdAt": r.createdAt || new Date().toISOString() }; }

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

      var newReplenishOrders = [];
      var newReplenishProds = [];
      var stockUpdates = {}; // { rowIndex: { qty: newQty, col: qtyColIndex + 1 } }

      // A. XỬ LÝ KHI BƠM ĐƠN / THÊM ĐƠN HÀNG MỚI
      // Xây dựng map Lệnh Sản Xuất và Đơn Hàng hiện tại để phục vụ Cướp Lệnh (Auto-link)
      var existingProdMap = {};
      if (prodSheet) {
        var pVals = prodSheet.getDataRange().getValues();
        var pHead = pVals[0];
        var pIdCol = pHead.indexOf('id');
        var pOrderIdCol = pHead.indexOf('orderId');
        var pNameCol = pHead.indexOf('name');
        var pStatusCol = pHead.indexOf('status');
        for (var pi = 1; pi < pVals.length; pi++) {
          existingProdMap[String(pVals[pi][pIdCol])] = {
            id: pVals[pi][pIdCol],
            orderId: pVals[pi][pOrderIdCol],
            name: pVals[pi][pNameCol],
            status: pVals[pi][pStatusCol]
          };
        }
      }
      var existingOrderMap = {};
      var oSheetToRead = ss.getSheetByName('Orders');
      if (oSheetToRead) {
        var oVals = oSheetToRead.getDataRange().getValues();
        var oHead = oVals[0];
        var oIdCol = oHead.indexOf('id');
        var oChanCol = oHead.indexOf('channel');
        for (var oi = 1; oi < oVals.length; oi++) {
          existingOrderMap[String(oVals[oi][oIdCol])] = {
            id: oVals[oi][oIdCol],
            channel: oVals[oi][oChanCol]
          };
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
                // Tồn kho hiện tại (chỉ dùng để tính toán luồng, KHÔNG trừ trực tiếp vào kho)
                var currentQty = stockUpdates[pInfo.rowIndex] !== undefined ? stockUpdates[pInfo.rowIndex].qty : pInfo.qty;
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
                  payload.productions = payload.productions || [];
                  payload.productions.push({
                    id: hijackedProdId,
                    orderId: orderObj.id, // Gắn sang đơn mới
                    note: 'Được chuyển từ lệnh Tồn kho sang đơn khách'
                  });

                  // Đơn khách chờ sản xuất
                  if (payload.orders) {
                    for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                      if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                        payload.orders[oIdx].status = 'Chờ Sản Xuất';
                        break;
                      }
                    }
                  } else {
                    var oSheetToUpdate = ss.getSheetByName('Orders');
                    if (oSheetToUpdate) {
                      var ovv = oSheetToUpdate.getDataRange().getValues();
                      var stCol = ovv[0].indexOf('status');
                      for (var k = 1; k < ovv.length; k++) {
                        if (String(ovv[k][0]) === String(pItem.orderId)) { oSheetToUpdate.getRange(k + 1, stCol + 1).setValue('Chờ Sản Xuất'); break; }
                      }
                    }
                  }

                  // Hủy pItem mới (không tạo thêm lệnh mới)
                  pItem._skipInsert = true;

                } else {
                  // 2. KHÔNG CƯỚP ĐƯỢC -> XỬ LÝ THEO TỒN KHO
                  if (currentQty <= 0) {
                    // KHO = 0: Tạo lệnh sản xuất bình thường
                    pItem.fulfilledFromStock = false;
                    if (payload.orders) {
                      for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                        if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                          payload.orders[oIdx].status = 'Chờ Sản Xuất';
                          break;
                        }
                      }
                    } else {
                      var oSheetToUpdate2 = ss.getSheetByName('Orders');
                      if (oSheetToUpdate2) {
                        var ovv2 = oSheetToUpdate2.getDataRange().getValues();
                        var stCol2 = ovv2[0].indexOf('status');
                        for (var k2 = 1; k2 < ovv2.length; k2++) {
                          if (String(ovv2[k2][0]) === String(pItem.orderId)) { oSheetToUpdate2.getRange(k2 + 1, stCol2 + 1).setValue('Chờ Sản Xuất'); break; }
                        }
                      }
                    }
                  } else {
                    // KHO > 0: Chuyển SẴN SÀNG ĐÓNG GÓI, KHÔNG TRỪ KHO BÂY GIỜ, không tạo lệnh sx cho đơn này
                    pItem._skipInsert = true;

                    if (payload.orders) {
                      for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                        if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                          payload.orders[oIdx].status = 'Sẵn sàng đóng gói';
                          break;
                        }
                      }
                    } else {
                      var oSheetToUpdate3 = ss.getSheetByName('Orders');
                      if (oSheetToUpdate3) {
                        var ovv3 = oSheetToUpdate3.getDataRange().getValues();
                        var stCol3 = ovv3[0].indexOf('status');
                        for (var k3 = 1; k3 < ovv3.length; k3++) {
                          if (String(ovv3[k3][0]) === String(pItem.orderId)) { oSheetToUpdate3.getRange(k3 + 1, stCol3 + 1).setValue('Sẵn sàng đóng gói'); break; }
                        }
                      }
                    }

                    // Giảm biến ảo để tính cho đơn tiếp theo trong cùng payload
                    currentQty--;
                    stockUpdates[pInfo.rowIndex] = { qty: currentQty, col: pInfo.qtyColIndex + 1 };

                    // Tạo lệnh bù kho (nếu kho tụt xuống <= Min + 1, nghĩa là lấy xong kho còn <= Min)
                    // (Theo user: sau khi sản xuất xong, kho phải lớn hơn min 1 đơn vị -> tạo min - Q + 2 lệnh)
                    if (currentQty <= minStock) {
                      var ticketsToCreate = minStock - currentQty + 1;
                      for (var i = 0; i < ticketsToCreate; i++) {
                        var repOrderId = 'OR_REPL_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + i;
                        var repProdId = 'PR_REPL_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + i;
                        newReplenishOrders.push({
                          id: repOrderId,
                          orderCode: 'TK' + Date.now().toString().slice(-8) + i,
                          channel: 'Sản Xuất Tồn',
                          customer: 'Kho Tồn',
                          createdAt: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss"),
                          date: new Date().toISOString().split('T')[0],
                          status: 'Đang sản xuất',
                          hasProduction: true
                        });
                        var isRepGlass = (String(pItem.type || '').toUpperCase() === 'BỂ KÍNH');
                        var repPhases = isRepGlass ?
                          { phase1: { name: 'Cắt Dán', status: 'Pending' }, phase2: { name: 'Gọt Keo', status: 'Pending' } } :
                          { phase1: { name: 'Dựng Khung', status: 'Pending' }, phase2: { name: 'Gia Cố', status: 'Pending' } };

                        newReplenishProds.push({
                          id: repProdId,
                          orderId: repOrderId,
                          name: pItem.name,
                          type: pItem.type || 'Layout',
                          status: 'Đang làm',
                          fulfilledFromStock: false,
                          phases: repPhases,
                          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16)
                        });
                      }
                    }
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

      // Đưa các đơn bù kho mới tạo vào payload
      if (newReplenishOrders.length > 0) {
        if (!payload.orders) payload.orders = [];
        payload.orders = payload.orders.concat(newReplenishOrders);
      }
      if (newReplenishProds.length > 0) {
        payload.prodItems = payload.prodItems.concat(newReplenishProds);
      }

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
            var isNewDone = String(newP.status || '').toUpperCase() === 'DONE';
            if (isNewDone) {
              // Tìm trạng thái cũ từ sheet để chỉ xử lý khi trạng thái chuyển từ Chưa Xong sang Xong
              var oldP = null;
              for (var rIdx = 1; rIdx < pData.length; rIdx++) {
                if (String(pData[rIdx][pIdCol]) === String(newP.id)) {
                  oldP = {
                    status: String(pData[rIdx][pStatusCol] || ''),
                    orderId: String(pData[rIdx][pOrderIdCol] || ''),
                    fulfilledFromStock: String(pData[rIdx][pFulfilledCol]).toUpperCase() === 'TRUE'
                  };
                  break;
                }
              }

              var wasAlreadyDone = oldP && oldP.status.toUpperCase() === 'DONE';
              var isFulfilledFromStock = (newP.fulfilledFromStock === true || String(newP.fulfilledFromStock).toUpperCase() === 'TRUE') || (oldP && oldP.fulfilledFromStock);
              if (!wasAlreadyDone && !isFulfilledFromStock) {
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
                if (pProductsSheet) {
                  pProductsSheet.getRange(pInfo.rowIndex, pInfo.qtyColIndex + 1).setValue(pInfo.qty + 1);
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
                          oData[oR][oStatusCol] = 'Sẵn sàng đóng gói';
                          ordersModified = true;
                          break;
                        }
                      }
                    }
                  } else {
                    // Lệnh sản xuất trực tiếp của đơn xong -> chuyển trạng thái đơn hàng
                    if (orderRowIndex !== -1) {
                      ordersSheet.getRange(orderRowIndex, oStatusCol + 1).setValue('Sẵn sàng đóng gói');
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

      var ordersToHandover = [];
      payload.orders.forEach(function (incomingOrder) {
        var isTargetHandover = String(incomingOrder.status || '').toUpperCase().trim() === 'ĐÃ BÀN GIAO';
        if (isTargetHandover && oIdColIdx !== -1 && oStatusColIdx !== -1) {
          var oldStatus = '';
          for (var r = 1; r < oldOrdersData.length; r++) {
            if (String(oldOrdersData[r][oIdColIdx]) === String(incomingOrder.id)) {
              oldStatus = String(oldOrdersData[r][oStatusColIdx]).toUpperCase().trim();
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
      var prodSheet = ss.getSheetByName('Production');
      var prodData = prodSheet ? prodSheet.getDataRange().getValues() : [];
      var prodIdCol = prodData.length > 0 ? prodData[0].indexOf('id') : -1;
      var existingProdIds = {};
      if (prodIdCol !== -1) {
        for (var i = 1; i < prodData.length; i++) {
          existingProdIds[String(prodData[i][prodIdCol])] = true;
        }
      }

      var finalProdItems = [];
      for (var i = 0; i < payload.prodItems.length; i++) {
        var pItem = payload.prodItems[i];
        var isNew = !existingProdIds[String(pItem.id)];

        if (isNew && pItem.type === 'Bể Kính' && (pItem.status === 'Pending' || pItem.status === 'Chờ sản xuất' || !pItem.status)) {
          processSmartGlassTankDispatch(ss, pItem);
        } else {
          finalProdItems.push(pItem);
        }
      }
      if (finalProdItems.length > 0) applyDeltasToSheet('Production', finalProdItems, formatProd, ss);
    }
    if (payload.packings && payload.packings.length > 0) applyDeltasToSheet('Packings', payload.packings, formatPacking, ss);
    if (payload.attendance && payload.attendance.length > 0) applyDeltasToSheet('Attendance', payload.attendance, formatAtt, ss);
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
    if (payload.BonusPenalty && payload.BonusPenalty.length > 0) applyDeltasToSheet('BonusPenalty', payload.BonusPenalty, formatBonusPenalty, ss);
    if (payload.KPI_Progress && payload.KPI_Progress.length > 0) applyDeltasToSheet('KPI_Progress', payload.KPI_Progress, formatKPIProg, ss);
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
        'Models3D': 'Models3D'
      };
      Object.keys(payload.deletes).forEach(function (clientKey) {
        var sName = keyMapping[clientKey] || clientKey;
        if (SCHEMA[sName] || SCHEMA_ERP[sName]) {
          deleteDeltas(sName, payload.deletes[clientKey], ss);
        }
      });
    }
    // 7. Tự động bốc kho tồn cho đơn hàng chờ
    try {
      // autoAllocateStockFromServer(ss); // Đã bị vô hiệu hóa, sử dụng logic mới ở Bơm Đơn
    } catch (allocErr) {
      console.error("Lỗi khi chạy tự động bốc kho:", allocErr);
    }
    SpreadsheetApp.flush();
    props.setProperty('RF_LAST_UPDATED', new Date().getTime().toString());

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

function recalculateOldKPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const kpiSheet = ss.getSheetByName('Config_KPI');
  const prodSheet = ss.getSheetByName('Production');
  if (!kpiSheet || !prodSheet) return 0;

  const kpiValues = kpiSheet.getDataRange().getValues();
  const kpiHeaders = kpiValues[0];
  const kpiConfig = kpiValues.slice(1).map(row => {
    const obj = {};
    kpiHeaders.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  const ordersSheet = ss.getSheetByName('Orders');
  const ordersValues = ordersSheet ? ordersSheet.getDataRange().getValues() : [];
  const ordersHeaders = ordersValues.length > 0 ? ordersValues[0] : [];
  const orderChannelMap = {};
  if (ordersValues.length > 1) {
    const idIdx = ordersHeaders.indexOf('id');
    const channelIdx = ordersHeaders.indexOf('channel');
    const codeIdx = ordersHeaders.indexOf('orderCode');
    if (idIdx > -1) {
      for (let k = 1; k < ordersValues.length; k++) {
        const ch = channelIdx > -1 ? String(ordersValues[k][channelIdx]).trim() : '';
        const code = codeIdx > -1 ? String(ordersValues[k][codeIdx]).trim() : '';
        orderChannelMap[String(ordersValues[k][idIdx]).trim()] = ch + ' ' + code;
      }
    }
  }

  const prodValues = prodSheet.getDataRange().getValues();
  const prodHeaders = prodValues[0];
  let updatedCount = 0;

  for (let i = 1; i < prodValues.length; i++) {
    const row = prodValues[i];
    const prodItem = {};
    prodHeaders.forEach((h, idx) => prodItem[h] = row[idx]);
    if (prodItem.fulfilledFromStock === true || prodItem.fulfilledFromStock === 'TRUE') continue;
    let hasChange = false;

    if (prodItem.p1_status === 'Done' && prodItem.p1_name) {
      const channel = orderChannelMap[String(prodItem.orderId).trim()] || '';
      const result = getSopAndRewardBackend(prodItem, prodItem.p1_name, kpiConfig, channel);
      const currentReward = Number(prodItem.p1_reward_vnd) || 0;
      if (result.reward !== currentReward) {
        const col = prodHeaders.indexOf('p1_reward_vnd') + 1;
        if (col > 0) { prodSheet.getRange(i + 1, col).setValue(result.reward); hasChange = true; }
      }
    }

    if (prodItem.p2_status === 'Done' && prodItem.p2_name) {
      const channel = orderChannelMap[String(prodItem.orderId).trim()] || '';
      const result = getSopAndRewardBackend(prodItem, prodItem.p2_name, kpiConfig, channel);
      const currentReward = Number(prodItem.p2_reward_vnd) || 0;
      if (result.reward !== currentReward) {
        const col = prodHeaders.indexOf('p2_reward_vnd') + 1;
        if (col > 0) { prodSheet.getRange(i + 1, col).setValue(result.reward); hasChange = true; }
      }
    }
    if (hasChange) updatedCount++;
  }
  return updatedCount;
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
    if (/SG|MY|TH|PH|MA|TW|Quốc Tế|Xuất Khẩu/i.test(channel)) reward *= 3;
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
    reward = Number(matchedRow['Thưởng Đóng Gói']) || 0;
  }

  if (/SG|MY|TH|PH|MA|TW|Quốc Tế|Xuất Khẩu/i.test(channel)) {
    reward *= 3;
  }

  return { time: 30, reward };
}

function recalculateOldPackingReward() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const kpiSheet = ss.getSheetByName('Config_KPI');
  const packSheet = ss.getSheetByName('Packings');
  const prodSheet = ss.getSheetByName('Production');
  if (!kpiSheet || !packSheet || !prodSheet) return 0;

  const kpiValues = kpiSheet.getDataRange().getValues();
  const kpiHeaders = kpiValues[0];
  const kpiConfig = kpiValues.slice(1).map(row => {
    const obj = {}; kpiHeaders.forEach((h, i) => obj[h] = row[i]); return obj;
  });

  const prodValues = prodSheet.getDataRange().getValues();
  const prodHeaders = prodValues[0];
  const orderItemMap = {};

  for (let i = 1; i < prodValues.length; i++) {
    const p = {}; prodHeaders.forEach((h, idx) => p[h] = prodValues[i][idx]);
    if (p.orderId && p.name) {
      orderItemMap[String(p.orderId).trim()] = { name: p.name, type: p.type || '' };
    }
  }

  const packValues = packSheet.getDataRange().getValues();
  const packHeaders = packValues[0];
  const ordersSheet = ss.getSheetByName('Orders');
  const ordersValues = ordersSheet ? ordersSheet.getDataRange().getValues() : [];
  const ordersHeaders = ordersValues.length > 0 ? ordersValues[0] : [];
  const orderChannelMap = {};
  if (ordersValues.length > 1) {
    const idIdx = ordersHeaders.indexOf('id');
    const channelIdx = ordersHeaders.indexOf('channel');
    const codeIdx = ordersHeaders.indexOf('orderCode');
    if (idIdx > -1) {
      for (let k = 1; k < ordersValues.length; k++) {
        const ch = channelIdx > -1 ? String(ordersValues[k][channelIdx]).trim() : '';
        const code = codeIdx > -1 ? String(ordersValues[k][codeIdx]).trim() : '';
        orderChannelMap[String(ordersValues[k][idIdx]).trim()] = ch + ' ' + code;
      }
    }
  }

  let updatedCount = 0;

  for (let i = 1; i < packValues.length; i++) {
    const row = packValues[i];
    const pack = {}; packHeaders.forEach((h, idx) => pack[h] = row[idx]);
    if (pack.status !== 'Done' || !pack.orderId) continue;

    const packOrderId = String(pack.orderId).trim();
    const itemObj = orderItemMap[packOrderId] || null; if (!itemObj || !itemObj.name) continue;
    const channel = orderChannelMap[packOrderId] || '';

    let newReward = 0;
    if (String(pack.id).includes('PK_WH_')) {
      newReward = 10000;
    } else {
      newReward = getPackingReward(itemObj, kpiConfig, channel);
    }

    if (Number(pack.reward_vnd) !== newReward) {
      const col = packHeaders.indexOf('reward_vnd') + 1;
      if (col > 0) { packSheet.getRange(i + 1, col).setValue(newReward); updatedCount++; }
    }
  }
  return updatedCount;
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

function getAppDataDelta(lastClientSync, pin) {
  var props = PropertiesService.getScriptProperties();
  var lastServerUpdate = props.getProperty('RF_LAST_UPDATED');
  if (!lastServerUpdate || !lastClientSync || parseInt(lastServerUpdate) > parseInt(lastClientSync)) {
    var data = getAppData(pin); data.hasChanges = true; return data;
  }
  return { hasChanges: false, serverTime: new Date().getTime() };
}

function saveAppData(payload) { return syncDeltas(payload); }



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

    var updatedRows = [];
    var matchedCodes = [];

    for (var j = 1; j < ordersData.length; j++) {
      var currentStatus = String(ordersData[j][statusIndex] || '');
      if (currentStatus !== 'Hàng Hoàn' && currentStatus !== 'Đã Huỷ') {
        var orderCode = String(ordersData[j][codeIndex] || '');

        for (var k = 0; k < spxMatches.length; k++) {
          var spxCode = spxMatches[k];
          if (orderCode.indexOf(spxCode) !== -1) {
            updatedRows.push(j + 1);
            matchedCodes.push(spxCode);
            break; // Tìm thấy mã này trong order thì ngừng vòng lặp k
          }
        }
      }
    }

    if (updatedRows.length > 0) {
      updatedRows.forEach(function (rowNum) {
        ordersSheet.getRange(rowNum, statusIndex + 1).setValue('Hàng Hoàn');
      });
      console.log("Đã chuyển " + updatedRows.length + " đơn sang Hàng Hoàn từ SPX Email: " + matchedCodes.join(', '));
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

function autoAllocateStockFromServer(ss) {
  try {
    var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();

    // 1. Đọc danh sách Hàng hóa (Products)
    var prodSheet = activeSs.getSheetByName('Products');
    if (!prodSheet) return;
    var prodData = prodSheet.getDataRange().getValues();
    var prodHeaders = prodData[0];
    var pIdCol = prodHeaders.indexOf('id');
    var pNameCol = prodHeaders.indexOf('name');
    var pQtyCol = prodHeaders.indexOf('quantity');
    var pCostCol = prodHeaders.indexOf('costPrice');
    if (pNameCol === -1 || pQtyCol === -1) return;

    // Tạo map hàng hóa khả dụng (chỉ lấy hàng hóa có quantity > 0)
    var stockMap = {};
    for (var i = 1; i < prodData.length; i++) {
      var pName = String(prodData[i][pNameCol]).trim();
      var pQty = Number(prodData[i][pQtyCol]) || 0;
      var pCost = pCostCol !== -1 ? (Number(prodData[i][pCostCol]) || 0) : 0;
      if (pName && pQty > 0) {
        stockMap[pName] = { rowIndex: i + 1, qty: pQty, id: prodData[i][pIdCol], originalQty: pQty, costPrice: pCost };
      }
    }

    // Nếu không có hàng hóa nào có sẵn trong kho thì dừng luôn
    if (Object.keys(stockMap).length === 0) return;

    // 2. Đọc danh sách Lệnh sản xuất (Production)
    var productionSheet = activeSs.getSheetByName('Production');
    if (!productionSheet) return;
    var rawProdItems = readSheet('Production', null, activeSs);

    // 3. Đọc danh sách Đơn hàng (Orders)
    var ordersSheet = activeSs.getSheetByName('Orders');
    if (!ordersSheet) return;
    var rawOrders = readSheet('Orders', null, activeSs);

    // Map đơn hàng bằng ID để tra cứu nhanh
    var ordersMap = {};
    rawOrders.forEach(function (o) {
      ordersMap[o.id] = o;
    });

    // TÍNH TOÁN HÀNG ĐÃ ĐƯỢC GIỮ CHỖ (RESERVED STOCK)
    // Hàng được giữ chỗ là hàng đã sản xuất xong, chưa bàn giao, và KHÔNG PHẢI fulfilledFromStock
    var reservedQtyMap = {};
    rawProdItems.forEach(function (p) {
      if (!p.id || !p.orderId || !p.name) return;
      var pStatus = String(p.status || '').toUpperCase().trim();
      var isFulfilled = p.fulfilledFromStock === true || String(p.fulfilledFromStock).toUpperCase() === 'TRUE';

      if (pStatus === 'DONE' && !isFulfilled) {
        var o = ordersMap[p.orderId];
        if (o) {
          var oStatus = String(o.status || '').toUpperCase().trim();
          var oChannel = String(o.channel || '').trim();
          if (oStatus !== 'ĐÃ BÀN GIAO' && oStatus !== 'HÀNG HOÀN' && oStatus !== 'ĐƠN HUỶ' && oStatus !== 'ĐƠN HỦY' && oStatus !== 'HỦY' && oStatus !== 'HUỶ') {
            if (oChannel !== 'Sản Xuất Tồn' && oChannel !== 'Sản Xuất Bù Kho') {
              var pName = String(p.name).trim();
              reservedQtyMap[pName] = (reservedQtyMap[pName] || 0) + 1;
            }
          }
        }
      }
    });

    // Cập nhật lại số lượng khả dụng thực tế sau khi trừ đi hàng đã giữ chỗ
    Object.keys(stockMap).forEach(function (pName) {
      var reserved = reservedQtyMap[pName] || 0;
      stockMap[pName].qty = Math.max(0, stockMap[pName].qty - reserved);
      stockMap[pName].originalQty = stockMap[pName].qty; // Reset originalQty để so sánh
    });

    // 4. Lọc các lệnh sản xuất thỏa mãn điều kiện:
    var eligiblePendingProds = [];
    rawProdItems.forEach(function (p) {
      if (!p.id || !p.orderId || !p.name) return;
      var pName = String(p.name).trim();
      if (!stockMap[pName]) return; // Không có trong kho

      var pStatus = String(p.status || '').toUpperCase().trim();
      if (pStatus === 'DONE' || pStatus === 'ĐÃ XONG' || pStatus === 'ĐÃ HUỶ' || pStatus === 'HỦY' || pStatus === 'HỦY/VỠ' || pStatus === 'HOÀN KHO ĐẠT') return;

      var isFulfilled = p.fulfilledFromStock === true || String(p.fulfilledFromStock).toUpperCase() === 'TRUE';
      if (isFulfilled) return; // Đã được bốc rồi

      var o = ordersMap[p.orderId];
      if (!o) return; // Không tìm thấy đơn hàng

      var oStatus = String(o.status || '').toUpperCase().trim();
      if (oStatus === 'ĐÃ GIAO' || oStatus === 'HOÀN THÀNH' || oStatus === 'ĐÃ HỦY' || oStatus === 'HỦY' || oStatus === 'ĐƠN HUỶ' || oStatus === 'HÀNG HOÀN') return;

      var oChannel = String(o.channel || '').trim();
      if (oChannel === 'Sản Xuất Tồn' || oChannel === 'Sản Xuất Bù Kho') return;

      // Lấy thời gian tạo đơn để sắp xếp FIFO (ưu tiên đơn cũ hơn)
      var createdAt = o.createdAt || o.date || '0';
      eligiblePendingProds.push({ prodItem: p, order: o, createdAt: createdAt });
    });

    // Sắp xếp các lệnh sản xuất theo thứ tự FIFO (cũ nhất trước)
    eligiblePendingProds.sort(function (a, b) {
      return String(a.createdAt).localeCompare(String(b.createdAt));
    });

    // Nếu không có lệnh nào chờ bốc, dừng luôn
    if (eligiblePendingProds.length === 0) return;

    var productionData = productionSheet.getDataRange().getValues();
    var productionHeaders = productionData[0];
    var prodIdColIndex = productionHeaders.indexOf('id');
    var prodFulfilledColIndex = productionHeaders.indexOf('fulfilledFromStock');
    var prodNoteColIndex = productionHeaders.indexOf('note');
    if (prodIdColIndex === -1 || prodFulfilledColIndex === -1) return;

    var orderUpdates = {}; // Để theo dõi các đơn hàng cần chuyển sang "Sẵn sàng đóng gói"
    var allocatedCount = 0;
    var prodModified = false;

    // 5. Tiến hành phân bổ hàng từ kho cho các lệnh sản xuất
    eligiblePendingProds.forEach(function (itemInfo) {
      var pItem = itemInfo.prodItem;
      var pName = String(pItem.name).trim();
      var stockInfo = stockMap[pName];
      if (!stockInfo || stockInfo.qty <= 0) return; // Hết hàng

      // Bốc 1 sản phẩm
      stockInfo.qty--;
      allocatedCount++;

      // Tìm dòng của lệnh sản xuất trong Sheet Production để cập nhật trực tiếp
      for (var rowIdx = 1; rowIdx < productionData.length; rowIdx++) {
        if (String(productionData[rowIdx][prodIdColIndex]) === String(pItem.id)) {
          productionData[rowIdx][prodFulfilledColIndex] = true;
          prodModified = true;

          // Cập nhật cục bộ để lát kiểm tra trạng thái đơn hàng
          pItem.fulfilledFromStock = true;
          break;
        }
      }

      orderUpdates[itemInfo.order.id] = itemInfo.order;
    });

    if (prodModified) {
      productionSheet.getRange(1, 1, productionData.length, productionHeaders.length).setValues(productionData);
    }

    // 6. Cập nhật lại số lượng tồn kho trong Sheet Products
    var productsModified = false;
    var ieLogRows = [];
    Object.keys(stockMap).forEach(function (pName) {
      var info = stockMap[pName];
      if (info.qty !== info.originalQty) {
        prodData[info.rowIndex - 1][pQtyCol] = info.qty;
        productsModified = true;

        // Ghi log xuất kho tự động bốc sang đơn hàng
        var cost = info.costPrice || 0;
        var logId = 'IE_AUTO_ALLOC_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        var ieLogSheet = activeSs.getSheetByName('ImportExport');
        if (ieLogSheet) {
          var itemsDataStr = JSON.stringify([{ name: pName, qty: info.originalQty - info.qty, price: cost }]);
          var ieRow = SCHEMA_ERP.ImportExport.map(function (h) {
            if (h === 'id') return logId;
            if (h === 'type') return 'Xuất';
            if (h === 'target') return 'Tự động bốc kho';
            if (h === 'totalAmount') return (info.originalQty - info.qty) * cost;
            if (h === 'date') return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
            if (h === 'note') return 'Tự động bốc kho tồn cho đơn hàng chờ';
            if (h === 'itemsData') return itemsDataStr;
            return '';
          });
          ieLogRows.push(ieRow);
        }
      }
    });

    if (productsModified) {
      prodSheet.getRange(1, 1, prodData.length, prodHeaders.length).setValues(prodData);
    }
    if (ieLogRows.length > 0) {
      var ieLogSheet = activeSs.getSheetByName('ImportExport');
      if (ieLogSheet) {
        ieLogSheet.getRange(ieLogSheet.getLastRow() + 1, 1, ieLogRows.length, ieLogRows[0].length).setValues(ieLogRows);
      }
    }

    // 7. Kiểm tra và chuyển trạng thái đơn hàng sang "Sẵn sàng đóng gói"
    var ordersData = ordersSheet.getDataRange().getValues();
    var oHeaders = ordersData[0];
    var oIdColIdx = oHeaders.indexOf('id');
    var oStatusColIdx = oHeaders.indexOf('status');
    var ordersModified = false;

    if (oIdColIdx !== -1 && oStatusColIdx !== -1) {
      Object.keys(orderUpdates).forEach(function (oId) {
        var order = orderUpdates[oId];

        var orderProds = rawProdItems.filter(function (p) {
          return String(p.orderId) === String(oId);
        });

        var isAllDoneOrFulfilled = orderProds.every(function (p) {
          var pStatus = String(p.status || '').toUpperCase().trim();
          var isDone = pStatus === 'DONE' || pStatus === 'ĐÃ XONG' || pStatus === 'HỦY/VỠ' || pStatus === 'HOÀN KHO ĐẠT';
          var isFulfilled = p.fulfilledFromStock === true || String(p.fulfilledFromStock).toUpperCase() === 'TRUE';
          return isDone || isFulfilled;
        });

        if (isAllDoneOrFulfilled && orderProds.length > 0) {
          for (var r = 1; r < ordersData.length; r++) {
            if (String(ordersData[r][oIdColIdx]) === String(oId)) {
              ordersData[r][oStatusColIdx] = 'Sẵn sàng đóng gói';
              ordersModified = true;
              break;
            }
          }
        }
      });
      if (ordersModified) {
        ordersSheet.getRange(1, 1, ordersData.length, oHeaders.length).setValues(ordersData);
      }
    }

    console.log("Đã tự động phân bổ " + allocatedCount + " sản phẩm từ kho tồn sang các đơn hàng đang chờ.");
  } catch (e) {
    console.error("Lỗi trong autoAllocateStockFromServer:", e);
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
      var isEligible = (category === 'LAYOUT' || category === 'BỂ KÍNH');
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

    if (idCol === -1 || codeCol === -1 || statusCol === -1) return { success: false, message: 'Sheet Orders thiếu cột chuẩn' };

    var ordersToSync = [];
    for (var i = 1; i < oData.length; i++) {
      var status = String(oData[i][statusCol] || '').trim();
      var code = String(oData[i][codeCol] || '').trim();
      var channel = String(oData[i][channelCol] || '').trim();

      // Chỉ đồng bộ những đơn Đang Giao, Đã Bàn Giao và mã đơn bắt đầu bằng GHN hoặc kênh GHN
      if ((status === 'Đang Giao' || status === 'Đã Bàn Giao' || status === 'Chờ Bàn Giao') && code.length > 5) {
        if (code.toUpperCase().startsWith('GHN') || channel.toUpperCase().includes('GHN')) {
          ordersToSync.push({ rowIndex: i + 1, code: code, id: oData[i][idCol], cod: Number(oData[i][codCol]) || 0 });
        }
      }
    }

    if (ordersToSync.length === 0) {
      return { success: true, count: 0, message: 'Không có đơn hàng nào đang giao cần đồng bộ.' };
    }

    var countSuccess = 0;
    var modifiedOrders = false;
    var financeTransactions = [];

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
          }
        }
      }
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
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var pSheet = ss.getSheetByName('Packings');
    var pData = pSheet ? pSheet.getDataRange().getValues() : [];

    var labelName = "RF_Processed";
    var label = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

    // Quét TẤT CẢ các email trong 3 ngày qua chưa được xử lý
    var threads = GmailApp.search('(newer_than:3d) -label:' + labelName + ' (subject:"hủy đơn hàng" OR subject:"huỷ đơn hàng" OR subject:"rút yêu cầu")');
    if (threads.length === 0) return { success: true, count: 0, message: 'Không có email huỷ đơn mới' };

    var count = 0;
    var modified = false;
    var debugLogs = [];
    debugLogs.push("Threads: " + threads.length);

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];

        var subject = msg.getSubject();
        // Trích xuất TẤT CẢ các cụm mã có từ 8 ký tự trở lên (chỉ gồm chữ và số)
        var codes = subject.match(/[A-Z0-9]{8,25}/ig);
        if (codes && codes.length > 0) {
          if (debugLogs.length < 5) debugLogs.push("Codes: " + codes.join(','));
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
                  }
                }
                break; // Đã tìm thấy và xử lý mã này thì ngưng vòng lặp oData
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

    var finalMsg = 'Đã xử lý tự động ' + count + ' đơn huỷ/hoàn từ email. (Quét ' + threads.length + ' threads)';
    if (count === 0) finalMsg = "Debug: " + debugLogs.slice(0, 3).join(" | ");

    return { success: true, count: count, message: finalMsg };
  } catch (e) {
    return { success: false, message: e.toString() };
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

function testBIDV() {
  var threads = GmailApp.search('from:bidvsmartbanking@bidv.com.vn', 0, 1);
  if (threads.length === 0) {
    Logger.log('Không tìm thấy email BIDV nào.');
    return;
  }
  var msg = threads[0].getMessages()[0];
  var body = msg.getPlainBody();
  Logger.log("=== NỘI DUNG EMAIL ===");
  Logger.log(body);

  var sourceMatch = body.match(/Tài khoản nguồn[^\d]*(\d+)/i) || body.match(/Debit account[^\d]*(\d+)/i);
  var amountMatch = body.match(/Số tiền giao dịch[^\d]*([\d,]+)/i) || body.match(/Transaction amount[^\d]*([\d,]+)/i);

  Logger.log("=== KẾT QUẢ QUÉT ===");
  Logger.log("Tài khoản nguồn: " + (sourceMatch ? sourceMatch[1] : "Không tìm thấy"));
  Logger.log("Số tiền: " + (amountMatch ? amountMatch[1] : "Không tìm thấy"));
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

      if (statusUpper === 'SẴN SÀNG ĐÓNG GÓI' && channelUpper === 'SHOPEE VN') {
        countMatchedOrders++;
        var orderId = ordersData[i][idColIdx];
        var orderCode = ordersData[i][orderCodeColIdx];

        // Cập nhật trạng thái thành 'Chờ Bàn Giao'
        ordersData[i][statusColIdx] = 'Chờ Bàn Giao';
        ordersModified = true;

        // Phạt mỗi nhân sự đóng gói 50.000đ
        for (var k = 0; k < packingStaffs.length; k++) {
          var penaltyId = Utilities.getUuid ? Utilities.getUuid() : new Date().getTime() + "_" + k;
          var newPenalty = [penaltyId, packingStaffs[k], PENALTY_AMOUNT, 'Phạt Quy Định', 'Lỗi không hoàn thành thao tác đóng gói đơn ' + orderCode, todayStr, orderCode];
          var rowObj = SCHEMA_ERP.BonusPenalty.map(function (col) {
            var idx = ['id', 'user', 'amount', 'type', 'note', 'date', 'orderCode'].indexOf(col);
            return idx !== -1 ? newPenalty[idx] : '';
          });
          penaltySheet.appendRow(rowObj);
        }

        // Cập nhật hoặc tạo mới bản ghi Packings
        var foundPacking = false;
        for (var j = 1; j < packingsData.length; j++) {
          if (String(packingsData[j][pOrderIdCol]) === String(orderId)) {
            packingsData[j][pPhotoCol] = WARNING_IMAGE_URL;
            packingsData[j][pPhotoBeforeCol] = WARNING_IMAGE_URL;
            foundPacking = true;
            packingsSheet.getRange(j + 1, pPhotoCol + 1).setValue(WARNING_IMAGE_URL);
            packingsSheet.getRange(j + 1, pPhotoBeforeCol + 1).setValue(WARNING_IMAGE_URL);
            break;
          }
        }

        if (!foundPacking) {
          var newPackingId = Utilities.getUuid ? Utilities.getUuid() : "P_" + new Date().getTime();
          var newPacking = SCHEMA.Packings.map(function (col) {
            if (col === 'id') return newPackingId;
            if (col === 'orderId') return orderId;
            if (col === 'status') return 'Done';
            if (col === 'photo') return WARNING_IMAGE_URL;
            if (col === 'photoBefore') return WARNING_IMAGE_URL;
            return '';
          });
          packingsSheet.appendRow(newPacking);
          packingsData.push(newPacking);
        }
      }
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

function duplicateProdItem(originalId) {
  try {
    console.log("Bắt đầu nhân bản Item ID: " + originalId);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idIdx = headers.indexOf('id');

    var targetRow = -1;
    var rowData = null;
    for (var i = 1; i < data.length; i++) {
      if (data[i][idIdx] == originalId) {
        targetRow = i;
        rowData = data[i];
        break;
      }
    }

    if (!rowData) throw new Error("Không tìm thấy lệnh gốc để nhân đôi.");

    var newRow = rowData.slice();
    var newId = Utilities.getUuid();
    newRow[idIdx] = newId;

    var clearFields = ['qc_status', 'qc_front_photo', 'qc_side_photo', 'qc_note', 'p1_user', 'p1_start', 'p1_endTime', 'p1_photo', 'p1_reward_vnd', 'p2_user', 'p2_start', 'p2_endTime', 'p2_photo', 'p2_reward_vnd'];
    clearFields.forEach(function (f) {
      var idx = headers.indexOf(f);
      if (idx > -1) newRow[idx] = '';
    });

    var pendingFields = ['status', 'p1_status', 'p2_status'];
    pendingFields.forEach(function (f) {
      var idx = headers.indexOf(f);
      if (idx > -1) newRow[idx] = 'Pending';
    });

    var noteIdx = headers.indexOf('note');
    if (noteIdx > -1) newRow[noteIdx] = '[BẢN SAO] ' + (newRow[noteIdx] || '');

    sheet.appendRow(newRow);

    return {
      success: true,
      message: "Đã nhân bản và reset QC thành công",
      newId: newId
    };

  } catch (error) {
    console.error("Lỗi tại duplicateProdItem: " + error.message);
    return {
      success: false,
      error: error.message,
      message: "Có lỗi xảy ra khi nhân bản. Vui lòng kiểm tra quyền xác thực (AUTH)."
    };
  }
}

// =========================================================================
// HÀM SỬA LỖI VÀ CHUYỂN GIAO DỊCH SHOPEE VỀ ĐÚNG VÍ
// =========================================================================
function fixShopeeAcc() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var accSheet = ss.getSheetByName('Accounts');
  var txSheet = ss.getSheetByName('Transactions');

  if (!accSheet || !txSheet) return "Lỗi: Không tìm thấy sheet Accounts hoặc Transactions";

  var accData = accSheet.getDataRange().getValues();
  var accHeaders = accData[0];
  var idCol = accHeaders.indexOf('id');
  var nameCol = accHeaders.indexOf('accountName');
  var balCol = accHeaders.indexOf('balance');

  // 1. Tìm hoặc tạo Ví Shopee
  var shopeeAccId = null;
  for (var i = 1; i < accData.length; i++) {
    if (String(accData[i][nameCol]).toLowerCase().includes('ví shopee')) {
      shopeeAccId = String(accData[i][idCol]);
      break;
    }
  }

  if (!shopeeAccId) {
    shopeeAccId = 'ACC_SHOPEE_FIX_' + Date.now();
    var newRow = accHeaders.map(function (h) {
      if (h === 'id') return shopeeAccId;
      if (h === 'accountName') return 'Ví Shopee - 0945445497';
      if (h === 'balance') return 0;
      return '';
    });
    accSheet.appendRow(newRow);
  }

  // 2. Tìm Tài khoản đầu tư bị gắn nhầm (có chứa chuỗi 0048094544)
  var wrongAccId = null;
  for (var i = 1; i < accData.length; i++) {
    if (String(accData[i][nameCol]).includes('0048094544')) {
      wrongAccId = String(accData[i][idCol]);
      break;
    }
  }

  if (!wrongAccId) return "Không tìm thấy Tài Khoản Đầu Tư bị gán nhầm.";

  // 3. Chuyển giao dịch Shopee từ tài khoản sai sang Ví Shopee
  var txData = txSheet.getDataRange().getValues();
  var tHeaders = txData[0];
  var tIdCol = tHeaders.indexOf('id');
  var tFromCol = tHeaders.indexOf('fromAccount');
  var tToCol = tHeaders.indexOf('toAccount');
  var tNoteCol = tHeaders.indexOf('note');
  var tTitleCol = tHeaders.indexOf('title');
  var tTypeCol = tHeaders.indexOf('type');
  var tAmtCol = tHeaders.indexOf('amount');

  var moved = 0;
  for (var i = 1; i < txData.length; i++) {
    var note = String(txData[i][tNoteCol]);
    var title = String(txData[i][tTitleCol]);
    if (note.includes('Doanh thu gộp') || note.includes('Tự động bóc tách') || note.includes('Phí ship Shopee') || title.includes('Shopee')) {
      if (txData[i][tFromCol] === wrongAccId) {
        txSheet.getRange(i + 1, tFromCol + 1).setValue(shopeeAccId);
        txData[i][tFromCol] = shopeeAccId;
        moved++;
      }
      if (txData[i][tToCol] === wrongAccId) {
        txSheet.getRange(i + 1, tToCol + 1).setValue(shopeeAccId);
        txData[i][tToCol] = shopeeAccId;
        moved++;
      }
    }
  }

  // 4. Tính toán lại số dư cho toàn bộ các quỹ dựa trên các giao dịch
  var balances = {};
  for (var i = 1; i < txData.length; i++) {
    var from = txData[i][tFromCol];
    var to = txData[i][tToCol];
    var type = txData[i][tTypeCol];
    var amt = Number(txData[i][tAmtCol]) || 0;

    if (!balances[from]) balances[from] = 0;
    if (!balances[to]) balances[to] = 0;

    if (type === 'Thu') {
      if (to) balances[to] += amt;
    } else if (type === 'Chi') {
      if (from) balances[from] -= amt;
    } else if (type === 'Chuyển') {
      if (from) balances[from] -= amt;
      if (to) balances[to] += amt;
    }
  }

  // Cập nhật lại số dư vào sheet Accounts
  accData = accSheet.getDataRange().getValues();
  for (var i = 1; i < accData.length; i++) {
    var accId = String(accData[i][idCol]);
    if (balances[accId] !== undefined) {
      accSheet.getRange(i + 1, balCol + 1).setValue(balances[accId]);
    }
  }

  SpreadsheetApp.flush();
  return "Đã chuyển " + (moved / 2) + " giao dịch Shopee về đúng Ví Shopee và cập nhật lại số dư các quỹ.";
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
  try {
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
        if (currentStatus !== 'Hoàn Thành' && currentStatus !== 'Hàng Hoàn' && currentStatus !== 'Đơn Huỷ') {
          oData[foundRowIndex][statusCol] = 'Hoàn Thành';
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
          financeTransactions.push([
            Utilities.getUuid(),
            'Thu',
            'Sàn TMĐT',
            amt,
            '',
            targetAccountId,
            'Đối soát: ' + searchCode,
            new Date().toISOString(),
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
      // Xoá rác đối soát cũ
      if (note.indexOf('Đối soát tự động (Batch)') > -1) isJunk = true;
      if (note.indexOf('Nhóm') > -1 && note.indexOf('=> THỰC NHẬN') > -1) isJunk = true;
      if (cat.indexOf('Đối soát') > -1) isJunk = true;
      if (note.indexOf('Doanh thu Shopee') > -1) isJunk = true;
      if (id.indexOf('TX_SHPINC') > -1 || id.indexOf('SHPINC') > -1) isJunk = true;
      if (note.indexOf('Order.all') > -1) isJunk = true;

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
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const prodSheet = ss.getSheetByName("Products");
    const bomSheet = ss.getSheetByName("BOM_Config");

    const prodData = prodSheet.getDataRange().getValues();
    const prodHeaders = prodData[0];

    const skuIdx = prodHeaders.indexOf("sku");
    const nameIdx = prodHeaders.indexOf("name");
    const costIdx = prodHeaders.indexOf("costPrice");

    // Đơn giá vật tư gốc (Nên lấy động từ bảng Products, ở đây set biến tĩnh làm ví dụ an toàn)
    // Giả định: Kính 4li = 180.000đ / m2 | Silicon = 5.000đ / mét dài dán
    const PRICE_PER_M2_GLASS = 180000;
    const PRICE_PER_M_SILICON = 5000;
    const LABOR_COST_PER_TANK = 15000; // Tiền công mài/dán khoán

    let updatedCount = 0;

    // Quét từ trên xuống dưới bảng Products
    for (let i = 1; i < prodData.length; i++) {
      let sku = String(prodData[i][skuIdx]);
      let name = String(prodData[i][nameIdx]);

      // Chỉ xử lý các SKU là Bể (bắt đầu bằng BE hoặc TERA)
      if (sku.startsWith("BE") || sku.startsWith("TERA")) {
        // Thuật toán bóc tách kích thước: Dài x Rộng x Cao
        let match = name.toLowerCase().match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/);

        if (match) {
          let L = parseFloat(match[1]) / 100; // Đổi sang mét
          let W = parseFloat(match[2]) / 100;
          let H = parseFloat(match[3]) / 100;

          // Tính toán định mức tiêu hao
          let glassArea = ((L * W) + 2 * (L * H) + 2 * (W * H)) * 1.1; // +10% hao hụt
          let siliconLength = (L * 2) + (W * 2) + (H * 4);

          // Tính Giá vốn tuyệt đối (COGS)
          let exactCOGS = Math.round((glassArea * PRICE_PER_M2_GLASS) + (siliconLength * PRICE_PER_M_SILICON) + LABOR_COST_PER_TANK);

          // 1. Cập nhật giá vốn vào bảng Products
          prodSheet.getRange(i + 1, costIdx + 1).setValue(exactCOGS);

          // 2. Tự động ghi BOM vào bảng BOM_Config (Mỗi bể 2 dòng vật tư: Kính + Keo)
          let bomId_Glass = "BOM_" + sku + "_GLASS";
          let bomId_Silicon = "BOM_" + sku + "_SILICON";

          bomSheet.appendRow([bomId_Glass, sku, "KINH4LI", glassArea.toFixed(3), "m2"]);
          bomSheet.appendRow([bomId_Silicon, sku, "SILICON", siliconLength.toFixed(2), "met"]);

          updatedCount++;
        }
      }
    }

    return { status: "success", message: `Đã chuẩn hóa BOM và Giá vốn cho ${updatedCount} mã bể kính.` };
  } catch (error) {
    console.error("Lỗi thuật toán bể kính: ", error);
    return { status: "error", message: error.message };
  }
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
  if (!ordersToHandover || ordersToHandover.length === 0) return;

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

  var ieLogRows = [];
  var productsModified = false;

  ordersToHandover.forEach(function (order) {
    var totalExportValue = 0;
    var allItemsToExport = [];

    // 1. Phụ kiện đóng gói (luôn trừ kho)
    var accs = [];
    if (typeof order.accessories === 'string') {
      try { accs = JSON.parse(order.accessories); } catch (e) { }
    } else {
      accs = order.accessories || [];
    }
    accs.forEach(function (a) {
      var qty = Number(a.quantity) || 1;
      allItemsToExport.push({ name: a.name, qty: qty });
    });

    // 2. Sản phẩm từ Production: CHỈ trừ kho khi fulfilledFromStock === false
    var orderProds = prodData.filter(function (p) { return String(p.orderId) === String(order.id); });
    orderProds.forEach(function (rp) {
      var isFulfilledFromStock = String(rp.fulfilledFromStock).toUpperCase() === 'TRUE' || rp.fulfilledFromStock === true;
      if (!isFulfilledFromStock) {
        allItemsToExport.push({ name: rp.name, qty: 1 });
      }
    });

    // Gom nhóm và trừ kho
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
            productsData[i][pQtyCol] = (Number(productsData[i][pQtyCol]) || 0) - gItem.qty;
            totalExportValue += gItem.qty * cost;
            productsModified = true;
            break;
          }
        }
      });

      var orderCode = (order.orderCode || '').split(' | ')[0] || order.id.substring(0, 5);
      var logId = 'IE_SAFE_OUT_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      var ieRow = SCHEMA_ERP.ImportExport.map(function (h) {
        if (h === 'id') return logId;
        if (h === 'type') return 'Xuất';
        if (h === 'target') return 'Bàn Giao Khách Hàng';
        if (h === 'totalAmount') return totalExportValue;
        if (h === 'date') return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
        if (h === 'note') return 'Xuất kho an toàn cho đơn bàn giao: ' + orderCode;
        if (h === 'itemsData') return JSON.stringify(Object.values(groupedItems));
        return '';
      });
      ieLogRows.push(ieRow);
    }
  });

  if (productsModified && productsSheet) {
    productsSheet.getRange(1, 1, productsData.length, pHeaders.length).setValues(productsData);
  }
  if (ieLogRows.length > 0) {
    var ieSheet = ss.getSheetByName('ImportExport');
    if (ieSheet) {
      ieSheet.getRange(ieSheet.getLastRow() + 1, 1, ieLogRows.length, ieLogRows[0].length).setValues(ieLogRows);
    }
  }
}
/**
 * TỰ ĐỘNG CHUẨN HÓA GIÁ VỐN KÍNH THEO QUY CHUẨN MỚI CỦA SẾP
 * - Kính 4li: 180.000đ/m2
 * - Kính 3li: 165.000đ/m2
 * - Mài (Chỉ áp dụng cho Kính 4li MVT): Mài 1 cạnh trên (dài 1.8m) = 45.000đ/tấm (1.8m * 25.000đ)
 */
function autoFixAllGlassCosts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Products");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const nameIdx = headers.indexOf("name");
  const costIdx = headers.indexOf("costPrice");

  let fixedCount = 0;

  for (let i = 1; i < data.length; i++) {
    let name = String(data[i][nameIdx] || "").toLowerCase();

    // 1. NHÓM KÍNH 4LI MVT (CÓ MÀI 1 CẠNH 1.8M)
    if (name.includes("kính 4li") && name.includes("mvt")) {
      // Tìm kích thước 25cm, 20cm, 18cm...
      let match = name.match(/(\d+)\s*cm/);
      if (match) {
        let width = parseFloat(match[1]); // Ví dụ: 25
        let length = 180; // Dài tiêu chuẩn

        let areaM2 = (width * length) / 10000;
        let glassCost = areaM2 * 180000;
        let grindCost = 1.8 * 25000; // Mài 1 cạnh dài 1.8m

        sheet.getRange(i + 1, costIdx + 1).setValue(Math.round(glassCost + grindCost));
        fixedCount++;
      }
    }

    // 2. NHÓM KÍNH 4LI CẮT ĐÁY (KHÔNG MÀI)
    else if (name.includes("kính 4li") && name.includes("cắt đáy")) {
      let match = name.match(/(\d+)\s*x\s*(\d+)/);
      if (match) {
        let width = parseFloat(match[1]);
        let length = parseFloat(match[2]);
        let areaM2 = (width * length) / 10000;

        sheet.getRange(i + 1, costIdx + 1).setValue(Math.round(areaM2 * 180000));
        fixedCount++;
      }
    }

    // 3. NHÓM KÍNH 3LI TERRA (KHÔNG MÀI)
    else if (name.includes("kính 3li")) {
      let match = name.match(/(\d+)\s*x\s*(\d+)/);
      if (match) {
        let width = parseFloat(match[1]);
        let length = parseFloat(match[2]);
        let areaM2 = (width * length) / 10000;

        sheet.getRange(i + 1, costIdx + 1).setValue(Math.round(areaM2 * 165000));
        fixedCount++;
      }
    }
  }

  SpreadsheetApp.flush();
  return { status: "success", message: `Đã chuẩn hóa giá vốn chuẩn cho ${fixedCount} mã kính.` };
}
/**
 * =========================================================================
 * API NHẬN DỮ LIỆU TỪ MODAL: TẠO KPI THỦ CÔNG (Vào bảng KPI_Progress)
 * =========================================================================
 */
function api_insertManualKPI(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('KPI_Progress');
    if (!sheet) {
      sheet = ss.insertSheet('KPI_Progress');
      sheet.appendRow(SCHEMA_ERP.KPI_Progress);
      sheet.setFrozenRows(1);
    }

    var now = new Date();
    var startTime = new Date(now.getFullYear(), now.getMonth(), 1); // Đầu tháng
    var endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Cuối tháng

    // ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide']
    var newRow = [
      'KPI_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      payload.user,
      payload.kpiName,
      0, // current khởi tạo bằng 0
      Number(payload.target) || 0,
      payload.unit || 'VNĐ',
      now,
      startTime,
      endTime,
      Number(payload.reward) || 0,
      false,
      Number(payload.penalty) || 0,
      payload.guide || ''
    ];

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    return { success: true, message: 'Đã thêm KPI thủ công thành công!' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * =========================================================================
 * API NHẬN DỮ LIỆU TỪ MODAL: GIAO NHIỆM VỤ (Vào bảng BonusPenalty làm XU)
 * =========================================================================
 */
function api_insertManualTask(payload) {
  try {
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

    // ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty']
    var newRow = [
      'KPI_XU_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      payload.user,
      payload.title || 'Nhiệm vụ Xu',
      0, // current
      1, // target
      'Xu', // Nhận diện Xu
      now,
      startTime,
      endTime,
      Number(payload.amount) || 0, // Số Xu
      false, // Chưa claim
      Number(payload.penalty) || 0 // Tiền phạt
    ];

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    return { success: true, message: 'Đã giao nhiệm vụ thành công! Nhân sự cần báo cáo hoàn thành để nhận Xu.' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * API XỬ LÝ DƯ NỢ LƯƠNG ÂM THEO CHUẨN ERP
 */
function api_settleMonthlyDebt(payload) {
  try {
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
  }
}

/**
 * API HOÀN THÀNH LÔ BỂ KÍNH (Batch Production)
 */
function api_completeBatchProduction(idList) {
  try {
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

function getOperationsHealth() {
  try {
    return { success: true, data: { sla: [], bottleneck: [], inventory: [] } };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG DỰA TRÊN DỮ LIỆU ĐƠN HÀNG
 */
function updateKpiProgressData() {
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
    const kpiNameIdx = kpiHeaders.indexOf('kpiName');
    const currentIdx = kpiHeaders.indexOf('current');
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
      return {
        status: row[oStatusIdx],
        isReconciled: String(row[oIsReconciledIdx]).toLowerCase() === 'true' || row[oIsReconciledIdx] === true,
        note: row[oNoteIdx] || '',
        revenue: Number(row[oRevenueIdx]) || 0,
        date: new Date(row[oDateIdx]),
        reconciledAt: recAt ? new Date(recAt) : new Date(row[oDateIdx])
      };
    });

    const updates = [];

    for (let i = 1; i < kpiData.length; i++) {
      const kpi = kpiData[i];
      const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase();
      const start = new Date(kpi[startTimeIdx]);
      const end = new Date(kpi[endTimeIdx]);
      const currentVal = Number(kpi[currentIdx]) || 0;
      let newVal = currentVal;

      // Filter orders within KPI timeframe
      const periodOrders = orders.filter(o => o.date >= start && o.date <= end);
      // Filter reconciled/completed orders by their actual process date
      const reconciledPeriodOrders = orders.filter(o => o.reconciledAt >= start && o.reconciledAt <= end);

      // Logic 2: Returned Item Processing (> 80%)
      if (kpiName.includes('xử lý hàng hoàn') || kpiName.includes('hoàn')) {
        const totalReturns = reconciledPeriodOrders.filter(o => o.status === 'Hàng Hoàn');
        const reconciledReturns = totalReturns.filter(o => o.isReconciled);
        if (totalReturns.length > 0) {
          newVal = (reconciledReturns.length / totalReturns.length) * 100;
        } else {
          newVal = 100; // No returns = 100% processing
        }
      }

      // Logic 3: Dispute Win Rate (> 60%)
      else if (kpiName.includes('tỷ lệ thắng khiếu nại') || kpiName.includes('khiếu nại')) {
        const winCount = reconciledPeriodOrders.filter(o => String(o.note).includes('[KN-THANG]')).length;
        const loseCount = reconciledPeriodOrders.filter(o => String(o.note).includes('[KN-THUA]')).length;
        const totalDisputes = winCount + loseCount;
        if (totalDisputes > 0) {
          newVal = (winCount / totalDisputes) * 100;
        }
      }

      // Logic 4: Sales Revenue Target
      else if (kpiName.includes('doanh thu')) {
        newVal = reconciledPeriodOrders.reduce((sum, o) => {
          return sum + (o.status === 'Đối Soát Thành Công' ? o.revenue : 0);
        }, 0);
      }

      // Logic 5: Clearance Sales Count (Thanh Lý Layout)
      else if (kpiName.includes('thanh lý') || kpiName.includes('clearance')) {
        newVal = reconciledPeriodOrders.filter(o =>
          String(o.note).toLowerCase().includes('thanh ly') && o.status === 'Đối Soát Thành Công'
        ).length;
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
    if (handler === 'updateKpiProgressData' || handler === 'updateKpiProgressData_Duong') {
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
            newVal = (onTimeCount / duongProds.length) * 100;
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

    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData_Duong: ' + err.toString());
  }
}

/**
 * HOTFIX (07-08-2026): Hàm chạy thủ công để sửa các lỗi sai giờ do UTC và chạy lại cập nhật KPI ngay lập tức
 * Hướng dẫn: Chọn hàm này trên Google Apps Script và bấm nút [Chạy / Run]
 */
function HOTFIX_TIMEZONES_AND_RUN_KPI() {
  try {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) return Logger.log('Hệ thống đang bận, vui lòng thử lại sau.');
    
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const ieSheet = ss.getSheetByName('ImportExport');
      const data = ieSheet.getDataRange().getValues();
      const dateIdx = data[0].indexOf('date');
      
      let fixedCount = 0;
      
      // Sửa giờ trong sheet ImportExport
      for (let i = 1; i < data.length; i++) {
        const rowDate = data[i][dateIdx];
        if (typeof rowDate === 'string' && rowDate.includes('2026-08-07')) {
          const match = rowDate.match(/^2026-08-07 0([0-6]):(\d{2}):(\d{2})/);
          if (match) {
            const hour = parseInt(match[1]);
            const newHour = hour + 7;
            const newHourStr = newHour < 10 ? '0' + newHour : String(newHour);
            const fixedDate = rowDate.replace(`0${hour}:`, `${newHourStr}:`);
            ieSheet.getRange(i + 1, dateIdx + 1).setValue(fixedDate);
            fixedCount++;
          }
        }
      }
      
      Logger.log(`Đã sửa thành công ${fixedCount} dòng bị lệch giờ (thành giờ Việt Nam GMT+7).`);
      
      // Chạy cập nhật lại KPI ngay lập tức
      Logger.log('Bắt đầu chạy quét và cập nhật lại toàn bộ tiến độ KPI...');
      updateKpiProgressData();
      updateKpiProgressData_Duong();
      Logger.log('Cập nhật KPI thành công!');
      
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    Logger.log('Lỗi khi chạy hotfix: ' + e.toString());
  }
}