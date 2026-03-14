import { describe, it, expect, vi, afterEach } from "vitest";
import { getElapsedSeconds, formatTime, isTimerRunning, isTimerPaused } from "./production-timer";
import type { ProductionOrder } from "../types/production";

const makeOrder = (overrides: Partial<ProductionOrder> = {}): ProductionOrder => ({
  orderNumber: "OP000001",
  productId: "p1",
  targetQuantity: 100,
  status: "PRODUCING",
  totalPausedSeconds: 0,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

describe("formatTime", () => {
  it("formats 0 seconds as 00:00:00", () => {
    expect(formatTime(0)).toBe("00:00:00");
  });

  it("formats 90 seconds as 00:01:30", () => {
    expect(formatTime(90)).toBe("00:01:30");
  });

  it("formats 3661 seconds as 01:01:01", () => {
    expect(formatTime(3661)).toBe("01:01:01");
  });
});

describe("getElapsedSeconds", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 0 when timer has not started", () => {
    const order = makeOrder({ timerStartedAt: null });
    expect(getElapsedSeconds(order)).toBe(0);
  });

  it("calculates elapsed time excluding paused seconds", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const startedAt = new Date(now - 120_000).toISOString(); // 120s ago
    const order = makeOrder({ timerStartedAt: startedAt, totalPausedSeconds: 20 });

    expect(getElapsedSeconds(order)).toBe(100); // 120 - 20
  });

  it("subtracts current pause duration when paused", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const startedAt = new Date(now - 120_000).toISOString(); // 120s ago
    const pausedAt = new Date(now - 30_000).toISOString(); // 30s ago
    const order = makeOrder({
      timerStartedAt: startedAt,
      timerPausedAt: pausedAt,
      totalPausedSeconds: 10,
    });

    // 120 - 10 (previous paused) - 30 (current pause) = 80
    expect(getElapsedSeconds(order)).toBe(80);
  });
});

describe("isTimerRunning", () => {
  it("returns true when started and not paused", () => {
    const order = makeOrder({ timerStartedAt: "2024-01-01T00:00:00Z" });
    expect(isTimerRunning(order)).toBe(true);
  });

  it("returns false when paused", () => {
    const order = makeOrder({
      timerStartedAt: "2024-01-01T00:00:00Z",
      timerPausedAt: "2024-01-01T00:01:00Z",
    });
    expect(isTimerRunning(order)).toBe(false);
  });

  it("returns false when completed", () => {
    const order = makeOrder({
      timerStartedAt: "2024-01-01T00:00:00Z",
      status: "COMPLETED",
    });
    expect(isTimerRunning(order)).toBe(false);
  });
});

describe("isTimerPaused", () => {
  it("returns true when started and paused", () => {
    const order = makeOrder({
      timerStartedAt: "2024-01-01T00:00:00Z",
      timerPausedAt: "2024-01-01T00:01:00Z",
    });
    expect(isTimerPaused(order)).toBe(true);
  });

  it("returns false when not started", () => {
    expect(isTimerPaused(makeOrder())).toBe(false);
  });
});
