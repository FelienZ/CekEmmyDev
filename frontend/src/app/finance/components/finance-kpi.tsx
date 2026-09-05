import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import CountUp from "react-countup";

interface FinanceKPIProps {
  income: number;
  expense: number;
  profit: number;
}

export default function FinanceKPI({
  income,
  expense,
  profit,
}: FinanceKPIProps) {
  return (
    <section className="grid grid-cols-3 gap-10">
      <div className="p-3 bg-accent rounded-md border-3 border-sidebar-ring flex items-center justify-between">
        <div className="grid place-content-between gap-3 py-2">
          <h4 className="font-medium">Total Pemasukan: </h4>
          <CountUp
            end={income}
            prefix="Rp. "
            duration={3}
            separator=","
            className="text-lg font-semibold"
          />
        </div>
        <Badge className="self-center bg-success text-success-foreground size-10 [&>svg]:size-5! rounded-md">
          <ArrowUp />
        </Badge>
      </div>
      <div className="p-3 bg-accent rounded-md border-3 border-sidebar-ring flex items-center justify-between">
        <div className="grid place-content-between gap-3 py-2">
          <h4 className="font-medium">Total Pengeluaran: </h4>
          <CountUp
            end={expense}
            prefix="Rp. "
            duration={3}
            separator=","
            className="text-lg font-semibold"
          />
        </div>
        <Badge className="self-center bg-danger text-danger-foreground [&>svg]:size-5! size-10 rounded-md">
          <ArrowDown />
        </Badge>
      </div>
      <div className="p-3 bg-accent rounded-md border-3 border-sidebar-ring flex items-center justify-between">
        <div className="grid place-content-between gap-3 py-2">
          <h4 className="font-medium">Pemasukan Bersih: </h4>
          <CountUp
            end={profit}
            prefix="Rp. "
            duration={3}
            separator=","
            className="text-lg font-semibold"
          />
        </div>
        <Badge className="self-center bg-success text-success-foreground size-10 [&>svg]:size-5! rounded-md">
          <DollarSign />
        </Badge>
      </div>
    </section>
  );
}
