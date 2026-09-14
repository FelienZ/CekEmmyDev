import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import {
  RATE_LIMIT_STORE,
  type RateLimitStore,
} from './rate-limit-store.interface';
import { MemoryRateLimitStore } from './memory-rate-limit.store';

export class RateLimitException extends HttpException {
  constructor(
    message: string,
    public readonly retryAfter: number,
  ) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export type IdentifierType = 'email' | 'phone';

/**
 * Application-level rate limiter for custom FinPro auth routes.
 * Enforces dual-dimension rate limits (Client IP + Canonical Identifier).
 * Operates strictly before side-effect operations (DB mutations, Better Auth OTP dispatch).
 */
@Injectable()
export class AuthRateLimiterService {
  private readonly store: RateLimitStore;

  constructor(
    @Optional()
    @Inject(RATE_LIMIT_STORE)
    store?: RateLimitStore,
  ) {
    this.store = store ?? new MemoryRateLimitStore();
  }

  /**
   * Helper to evaluate a specific rate limit key and throw RateLimitException if exceeded.
   */
  private checkKeyLimit(
    key: string,
    limit: number,
    windowSeconds: number,
    errorMessage: (retryAfter: number) => string,
  ): void {
    const result = this.store.consume(key, limit, windowSeconds);
    // Support both sync and async stores
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      throw new Error('Async rate limit store requires await handling');
    }

    const syncResult = result as { allowed: boolean; retryAfter: number };
    if (!syncResult.allowed) {
      throw new RateLimitException(
        errorMessage(syncResult.retryAfter),
        syncResult.retryAfter,
      );
    }
  }

  /**
   * Login rate limit:
   * - IP: 10 requests / 60s
   * - Identifier: 5 requests / 60s
   */
  checkLoginRateLimit(
    ip: string,
    normalizedIdentifier: string,
    type: IdentifierType,
  ): void {
    const canonicalIp = ip.trim();
    const canonicalId = normalizedIdentifier.trim();

    // 1. IP check
    this.checkKeyLimit(
      `login:ip:${canonicalIp}`,
      10,
      60,
      (retryAfter) =>
        `Terlalu banyak percobaan login dari IP ini. Silakan coba lagi dalam ${retryAfter} detik.`,
    );

    // 2. Identifier check
    this.checkKeyLimit(
      `login:id:${type}:${canonicalId}`,
      5,
      60,
      (retryAfter) =>
        `Terlalu banyak percobaan login untuk akun ini. Silakan coba lagi dalam ${retryAfter} detik.`,
    );
  }

  /**
   * OTP Send / Registration rate limit:
   * - IP: 5 requests / 60s
   * - Identifier: 1 request / 60s (Cooldown)
   */
  checkOtpSendRateLimit(
    ip: string,
    normalizedIdentifier: string,
    type: IdentifierType,
  ): void {
    const canonicalIp = ip.trim();
    const canonicalId = normalizedIdentifier.trim();

    // 1. IP check
    this.checkKeyLimit(
      `otp_send:ip:${canonicalIp}`,
      5,
      60,
      (retryAfter) =>
        `Terlalu banyak permintaan OTP dari IP ini. Silakan coba lagi dalam ${retryAfter} detik.`,
    );

    // 2. Identifier check (1 req per 60s cooldown)
    this.checkKeyLimit(
      `otp_send:id:${type}:${canonicalId}`,
      1,
      60,
      (retryAfter) =>
        `Silakan tunggu ${retryAfter} detik sebelum meminta kode OTP kembali.`,
    );
  }

  /**
   * OTP Verify rate limit:
   * - IP: 10 requests / 60s
   * - Identifier: 5 requests / 60s
   * Note: Better Auth allowedAttempts remains the primary guard for code validity.
   */
  checkOtpVerifyRateLimit(
    ip: string,
    normalizedIdentifier: string,
    type: IdentifierType,
  ): void {
    const canonicalIp = ip.trim();
    const canonicalId = normalizedIdentifier.trim();

    // 1. IP check
    this.checkKeyLimit(
      `otp_verify:ip:${canonicalIp}`,
      10,
      60,
      (retryAfter) =>
        `Terlalu banyak percobaan verifikasi OTP dari IP ini. Silakan coba lagi dalam ${retryAfter} detik.`,
    );

    // 2. Identifier check
    this.checkKeyLimit(
      `otp_verify:id:${type}:${canonicalId}`,
      5,
      60,
      (retryAfter) =>
        `Terlalu banyak percobaan verifikasi OTP untuk akun ini. Silakan coba lagi dalam ${retryAfter} detik.`,
    );
  }

  /**
   * Resets rate limit entries (useful for test isolation).
   */
  reset(key?: string): void {
    void this.store.reset?.(key);
  }
}
