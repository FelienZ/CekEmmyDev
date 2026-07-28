"use client";

import { productColumns } from "@/app/products/components/product-table-columns";
import { Button } from "@/components/ui/button";
import {
  useGetProductById,
  useGetProductCategories,
  useGetProducts,
} from "@/lib/hooks/useProducts";
import { PackagePlus } from "lucide-react";
import { DataTableProducts } from "./components/data-table-products";
import ProductDrawer from "./components/product-drawer";
import { useState } from "react";
import { Product } from "@/types/product";

export default function ProductPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const { data: products } = useGetProducts();
  const { data: categories } = useGetProductCategories();
  const { data: product, isLoading: isLoadingProduct } =
    useGetProductById(selectedProduct);

  const handleOpenCreate = () => {
    setSelectedProduct(undefined);
    setIsOpen(!isOpen);
  };

  const handleOpenEdit = (val: Product) => {
    setSelectedProduct(val.id);
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col gap-5 py-4 lg:gap-10 md:py-6">
      <div className="flex max-sm:flex-col gap-3 items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col gap-2 max-sm:text-sm max-sm:text-center">
          <h3 className="font-semibold text-xl md:text-3xl">
            Manajemen Produk
          </h3>
          <p>Kelola Inventaris dan Katalog Produk</p>
        </div>
        <Button
          size={"lg"}
          className="gap-2 max-sm:w-full"
          onClick={handleOpenCreate}
        >
          <PackagePlus /> Buat Produk
        </Button>
      </div>
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <DataTableProducts
          data={products || []}
          columns={productColumns}
          categories={categories || []}
          onOpenEdit={handleOpenEdit}
        />
      </div>
      <ProductDrawer
        key={product ? `edit-${product.id}` : "create"}
        product={product}
        isOpen={isOpen}
        isLoading={isLoadingProduct}
        onOpenChange={handleOpenCreate}
      />
    </div>
  );
}
