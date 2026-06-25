export class StripeClient {


  constructor(
    private apiKey:string
  ) {}



  async createCheckoutSession(input:{
    subscriptionId:string;
    plan:string;
    successUrl:string;
    cancelUrl:string;
  }) {



    /*
      MVP implementation

      در آینده اینجا درخواست واقعی Stripe API قرار می‌گیرد
    */


    return {

      id:
        crypto.randomUUID(),


      url:
        `https://checkout.stripe.com/session/${input.subscriptionId}`,


      subscriptionId:
        input.subscriptionId,


      plan:
        input.plan

    };

  }






  async verifyWebhook(

    payload:string,

    signature:string

  ):Promise<boolean>{



    /*
      MVP

      بعداً:
      Stripe signature verification
    */


    if(!payload){

      return false;

    }



    if(!signature){

      return false;

    }



    return true;


  }



}