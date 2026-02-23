/**
 * Database connection pool
 */
const { Pool } = require('pg');

const dbConfig =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PG_USER || 'postgres'}:${process.env.PG_PASSWORD || 'postgres'}` +
    `@${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || '5432'}/${process.env.PG_DATABASE || 'gold_vn_track'}`;

const pool = new Pool({ connectionString: dbConfig });

module.exports = { pool };
