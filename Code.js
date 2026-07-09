var SCHEMA = {
  Orders: ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser'],
  Production: ['id', 'orderId', 'type', 'name', 'note', 'status', 'deadline', 'fulfilledFromStock', 'p1_name', 'p1_status', 'p1_user', 'p1_start', 'p1_endTime', 'p1_photo', 'p1_reward_vnd', 'p2_name', 'p2_status', 'p2_user', 'p2_start', 'p2_endTime', 'p2_photo', 'p2_reward_vnd'],
  Packings: ['id', 'orderId', 'user', 'start', 'end', 'endTime', 'status', 'photo', 'reward_vnd', 'photoBefore'],
  Attendance: ['id', 'user', 'date', 'morningIn', 'morningOut', 'afternoonIn', 'afternoonOut', 'leaveType', 'leaveReportAt', 'shift', 'timeIn', 'timeOut', 'totalHours', 'status', 'penalty', 'isEdited', 'leaveStart', 'leaveEnd', 'note'],
  Documents: ['id', 'category', 'title', 'description', 'link', 'createdAt', 'createdBy'],
  Trainings: ['id', 'title', 'content', 'targetRole', 'createdAt', 'createdBy', 'readUsers']
};

var SCHEMA_ERP = {
  Products: ['id', 'sku', 'name', 'unit', 'image', 'category', 'sub_category', 'costPrice', 'price', 'quantity', 'minStock', 'maxStock', 'realImage', 'importUnit', 'conversionRate'],
  Accounts: ['id', 'accountName', 'balance'],
  Suppliers: ['id', 'name', 'phone', 'totalDebt', 'category'],
  Transactions: ['id', 'type', 'category', 'amount', 'fromAccount', 'toAccount', 'title', 'date', 'note', 'isAuto'],
  ImportExport: ['id', 'type', 'target', 'totalAmount', 'date', 'note', 'itemsData'],
  ProfitReports: ['id', 'period', 'channel', 'revenue', 'orderCount', 'platformFee', 'returns', 'discount', 'ads', 'cogs', 'salary', 'operation'],
  BonusPenalty: ['id', 'user', 'amount', 'type', 'note', 'date', 'orderCode'],
  KPI_Progress: ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed']
};

function doGet(e) {
  if (e && e.parameter && e.parameter.app === 'ctv') {
      return HtmlService.createTemplateFromFile('App_CTV').evaluate()
          .setTitle('CTV Workspace - RichFish Aquarium')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  return HtmlService.createTemplateFromFile('Index').evaluate()
      .setTitle('RF Workspace Pro V99.6.6')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  var content = HtmlService.createHtmlOutputFromFile(filename).getContent();
  content = content.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');
  return content;
}

function initDB() { var ss = SpreadsheetApp.getActiveSpreadsheet(); Object.keys(SCHEMA).forEach(function(s) { if (!ss.getSheetByName(s)) { var sheet = ss.insertSheet(s); sheet.appendRow(SCHEMA[s]); sheet.setFrozenRows(1); } }); }
function initDbERP() { var ss = SpreadsheetApp.getActiveSpreadsheet(); Object.keys(SCHEMA_ERP).forEach(function(s) { if (!ss.getSheetByName(s)) { var sheet = ss.insertSheet(s); sheet.appendRow(SCHEMA_ERP[s]); sheet.setFrozenRows(1); sheet.getRange(1, 1, 1, SCHEMA_ERP[s].length).setFontWeight("bold").setBackground("#e6f5f5"); } }); }

// =========================================================================
// HÀM ĐỌC GOOGLE SHEETS (ĐÃ ĐƯỢC NÂNG CẤP THÊM TÍNH NĂNG LỌC - FILTERING)
// =========================================================================
function readSheet(name, filterFn, ss) {
  try {
    var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
    var sheet = activeSs.getSheetByName(name); if (!sheet) return [];
    var lastRow = sheet.getLastRow(); if (lastRow <= 1) return [];
    
    // Nới lỏng giới hạn lên 4000 dòng vì giờ API đã có khả năng tự động lọc bỏ bớt
    var maxRows = Math.min(lastRow, 4000); 
    var data = sheet.getRange(1, 1, maxRows, sheet.getLastColumn()).getValues();
    var headers = data[0]; var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j]; var header = headers[j];
        if (val instanceof Date) {
          if (val.getFullYear() === 1899) {
            if (val.getHours() === 0 && val.getMinutes() === 0 && val.getSeconds() === 0) {
              obj[header] = "";
            } else {
              obj[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), "HH:mm:ss");
            }
          } else if (val.getHours() === 0 && val.getMinutes() === 0 && val.getSeconds() === 0) {
            obj[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          } else {
            obj[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
          }
        } else if (header === 'date' && val) {
          var str = String(val).trim(); if (str.includes('T')) str = str.split('T')[0];
          if (str.includes('/')) { var parts = str.split('/'); if (parts.length === 3) str = parts[2] + '-' + parts[1].padStart(2,'0') + '-' + parts[0].padStart(2,'0'); }
          obj[header] = str;
        } else { obj[header] = String(val !== null && val !== undefined ? val : '').trim(); }
      }
      
      if (obj.id || name === 'Config_KPI') {
        // ÁP DỤNG MÀNG LỌC DỮ LIỆU ĐỂ GIẢM TẢI BỘ NHỚ CHO TRÌNH DUYỆT
        if (!filterFn || filterFn(obj)) {
           result.push(obj);
        }
      }
    } 
    return result;
  } catch (e) { return []; }
}

