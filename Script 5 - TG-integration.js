function main() {
  var campaignIterator = AdsApp.campaigns()
    .withCondition("Status = 'PAUSED'")
    .get();

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();

    if (!campaign.isEnabled()) {
      sendTelegramMessage('Кампания приостановлена: ' + campaign.getName());
    }

    var todayStats = campaign.getStatsFor("TODAY");
    if (todayStats.getCost() >= campaign.getBudget().getAmount()) {
      sendTelegramMessage('Кампания достигла суточного бюджета: ' + campaign.getName());
    }
  }
}
//Настройки Telegram-бота
function sendTelegramMessage(message) {
  var botToken = 'СЮДА ТОКЕН БОТА'; // Замените на ваш токен бота
  var chatId = 'СЮДА CHAT-ID';     // Замените на ваш chat_id
  
  var encodedMessage = encodeURIComponent(message);
  var telegramUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage?chat_id=" + chatId + "&text=" + encodedMessage;

  try {
    var response = UrlFetchApp.fetch(telegramUrl);
    Logger.log("Уведомление отправлено: " + message);
  } catch (e) {
    Logger.log("Ошибка при отправке уведомления: " + e.message);
  }
}

