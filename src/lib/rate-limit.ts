export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maximumKeys = 10_000
  ) {}

  attempt(key: string, now = Date.now()) {
    const current = this.entries.get(key);
    if (current && current.resetAt > now) {
      if (current.count >= this.limit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
      current.count++;
      return { allowed: true, retryAfterSeconds: 0 };
    }
    this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
    if (this.entries.size > this.maximumKeys) this.compact(now);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  clear(key: string) {
    this.entries.delete(key);
  }

  private compact(now: number) {
    for (const [key, value] of this.entries) if (value.resetAt <= now) this.entries.delete(key);
    while (this.entries.size > this.maximumKeys) {
      const oldestKey = this.entries.keys().next().value as string | undefined;
      if (!oldestKey) break;
      this.entries.delete(oldestKey);
    }
  }
}

