import { WorkerError, ErrorCode } from "../core/errors/WorkerError";

import { PolicyResolver } from "../core/policy/PolicyResolver";
import { NodeSelector } from "../core/routing/NodeSelector";
import { SubscriptionBuilder } from "../core/builders/SubscriptionBuilder";

import { AuthGuard } from "../core/auth/AuthGuard";
import { ApiKeyService } from "../core/auth/ApiKeyService";

import { QuotaGuard } from "../core/guard/QuotaGuard";
import { UsageLogger } from "../core/usage/UsageLogger";

import { ExecutorRegistry } from "../core/executor/ExecutorRegistry";

import { BillingEngine } from "../core/billing/BillingEngine";

import { PaymentService } from "../core/payments/PaymentService";
import { StripeClient } from "../core/payments/StripeClient";

import { SubscriptionStatus } from "../domain/entities/SubscriptionStatus";

import { D1SubscriptionRepository } from "../infrastructure/d1/D1SubscriptionRepository";
import { D1ApiKeyRepository } from "../infrastructure/d1/D1ApiKeyRepository";
import { D1UsageRepository } from "../infrastructure/d1/D1UsageRepository";
import { D1BillingRepository } from "../infrastructure/d1/D1BillingRepository";

import { SubscriptionContext } from "../core/context/SubscriptionContext";




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

  private executor:ExecutorRegistry;

  private billingEngine:BillingEngine;

  private paymentService:PaymentService;



  constructor(
    db:D1Database
  ){


    const subscriptionRepo =
      new D1SubscriptionRepository(db);


    const apiKeyRepo =
      new D1ApiKeyRepository(db);


    const usageRepo =
      new D1UsageRepository(db);


    const billingRepo =
      new D1BillingRepository(db);



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
        new StripeClient(
          "STRIPE_SECRET_KEY"
        )
      );

  }






  async execute(
    request:Request
  ):Promise<unknown>{


    const url =
      new URL(
        request.url
      );


    const method =
      request.method;






    if(
      url.pathname === "/auth/create-key"
      &&
      method === "POST"
    ){


      const body =
        await request.json() as {
          subscriptionId:string;
        };



      if(!body.subscriptionId){

        throw new WorkerError({

          code:
            ErrorCode.BAD_REQUEST,

          message:
            "subscriptionId required"

        });

      }



      const key =
        await this.apiKeyService.create(
          body.subscriptionId
        );


      return {

        success:true,

        data:key

      };

    }







    if(
      url.pathname === "/webhook/stripe"
      &&
      method === "POST"
    ){


      const payload =
        await request.text();


      const signature =
        request.headers.get(
          "stripe-signature"
        ) || "";



      const valid =
        await this.paymentService.verifyWebhook(
          payload,
          signature
        );


      if(!valid){

        throw new WorkerError({

          code:
            ErrorCode.UNAUTHORIZED,

          message:
            "Invalid webhook"

        });

      }



      const event =
        JSON.parse(payload);



      if(
        event.type ===
        "checkout.session.completed"
      ){


        const subscriptionId =
          event.data.object.metadata.subscriptionId;



        await this.executor.updateSubscriptionStatus(

          subscriptionId,

          SubscriptionStatus.ACTIVE

        );

      }



      return {

        success:true

      };

    }







    const context:SubscriptionContext =
      await this.auth.authenticate(
        request
      );








    // =====================
    // API KEY MANAGEMENT
    // =====================


    if(
      url.pathname === "/auth/keys"
      &&
      method === "GET"
    ){


      const keys =
        await this.apiKeyService.list(
          context.subscriptionId
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
        await request.json() as {
          key:string;
        };



      if(!body.key){

        throw new WorkerError({

          code:
            ErrorCode.BAD_REQUEST,

          message:
            "key required"

        });

      }



      await this.apiKeyService.revoke(
        body.key
      );


      return {

        success:true

      };

    }








    await this.policy.check(
      request
    );







    if(
      url.pathname === "/billing/checkout"
      &&
      method === "POST"
    ){


      const body =
        await request.json() as {
          plan:string;
        };



      const session =
        await this.paymentService.createCheckout(

          context.subscriptionId,

          body.plan

        );



      return {

        success:true,

        data:session

      };

    }







    if(
      url.pathname === "/billing/invoice"
    ){


      const invoice =
        await this.billingEngine.generateInvoice(

          context.subscriptionId

        );


      return {

        success:true,

        data:invoice

      };

    }







    await this.quota.check(

      context.subscriptionId,

      "FREE"

    );







    if(
      url.pathname === "/subscribe"
      &&
      method === "POST"
    ){


      const body =
        await request.json();



      const node =
        await this.selector.select(
          request
        );



      const subscription =
        await this.executor.createSubscription(

          node,

          body

        );



      await this.executor.persist(
        subscription
      );



      await this.executor.execute(

        node,

        subscription

      );



      await this.usageLogger.log({

        subscriptionId:
          context.subscriptionId,

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

        subscriptionId:
          context.subscriptionId,

        request

      });



      return {

        success:true,

        data:result

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