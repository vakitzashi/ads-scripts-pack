function main() {
  // Получаем все активные кампании
  var campaignIterator = AdsApp.campaigns()
    .withCondition("Status = 'PAUSED'")  // Фильтруем по активным кампаниям
    .get();

  // Перебираем кампании и проверяем их статус
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();

    // Проверяем, если кампания приостановлена
    if (!campaign.isEnabled()) {
      sendTelegramMessage('Кампания приостановлена: ' + campaign.getName());
    }

    // Проверяем, если кампания достигла суточного бюджета
    var todayStats = campaign.getStatsFor("TODAY");
    if (todayStats.getCost() >= campaign.getBudget().getAmount()) {
      sendTelegramMessage('Кампания достигла суточного бюджета: ' + campaign.getName());
    }
  }
}

function sendTelegramMessage(message) {
  var botToken = 'СЮДА ТОКЕН БОТА'; // Замените на ваш токен бота
  var chatId = 'СЮДА CHAT-ID';     // Замените на ваш chat_id
  
  // Экранируем параметры, чтобы избежать проблем с URL
  var encodedMessage = encodeURIComponent(message);
  var telegramUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage?chat_id=" + chatId + "&text=" + encodedMessage;

  // Отправляем запрос в Telegram API
  try {
    var response = UrlFetchApp.fetch(telegramUrl);
    Logger.log("Уведомление отправлено: " + message);
  } catch (e) {
    Logger.log("Ошибка при отправке уведомления: " + e.message);
  }
}
