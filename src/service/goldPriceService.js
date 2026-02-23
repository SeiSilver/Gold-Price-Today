/**
 * Gold price business logic - orchestrates BTMC API and database
 */
const btmcApiService = require('./btmcApiService');
const goldPriceDao = require('../dao/goldPriceDao');

async function fetchAndStoreGoldPrices() {
  try {
    const items = await btmcApiService.fetchGoldPrices();

    if (!items.length) {
      console.log('[Cron] No data received from API');
      return { success: false, count: 0, error: 'No data received from API' };
    }

    for (const item of items) {
      const record = btmcApiService.parseItem(item);
      await goldPriceDao.insert(record);
    }

    console.log(`[Cron] Stored ${items.length} gold price records at ${new Date().toISOString()}`);
    return { success: true, count: items.length };
  } catch (err) {
    console.error('[Cron] Error fetching/storing gold prices:', err.message);
    return { success: false, count: 0, error: err.message };
  }
}

async function getChartDataForGold(goldName) {
  if (!goldName) {
    return { chartLabels: [], chartBuyValues: [], chartSellValues: [] };
  }
  return goldPriceDao.getChartData(goldName);
}

async function getDashboardData(selectedGoldName) {
  const [latestPrices, goldNames, chartData] = await Promise.all([
    goldPriceDao.getLatestPrices(),
    goldPriceDao.getDistinctNames(),
    getChartDataForGold(selectedGoldName),
  ]);
  return {
    latestPrices,
    goldNames,
    chartLabels: chartData.chartLabels,
    chartBuyValues: chartData.chartBuyValues,
    chartSellValues: chartData.chartSellValues,
  };
}

module.exports = {
  fetchAndStoreGoldPrices,
  getChartDataForGold,
  getDashboardData,
};
