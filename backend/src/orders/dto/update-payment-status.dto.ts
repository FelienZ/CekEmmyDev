import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsNumber({}, { message: 'Jumlah bayar harus berupa angka' })
  @Min(0, { message: 'Jumlah bayar tidak boleh negatif' })
  @IsNotEmpty({ message: 'Jumlah bayar tidak boleh kosong' })
  paidAmount!: number;
}
