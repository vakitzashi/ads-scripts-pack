// Конфигурация
const EFFECTIVE_CTR_THRESHOLD = 0.03; // Порог CTR для эффективных ключей (3%)
const EFFECTIVE_CONVERSIONS_THRESHOLD = 1; // Минимальное количество конверсий для эффективных ключей
const INEFFECTIVE_CTR_THRESHOLD = 0.01; // Порог CTR для неэффективных ключей (1%)
const BID_INCREASE_PERCENTAGE = 0.2; // Процент повышения ставки для эффективных ключей (20%)
const BID_DECREASE_PERCENTAGE = 0.1; // Процент понижения ставки для неэффективных ключей (10%)

// Функция для классификации и корректировки ставок
function classifyAndAdjustKeywords() {
  const campaignIterator = AdsApp.campaigns().get();
  
  while (campaignIterator.hasNext()) {
    const campaign = campaignIterator.next();
    Logger.log(`Обработка кампании: ${campaign.getName()}`);
    
    const keywordIterator = campaign.keywords().get();
    
    while (keywordIterator.hasNext()) {
      const keyword = keywordIterator.next();
      const stats = keyword.getStatsFor('LAST_7_DAYS'); // Получаем статистику за последние 7 дней
      
      const ctr = stats.getCtr();
      const conversions = stats.getConversions();
      const currentBid = keyword.getMaxCpc(); // Текущая ставка
      
      // Классификация ключевых слов
      if (ctr > EFFECTIVE_CTR_THRESHOLD && conversions > EFFECTIVE_CONVERSIONS_THRESHOLD) {
        // Эффективные ключевые слова
        const newBid = currentBid * (1 + BID_INCREASE_PERCENTAGE);
        keyword.setMaxCpc(newBid);
        Logger.log(`Повышена ставка для ключевого слова "${keyword.getText()}". Новая ставка: ${newBid}`);
      } else if (ctr < INEFFECTIVE_CTR_THRESHOLD && conversions === 0) {
        // Неэффективные ключевые слова
        const newBid = currentBid * (1 - BID_DECREASE_PERCENTAGE);
        keyword.setMaxCpc(newBid);
        Logger.log(`Понижена ставка для ключевого слова "${keyword.getText()}". Новая ставка: ${newBid}`);
      }
    }
  }
  
  Logger.log('Обработка завершена.');
}

// Установка триггера для ежедневного выполнения
function setupTrigger() {
  ScriptApp.newTrigger('classifyAndAdjustKeywords')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
}