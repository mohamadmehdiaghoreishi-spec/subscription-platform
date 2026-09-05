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


        const response = new Response(

          JSON.stringify({

            status:"ok",

            message:"Subscription Platform Root",

            timestamp:Date.now()

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
