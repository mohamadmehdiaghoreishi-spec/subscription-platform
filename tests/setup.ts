import { env, applyD1Migrations } from "cloudflare:test";
import { readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

const migrations = await readD1Migrations("./migrations");

await applyD1Migrations(env.DB, migrations);