import { SubscriptionPipeline } from "./pipeline/SubscriptionPipeline";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/favicon.ico" || url.pathname === "/robots.txt") {
        return new Response(null, { status: 204 });
      }

      const pipeline = new SubscriptionPipeline();
      const result = await pipeline.execute(request);

      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};