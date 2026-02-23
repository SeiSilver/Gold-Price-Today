/**
 * BTMC API client - fetch and parse gold price data
 * API returns { DataList: { Data: [...] } } - each item has @row and keys like @n_1, @k_1 (suffix = row)
 */
const axios = require('axios');
const moment = require('moment');

const BTMC_API_URL =
  process.env.BTMC_API_URL ||
  'http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v';

async function fetchGoldPrices() {
  const { data } = await axios.get(BTMC_API_URL);
  const items = data?.DataList?.Data || data?.data || (Array.isArray(data) ? data : []);
  return items;
}

function parseItem(item) {
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

  return { name, karat, buyPrice, sellPrice, worldPrice, recordedAt };
}

module.exports = {
  fetchGoldPrices,
  parseItem,
};