// =========================================================================
// HÀM GÓI DỮ LIỆU GỬI VỀ APP (LỌC BỎ RÁC VÀ DỮ LIỆU CŨ QUÁ 45 NGÀY)
// =========================================================================
function getAppData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss.getSheetByName('Trainings')) {
      var trainingsSheet = ss.insertSheet('Trainings');
      trainingsSheet.appendRow(SCHEMA.Trainings);
      trainingsSheet.setFrozenRows(1);
    }
    // 1. TẠO MỐC THỜI GIAN CẮT DỮ LIỆU (MẶC ĐỊNH LÀ 45 NGÀY TRƯỚC)
    var cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 45);
    var cutoffStr = Utilities.formatDate(cutoffDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

    // 2. LỌC ĐƠN HÀNG: Giữ đơn mới trong 45 ngày HOẶC đơn chưa hoàn tất
    var orders = readSheet('Orders', function(o) {
        var isRecent = (o.date >= cutoffStr) || (o.createdAt && o.createdAt.substring(0, 10) >= cutoffStr);
        var isPending = (o.status !== 'Đã Giao' && o.status !== 'Hoàn Thành' && o.status !== 'Đã Hủy');
        return isRecent || isPending;
    }, ss).map(function(o) {
      try { var acc = o.accessories; while (typeof acc === 'string') { acc = JSON.parse(acc); } o.accessories = Array.isArray(acc) ? acc : []; } catch(e) { o.accessories = []; }
      o.hasProduction = (String(o.hasProduction).toUpperCase() === 'TRUE'); return o;
    });

    // 3. LỌC LỆNH SẢN XUẤT: Giữ lệnh mới HOẶC lệnh chưa Done
    var prodItems = readSheet('Production', function(p) {
        var isRecent = (p.deadline && String(p.deadline).substring(0, 10) >= cutoffStr) || (p.date && p.date >= cutoffStr);
        var isPending = (p.status !== 'Done');
        return isRecent || isPending;
    }, ss).map(function(p) { return { id: p.id, orderId: p.orderId, type: p.type, name: p.name, note: p.note, status: p.status, deadline: p.deadline, fulfilledFromStock: (String(p.fulfilledFromStock).toUpperCase() === 'TRUE'), phases: { phase1: { name: p.p1_name||'', status: p.p1_status||'', user: p.p1_user||'', start: p.p1_start||'', endTime: p.p1_endTime||'', photo: p.p1_photo||'', reward_vnd: p.p1_reward_vnd || 0 }, phase2: { name: p.p2_name||'', status: p.p2_status||'', user: p.p2_user||'', start: p.p2_start||'', endTime: p.p2_endTime||'', photo: p.p2_photo||'', reward_vnd: p.p2_reward_vnd || 0 } } }; });
    
    // 4. LỌC ĐÓNG GÓI
    var packings = readSheet('Packings', function(p) {
        var isRecent = (p.endTime && String(p.endTime).substring(0, 10) >= cutoffStr) || (p.date >= cutoffStr);
        var isPending = (p.status !== 'Done');
        return isRecent || isPending;
    }, ss).map(function(p) { return { id: p.id, orderId: p.orderId, user: p.user || '', start: p.start || '', end: p.end || '', endTime: p.endTime || '', status: p.status || '', photo: p.photo || '', reward_vnd: Number(p.reward_vnd || 0) }; });
    
    // 5. LỌC CHẤM CÔNG (HR): Chỉ lấy đúng 45 ngày gần nhất để tính lương
    var attendance = readSheet('Attendance', function(a) { 
        return (a.date >= cutoffStr); 
    }, ss);

    var d = { orders: orders || [], prodItems: prodItems || [], packings: packings || [], attendance: attendance || [], kpiConfig: readSheet('Config_KPI', null, ss) || [], documents: readSheet('Documents', null, ss) || [], trainings: readSheet('Trainings', null, ss) || [] };
    
    // 6. LỌC CÁC BẢNG ERP (Lịch sử giao dịch, Thu chi, Thưởng phạt)
    Object.keys(SCHEMA_ERP).forEach(function(n) { 
        if (n === 'Transactions' || n === 'ImportExport' || n === 'BonusPenalty') {
            d[n] = readSheet(n, function(item) { 
                // Chỉ kéo về app các giao dịch tài chính & kho vận trong 45 ngày qua
                return (item.date && String(item.date).substring(0, 10) >= cutoffStr); 
            }, ss) || [];
        } else {
            // Hàng hoá (Products), Quỹ (Accounts) là dữ liệu Master nên giữ toàn bộ
            d[n] = readSheet(n, null, ss) || []; 
        }
    });

    var props = PropertiesService.getScriptProperties();
    d.announcement = props.getProperty('RF_ANNOUNCEMENT') || "Tối nay 20:00 ngày 15/06/2026.\nĐào tạo nâng cao kỹ năng quản lý. Có mặt đúng giờ!";

    d.serverTime = new Date().getTime(); return d;
  } catch(e) { return { error: e.toString() }; }
}

