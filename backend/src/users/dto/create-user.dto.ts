import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Nama harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name!: string;

  @ValidateIf((o: CreateUserDto) => !o.email || o.email.trim().length === 0)
  @IsNotEmpty({
    message: 'Minimal salah satu dari nomor telepon atau email harus diisi',
  })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;
}
