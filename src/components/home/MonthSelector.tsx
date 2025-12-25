import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export function MonthSelector() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  const handlePrev = () => {
    setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNext = () => {
    setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
  };

  return (
    <div className="flex items-center justify-center gap-4 py-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <button 
        onClick={handlePrev}
        className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
      </button>
      
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {MONTHS.map((month, index) => (
          <button
            key={month}
            onClick={() => setCurrentMonth(index)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              index === currentMonth
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {month}
          </button>
        ))}
      </div>
      
      <button 
        onClick={handleNext}
        className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
}
