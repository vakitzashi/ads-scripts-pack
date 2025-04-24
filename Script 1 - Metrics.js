// Конфигурация
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // ID вашей Google Таблицы
const GOOGLE_ADS_ACCOUNT_IDS = ['123-456-7890', '098-765-4321']; // Список аккаунтов Google Ads
const REPORT_DATE_RANGE = 'LAST_7_DAYS'; // Диапазон дат отчета
const METRICS = ['metrics.impressions', 'metrics.clicks', 'metrics.ctr', 'metrics.cost_micros', 'metrics.conversions']; // Метрики для экспорта
const DIMENSIONS = ['campaign.name']; // Измерения (например, название кампании)

// Функция для получения данных из Google Ads
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
      rowData['account_id'] = accountId; // Добавляем ID аккаунта
      reports.push(rowData);
    }
  });
  
  return reports;
}

// Функция для записи данных в Google Таблицу
function exportDataToSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('Data') || spreadsheet.insertSheet('Data');
  
  // Очищаем старые данные
  sheet.clearContents();
  
  // Получаем данные из Google Ads
  const data = fetchGoogleAdsData();
  
  if (data.length === 0) {
    Logger.log('Нет данных для экспорта.');
    return;
  }
  
  // Формируем заголовки
  const headers = ['Account ID'].concat(DIMENSIONS, METRICS);
  sheet.appendRow(headers);
  
  // Записываем данные
  data.forEach(row => {
    const rowData = [row['account_id']];
    DIMENSIONS.forEach(dim => rowData.push(row[dim]));
    METRICS.forEach(metric => rowData.push(row[metric]));
    sheet.appendRow(rowData);
  });
  
  Logger.log(`Экспорт завершен. Всего строк: ${data.length}`);
}

// Установка триггера для ежедневного выполнения
function setupTrigger() {
  ScriptApp.newTrigger('exportDataToSheet')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}