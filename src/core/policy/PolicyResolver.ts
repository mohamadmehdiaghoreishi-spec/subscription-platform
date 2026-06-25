import {
  WorkerError,
  ErrorCode
} from "../errors/WorkerError";



export class PolicyResolver {



  async check(
    request: Request
  ): Promise<void> {


    const url =
      new URL(request.url);



    const path =
      url.pathname;



    const allowedRoutes = [

      "/sub",

      "/subscribe",

      "/billing",

    ];



    const allowed =
      allowedRoutes.some(

        route =>
          path.startsWith(route)

      );



    if(!allowed){


      throw new WorkerError({


        code:
          ErrorCode.FORBIDDEN,


        message:
          "Access denied",


        metadata:{


          path


        }


      });


    }



  }


}