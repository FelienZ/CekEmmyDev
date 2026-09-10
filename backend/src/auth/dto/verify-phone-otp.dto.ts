import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyPhoneOtpDto {
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phone!: string;

  @IsString({ message: 'Kode OTP harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Kode OTP tidak boleh kosong' })
  code!: string;
}
