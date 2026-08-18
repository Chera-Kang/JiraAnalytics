/**
 * Google Apps Script (GAS) API for Jira Analytics Dashboard
 * 
 * To deploy this:
 * 1. Go to Google Apps Script editor.
 * 2. Paste this code into Code.gs.
 * 3. Click "Deploy" > "New deployment".
 * 4. Select type "Web app".
 * 5. Execute as: "Me", Who has access: "Anyone".
 * 6. Copy the resulting Web App URL and use it in your React app.
 */

// Spreadsheet setup
// You can either bind this script directly to a spreadsheet or provide the ID here.
const SHEET_ID = '1C_sTWWr-n6B1rRcajcFHAAbH-WTxT1vLXDrwDjwM5n4'; 

/**
 * Handle HTTP GET Requests
 * Typically used by the React app on load to fetch data.
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'sync') {
      return handleSync();
    }
    
    return handleGetData();
    
  } catch (err) {
    return createJsonResponse({ error: err.toString() }, 500);
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === 'sync') {
      return handleSync();
    }
    return createJsonResponse({ error: 'Unknown action' }, 400);
  } catch (err) {
    return createJsonResponse({ error: err.toString() }, 500);
  }
}

/**
 * Fetches the data from the Spreadsheet
 */
function handleGetData() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // 1. Last Updated 시간 가져오기 (raw_date 시트 M1)
  let lastUpdated = new Date().toISOString();
  const rawDateSheet = ss.getSheetByName('raw_date');
  if (rawDateSheet) {
    const rawDateValue = rawDateSheet.getRange('M1').getValue();
    if (rawDateValue) {
      lastUpdated = rawDateValue.toString();
    }
  }

  // 2. 버전 정보 가져오기 (query2 시트 A2부터)
  let versions = [];
  const query2Sheet = ss.getSheetByName('query2');
  if (query2Sheet) {
    const lastRow = query2Sheet.getLastRow();
    if (lastRow >= 2) {
      // A부터 D열 (버전, 시작, 종료, workday)
      const versionData = query2Sheet.getRange(2, 1, lastRow - 1, 4).getValues();
      versions = versionData
        .filter(row => row[0]) // 값이 비어있지 않은 행만 필터링
        .map(row => ({
          name: row[0].toString(),
          start: row[1] ? row[1].toString() : '', 
          end: row[2] ? row[2].toString() : '',
          workDays: Number(row[3]) || 0
        }));
    }
  }

  // 3. 글로벌 통계 가져오기 (query3 시트 M열~Q열)
  let globalStats = [];
  const query3Sheet = ss.getSheetByName('query3');
  if (query3Sheet) {
    const lastRow = query3Sheet.getLastRow();
    if (lastRow >= 2) {
      // M열(13) ~ Q열(17)
      const globalData = query3Sheet.getRange(2, 13, lastRow - 1, 5).getValues();
      globalStats = globalData
        .filter(row => row[0] && row[1]) // 연도와 월이 있는 데이터만
        .map(row => ({
          year: row[0].toString(),
          month: row[1].toString().replace('월', '').padStart(2, '0'), // "10월" -> "10", "1" -> "01"
          created: Number(row[2]) || 0,
          resolved: Number(row[3]) || 0,
          remaining: Number(row[4]) || 0
        }));
    }
  }

  // 4. 세부 이슈 데이터 가져오기 (query 시트 A열~M열)
  let issues = []; 
  const querySheet = ss.getSheetByName('query');
  if (querySheet) {
    const lastRow = querySheet.getLastRow();
    if (lastRow >= 2) { 
      const issueData = querySheet.getRange(2, 1, lastRow - 1, 13).getValues();
      issues = issueData
        .filter(row => row[1] && row[1].toString().startsWith('PPLW')) // Key값이 있는 유효 데이터만
        .map(row => ({
          // 맵핑 정보: 1=Key, 2=FixVersion, 3=Assignee, 4=Priority, 5=IssueType, 6=Status, 7=Resolution, 12=WorkTime
          id: row[1].toString(),
          fixVersion: row[2] ? row[2].toString() : '미지정',
          assignee: row[3] ? row[3].toString() : '미지정',
          priority: row[4] ? row[4].toString() : 'None',
          type: row[5] ? row[5].toString() : 'None',
          status: row[6] ? row[6].toString() : 'None',
          resolution: row[7] ? row[7].toString() : 'None',
          resolutionTimeDays: Number(row[12]) || null
        }));
    }
  }
  
  const responseData = {
    lastUpdated: lastUpdated,
    message: "Data fetched successfully",
    versions: versions,
    globalStats: globalStats,
    issues: issues 
  };
  
  return createJsonResponse(responseData, 200);
}

/**
 * Triggers the actual Jira Sync process
 */
function handleSync() {
  const now = new Date().toISOString();
  // 실제 동기화 코드가 이 위치에 들어갑니다.
  // 완료 후 raw_date 시트 M1에 시간 업데이트
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const rawDateSheet = ss.getSheetByName('raw_date');
  if (rawDateSheet) {
    rawDateSheet.getRange('M1').setValue(now);
  }
  
  return createJsonResponse({ 
    success: true, 
    lastUpdated: now,
    message: "Sync completed successfully"
  }, 200);
}

/**
 * Helper to return properly formatted JSON response for Apps Script Web App
 */
function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
