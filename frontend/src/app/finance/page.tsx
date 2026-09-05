"use client";

import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import FinanceKPI from "./components/finance-kpi";
import { DataTableFinance } from "./components/tables/data-table-finance";
import { financeColumns } from "./components/tables/finance-table-columns";
import {
  useTransaction,
  useTransactionCategories,
  useTransactionCategory,
  useTransactions,
} from "@/lib/hooks/useTransactions";
import FinanceDrawer from "./components/form/finance-drawer";
import { useMemo, useState } from "react";
import { DataTableFinanceCategories } from "./components/tables/data-table-categories";
import { financeCategoriesColumns } from "./components/tables/categories-table-columns copy";
import FinanceCategoryDrawer from "./components/form/finance-category-drawer";
import { Transaction, TransactionType } from "@/types/finance";

export default function FinancialPage() {
  const { data: transactions } = useTransactions();
  const { data: categories } = useTransactionCategories();
  const [selected, setSelected] = useState<{
    transaction?: string;
    category?: string;
  }>({
    transaction: undefined,
    category: undefined,
  });
  const { data: transaction, isLoading: transactionLoading } = useTransaction(
    selected.transaction,
  );
  const { data: category, isLoading: categoryLoading } = useTransactionCategory(
    selected.category,
  );
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isOpen, setIsOpen] = useState({
    transaction: false,
    category: false,
  });
  const handleOpenCreate = () => {
    setSelected({ ...selected, transaction: undefined });
    setIsOpen({ ...isOpen, transaction: !isOpen.transaction });
  };
  const handleOpenEdit = (t: Transaction) => {
    setSelected({ ...selected, transaction: t?.id });
    setIsOpen({ ...isOpen, transaction: !isOpen.transaction });
  };
  const handleOpenCreateCategory = () => {
    setSelected({ ...selected, category: undefined });
    setIsOpen({ ...isOpen, category: !isOpen.category });
  };
  const handleOpenEditCategory = (id: string) => {
    setSelected({ ...selected, category: id });
    setIsOpen({ ...isOpen, category: !isOpen.transaction });
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
          onClick={() => handleOpenCreate()}
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
        key={selected.transaction ? `edit-${selected.transaction}` : "create"}
        Transaction={transaction}
        isOpen={isOpen.transaction}
        isLoading={transactionLoading}
        onOpenChange={handleOpenCreate}
      />
      <FinanceCategoryDrawer
        key={
          selected.category
            ? `edit-category-${selected.category}`
            : "create-category"
        }
        category={category}
        isOpen={isOpen.category}
        isLoading={categoryLoading}
        onOpenChange={handleOpenCreateCategory}
      />
      <DataTableFinance
        data={transactions || []}
        columns={financeColumns}
        categories={categories || []}
        onOpenEdit={handleOpenEdit}
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
        />
      </div>
    </div>
  );
}
