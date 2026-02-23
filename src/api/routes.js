/**
 * API routes
 */
const express = require('express');
const goldPriceService = require('../service/goldPriceService');

const router = express.Router();

const DEFAULT_GOLD_NAME = 'VÀNG MIẾNG SJC (Vàng SJC)';

// POST /api/fetch - Manual trigger to fetch BTMC data
router.post('/fetch', async (req, res) => {
  try {
    const result = await goldPriceService.fetchAndStoreGoldPrices();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/chart?name=... - Chart data for selected gold product
router.get('/chart', async (req, res) => {
  try {
    const goldName = req.query.name || '';
    const data = await goldPriceService.getChartDataForGold(goldName);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET / - Dashboard with latest prices and chart data
router.get('/', async (req, res) => {
  try {
    const selectedGoldName = req.query.goldName || DEFAULT_GOLD_NAME;
    const data = await goldPriceService.getDashboardData(selectedGoldName);

    res.render('index', {
      latestPrices: data.latestPrices,
      goldNames: data.goldNames,
      selectedGoldName,
      chartLabels: data.chartLabels,
      chartBuyValues: data.chartBuyValues,
      chartSellValues: data.chartSellValues,
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Error loading data');
  }
});

module.exports = router;
