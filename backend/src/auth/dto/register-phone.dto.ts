import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterPhoneDto {
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phone!: string;

  @IsString({ message: 'Nama harus berupa teks' })
  @IsOptional()
  name?: string;
}
