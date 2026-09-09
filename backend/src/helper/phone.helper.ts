import { BadRequestException } from '@nestjs/common';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Normalizes a phone number to canonical E.164 format (e.g. +6281234567890).
 * Defaults to Indonesia (ID) region when country code is omitted.
 */
export function normalizePhoneNumber(
  rawPhone: string | null | undefined,
): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return null;
  }

  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = parsePhoneNumberFromString(trimmed, 'ID');
  if (!parsed || !parsed.isValid()) {
    throw new BadRequestException('Format nomor telepon tidak valid');
  }

  return parsed.format('E.164');
}

/**
 * Normalizes email address to canonical trimmed lowercase.
 */
export function normalizeEmail(
  rawEmail: string | null | undefined,
): string | null {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return null;
  }

  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.toLowerCase();
}
