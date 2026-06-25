import { StripeClient } from "./StripeClient";


export class PaymentService {



  constructor(

    private stripe:StripeClient

  ) {}





  async createCheckout(

    subscriptionId:string,

    plan:string

  ){



    return this.stripe.createCheckoutSession({

      subscriptionId,

      plan,


      successUrl:
        "https://app/success",


      cancelUrl:
        "https://app/cancel"

    });


  }






  async verifyWebhook(

    payload:string,

    signature:string

  ){



    return this.stripe.verifyWebhook(

      payload,

      signature

    );


  }



}