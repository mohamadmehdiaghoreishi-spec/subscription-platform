import { ErrorBoundary } from "./core/errors/ErrorBoundary";
import { SubscriptionPipeline } from "./pipeline/SubscriptionPipeline";

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const pipeline = new SubscriptionPipeline();
      const result = await pipeline.execute(request);

      return new Response(result, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (err) {
      return ErrorBoundary.handle(err);
    }
  },
};