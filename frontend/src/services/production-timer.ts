import type { ProductionOrder } from "../types/production";

/** Calculate elapsed time in seconds (excluding paused time) */
export function getElapsedSeconds(order: ProductionOrder): number {
  if (!order.timerStartedAt) return 0;

  const startTime = new Date(order.timerStartedAt).getTime();
  const now = Date.now();

  let totalElapsed = Math.floor((now - startTime) / 1000);
  totalElapsed -= order.totalPausedSeconds;

  // If currently paused, subtract current pause duration
  if (order.timerPausedAt) {
    const pausedAt = new Date(order.timerPausedAt).getTime();
    const currentPauseDuration = Math.floor((now - pausedAt) / 1000);
    totalElapsed -= currentPauseDuration;
  }

  return Math.max(0, totalElapsed);
}

/** Format seconds into HH:MM:SS */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** Check if timer is currently running */
export function isTimerRunning(order: ProductionOrder): boolean {
  return (
    !!order.timerStartedAt &&
    !order.timerPausedAt &&
    order.status !== "COMPLETED" &&
    order.status !== "CANCELLED"
  );
}

/** Check if timer is paused */
export function isTimerPaused(order: ProductionOrder): boolean {
  return (
    !!order.timerStartedAt &&
    !!order.timerPausedAt &&
    order.status !== "COMPLETED" &&
    order.status !== "CANCELLED"
  );
}
