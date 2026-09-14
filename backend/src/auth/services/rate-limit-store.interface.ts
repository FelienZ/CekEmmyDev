export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
  total: number;
}

export const RATE_LIMIT_STORE = Symbol('RATE_LIMIT_STORE');

export interface RateLimitStore {
  consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> | RateLimitResult;
  reset?(key?: string): Promise<void> | void;
}
