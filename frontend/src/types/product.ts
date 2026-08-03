import z from "zod";

export interface Product{
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  isAvailable: boolean;
  categoryId: string;
}

export interface ProductCategories{
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  product: Product[]
}

export const CreateProductSchema = z.object({
  name: z.string().min(3, "Nama Produk Minimal 3 Karakter"),
  price: z.coerce.number({ error: "Wajib diisi dengan angka" }).min(0,"Harga Tidak Boleh Negatif"),
  stock: z.coerce.number({ error: "Wajib diisi dengan angka" }).min(0, "Stok Tidak Boleh Negatif"),
  description: z.string().optional(),
  categoryId: z.string({error: "Kategori Invalid"}),
});

export type CreateProduct = z.infer<typeof CreateProductSchema>