import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProductCategoryStatusDto {
  @IsBoolean({ message: 'Status aktif harus berupa boolean' })
  @IsNotEmpty({ message: 'Status aktif tidak boleh kosong' })
  isActive!: boolean;
}
