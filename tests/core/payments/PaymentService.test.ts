import { describe, it, expect, vi } from "vitest";

import { PaymentService } from "../../../src/core/payments/PaymentService";

describe("PaymentService", () => {

  it("createCheckout() looks up the plan price and forwards it to Zarinpal", async () => {

    const zarinpal = {
      requestPayment: vi.fn(async () => ({
        authority: "AUTH1",
        paymentUrl: "https://sandbox.zarinpal.com/pg/StartPay/AUTH1",
      })),
      verifyPayment: vi.fn(),
    };

    const service = new PaymentService(zarinpal as any);

    const session = await service.createCheckout("PRO", "https://example.com/callback");

    expect(zarinpal.requestPayment).toHaveBeenCalledWith({
      amount: 300000,
      description: "Subscription plan: PRO",
      callbackUrl: "https://example.com/callback",
    });

    expect(session).toEqual({
      url: "https://sandbox.zarinpal.com/pg/StartPay/AUTH1",
      authority: "AUTH1",
      amount: 300000,
    });
  });

  it("createCheckout() throws for an unknown plan name", async () => {

    const zarinpal = {
      requestPayment: vi.fn(),
      verifyPayment: vi.fn(),
    };

    const service = new PaymentService(zarinpal as any);

    await expect(
      service.createCheckout("NOT_A_PLAN", "https://example.com/callback")
    ).rejects.toThrow(/Unknown plan/);

    expect(zarinpal.requestPayment).not.toHaveBeenCalled();
  });

  it("verifyPayment() delegates to the Zarinpal client", async () => {

    const zarinpal = {
      requestPayment: vi.fn(),
      verifyPayment: vi.fn(async () => ({ verified: true, refId: 42 })),
    };

    const service = new PaymentService(zarinpal as any);

    const result = await service.verifyPayment("AUTH1", 300000);

    expect(zarinpal.verifyPayment).toHaveBeenCalledWith("AUTH1", 300000);
    expect(result).toEqual({ verified: true, refId: 42 });
  });

});
