import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterEmailDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @IsString({ message: 'Nama harus berupa teks' })
  @IsOptional()
  name?: string;
}
