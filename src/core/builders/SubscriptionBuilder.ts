import { WorkerError } from "../errors/WorkerError";
import { ErrorCode } from "../errors/ErrorCode";


export class SubscriptionBuilder {


  build() {


    throw new WorkerError({

      code: ErrorCode.INTERNAL_ERROR,

      message: "Subscription build failed",

      metadata: {

        stage: "builder"

      }

    });


  }


}