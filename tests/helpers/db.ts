import { env } from "cloudflare:test";

export async function clearDatabase() {

  const tables = await env.DB.prepare(`
SELECT name
FROM sqlite_master
WHERE type='table'
ORDER BY name
`).all();

  console.log("TABLES:", tables.results);

  const list = [
    "usage",
    "api_keys",
    "subscription_plans",
    "subscriptions"
  ];

  for (const table of list) {
    console.log("Deleting", table);
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }

}

export async function seedPlans() {

  await env.DB.prepare(`
INSERT OR IGNORE INTO plans
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
  'pro',
  'PRO',
  datetime('now')
),
(
  'enterprise',
  'ENTERPRISE',
  datetime('now')
)
`).run();

}

export async function resetDatabase() {

  await clearDatabase();

  await seedPlans();

}
