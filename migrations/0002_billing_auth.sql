CREATE TABLE IF NOT EXISTS api_keys (

  id TEXT PRIMARY KEY,

  key TEXT UNIQUE NOT NULL,

  subscriptionId TEXT NOT NULL,

  status TEXT NOT NULL,

  createdAt TEXT NOT NULL

);



CREATE TABLE IF NOT EXISTS usage (

  id TEXT PRIMARY KEY,

  subscriptionId TEXT NOT NULL,

  endpoint TEXT NOT NULL,

  createdAt TEXT NOT NULL

);



CREATE TABLE IF NOT EXISTS billing (

  id TEXT PRIMARY KEY,

  subscriptionId TEXT NOT NULL,

  usageCount INTEGER NOT NULL,

  cost REAL NOT NULL,

  periodStart TEXT NOT NULL,

  periodEnd TEXT NOT NULL,

  createdAt TEXT NOT NULL

);