// Конфигурация
const IMPRESSIONS_THRESHOLD = 500; // Порог охвата для эффективных кампаний
const BUDGET_INCREASE_PERCENTAGE = 0.15; // Процент увеличения бюджета (15%)

// Функция для управления бюджетом
function adjustCampaignBudgets() {
  const campaignIterator = AdsApp.campaigns().get();
  
  while (campaignIterator.hasNext()) {
    const campaign = campaignIterator.next();
    const stats = campaign.getStatsFor('LAST_7_DAYS'); // Получаем статистику за последние 7 дней
    
    const impressions = stats.getImpressions(); // Охват кампании
    const currentBudget = campaign.getBudget().getAmount(); // Текущий дневной бюджет
    
    Logger.log(`Обработка кампании: ${campaign.getName()}, Охват: ${impressions}, Текущий бюджет: ${currentBudget}`);
    
    // Условие для эффективных кампаний
    if (impressions > IMPRESSIONS_THRESHOLD) {
      const newBudget = currentBudget * (1 + BUDGET_INCREASE_PERCENTAGE); // Новый бюджет
      campaign.getBudget().setAmount(newBudget);
      
      Logger.log(`Бюджет увеличен для кампании "${campaign.getName()}". Новый бюджет: ${newBudget}`);
    }
  }
  
  Logger.log('Обработка завершена.');
}

// Установка триггера для ежедневного выполнения
function setupTrigger() {
  ScriptApp.newTrigger('adjustCampaignBudgets')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
}