import path from "node:path";

import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {

  const migrations = await readD1Migrations(
    path.join(__dirname, "migrations")
  );

  return {
    test: {
      setupFiles: ["./tests/setup.ts"],

      poolOptions: {
        workers: {
          wrangler: {
            configPath: "./wrangler.toml",
          },

          miniflare: {
            bindings: {
              TEST_MIGRATIONS: migrations,
              ZARINPAL_MERCHANT_ID: "00000000-0000-0000-0000-000000000000",
              ZARINPAL_SANDBOX: "true",
            },
          },
        },
      },
    },
  };

});
