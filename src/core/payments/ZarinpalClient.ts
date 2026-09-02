export interface ZarinpalPaymentRequest {

  amount: number; // Toman

  description: string;

  callbackUrl: string;

  mobile?: string;

  email?: string;

}

export interface ZarinpalPaymentResult {

  authority: string;

  paymentUrl: string;

}

export interface ZarinpalVerifyResult {

  verified: boolean;

  refId?: number;

}

export class ZarinpalClient {

  private baseUrl: string;

  private startPayUrl: string;

  constructor(
    private merchantId: string,
    private sandbox: boolean
  ) {

    this.baseUrl = sandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment"
      : "https://payment.zarinpal.com/pg/v4/payment";

    this.startPayUrl = sandbox
      ? "https://sandbox.zarinpal.com/pg/StartPay"
      : "https://payment.zarinpal.com/pg/StartPay";

  }

  async requestPayment(
    input: ZarinpalPaymentRequest
  ): Promise<ZarinpalPaymentResult> {

    const response = await fetch(
      `${this.baseUrl}/request.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          merchant_id: this.merchantId,
          amount: input.amount,
          description: input.description,
          callback_url: input.callbackUrl,
          metadata: {
            ...(input.mobile ? { mobile: input.mobile } : {}),
            ...(input.email ? { email: input.email } : {})
          }
        })
      }
    );

    const json = await response.json() as any;

    if (!json.data || json.data.code !== 100) {

      throw new Error(
        `Zarinpal payment request failed: ${JSON.stringify(json.errors ?? json)}`
      );

    }

    const authority = json.data.authority as string;

    return {

      authority,

      paymentUrl: `${this.startPayUrl}/${authority}`

    };

  }

  async verifyPayment(
    authority: string,
    amount: number
  ): Promise<ZarinpalVerifyResult> {

    const response = await fetch(
      `${this.baseUrl}/verify.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          merchant_id: this.merchantId,
          amount,
          authority
        })
      }
    );

    const json = await response.json() as any;

    const code = json.data?.code;

    // 100 = verified just now, 101 = was already verified earlier (still success)
    if (code === 100 || code === 101) {

      return {

        verified: true,

        refId: json.data.ref_id

      };

    }

    return { verified: false };

  }

}
