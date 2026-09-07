import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface PrismaErrorOptions {
  entityName?: string;
  conflictMessage?: string;
  notFoundMessage?: string;
  foreignKeyMessage?: string;
}

// translate error kalau instance prisma (kode pg)
export function handlePrismaError(
  error: unknown,
  options?: PrismaErrorOptions | string,
): never {
  const opts: PrismaErrorOptions =
    typeof options === 'string' ? { entityName: options } : options || {};

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const entity = opts.entityName || 'Data';

    switch (error.code) {
      // violation unique -> respon dengan 409
      case 'P2002': {
        const message =
          opts.conflictMessage ||
          `${entity} dengan data tersebut sudah digunakan`;
        throw new ConflictException(message);
      }
      case 'P2025': {
        const message = opts.notFoundMessage || `${entity} tidak ditemukan`;
        throw new NotFoundException(message);
      }
      case 'P2003': {
        const message =
          opts.foreignKeyMessage ||
          `Relasi ${entity} tidak valid atau data terkait tidak ditemukan`;
        throw new BadRequestException(message);
      }
    }
  }

  if (error instanceof HttpException) {
    throw error;
  }

  throw error;
}
