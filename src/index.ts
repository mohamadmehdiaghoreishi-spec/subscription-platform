import { SubscriptionPipeline } from "./pipeline/SubscriptionPipeline";
import { ErrorBoundary } from "./core/errors/ErrorBoundary";

export interface Env {
  DB: D1Database;
}


export default {

  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {

    try {

      const url = new URL(request.url);


      if (url.pathname === "/") {

        return new Response(
          JSON.stringify({
            status: "ok",
            message: "Subscription Platform Root",
            timestamp: Date.now()
          }),
          {
            status: 200,
            headers:{
              "Content-Type":"application/json"
            }
          }
        );

      }


      const pipeline =
        new SubscriptionPipeline(env.DB);


      const result =
        await pipeline.execute(request);



      return new Response(
        typeof result === "string"
          ? result
          : JSON.stringify(result),
        {
          status:200,
          headers:{
            "Content-Type":"application/json"
          }
        }
      );


    } catch(error) {


      const safe =
        ErrorBoundary.toResponse(error);


      return new Response(
        JSON.stringify(safe),
        {
          status:
            error instanceof Error &&
            "status" in error
              ? Number((error as any).status)
              : 500,

          headers:{
            "Content-Type":"application/json"
          }
        }
      );

    }

  }

};