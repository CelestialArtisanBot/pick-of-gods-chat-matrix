/**
 * Utility functions for IDs, timestamps, etc.
 */

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);
}

export function generateTimestamp(secondsFromNow = 0): string {
  return new Date(Date.now() + secondsFromNow * 1000).toISOString();
}
