CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  node TEXT NOT NULL,
  status TEXT NOT NULL,
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL
);