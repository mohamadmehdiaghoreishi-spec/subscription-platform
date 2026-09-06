import { ZarinpalClient } from "./ZarinpalClient";
import { PlanPrices } from "../plans/PlanTypes";
import { Logger } from "../logging/Logger";


export class PaymentService {



  constructor(

    private zarinpal:ZarinpalClient

  ) {}




  async createCheckout(

    plan:string,

    callbackUrl:string,

    ownerId:string = ""

  ){



    const amount =
      (PlanPrices as Record<string, number>)[plan];

    if(amount === undefined){

      throw new Error(`Unknown plan: ${plan}`);

    }

    const result =
      await this.zarinpal.requestPayment({

        amount,

        description:`Subscription plan: ${plan}`,

        callbackUrl

      });

    Logger.info("payment.checkout.created", {

      ownerId,

      plan,

      amount,

      authority: result.authority

    });

    return {

      url:result.paymentUrl,

      authority:result.authority,

      amount

    };


  }




  async verifyPayment(

    authority:string,

    amount:number,

    ownerId:string = ""

  ){



    const result =
      await this.zarinpal.verifyPayment(

        authority,

        amount

      );

    if(result.verified){

      Logger.info("payment.verify.success", {

        authority,

        ownerId,

        refId: result.refId,

        amount

      });

    } else {

      // NOTE: ZarinpalClient.verifyPayment currently collapses every
      // non-(100|101) response into `verified:false` without a code,
      // so we can't yet distinguish "genuinely declined" from a
      // Zarinpal-side error during verify. Until ZarinpalClient surfaces
      // that distinction, `reason` stays generic.
      Logger.warn("payment.verify.failed", {

        authority,

        ownerId,

        amount,

        reason: "gateway_rejected_verification"

      });

    }

    return result;


  }



}
