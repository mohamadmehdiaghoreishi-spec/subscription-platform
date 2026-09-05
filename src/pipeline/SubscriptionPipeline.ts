import {
  WorkerError,
  ErrorCode
} from "../core/errors/WorkerError";


import { PolicyResolver }
from "../core/policy/PolicyResolver";


import { NodeSelector }
from "../core/routing/NodeSelector";


import { SubscriptionBuilder }
from "../core/builders/SubscriptionBuilder";


import { AuthGuard }
from "../core/auth/AuthGuard";


import { ApiKeyService }
from "../core/auth/ApiKeyService";


import { QuotaGuard }
from "../core/guard/QuotaGuard";


import { UsageLogger }
from "../core/usage/UsageLogger";


import { ExecutorRegistry }
from "../core/executor/ExecutorRegistry";


import { BillingEngine }
from "../core/billing/BillingEngine";


import { PaymentService }
from "../core/payments/PaymentService";


import { ZarinpalClient }
from "../core/payments/ZarinpalClient";




import { D1SubscriptionRepository }
from "../infrastructure/d1/D1SubscriptionRepository";


import { D1ApiKeyRepository }
from "../infrastructure/d1/D1ApiKeyRepository";


import { D1UsageRepository }
from "../infrastructure/d1/D1UsageRepository";


import { D1BillingRepository }
from "../infrastructure/d1/D1BillingRepository";


import { D1PlanRepository }
from "../infrastructure/d1/D1PlanRepository";


import { PlanService }
from "../core/plans/PlanService";


import { PlanType, PlanPrices }
from "../core/plans/PlanTypes";

import {
  validateCreateKeyBody,
  validateRevokeKeyBody,
  validateCheckoutBody,
  validateSubscribeBody
}
from "../core/validation/RequestSchemas";


import { SubscriptionContext }
from "../core/context/SubscriptionContext";






