import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyEmailOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @IsString({ message: 'Kode OTP harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Kode OTP tidak boleh kosong' })
  otp!: string;
}
