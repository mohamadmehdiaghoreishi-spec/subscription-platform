import { describe, it, expect, vi, afterEach } from "vitest";

import { Logger } from "../../../src/core/logging/Logger";

describe("Logger", () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("info() writes a JSON line to console.log with level, event and fields", () => {

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    Logger.info("request.start", { path: "/sub" });

    expect(spy).toHaveBeenCalledTimes(1);

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);

    expect(parsed.level).toBe("info");
    expect(parsed.event).toBe("request.start");
    expect(parsed.path).toBe("/sub");
    expect(parsed.timestamp).toBeTruthy();
  });

  it("warn() writes to console.warn", () => {

    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    Logger.warn("quota.near-limit", { ownerId: "owner-1" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(spy.mock.calls[0][0] as string).level).toBe("warn");
  });

  it("error() writes to console.error", () => {

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    Logger.error("request.error", { status: 500 });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(spy.mock.calls[0][0] as string).level).toBe("error");
  });

});