export class SubscriptionPipeline {



private policy =
new PolicyResolver();



private selector =
new NodeSelector();



private builder =
new SubscriptionBuilder();




private auth:AuthGuard;


private apiKeyService:ApiKeyService;


private quota:QuotaGuard;


private usageLogger:UsageLogger;

private usageRepo:D1UsageRepository;


private executor:ExecutorRegistry;


private billingEngine:BillingEngine;


private paymentService:PaymentService;


private planService:PlanService;







constructor(
db:D1Database,
zarinpalMerchantId:string,
zarinpalSandbox:boolean
){



const subscriptionRepo =
new D1SubscriptionRepository(db);



const apiKeyRepo =
new D1ApiKeyRepository(db);



const usageRepo =
new D1UsageRepository(db);

this.usageRepo = usageRepo;



const billingRepo =
new D1BillingRepository(db);



const planRepo =
new D1PlanRepository(db);




this.auth =
new AuthGuard(

apiKeyRepo

);




this.apiKeyService =
new ApiKeyService(

apiKeyRepo

);




this.quota =
new QuotaGuard(

usageRepo

);




this.usageLogger =
new UsageLogger(

usageRepo

);




this.executor =
new ExecutorRegistry(

subscriptionRepo

);




this.billingEngine =
new BillingEngine(

usageRepo,

billingRepo

);




this.paymentService =
new PaymentService(

new ZarinpalClient(

zarinpalMerchantId,

zarinpalSandbox

)

);




this.planService =
new PlanService(

planRepo

);


}






async execute(

request:Request

):Promise<unknown>{



const url =
new URL(request.url);



const method =
request.method;




if(
url.pathname === "/auth/create-key"
&&
method === "POST"
){



const body =
validateCreateKeyBody(
await request.json()
);



const key =
await this.apiKeyService.create(

body.subscriptionId

);



return {

success:true,

data:key

};


}if(
url.pathname === "/payment/callback"
&&
method === "GET"
){



const authority =
url.searchParams.get("Authority") || "";

const status =
url.searchParams.get("Status") || "";

const ownerId =
url.searchParams.get("ownerId") || "";

const plan =
url.searchParams.get("plan") || "";



if(status !== "OK"){

return {

success:false,

data:{ message:"Payment cancelled" }

};

}



if(!authority || !ownerId || !plan){

throw new WorkerError({

code:

ErrorCode.BAD_REQUEST,

message:

"Missing payment callback parameters"

});

}



const amount =
PlanPrices[plan as keyof typeof PlanPrices];

if(amount === undefined){

throw new WorkerError({

code:

ErrorCode.BAD_REQUEST,

message:

`Unknown plan: ${plan}`

});

}



const result =
await this.paymentService.verifyPayment(

authority,

amount

);



if(!result.verified){

throw new WorkerError({

code:

ErrorCode.UNAUTHORIZED,

message:

"Payment verification failed"

});

}



await this.executor.activateSubscription(

ownerId

);



return {

success:true,

data:{ refId:result.refId }

};



}






const context:SubscriptionContext =

await this.auth.authenticate(

request

);





await this.policy.check(

request

);







if(
url.pathname === "/billing/checkout"
&&
method === "POST"
){



const body =
validateCheckoutBody(
await request.json()
);



const callbackUrl =
`${url.origin}/payment/callback?ownerId=${encodeURIComponent(context.ownerId)}&plan=${encodeURIComponent(body.plan)}`;



const session =
await this.paymentService.createCheckout(

body.plan,

callbackUrl

);



return {

success:true,

data:session

};


}







if(
url.pathname === "/usage/summary"
&&
method === "GET"
){



const [ total, byDay, byPath ] =
await Promise.all([

this.usageRepo.totalCount(context.ownerId),

this.usageRepo.countByDay(context.ownerId, 7),

this.usageRepo.countByPath(context.ownerId)

]);



return {

success:true,

data:{

total,

last7Days:byDay,

byPath

}

};


}




if(
url.pathname === "/billing/invoice"
){



const invoice =
await this.billingEngine.generateInvoice(

context.ownerId

);



return {

success:true,

data:invoice

};


}







if(
url.pathname === "/auth/keys"
&&
method === "GET"
){



const keys =
await this.apiKeyService.list(

context.ownerId

);



return {

success:true,

data:keys

};


}







if(
url.pathname === "/auth/revoke-key"
&&
method === "POST"
){



const body =
validateRevokeKeyBody(
await request.json()
);



await this.apiKeyService.revoke(

body.key

);



return {

success:true

};


}







if(
url.pathname === "/subscribe"
&&
method === "POST"
){



const body =
validateSubscribeBody(
await request.json()
);




const currentPlan =

await this.planService.getSubscriptionPlan(

context.ownerId

);




await this.quota.check(

context.ownerId,

currentPlan

);




const node =
await this.selector.select(

request

);




const subscription =
await this.executor.createSubscription(

context.ownerId,

node,

body

);





await this.executor.persist(

subscription

);





await this.planService.assignPlan(

subscription.id,

body.plan ?? PlanType.FREE

);





await this.executor.execute(

node,

subscription

);





await this.usageLogger.log({

ownerId: context.ownerId,


request

});





return {

success:true,

data:subscription

};



}








if(
url.pathname === "/sub"
){



const node =
await this.selector.select(

request

);




const result =
await this.builder.build(

node,

request

);





await this.usageLogger.log({

ownerId: context.ownerId,


request

});





return {

success:true,

data:result

};


}
if(
url.pathname === "/subscription"
&&
method === "GET"
){



const subscription =

await this.executor.getSubscription(

context.ownerId

);





if(!subscription){



throw new WorkerError({

code:

ErrorCode.NOT_FOUND,


message:

"Subscription not found"

});


}





return {

success:true,

data:subscription

};


}








if(
url.pathname === "/subscriptions"
&&
method === "GET"
){



const subscriptions =

await this.executor.listSubscriptions(

context.ownerId

);





return {

success:true,

data:subscriptions

};



}








if(
url.pathname === "/subscription/cancel"
&&
method === "POST"
){



const cancelled =
await this.executor.cancelSubscription(

context.ownerId

);





return {

success:true,

status:

cancelled.status

};


}









throw new WorkerError({



code:

ErrorCode.NOT_FOUND,



message:

"Route not found",



metadata:{



path:

url.pathname,



stage:

"SubscriptionPipeline"



}



});



}



}

