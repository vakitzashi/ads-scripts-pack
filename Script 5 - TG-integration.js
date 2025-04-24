// Конфигурация
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; // Токен вашего Telegram-бота
const TELEGRAM_CHAT_IDS = ['CHAT_ID_1', 'CHAT_ID_2']; // ID чатов администраторов
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // ID вашей Google Таблицы
const INCIDENT_SHEET_NAME = 'Incidents'; // Название листа с инцидентами

// Функция для отправки уведомлений в Telegram
function sendTelegramNotifications() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(INCIDENT_SHEET_NAME);
  
  if (!sheet) {
    Logger.log('Лист с инцидентами не найден.');
    return;
  }
  
  const data = sheet.getDataRange().getValues(); // Получаем все данные из таблицы
  if (data.length <= 1) {
    Logger.log('Нет новых инцидентов для уведомления.');
    return;
  }
  
  // Удаляем заголовки и фильтруем только новые инциденты
  const incidents = data.slice(1).filter(row => row[0] !== ''); // Исключаем пустые строки
  
  if (incidents.length === 0) {
    Logger.log('Нет новых инцидентов для уведомления.');
    return;
  }
  
  // Формируем сообщение
  let message = `🚨 *Уведомление о приостановленных кампаниях* 🚨\n\n`;
  incidents.forEach((incident, index) => {
    const [timestamp, campaignName, cost, clicks] = incident;
    message += `${index + 1}. Кампания: *${campaignName}*\n`;
    message += `   - Расход: $${cost}\n`;
    message += `   - Клики: ${clicks}\n`;
    message += `   - Время: ${timestamp}\n\n`;
  });
  
  // Отправляем сообщение всем администраторам
  TELEGRAM_CHAT_IDS.forEach(chatId => {
    sendTelegramMessage(chatId, message);
  });
  
  Logger.log(`Уведомления отправлены. Всего инцидентов: ${incidents.length}`);
}

// Вспомогательная функция для отправки сообщения через Telegram API
function sendTelegramMessage(chatId, message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}

// Установка триггера для выполнения раз в час
function setupTrigger() {
  ScriptApp.newTrigger('sendTelegramNotifications')
    .timeBased()
    .everyHours(1)
    .create();
}