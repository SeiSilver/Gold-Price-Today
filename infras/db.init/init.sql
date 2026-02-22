-- Gold VN Track - PostgreSQL Schema
-- Auto-run on Postgres container first startup

CREATE TABLE IF NOT EXISTS gold_prices (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    karat       VARCHAR(50) NOT NULL,
    buy_price   BIGINT NOT NULL,
    sell_price  BIGINT NOT NULL,
    world_price VARCHAR(100),
    recorded_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gold_prices_recorded_at ON gold_prices(recorded_at);
CREATE INDEX IF NOT EXISTS idx_gold_prices_name ON gold_prices(name);

-- Unique index to prevent duplicate records (skip insert if already exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_gold_prices_unique_record
  ON gold_prices(name, karat, buy_price, sell_price, world_price, recorded_at);
