function main() {
  var spreadsheetUrl = "СЮДА ССЫЛКУ НА ВАШУ ГУГЛ-ТАБЛИЦУ ССЫЛКА ЗАКАНЧИВАЕТСЯ НА /edit";
  var statusSheetName = "Campaign Status"; 
  var reachSheetName = "Daily Reach"; 
  
  var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);

  // Добавляем статус кампаний
  updateCampaignStatus(spreadsheet, statusSheetName);

  // Обновляем охваты раз в сутки
  if (isMidnight()) {
    updateDailyReach(spreadsheet, reachSheetName);
  }
}

// Добавление статуса кампаний в новые строки
function updateCampaignStatus(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  
  // Проверяем, есть ли заголовки, если нет — добавляем
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Дата и время", "Кампания", "ID", "Статус"]);
  }

  var campaigns = AdsApp.campaigns().get();
  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    sheet.appendRow([
      new Date().toLocaleString(),
      campaign.getName(),
      campaign.getId(),
      campaign.isEnabled() ? "Активна" : (campaign.isPaused() ? "Приостановлена" : "Остановлена")
    ]);
  }
}

// Добавление охватов за прошедшие сутки в новые строки
function updateDailyReach(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  
  // Проверяем, есть ли заголовки, если нет — добавляем
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Дата", "Кампания", "ID", "Охваты"]);
  }

  var date = new Date();
  date.setDate(date.getDate() - 1); // Вчерашний день
  var formattedDate = Utilities.formatDate(date, AdsApp.currentAccount().getTimeZone(), "yyyy-MM-dd");

  var campaigns = AdsApp.campaigns().get();
  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    var stats = campaign.getStatsFor("YESTERDAY");
    sheet.appendRow([
      formattedDate,
      campaign.getName(),
      campaign.getId(),
      stats.getImpressions()
    ]);
  }
}

// Проверяет, наступила ли полночь
function isMidnight() {
  var now = new Date();
  return now.getHours() === 0 && now.getMinutes
}
