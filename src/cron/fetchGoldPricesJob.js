/**
 * Cron job - daily fetch of BTMC gold prices at 8:00 AM
 */
const cron = require('node-cron');
const goldPriceService = require('../service/goldPriceService');

function start() {
  cron.schedule('0 8 * * *', goldPriceService.fetchAndStoreGoldPrices);
  console.log('[Cron] Scheduled daily fetch at 8:00 AM');
}

module.exports = { start };
