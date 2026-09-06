CREATE TABLE IF NOT EXISTS payment_intents (
  authority TEXT PRIMARY KEY,
  ownerId TEXT NOT NULL,
  plan TEXT NOT NULL,
  createdAt TEXT NOT NULL
);