import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface DateBadgeProps {
  onClick: () => void;
}

const DateBadge = ({ onClick }: DateBadgeProps) => {
  const today = new Date();
  
  // Format: "T6, 17/1"
  const dayOfWeek = format(today, "EEEEEE", { locale: vi }); // T2, T3, T4, T5, T6, T7, CN
  const dayMonth = format(today, "d/M");
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/60 hover:bg-muted transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <CalendarDays className="h-3.5 w-3.5" />
      <span>{dayOfWeek}, {dayMonth}</span>
    </button>
  );
};

export default DateBadge;
