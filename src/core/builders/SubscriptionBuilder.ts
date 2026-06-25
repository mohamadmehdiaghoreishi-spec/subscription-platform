import {
  WorkerError,
  ErrorCode
} from "../errors/WorkerError";

import { SelectedNode } from "../routing/NodeSelector";


export interface SubscriptionResult {

  node:string;

  status:
  "success" | "failed";

  payload:unknown;

}



export class SubscriptionBuilder {


  async build(
    node: SelectedNode,
    request: Request
  ): Promise<SubscriptionResult> {


    if(!node){

      throw new WorkerError({

        code: ErrorCode.INTERNAL_ERROR,

        message:
          "Node is missing in SubscriptionBuilder",

        metadata:{

          stage:
            "SubscriptionBuilder"

        }

      });

    }



    const url =
      new URL(request.url);



    return {

      node: node.type,

      status:"success",

      payload:{

        message:
          "Subscription generated successfully 🚀",

        path:
          url.pathname,

        reason:
          node.reason

      }

    };


  }


}