/**
 * Gold VN Track - Monolithic Node.js Application
 * Tracks gold prices from BTMC API, stores in PostgreSQL, displays with Bootstrap UI
 */

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Database connection
const dbConfig = process.env.DATABASE_URL || (
  `postgresql://${process.env.PG_USER || 'postgres'}:${process.env.PG_PASSWORD || 'postgres'}` +
  `@${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || '5432'}/${process.env.PG_DATABASE || 'gold_vn_track'}`
);
const pool = new Pool({ connectionString: dbConfig });

// BTMC API
const BTMC_API_URL = process.env.BTMC_API_URL || 'http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v';

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Parse API response and insert into database
 * API returns { DataList: { Data: [...] } } - each item has @row and keys like @n_1, @k_1 (suffix = row)
 */
async function fetchAndStoreGoldPrices() {
  try {
    const { data } = await axios.get(BTMC_API_URL);
    const items = data?.DataList?.Data || data?.data || (Array.isArray(data) ? data : []);

    if (!items.length) {
      console.log('[Cron] No data received from API');
      return { success: false, count: 0, error: 'No data received from API' };
    }

    for (const item of items) {
      const row = item['@row'] || '1';
      const name = item[`@n_${row}`] ?? item['@n_1'] ?? '';
      const karat = item[`@k_${row}`] ?? item['@k_1'] ?? '';
      const buyPrice = parseInt(String(item[`@pb_${row}`] ?? item['@pb_1'] ?? '0').replace(/\D/g, ''), 10) || 0;
      const sellPrice = parseInt(String(item[`@ps_${row}`] ?? item['@ps_1'] ?? '0').replace(/\D/g, ''), 10) || 0;
      const worldPrice = String(item[`@pt_${row}`] ?? item['@pt_1'] ?? '');
      const dateStr = item[`@d_${row}`] ?? item['@d_1'] ?? '';

      const recordedAt = moment(dateStr, 'DD/MM/YYYY HH:mm').isValid()
        ? moment(dateStr, 'DD/MM/YYYY HH:mm').toDate()
        : new Date();

      await pool.query(
        `INSERT INTO gold_prices (name, karat, buy_price, sell_price, world_price, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name, karat, buy_price, sell_price, world_price, recorded_at) DO NOTHING`,
        [name, karat, buyPrice, sellPrice, worldPrice || '', recordedAt]
      );
    }

    console.log(`[Cron] Stored ${items.length} gold price records at ${new Date().toISOString()}`);
    return { success: true, count: items.length };
  } catch (err) {
    console.error('[Cron] Error fetching/storing gold prices:', err.message);
    return { success: false, count: 0, error: "Không có data mới" };
  }
}

// Cron job: daily at 8:00 AM
cron.schedule('0 8 * * *', fetchAndStoreGoldPrices);
console.log('[Cron] Scheduled daily fetch at 8:00 AM');

// Route: POST /api/fetch - Manual trigger to fetch BTMC data
app.post('/api/fetch', async (req, res) => {
  try {
    const result = await fetchAndStoreGoldPrices();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper: fetch chart data for a gold product
async function getChartDataForGold(goldName) {
  const result = await pool.query(
    `SELECT buy_price, sell_price, recorded_at FROM gold_prices
     WHERE name = $1
     ORDER BY recorded_at DESC LIMIT 30`,
    [goldName]
  );
  const chartData = result.rows.reverse().map((r) => ({
    buyPrice: Number(r.buy_price),
    sellPrice: Number(r.sell_price),
    date: moment(r.recorded_at).format('DD/MM HH:mm'),
  }));
  return {
    chartLabels: chartData.map((d) => d.date),
    chartBuyValues: chartData.map((d) => d.buyPrice),
    chartSellValues: chartData.map((d) => d.sellPrice),
  };
}

// Route: GET /api/chart?name=... - Chart data for selected gold product
app.get('/api/chart', async (req, res) => {
  try {
    const goldName = req.query.name || '';
    if (!goldName) {
      return res.json({ chartLabels: [], chartBuyValues: [], chartSellValues: [] });
    }
    const data = await getChartDataForGold(goldName);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route: GET / - Dashboard with latest prices and chart data
app.get('/', async (req, res) => {
  try {
    const selectedGoldName = req.query.goldName || 'NHẪN TRÒN TRƠN (Vàng Rồng Thăng Long)';
    const query = `
    SELECT * FROM (
      SELECT DISTINCT ON (name) *
      FROM gold_prices
      ORDER BY name, recorded_at DESC
    ) AS latest_prices
    ORDER BY buy_price ASC;
  `;
  pool.query(query, (err, res) => { /* ... */ });
    const [latestResult, goldNamesResult, chartData] = await Promise.all([
      pool.query(query),
      pool.query('SELECT DISTINCT name FROM gold_prices ORDER BY name'),
      getChartDataForGold(selectedGoldName),
    ]);

    const latestPrices = latestResult.rows;
    const goldNames = goldNamesResult.rows.map((r) => r.name);

    res.render('index', {
      latestPrices,
      goldNames,
      selectedGoldName,
      chartLabels: chartData.chartLabels,
      chartBuyValues: chartData.chartBuyValues,
      chartSellValues: chartData.chartSellValues,
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Error loading data');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
