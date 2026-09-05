import { Env as WorkerEnv } from "../src/core/config/EnvContext";

declare module "cloudflare:test" {
  interface ProvidedEnv extends WorkerEnv {
    TEST_MIGRATIONS: D1Migration[];
  }
}
