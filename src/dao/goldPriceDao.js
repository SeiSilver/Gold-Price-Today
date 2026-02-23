/**
 * Data Access Object - gold_prices table
 */
const { pool } = require('./db');
const moment = require('moment');

async function insert(record) {
  await pool.query(
    `INSERT INTO gold_prices (name, karat, buy_price, sell_price, world_price, recorded_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (name, karat, buy_price, sell_price, world_price, recorded_at) DO NOTHING`,
    [
      record.name,
      record.karat,
      record.buyPrice,
      record.sellPrice,
      record.worldPrice || '',
      record.recordedAt,
    ]
  );
}

async function getLatestPrices() {
  const query = `
    SELECT * FROM (
      SELECT DISTINCT ON (name) *
      FROM gold_prices
      ORDER BY name, recorded_at DESC
    ) AS latest_prices
    ORDER BY buy_price ASC
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function getDistinctNames() {
  const result = await pool.query('SELECT DISTINCT name FROM gold_prices ORDER BY name');
  return result.rows.map((r) => r.name);
}

async function getChartData(goldName) {
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

module.exports = {
  insert,
  getLatestPrices,
  getDistinctNames,
  getChartData,
};
