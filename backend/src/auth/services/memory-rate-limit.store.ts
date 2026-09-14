import { Injectable } from '@nestjs/common';
import { RateLimitResult, RateLimitStore } from './rate-limit-store.interface';

interface MemoryBucket {
  count: number;
  windowStart: number;
  windowMs: number;
}

/**
 * Lightweight in-memory fixed-window rate limiter store.
 * Suitable for single-instance / development environments.
 * Uses opportunistic pruning to ensure memory remains bounded without running timers.
 */
@Injectable()
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly store = new Map<string, MemoryBucket>();
  private readonly maxEntries = 10000;

  private pruneExpired(now: number): void {
    for (const [key, bucket] of this.store.entries()) {
      if (now - bucket.windowStart >= bucket.windowMs) {
        this.store.delete(key);
      }
    }
  }

  consume(key: string, limit: number, windowSeconds: number): RateLimitResult {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // Opportunistic pruning when memory threshold is reached
    if (this.store.size >= this.maxEntries) {
      this.pruneExpired(now);
    }

    const bucket = this.store.get(key);

    if (!bucket || now - bucket.windowStart >= bucket.windowMs) {
      this.store.set(key, {
        count: 1,
        windowStart: now,
        windowMs,
      });
      return {
        allowed: true,
        retryAfter: 0,
        remaining: Math.max(0, limit - 1),
        total: 1,
      };
    }

    if (bucket.count >= limit) {
      const elapsed = now - bucket.windowStart;
      const retryAfter = Math.max(
        1,
        Math.ceil((bucket.windowMs - elapsed) / 1000),
      );
      return {
        allowed: false,
        retryAfter,
        remaining: 0,
        total: bucket.count,
      };
    }

    bucket.count += 1;
    return {
      allowed: true,
      retryAfter: 0,
      remaining: Math.max(0, limit - bucket.count),
      total: bucket.count,
    };
  }

  reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}
