import { D1PlanRepository }
from "../../infrastructure/d1/D1PlanRepository";

import { PlanType }
from "./PlanTypes";


export class PlanService {



constructor(
 private repo:D1PlanRepository
){}





async getSubscriptionPlan(

 subscriptionId:string

):Promise<PlanType>{


 return this.repo.getBySubscription(

   subscriptionId

 );


}







async assignPlan(

 subscriptionId:string,

 plan:PlanType

):Promise<void>{


 await this.repo.assign(

   subscriptionId,

   plan

 );


}



}