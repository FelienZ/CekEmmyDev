"use client";

import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import FinanceKPI from "./components/finance-kpi";
import { DataTableFinance } from "./components/tables/data-table-finance";
import { financeColumns } from "./components/tables/finance-table-columns";
import {
  useTransactionCategories,
  useTransactions,
  useActivateCategory,
  useDeactivateCategory,
} from "@/lib/hooks/useTransactions";
import FinanceDrawer from "./components/form/finance-drawer";
import { useMemo, useState } from "react";
import { DataTableFinanceCategories } from "./components/tables/data-table-categories";
import { financeCategoriesColumns } from "./components/tables/categories-table-columns";
import FinanceCategoryDrawer from "./components/form/finance-category-drawer";
import { Transaction, TransactionCategory, TransactionType } from "@/types/finance";

export default function FinancialPage() {
  const { data: transactions } = useTransactions();
  const { data: categories } = useTransactionCategories();
  const { mutate: activateCategory } = useActivateCategory();
  const { mutate: deactivateCategory } = useDeactivateCategory();

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const [isOpen, setIsOpen] = useState({
    transaction: false,
    category: false,
  });

  const handleOpenCreateTransaction = () => {
    setSelectedTransactionId(undefined);
    setIsOpen((prev) => ({ ...prev, transaction: !prev.transaction }));
  };

  const handleOpenEditTransaction = (data: Transaction) => {
    setSelectedTransactionId(data.id);
    setIsOpen((prev) => ({ ...prev, transaction: true }));
  };

  const handleOpenCreateCategory = () => {
    setSelectedCategoryId(undefined);
    setIsOpen((prev) => ({ ...prev, category: !prev.category }));
  };

  const handleOpenEditCategory = (data: TransactionCategory) => {
    setSelectedCategoryId(data.categoryId);
    setIsOpen((prev) => ({ ...prev, category: true }));
  };

  const incomeTotal = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    const total = transactions
      ?.filter((t) => t.transactionCategory.type === TransactionType.INCOME)
      .map((t) => Number(t.amount))
      .reduce((a, v) => a + v, 0);
    return total;
  }, [transactions]);
  const expenseTotal = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    const total = transactions
      ?.filter((t) => t.transactionCategory.type === TransactionType.EXPENSE)
      .map((t) => Number(t.amount))
      .reduce((a, v) => a + v, 0);
    return total;
  }, [transactions]);
  const netProfit = Number(incomeTotal) - Number(expenseTotal);

  const selectedTransaction = transactions?.find(
    (t) => t.id === selectedTransactionId,
  );

  const selectedCategory = categories?.find(
    (c) => c.categoryId === selectedCategoryId,
  );

  return (
    <div className="flex flex-col gap-5 py-4 lg:gap-8 md:py-6 lg:px-6">
      <div className="flex max-sm:flex-col gap-2 items-center justify-between">
        <div className="flex flex-col gap-2 max-sm:text-sm max-sm:text-center">
          <h2 className="font-semibold md:text-3xl text-2xl">
            Manajemen Keuangan
          </h2>
          <p>Pantau Keuangan dan Transaksi</p>
        </div>
        <Button
          onClick={() => handleOpenCreateTransaction()}
          size={"lg"}
          className="gap-2 max-sm:w-full"
        >
          <CirclePlus /> Entri Baru
        </Button>
      </div>
      <FinanceKPI
        income={incomeTotal}
        expense={expenseTotal}
        profit={netProfit}
      />
      <FinanceDrawer
        key={
          selectedTransactionId
            ? `edit-transaction-${selectedTransactionId}`
            : "create-transaction"
        }
        transaction={selectedTransaction}
        isOpen={isOpen.transaction}
        onOpenChange={(open) => {
          if (!open) setSelectedTransactionId(undefined);
          setIsOpen((prev) => ({ ...prev, transaction: open }));
        }}
      />
      <FinanceCategoryDrawer
        key={
          selectedCategoryId
            ? `edit-category-${selectedCategoryId}`
            : "create-category"
        }
        category={selectedCategory}
        isOpen={isOpen.category}
        onOpenChange={handleOpenCreateCategory}
      />
      <DataTableFinance
        data={transactions || []}
        columns={financeColumns}
        categories={categories || []}
        onOpenEdit={handleOpenEditTransaction}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xl">Kategori Transaksi</h3>
          <Button
            onClick={() => handleOpenCreateCategory()}
            size={"lg"}
            className="gap-2 w-fit max-sm:w-full"
          >
            <CirclePlus /> Kategori Baru
          </Button>
        </div>
        <DataTableFinanceCategories
          categories={categories || []}
          columns={financeCategoriesColumns}
          onOpenEdit={handleOpenEditCategory}
          onActivate={(id) => activateCategory(id)}
          onDeactivate={(id) => deactivateCategory(id)}
        />
      </div>
    </div>
  );
}
