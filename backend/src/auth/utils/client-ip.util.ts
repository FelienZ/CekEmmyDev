import type { Request } from 'express';

/**
 * Extracts client IP address safely in a proxy-aware manner.
 * Express populates `req.ip` when `trust proxy` is configured properly.
 * IPv6-mapped IPv4 addresses (::ffff:127.0.0.1) are normalized to standard IPv4.
 */
export function getClientIp(req: Request): string {
  const rawIp = req.ip || req.socket?.remoteAddress;
  if (rawIp) {
    return rawIp.replace(/^::ffff:/, '').trim();
  }
  return '127.0.0.1';
}
