/**
 * Gold VN Track - Entry point
 * Tracks gold prices from BTMC API, stores in PostgreSQL, displays with Bootstrap UI
 */
require('dotenv').config();
const express = require('express');
const path = require('path');

const routes = require('./api/routes');
const fetchGoldPricesJob = require('./cron/fetchGoldPricesJob');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Routes
app.use('/api', routes);
app.use('/', routes);

// Cron job
fetchGoldPricesJob.start();

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
