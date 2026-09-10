import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password baru tidak boleh kosong' })
  @MinLength(8, { message: 'Password minimal terdiri dari 8 karakter' })
  newPassword!: string;
}
