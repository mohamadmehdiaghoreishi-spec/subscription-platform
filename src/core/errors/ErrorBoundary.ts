import {
  WorkerError,
  ErrorCode,
  isWorkerError
} from "./WorkerError";


import {
  ErrorStatusMap
} from "./ErrorStatusMap";




export class ErrorBoundary {


  static toResponse(error: unknown): Response {



    if(isWorkerError(error)){


      return new Response(

        JSON.stringify({

          success:false,

          error:error.toJSON()

        }),

        {

          status:error.status,

          headers:{

            "Content-Type":
            "application/json"

          }

        }

      );


    }




    const fallback = {


      success:false,


      error:{


        code:ErrorCode.UNKNOWN_ERROR,


        message:
        error instanceof Error
        ? error.message
        : "Unexpected error",


        status:
        ErrorStatusMap[ErrorCode.UNKNOWN_ERROR],


        timestamp:
        new Date().toISOString()


      }


    };




    return new Response(

      JSON.stringify(fallback),

      {

        status:500,

        headers:{

          "Content-Type":
          "application/json"

        }

      }

    );


  }


}