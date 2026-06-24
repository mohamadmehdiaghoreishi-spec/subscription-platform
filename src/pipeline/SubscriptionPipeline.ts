import { WorkerError, ErrorCode } from "../core/errors/WorkerError";


export class SubscriptionPipeline {


  constructor(
    private db?: D1Database
  ) {}



  async execute(request: Request): Promise<Response> {


    const url = new URL(request.url);



    if (url.pathname === "/sub") {


      return new Response(

        JSON.stringify({

          status: "ok",

          endpoint: "/sub",

          timestamp: Date.now()

        }),

        {
          status: 200,

          headers: {
            "Content-Type": "application/json"
          }
        }

      );


    }



    if (url.pathname === "/") {


      return new Response(

        JSON.stringify({

          status: "ok",

          message: "Subscription Platform Root",

          timestamp: Date.now()

        }),

        {
          status:200,

          headers:{
            "Content-Type":"application/json"
          }
        }

      );

    }



    throw new WorkerError({

      code: ErrorCode.NOT_FOUND,

      message: "Route not found",

      details: {

        path: url.pathname

      }

    });


  }


}