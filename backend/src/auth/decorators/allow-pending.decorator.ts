import { SetMetadata } from '@nestjs/common';

export const ALLOW_PENDING_KEY = 'allowPendingActivation';
export const AllowPendingActivation = () =>
  SetMetadata(ALLOW_PENDING_KEY, true);
