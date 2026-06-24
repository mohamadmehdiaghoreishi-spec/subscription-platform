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


      if (
        url.pathname === "/favicon.ico" ||
        url.pathname === "/robots.txt"
      ) {

        return new Response(null, {
          status: 204
        });

      }



      const pipeline = new SubscriptionPipeline(env.DB);


      const result = await pipeline.execute(request);



      return new Response(
        JSON.stringify(result, null, 2),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );


    } catch(error) {


      console.error("Worker Error:", error);


      const safe = ErrorBoundary.toResponse(error);


      return new Response(
        JSON.stringify(safe, null, 2),
        {
          status: (error as any)?.statusCode ?? 500,
          headers:{
            "Content-Type":"application/json"
          }
        }
      );


    }

  }

};