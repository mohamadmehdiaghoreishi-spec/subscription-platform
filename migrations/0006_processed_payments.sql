CREATE TABLE IF NOT EXISTS processed_payments (
  authority TEXT PRIMARY KEY,
  ownerId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  refId TEXT,
  processedAt TEXT NOT NULL
);
