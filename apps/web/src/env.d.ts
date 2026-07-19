/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

import type { Env } from "@vlog/workers";

declare global {
  namespace App {
    interface Locals extends Record<string, unknown> {
      runtime: {
        env: Env;
        cf?: CfProperties;
        ctx: ExecutionContext;
      };
    }
  }
}
