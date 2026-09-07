import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTransactionCategoryDto } from './create-transaction-category.dto';

export class UpdateTransactionCategoryDto extends PartialType(
  OmitType(CreateTransactionCategoryDto, ['type'] as const),
) {}
