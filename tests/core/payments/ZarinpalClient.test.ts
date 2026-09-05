import { describe, it, expect, vi, afterEach } from "vitest";

import { ZarinpalClient } from "../../../src/core/payments/ZarinpalClient";

function mockFetchOnce(status: number, body: unknown) {
  return vi.fn(async () => ({
    json: async () => body,
    status,
  } as Response));
}

describe("ZarinpalClient", () => {

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requestPayment() returns a StartPay url built from the returned authority (sandbox)", async () => {

    const fetchMock = mockFetchOnce(200, {
      data: { code: 100, authority: "A00000000000000000000000000000123456" },
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new ZarinpalClient("merchant-123", true);

    const result = await client.requestPayment({
      amount: 100000,
      description: "Subscription plan: PRO",
      callbackUrl: "https://example.com/payment/callback",
    });

    expect(result.authority).toBe("A00000000000000000000000000000123456");
    expect(result.paymentUrl).toBe(
      "https://sandbox.zarinpal.com/pg/StartPay/A00000000000000000000000000000123456"
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(calledUrl).toBe("https://sandbox.zarinpal.com/pg/v4/payment/request.json");

    const sentBody = JSON.parse((options as any).body);
    expect(sentBody.merchant_id).toBe("merchant-123");
    expect(sentBody.amount).toBe(100000);
  });

  it("requestPayment() uses the production StartPay url when sandbox is false", async () => {

    vi.stubGlobal("fetch", mockFetchOnce(200, {
      data: { code: 100, authority: "AUTH1" },
    }));

    const client = new ZarinpalClient("merchant-123", false);

    const result = await client.requestPayment({
      amount: 1,
      description: "d",
      callbackUrl: "https://example.com/cb",
    });

    expect(result.paymentUrl).toBe("https://payment.zarinpal.com/pg/StartPay/AUTH1");
  });

  it("requestPayment() throws when Zarinpal returns a non-success code", async () => {

    vi.stubGlobal("fetch", mockFetchOnce(200, {
      errors: { message: "Invalid merchant" },
    }));

    const client = new ZarinpalClient("bad-merchant", true);

    await expect(
      client.requestPayment({
        amount: 100000,
        description: "d",
        callbackUrl: "https://example.com/cb",
      })
    ).rejects.toThrow(/Zarinpal payment request failed/);
  });

  it("verifyPayment() reports verified:true for code 100 (verified now)", async () => {

    vi.stubGlobal("fetch", mockFetchOnce(200, {
      data: { code: 100, ref_id: 987654 },
    }));

    const client = new ZarinpalClient("merchant-123", true);

    const result = await client.verifyPayment("some-authority", 100000);

    expect(result.verified).toBe(true);
    expect(result.refId).toBe(987654);
  });

  it("verifyPayment() reports verified:true for code 101 (already verified earlier)", async () => {

    vi.stubGlobal("fetch", mockFetchOnce(200, {
      data: { code: 101, ref_id: 987654 },
    }));

    const client = new ZarinpalClient("merchant-123", true);

    const result = await client.verifyPayment("some-authority", 100000);

    expect(result.verified).toBe(true);
  });

  it("verifyPayment() reports verified:false for any other code", async () => {

    vi.stubGlobal("fetch", mockFetchOnce(200, {
      data: { code: -11 },
    }));

    const client = new ZarinpalClient("merchant-123", true);

    const result = await client.verifyPayment("some-authority", 100000);

    expect(result.verified).toBe(false);
    expect(result.refId).toBeUndefined();
  });

});
