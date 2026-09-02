import { ZarinpalClient } from "./ZarinpalClient";
import { PlanPrices } from "../plans/PlanTypes";


export class PaymentService {



  constructor(

    private zarinpal:ZarinpalClient

  ) {}





  async createCheckout(

    plan:string,

    callbackUrl:string

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

    return {

      url:result.paymentUrl,

      authority:result.authority,

      amount

    };


  }





  async verifyPayment(

    authority:string,

    amount:number

  ){



    return this.zarinpal.verifyPayment(

      authority,

      amount

    );


  }



}
