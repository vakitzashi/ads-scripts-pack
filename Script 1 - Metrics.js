// ������������
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // ID ����� Google �������
const GOOGLE_ADS_ACCOUNT_IDS = ['123-456-7890', '098-765-4321']; // ������ ��������� Google Ads
const REPORT_DATE_RANGE = 'LAST_7_DAYS'; // �������� ��� ������
const METRICS = ['metrics.impressions', 'metrics.clicks', 'metrics.ctr', 'metrics.cost_micros', 'metrics.conversions']; // ������� ��� ��������
const DIMENSIONS = ['campaign.name']; // ��������� (��������, �������� ��������)

// ������� ��� ��������� ������ �� Google Ads
function fetchGoogleAdsData() {
  const reports = [];
  
  GOOGLE_ADS_ACCOUNT_IDS.forEach(accountId => {
    const query = `
      SELECT ${DIMENSIONS.join(', ')}, ${METRICS.join(', ')}
      FROM campaign
      WHERE segments.date DURING ${REPORT_DATE_RANGE}
    `;
    
    const report = AdsApp.report(query, {
      includeZeroImpressions: false,
      apiVersion: 'v11'
    });
    
    const rows = report.rows();
    while (rows.hasNext()) {
      const row = rows.next();
      const rowData = {};
      DIMENSIONS.forEach(dim => rowData[dim] = row[dim]);
      METRICS.forEach(metric => rowData[metric] = row[metric]);
      rowData['account_id'] = accountId; // ��������� ID ��������
      reports.push(rowData);
    }
  });
  
  return reports;
}

// ������� ��� ������ ������ � Google �������
function exportDataToSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('Data') || spreadsheet.insertSheet('Data');
  
  // ������� ������ ������
  sheet.clearContents();
  
  // �������� ������ �� Google Ads
  const data = fetchGoogleAdsData();
  
  if (data.length === 0) {
    Logger.log('��� ������ ��� ��������.');
    return;
  }
  
  // ��������� ���������
  const headers = ['Account ID'].concat(DIMENSIONS, METRICS);
  sheet.appendRow(headers);
  
  // ���������� ������
  data.forEach(row => {
    const rowData = [row['account_id']];
    DIMENSIONS.forEach(dim => rowData.push(row[dim]));
    METRICS.forEach(metric => rowData.push(row[metric]));
    sheet.appendRow(rowData);
  });
  
  Logger.log(`������� ��������. ����� �����: ${data.length}`);
}

// ��������� �������� ��� ����������� ����������
function setupTrigger() {
  ScriptApp.newTrigger('exportDataToSheet')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}