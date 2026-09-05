import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateFinanceDto extends PartialType(CreateTransactionDto) {}
