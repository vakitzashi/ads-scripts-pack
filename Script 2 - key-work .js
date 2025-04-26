function main() {
  // Параметры фильтрации
  var minCTR = 1; // Минимальный CTR (%)
  var maxCPA = 2; // Максимальная стоимость конверсии ($)
  var dateRange = "LAST_30_DAYS"; // Период для анализа
  var searchQueryCTRThreshold = 1.5; // Минимальный CTR для добавления нового ключевого слова (%)
  var excludedCampaignStatuses = ["PAUSED", "REMOVED"]; // Кампании для исключения
  
  // Отключение ключевых слов
  disableLowPerformanceKeywords(dateRange, minCTR, maxCPA);

  // Добавление новых ключевых слов
  addNewKeywords(dateRange, searchQueryCTRThreshold, excludedCampaignStatuses);
}

// Отключение ключевых слов с низким CTR или высоким CPA
function disableLowPerformanceKeywords(dateRange, minCTR, maxCPA) {
  var keywords = AdsApp.keywords()
    .withCondition("Status = ENABLED")
    .forDateRange(dateRange)
    .get();

  while (keywords.hasNext()) {
    var keyword = keywords.next();
    var stats = keyword.getStatsFor(dateRange);
    var ctr = stats.getCtr() * 100; // CTR в процентах
    var cpa = stats.getCost() / stats.getConversions(); // Стоимость конверсии

    if (ctr < minCTR || (stats.getConversions() > 0 && cpa > maxCPA)) {
      keyword.pause();
      Logger.log(
        "Ключевое слово '" +
          keyword.getText() +
          "' было отключено. CTR: " +
          ctr.toFixed(2) +
          "%, CPA: $" +
          cpa.toFixed(2)
      );
    }
  }
}

// Добавление новых ключевых слов из отчёта по поисковым запросам
function addNewKeywords(dateRange, searchQueryCTRThreshold, excludedCampaignStatuses) {
  var searchQueries = AdsApp.report(
    "SELECT Query, AdGroupId, CampaignId, Clicks, Impressions, Ctr " +
      "FROM SEARCH_QUERY_PERFORMANCE_REPORT " +
      "WHERE Clicks > 0 AND Ctr > " +
      searchQueryCTRThreshold / 100 +
      " AND AdGroupStatus NOT_IN ['" +
      excludedCampaignStatuses.join("', '") +
      "'] " +
      "DURING " +
      dateRange
  ).rows();

  while (searchQueries.hasNext()) {
    var queryRow = searchQueries.next();
    var queryText = queryRow["Query"];
    var adGroupId = queryRow["AdGroupId"];

    // Добавляем ключевое слово в соответствующую группу объявлений
    var adGroup = AdsApp.adGroups().withIds([adGroupId]).get().next();
    var existingKeywords = adGroup.keywords().withCondition("Text = '" + queryText + "'").get();

    if (!existingKeywords.hasNext()) {
      adGroup.newKeywordBuilder().withText(queryText).build();
      Logger.log("Добавлено ключевое слово: " + queryText + " в группу: " + adGroup.getName());
    }
  }
}
