import {
  WorkerError,
  ErrorCode
} from "../errors/WorkerError";



export class QuotaGuard {



  async check(
    request:Request
  ):Promise<void>{



    const quotaExceeded =
    false;



    if(quotaExceeded){



      throw new WorkerError({


        code:
        ErrorCode.RATE_LIMITED,


        message:
        "Quota exceeded for this subscription",



        metadata:{


          limit:100,


          source:
          "QuotaGuard"


        }


      });



    }


  }


}