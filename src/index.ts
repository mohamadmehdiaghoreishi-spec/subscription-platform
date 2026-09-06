import { SubscriptionPipeline } from "./pipeline/SubscriptionPipeline";
import { ErrorBoundary } from "./core/errors/ErrorBoundary";
import { Env } from "./core/config/EnvContext";
import { Logger } from "./core/logging/Logger";
import { isWorkerError } from "./core/errors/WorkerError";

export type { Env };



export default {

  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {


    const requestId = crypto.randomUUID();

    const startedAt = Date.now();

    const url = new URL(request.url);

    Logger.info("request.start", {

      requestId,

      method: request.method,

      path: url.pathname

    });


    try {


      if(url.pathname === "/"){

        const dbCheckStartedAt = Date.now();
        let dbHealthy = true;
        let dbError: unknown = null;
        try {
          await env.DB.prepare("SELECT 1").first();
        } catch (err) {
          dbHealthy = false;
          dbError = err;
        }
        const latencyMs = Date.now() - dbCheckStartedAt;
        const status = dbHealthy ? "ok" : "error";
        const httpStatus = dbHealthy ? 200 : 503;
        if (!dbHealthy) {
          Logger.error("health.db_check_failed", {
            requestId,
            latencyMs,
            message: dbError instanceof Error ? dbError.message : String(dbError)
          });
        }

        const response = new Response(

          JSON.stringify({

            status,

            message: dbHealthy
              ? "Subscription Platform Root"
              : "Database check failed",

            db: {
              status,
              latencyMs
            },

            timestamp:Date.now()

          }),

          {

            status:httpStatus,

            headers:{

              "Content-Type":"application/json"

            }

          }

        );

        Logger.info("request.end", {

          requestId,

          method: request.method,

          path: url.pathname,

          status: httpStatus,

          durationMs: Date.now() - startedAt

        });

        return response;


      }




      const pipeline =
        new SubscriptionPipeline(env.DB, env.ZARINPAL_MERCHANT_ID, env.ZARINPAL_SANDBOX === "true");



      const result =
        await pipeline.execute(request);




      const response = new Response(

        JSON.stringify({

          success:true,

          data:result,

          timestamp:new Date().toISOString()

        }),

        {

          status:200,

          headers:{

            "Content-Type":"application/json"

          }

        }

      );

      Logger.info("request.end", {

        requestId,

        method: request.method,

        path: url.pathname,

        status: 200,

        durationMs: Date.now() - startedAt

      });

      return response;



    } catch(error){


      const response = ErrorBoundary.toResponse(error);

      Logger.error("request.error", {

        requestId,

        method: request.method,

        path: url.pathname,

        status: response.status,

        durationMs: Date.now() - startedAt,

        code: isWorkerError(error) ? error.code : "UNKNOWN_ERROR",

        message: error instanceof Error ? error.message : String(error)

      });

      return response;


    }


  }


};