function applyDeltasToSheet(sheetName, items, formatter, ss) {
  var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSs.getSheetByName(sheetName); if(!sheet) return;
  var data = sheet.getDataRange().getValues();
  var headers = data[0] || SCHEMA[sheetName] || SCHEMA_ERP[sheetName] || [];

  var expectedSchema = SCHEMA[sheetName] || SCHEMA_ERP[sheetName] || [];
  if (expectedSchema.length > 0 && data.length > 0) {
    var missing = [];
    expectedSchema.forEach(function(col) {
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

  items.forEach(function(item) {
    var rowObject = formatter(item); 
    var found = false;
    for(var i=1; i<data.length; i++) { 
        if(String(data[i][0]) === String(item.id)) { 

            var newRow = headers.map(function(h, colIdx) { 
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

            sheet.getRange(i+1, 1, 1, newRow.length).setValues([newRow]); 
            data[i] = newRow;
            found = true; 
            break; 
        } 
    }
    if(!found) {
        var newRow = headers.map(function(h) { 
            var val = rowObject[h];
            if (typeof val === 'number' && isNaN(val)) return 0;
            return val !== undefined ? val : ''; 
        });
        sheet.appendRow(newRow);
        data.push(newRow);
    }
  });
}

function deleteDeltas(sheetName, itemIds, ss) {
   if (!itemIds || itemIds.length === 0) return;
   var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
   var sheet = activeSs.getSheetByName(sheetName); if (!sheet) return;
   var data = sheet.getDataRange().getValues();
   for (var i = data.length - 1; i >= 1; i--) { if (itemIds.indexOf(String(data[i][0])) !== -1) sheet.deleteRow(i + 1); }
}

function formatOrder(o) { return { "id": o.id, "orderCode": o.orderCode || '', "channel": o.channel || '', "customer": o.customer || '', "phone": o.phone || '', "address": o.address || '', "note": o.note || '', "createdAt": o.createdAt || '', "deadline": o.deadline || '', "date": o.date || '', "status": o.status || '', "accessories": typeof o.accessories === 'string' ? o.accessories : JSON.stringify(o.accessories || []), "hasProduction": o.hasProduction||false, "isCarriedToWH": o.isCarriedToWH || '', "updatedBy": o.updatedBy || '', "revenue": o.revenue||0, "prePaid": o.prePaid||0, "cod": o.cod||0, "costTotal": o.costTotal||0, "responsibleUser": o.responsibleUser||'' }; }
function formatProd(p) { var ph1 = (p.phases && p.phases.phase1) ? p.phases.phase1 : {}; var ph2 = (p.phases && p.phases.phase2) ? p.phases.phase2 : {}; return { "id": p.id, "orderId": p.orderId, "type": p.type||'', "name": p.name||'', "note": p.note||'', "status": p.status||'', "deadline": p.deadline||'', "fulfilledFromStock": p.fulfilledFromStock||false, "p1_name": ph1.name||'', "p1_status": ph1.status||'', "p1_user": ph1.user||'', "p1_start": ph1.start||'', "p1_endTime": ph1.endTime||'', "p1_photo": ph1.photo||'', "p1_reward_vnd": ph1.reward_vnd||0, "p2_name": ph2.name||'', "p2_status": ph2.status||'', "p2_user": ph2.user||'', "p2_start": ph2.start||'', "p2_endTime": ph2.endTime||'', "p2_photo": ph2.photo||'', "p2_reward_vnd": ph2.reward_vnd||0 }; }
function formatPacking(p) { return { "id": p.id, "orderId": p.orderId, "user": p.user||'', "start": p.start||'', "end": p.end||'', "endTime": p.endTime||'', "status": p.status||'', "photo": p.photo||'', "reward_vnd": p.reward_vnd||0 }; }
function formatAtt(a) { 
  return { 
    "id": a.id, "user": a.user||'', "date": a.date||'', 
    "morningIn": a.morningIn||'', "morningOut": a.morningOut||'', 
    "afternoonIn": a.afternoonIn||'', "afternoonOut": a.afternoonOut||'', 
    "leaveType": a.leaveType||'', "leaveReportAt": a.leaveReportAt||'', 
    "shift": a.shift||'', "timeIn": a.timeIn||'', "timeOut": a.timeOut||'', 
    "totalHours": a.totalHours||0, "status": a.status||'', "penalty": a.penalty||0, 
    "isEdited": a.isEdited||false, "leaveStart": a.leaveStart||'', "leaveEnd": a.leaveEnd||'', "note": a.note||'' 
  };
}

function formatProduct(p) { 
  return { 
    "id": p.id, "sku": p.sku||'', "name": p.name||'', "unit": p.unit||'', "image": p.image||'', 
    "category": p.category||'', "sub_category": p.sub_category||'', 
    "costPrice": p.costPrice||0, "price": p.price||0, "quantity": p.quantity||0,
    "minStock": p.minStock||0, "maxStock": p.maxStock||0, "realImage": p.realImage||'',
    "importUnit": p.importUnit||'', "conversionRate": p.conversionRate||1
  };
}

function formatAccount(a) { return { "id": a.id, "accountName": a.accountName||'', "balance": a.balance||0 }; }
function formatSupplier(s) { return { "id": s.id, "name": s.name||'', "phone": s.phone||'', "totalDebt": s.totalDebt||0, "category": s.category||'' }; }
function formatTransaction(t) { return { "id": t.id, "type": t.type||'', "category": t.category||'', "amount": t.amount||0, "fromAccount": t.fromAccount||'', "toAccount": t.toAccount||'', "title": t.title||'', "date": t.date||'', "note": t.note||'', "isAuto": t.isAuto||'' }; }
function formatImportExport(i) { return { "id": i.id, "type": i.type||'', "target": i.target||'', "totalAmount": i.totalAmount||0, "date": i.date||'', "note": i.note||'', "itemsData": i.itemsData||'' }; }
function formatDocument(d) { return { "id": d.id, "category": d.category || 'Khác', "title": d.title || '', "description": d.description || '', "link": d.link || '', "createdAt": d.createdAt || new Date().toISOString(), "createdBy": d.createdBy || '' }; }
function formatTraining(t) { return { "id": t.id, "title": t.title || '', "content": t.content || '', "targetRole": t.targetRole || 'ALL', "createdAt": t.createdAt || new Date().toISOString(), "createdBy": t.createdBy || '', "readUsers": typeof t.readUsers === 'string' ? t.readUsers : JSON.stringify(t.readUsers || []) }; }
function formatProfitReport(r) { return { "id": r.id, "period": r.period||'', "channel": r.channel||'', "revenue": r.revenue||0, "orderCount": r.orderCount||0, "platformFee": r.platformFee||0, "returns": r.returns||0, "discount": r.discount||0, "ads": r.ads||0, "cogs": r.cogs||0, "salary": r.salary||0, "operation": r.operation||0 }; }
function formatBonusPenalty(b) { return { "id": b.id, "user": b.user||'', "amount": b.amount||0, "type": b.type||'', "note": b.note||'', "date": b.date||'', "orderCode": b.orderCode||'' }; }
function formatKPIProg(k) { return { "id": k.id, "user": k.user||'', "kpiName": k.kpiName||'', "current": k.current||0, "target": k.target||0, "unit": k.unit||'', "lastUpdated": k.lastUpdated||'', "startTime": k.startTime||'', "endTime": k.endTime||'', "reward": k.reward||0, "isClaimed": k.isClaimed||false }; }

// HÀM LƯU PHÂN QUYỀN VÀ CẤU HÌNH NHÂN SỰ VỀ GOOGLE SHEETS
function updateUserConfigSheet(configPayload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config_NhanSu');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var pinsMap = configPayload.pins || {};
  var nameToPinData = {};
  Object.keys(pinsMap).forEach(function(pin) {
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
  var processedNames = {};
  
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0] || '').trim();
    if (!name) continue;
    
    if (nameToPinData[name]) {
      var update = nameToPinData[name];
      var updatedRow = [...data[i]];
      updatedRow[1] = update.avatar || '';
      updatedRow[2] = update.title || '';
      updatedRow[3] = update.role || '';
      updatedRow[4] = update.pin || '';
      newRows.push(updatedRow);
      processedNames[name] = true;
    } else {
      newRows.push(data[i]);
    }
  }
  
  Object.keys(nameToPinData).forEach(function(name) {
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

function syncDeltas(payload) {
  if (!payload) return getAppData();
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Hoàn trả số dư khi XOÁ giao dịch
    if (payload.deletes && payload.deletes.Transactions && payload.deletes.Transactions.length > 0) {
      var txSheet = ss.getSheetByName('Transactions');
      if (txSheet) {
        var txData = txSheet.getDataRange().getValues();
        var txHeaders = txData[0] || [];
        var idCol = txHeaders.indexOf('id');
        var amtCol = txHeaders.indexOf('amount');
        var fromCol = txHeaders.indexOf('fromAccount');
        var toCol = txHeaders.indexOf('toAccount');
        
        if (idCol !== -1 && amtCol !== -1 && fromCol !== -1 && toCol !== -1) {
          payload.deletes.Transactions.forEach(function(txId) {
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
    
    // 2. Cập nhật số dư khi THÊM/SỬA giao dịch
    if (payload.Transactions && payload.Transactions.length > 0) {
      var txSheet = ss.getSheetByName('Transactions');
      if (txSheet) {
        var txData = txSheet.getDataRange().getValues();
        var txHeaders = txData[0] || SCHEMA_ERP.Transactions;
        var idCol = txHeaders.indexOf('id');
        var amtCol = txHeaders.indexOf('amount');
        var fromCol = txHeaders.indexOf('fromAccount');
        var toCol = txHeaders.indexOf('toAccount');
        
        payload.Transactions.forEach(function(newTx) {
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

    if (payload.orders && payload.orders.length > 0) applyDeltasToSheet('Orders', payload.orders, formatOrder, ss);
    if (payload.prodItems && payload.prodItems.length > 0) applyDeltasToSheet('Production', payload.prodItems, formatProd, ss);
    if (payload.packings && payload.packings.length > 0) applyDeltasToSheet('Packings', payload.packings, formatPacking, ss);
    if (payload.attendance && payload.attendance.length > 0) applyDeltasToSheet('Attendance', payload.attendance, formatAtt, ss);
    if (payload.Products && payload.Products.length > 0) applyDeltasToSheet('Products', payload.Products, formatProduct, ss);
    if (payload.Accounts && payload.Accounts.length > 0) applyDeltasToSheet('Accounts', payload.Accounts, formatAccount, ss);
    if (payload.Suppliers && payload.Suppliers.length > 0) applyDeltasToSheet('Suppliers', payload.Suppliers, formatSupplier, ss);
    if (payload.Transactions && payload.Transactions.length > 0) applyDeltasToSheet('Transactions', payload.Transactions, formatTransaction, ss);
    if (payload.ImportExport && payload.ImportExport.length > 0) applyDeltasToSheet('ImportExport', payload.ImportExport, formatImportExport, ss);
    if (payload.documents && payload.documents.length > 0) applyDeltasToSheet('Documents', payload.documents, formatDocument, ss);
    if (payload.trainings && payload.trainings.length > 0) applyDeltasToSheet('Trainings', payload.trainings, formatTraining, ss);
    if (payload.ProfitReports && payload.ProfitReports.length > 0) applyDeltasToSheet('ProfitReports', payload.ProfitReports, formatProfitReport, ss);
    if (payload.BonusPenalty && payload.BonusPenalty.length > 0) applyDeltasToSheet('BonusPenalty', payload.BonusPenalty, formatBonusPenalty, ss);
    if (payload.KPI_Progress && payload.KPI_Progress.length > 0) applyDeltasToSheet('KPI_Progress', payload.KPI_Progress, formatKPIProg, ss);
    // XỬ LÝ RIÊNG TÀI CHÍNH CỘNG TÁC VIÊN (CÁCH LY VỚI SỔ QUỸ CHÍNH)
  if (payload.transactions && payload.transactions.length > 0) {
    let financeSheet = ss.getSheetByName('CTV_Finance');
    
    // Tự động tạo Sheet "CTV_Finance" nếu chưa tồn tại
    if (!financeSheet) {
      financeSheet = ss.insertSheet('CTV_Finance');
      financeSheet.appendRow(['id', 'date', 'type', 'amount', 'note', 'user', 'status']);
      financeSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
    }
    
    // Nạp các phiếu tài chính vào Sheet riêng biệt
    payload.transactions.forEach(t => {
      financeSheet.appendRow([t.id, t.date, t.type, t.amount, t.note, t.user, t.status]);
    });
  }
    if (payload.UserConfigs && payload.UserConfigs.length > 0) {
      updateUserConfigSheet(payload.UserConfigs[0]);
    }

    var props = PropertiesService.getScriptProperties();
    if (payload.announcement !== undefined) {
        props.setProperty('RF_ANNOUNCEMENT', payload.announcement);
    }
    if (payload.deletes) {
        ['Orders', 'Production', 'Packings', 'Products', 'ImportExport', 'Transactions', 'Accounts', 'Suppliers', 'BonusPenalty', 'KPI_Progress', 'Attendance', 'Documents', 'Trainings'].forEach(function(sName) {
         if(payload.deletes[sName]) deleteDeltas(sName, payload.deletes[sName], ss);
       });
    }
    SpreadsheetApp.flush();
    props.setProperty('RF_LAST_UPDATED', new Date().getTime().toString());
    
  } finally { lock.releaseLock(); }
  
  var d = getAppData();
  d.serverTime = new Date().getTime();
  return d;
}

const ADMIN_ROLES = ['TỐI CAO', 'SẢN XUẤT', 'KHO VẬN', 'BÁN HÀNG', 'NHÂN SỰ', 'KẾ TOÁN', 'KIỂM TOÁN', 'NHÂN VIÊN'];
const BOSS_ROLES = ['TỐI CAO'];

function getUserConfig() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('USER_CONFIG');
  
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { console.warn('Cache corrupted, reloading from sheet...'); }
  }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config_NhanSu');
    if (!sheet) { console.error('Sheet Config_NhanSu not found'); return getEmptyConfig(); }

    const data = sheet.getDataRange().getValues();
    const config = { avatars: {}, titles: {}, salaries: {}, pins: {}, users: [], roles: {} };

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = String(row[0] || '').trim();
      if (!name) continue;

      config.users.push(name);
      const linkOrId = String(row[1] || '').trim();
      if (linkOrId) {
        const match = linkOrId.match(/[-\w]{25,}/);
        config.avatars[name] = match ? match[0] : linkOrId;
      }

      const title = String(row[2] || '').trim();
      if (title) config.titles[name] = title;

      const role = String(row[3] || '').trim().toUpperCase() || 'THỢ';
      config.roles[name] = role;

      var pin = String(row[4] || '').trim();
      if (pin) {
        // Loại bỏ phần thập phân .0 nếu có (ví dụ "123456.0" -> "123456")
        pin = pin.replace(/\.0+$/, '');
        
        var pinObj = {
          name: name,
          role: role,
          title: title,
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
        baseSalary: parseNumber(row[5]),
        funcSalary: parseNumber(row[6]),
        allowance: parseNumber(row[7]),
        deduction: parseNumber(row[8])
      };
    }

    cache.put('USER_CONFIG', JSON.stringify(config), 300);
    return config;

  } catch (e) {
    console.error('Error in getUserConfig:', e);
    return getEmptyConfig();
  }
}

function parseNumber(val) {
  if (!val) return 0;
  const num = Number(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

function getEmptyConfig() {
  return { avatars: {}, titles: {}, salaries: {}, pins: {}, users: [], roles: {} };
}

function validatePin(pin) {
  if (!pin) { return { valid: false, user: null, role: '', isAdmin: false, isBoss: false }; }
  const config = getUserConfig();
  
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

  if (!userInfo) { return { valid: false, user: null, role: '', isAdmin: false, isBoss: false }; }
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
      const result = getSopAndRewardBackend(prodItem, prodItem.p1_name, kpiConfig);
      const currentReward = Number(prodItem.p1_reward_vnd) || 0;
      if (result.reward !== currentReward) {
        const col = prodHeaders.indexOf('p1_reward_vnd') + 1;
        if (col > 0) { prodSheet.getRange(i + 1, col).setValue(result.reward); hasChange = true; }
      }
    }

    if (prodItem.p2_status === 'Done' && prodItem.p2_name) {
      const result = getSopAndRewardBackend(prodItem, prodItem.p2_name, kpiConfig);
      const currentReward = Number(prodItem.p2_reward_vnd) || 0;
      if (result.reward !== currentReward) {
        const col = prodHeaders.indexOf('p2_reward_vnd) + 1');
        if (col > 0) { prodSheet.getRange(i + 1, col).setValue(result.reward); hasChange = true; }
      }
    }
    if (hasChange) updatedCount++;
  }
  return updatedCount;
}

function getSopAndRewardBackend(item, phaseName, kpiConfig) {
  if (!item?.name || !kpiConfig?.length) { return { time: 30, reward: 0 }; }
  const rawName = String(item.name).toLowerCase().trim();
  const phase = String(phaseName || '').toLowerCase();

  const normalizeName = (name) => {
    return name
      .replace(/ver\.?\s*\d+/gi, '')
      .replace(/-\s*size\s*\d+/gi, '')
      .replace(/rừng|đảo|bonsai|trang|cover|nature/gi, '')
      .replace(/[-\s]+/g, ' ')
      .trim();
  };

  const itemName = normalizeName(rawName);
  const isLayoutItem = /rừng|layout|đảo|bonsai|trang|cover|nature/i.test(rawName);
  let matchedRow = null;

  matchedRow = kpiConfig.find(row => {
    const rowName = normalizeName(String(row['Tên Hàng'] || ''));
    if (!rowName) return false;
    return itemName === rowName || itemName.includes(rowName) || rowName.includes(itemName);
  });

  if (!matchedRow) {
    const sizeMatch = rawName.match(/(\d{2,3})[x×]/);
    const size = sizeMatch ? parseInt(sizeMatch[1]) : 0;

    if (size > 0) {
      matchedRow = kpiConfig.find(row => {
        const rowName = String(row['Tên Hàng'] || '').toLowerCase();
        if (isLayoutItem && !rowName.includes('layout') && !rowName.includes('lay-')) return false;
        if (size >= 130) return rowName.includes('130');
        if (size >= 110) return rowName.includes('110') || rowName.includes('120');
        if (size >= 70)  return rowName.includes('70');
        if (size >= 50)  return rowName.includes('50');
        if (size >= 40)  return rowName.includes('40');
        if (size >= 30)  return rowName.includes('30');
        if (size >= 20)  return rowName.includes('20');
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
  if (phase.includes('phase1') || phase.includes('cắt') || phase.includes('dán') || phase.includes('dựng')) {
    reward = Number(matchedRow['Tiền Khâu 1']) || 0;
  } 
  else if (phase.includes('phase2') || phase.includes('gọt') || phase.includes('keo') || phase.includes('gia cố')) {
    reward = Number(matchedRow['Tiền Khâu 2']) || 0;
  } 
  else if (phase.includes('đóng gói') || phase.includes('pack')) {
    reward = Number(matchedRow['Thưởng Đóng Gói']) || 0;
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
    if (p.orderId && p.name && !orderItemMap[p.orderId]) { orderItemMap[p.orderId] = p.name; }
  }

  const packValues = packSheet.getDataRange().getValues();
  const packHeaders = packValues[0];
  let updatedCount = 0;

  for (let i = 1; i < packValues.length; i++) {
    const row = packValues[i];
    const pack = {}; packHeaders.forEach((h, idx) => pack[h] = row[idx]);
    if (pack.status !== 'Done' || !pack.orderId) continue;

    const itemName = orderItemMap[pack.orderId] || ''; if (!itemName) continue;
    const newReward = getPackingReward(itemName, kpiConfig);

    if (Number(pack.reward_vnd) !== newReward) {
      const col = packHeaders.indexOf('reward_vnd') + 1;
      if (col > 0) { packSheet.getRange(i + 1, col).setValue(newReward); updatedCount++; }
    }
  }
  return updatedCount;
}

function getPackingReward(itemName, kpiConfig) {
  if (!itemName || !kpiConfig || kpiConfig.length === 0) return 1000;
  const rawName = String(itemName).toLowerCase().trim();

  const normalizeName = (name) => {
    return name.replace(/ver\.?\s*\d+/gi, '').replace(/-\s*size\s*\d+/gi, '').replace(/rừng|đảo|bonsai|trang|cover|nature/gi, '').replace(/[-\s]+/g, ' ').trim();
  };

  const normalizedItem = normalizeName(rawName);
  let matchedRow = kpiConfig.find(row => {
    const rowName = normalizeName(String(row['Tên Hàng'] || ''));
    return rowName && (normalizedItem === rowName || normalizedItem.includes(rowName) || rowName.includes(normalizedItem));
  });

  if (!matchedRow) {
    const sizeMatch = rawName.match(/(\d{2,3})[x×]/);
    const size = sizeMatch ? parseInt(sizeMatch[1]) : 0;

    if (size > 0) {
      matchedRow = kpiConfig.find(row => {
        const rowName = String(row['Tên Hàng'] || '').toLowerCase();
        if (size >= 130) return rowName.includes('130');
        if (size >= 110) return rowName.includes('110') || rowName.includes('120');
        if (size >= 70)  return rowName.includes('70');
        if (size >= 50)  return rowName.includes('50');
        if (size >= 40)  return rowName.includes('40');
        if (size >= 30)  return rowName.includes('30');
        if (size >= 20)  return rowName.includes('20');
        return false;
      });
    }
  }

  if (!matchedRow) return 1000;
  return Number(matchedRow['Thưởng Đóng Gói']) || 1000;
}

function getAppDataDelta(lastClientSync) {
  var props = PropertiesService.getScriptProperties(); 
  var lastServerUpdate = props.getProperty('RF_LAST_UPDATED');
  if (!lastServerUpdate || !lastClientSync || parseInt(lastServerUpdate) > parseInt(lastClientSync)) { 
    var data = getAppData(); data.hasChanges = true; return data; 
  }
  return { hasChanges: false, serverTime: new Date().getTime() };
}

function saveAppData(payload) { return syncDeltas(payload); }

const GEMINI_API_KEY = 'AQ.Ab8RN6KJvoaYlF_wR4zn0isMypbJ-yHxbvO8m_jP9GI-UT7v4Q'; 
function askAssistant(question, userName, userRole) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') return "⚠️ Chưa lắp API Key!";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
  const now = new Date();
  const currentDate = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy");
  const currentTime = Utilities.formatDate(now, "GMT+7", "HH:mm:ss");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const getLightData = (sheetName) => {
    try {
      const sheet = ss.getSheetByName(sheetName); if (!sheet) return `Chưa có tab ${sheetName}`;
      const data = sheet.getDataRange().getDisplayValues(); if (data.length <= 1) return `Tab ${sheetName} đang trống.`;
      const headers = data[0].join(" | ");
      const limitedData = data.length > 50 ? data.slice(-100) : data.slice(1);
      return `CỘT: ${headers}\n${limitedData.map(r => r.join(" | ")).join("\n")}`;
    } catch(e) { return `Lỗi đọc ${sheetName}: ${e.message}`; }
  };

  const duLieuDonHang = getLightData("Orders");
  const duLieuKho = getLightData("Products");
  const duLieuKPI = getLightData("Config_KPI");

  let duLieuDiemDanh = "Chưa có dữ liệu điểm danh.";
  try {
    const sheetDD = ss.getSheetByName("Attendance");
    if (sheetDD) {
      const dataDD = sheetDD.getDataRange().getDisplayValues();
      const todayRows = dataDD.filter((r, idx) => idx === 0 || r.join("").includes(currentDate));
      duLieuDiemDanh = todayRows.map(r => r.join(" | ")).join("\n");
    }
  } catch(e) {}

  const systemPrompt = `Bạn là Trợ lý Quản trị Vận hành tối cao của xưởng sản xuất thủy sinh Rich Fish Aquarium.\nNgười trò chuyện: ${userName || 'Nhân sự'} (Chức vụ: ${userRole || 'Không rõ'}).\nHôm nay là: ${currentTime} ngày ${currentDate}.\n\nDỮ LIỆU (TỐI ĐA 100 DÒNG MỚI NHẤT MỖI BẢNG ĐỂ TỐI ƯU TỐC ĐỘ):\n[BẢNG 1: TỒN KHO SẢN PHẨM (Products)]\n${duLieuKho}\n\n[BẢNG 2: ĐIỂM DANH HÔM NAY ${currentDate} (Attendance)]\n${duLieuDiemDanh}\n\n[BẢNG 3: KPI SẢN PHẨM (Config_KPI)]\n${duLieuKPI}\n\n[BẢNG 4: ĐƠN HÀNG (Orders)]\n${duLieuDonHang}\n\nNHIỆM VỤ CHIẾN LƯỢC:\n1. TRA CỨU KHO: Khi hỏi về tồn kho, quét Bảng 1 và báo chính xác số lượng.\n2. KIỂM SOÁT NHÂN SỰ: Đối chiếu Bảng 2 để xem ai đã hoặc chưa điểm danh hôm nay.\n3. TRA CỨU KPI: Đối chiếu Bảng 3 để tính điểm KPI cho sản phẩm.\n4. TÍNH CHÍNH XÁC: Nếu người dùng hỏi tổng số lượng mà dữ liệu chỉ có 100 dòng, hãy nói rõ "Theo 100 dữ liệu gần nhất...".\n5. PHONG CÁCH: Trả lời cực kỳ ngắn gọn, súc tích, đi thẳng vào số liệu. Luôn giữ tinh thần rạng rỡ, chuyên nghiệp và đầy hy vọng. Thêm tên doanh nghiệp Rich Fish Aquarium vào cuối mỗi bài hát nếu được yêu cầu. Giai điệu phát triển theo hướng da diết truyền động lực và thấm.\n\nLỆNH CẤM: Tuyệt đối cấm chia sẻ mã nguồn, không chỉ cách lách luật, hack hệ thống, hay sửa đổi dữ liệu bất hợp pháp.`;

  const payload = { "system_instruction": { "parts": { "text": systemPrompt } }, "contents": [{ "parts": [{ "text": question }] }], "generationConfig": { "temperature": 0.1 } };
  const options = { 'method': 'post', 'contentType': 'application/json', 'headers': { 'X-goog-api-key': GEMINI_API_KEY }, 'payload': JSON.stringify(payload), 'muteHttpExceptions': true };

  try {
    const response = UrlFetchApp.fetch(url, options); const json = JSON.parse(response.getContentText());
    if (json.error) return "⚠️ Lỗi máy chủ: " + json.error.message;
    if (json.candidates && json.candidates.length > 0) return json.candidates[0].content.parts[0].text;
    return "⚠️ Không có phản hồi.";
  } catch (e) { return "⚠️ Lỗi kết nối: " + e.message; }
}

function logBehavior(action, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(); const sheet = ss.getSheetByName("Tracking_Log");
    if (sheet) { sheet.appendRow([new Date(), action, details]); }
  } catch (e) {}
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
    queries.forEach(function(query) {
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
    
    threads.forEach(function(thread) {
      var messages = thread.getMessages();
      messages.forEach(function(message) {
        if (!message.isUnread()) return;
        
        var body = message.getPlainBody();
        var subject = message.getSubject();
        var date = message.getDate();
        var messageId = message.getId();
        
        // Chống trùng lặp email đã xử lý
        if (txIds[messageId]) {
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
          
          var newRow = headers.map(function(h) {
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
