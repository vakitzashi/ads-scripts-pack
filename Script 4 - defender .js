
const SPREADSHEET_ID = 'ID_ВАШЕЙ_GOOGLE-ТАБЛИЦЫ';
const MAX_COST = 5; // Максимальный допустимый расход ($)
const MIN_CLICKS = 2; // Минимальное количество кликов (2)

function detectAndPauseCampaigns() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('Incidents') || spreadsheet.insertSheet('Incidents');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Campaign Name', 'Cost', 'Clicks']);
  }
  
  const campaignIterator = AdsApp.campaigns().get();
  
  while (campaignIterator.hasNext()) {
    const campaign = campaignIterator.next();
    const stats = campaign.getStatsFor('TODAY');
    
    const cost = stats.getCost();
    const clicks = stats.getClicks();
    
    Logger.log(`Обработка кампании: ${campaign.getName()}, Расход: $${cost}, Клики: ${clicks}`);
    
    if (cost > MAX_COST && clicks < MIN_CLICKS) {
      campaign.pause();
      
      const timestamp = new Date();
      sheet.appendRow([timestamp, campaign.getName(), cost, clicks]);
      
      Logger.log(`Кампания "${campaign.getName()}" остановлена из-за подозрительной активности.`);
    }
  }
  
  Logger.log('Проверка завершена.');
}

function setupTrigger() {
  ScriptApp.newTrigger('detectAndPauseCampaigns')
    .timeBased()
    .everyMinutes(15)
    .create();

}
