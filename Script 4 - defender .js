// Конфигурация
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // ID вашей Google Таблицы
const MAX_COST = 5; // Максимальный допустимый расход ($5)
const MIN_CLICKS = 2; // Минимальное количество кликов (2)

// Функция для обнаружения подозрительной активности и остановки кампаний
function detectAndPauseCampaigns() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('Incidents') || spreadsheet.insertSheet('Incidents');
  
  // Создаем заголовки, если таблица пустая
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Campaign Name', 'Cost', 'Clicks']);
  }
  
  const campaignIterator = AdsApp.campaigns().get();
  
  while (campaignIterator.hasNext()) {
    const campaign = campaignIterator.next();
    const stats = campaign.getStatsFor('TODAY'); // Получаем статистику за сегодня
    
    const cost = stats.getCost(); // Расход
    const clicks = stats.getClicks(); // Количество кликов
    
    Logger.log(`Обработка кампании: ${campaign.getName()}, Расход: $${cost}, Клики: ${clicks}`);
    
    // Условие для подозрительной активности
    if (cost > MAX_COST && clicks < MIN_CLICKS) {
      campaign.pause(); // Останавливаем кампанию
      
      // Логируем инцидент в Google Таблицу
      const timestamp = new Date();
      sheet.appendRow([timestamp, campaign.getName(), cost, clicks]);
      
      Logger.log(`Кампания "${campaign.getName()}" остановлена из-за подозрительной активности.`);
    }
  }
  
  Logger.log('Проверка завершена.');
}

// Установка триггера для частого выполнения (например, каждые 15 минут)
function setupTrigger() {
  ScriptApp.newTrigger('detectAndPauseCampaigns')
    .timeBased()
    .everyMinutes(15)
    .create();
}