CREATE TABLE IF NOT EXISTS plans (

  id TEXT PRIMARY KEY,

  name TEXT NOT NULL UNIQUE,

  createdAt TEXT NOT NULL

);


CREATE TABLE IF NOT EXISTS subscription_plans (

  id TEXT PRIMARY KEY,

  subscriptionId TEXT NOT NULL,

  planId TEXT NOT NULL,

  createdAt TEXT NOT NULL

);



INSERT INTO plans
(
 id,
 name,
 createdAt
)
VALUES
(
 'free',
 'FREE',
 datetime('now')
),
(
 'basic',
 'BASIC',
 datetime('now')
),
(
 'pro',
 'PRO',
 datetime('now')
),
(
 'enterprise',
 'ENTERPRISE',
 datetime('now')
);