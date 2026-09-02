export class StripeClient {


  constructor(
    private apiKey:string,
    private webhookSecret:string
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



    if(!payload){

      return false;

    }



    if(!signature){

      return false;

    }



    // Stripe-Signature header format: "t=<timestamp>,v1=<hex hmac>"
    const parts = signature
      .split(",")
      .reduce<Record<string,string>>((acc, part) => {

        const [key, value] = part.split("=");

        if(key && value){

          acc[key] = value;

        }

        return acc;

      }, {});

    const timestamp = parts["t"];
    const expectedSignature = parts["v1"];

    if(!timestamp || !expectedSignature){

      return false;

    }

    const signedPayload = `${timestamp}.${payload}`;

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.webhookSecret),
      { name:"HMAC", hash:"SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return this.timingSafeEqual(computedSignature, expectedSignature);

  }



  private timingSafeEqual(a:string, b:string):boolean{

    if(a.length !== b.length){

      return false;

    }

    let mismatch = 0;

    for(let i = 0; i < a.length; i++){

      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);

    }

    return mismatch === 0;

  }



}