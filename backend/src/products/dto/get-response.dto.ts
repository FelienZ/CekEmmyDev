export class GetProductResponseDto {
  id!: string;
  slug!: string | null;
  name!: string;
  price!: number;
  stock!: number;
  description!: string | null;
  categoryId!: string;
  isAvailable!: boolean;
}

export class GetProductCategoriesDto {
  categoryId!: string;
  name!: string;
  description!: string | null;
}
