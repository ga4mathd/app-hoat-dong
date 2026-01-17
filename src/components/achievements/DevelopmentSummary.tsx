import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { DevelopmentData } from '@/lib/developmentCategories';
import { DevelopmentChart } from './DevelopmentChart';

interface DevelopmentSummaryProps {
  data: DevelopmentData[];
}

export function DevelopmentSummary({ data }: DevelopmentSummaryProps) {
  const navigate = useNavigate();
  const hasData = data.some(d => d.value > 0);

  return (
    <div 
      className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-5 border border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
      onClick={() => navigate('/development')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Phát triển toàn diện</h3>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>

      {hasData ? (
        <>
          <div className="h-[220px] -mx-2">
            <DevelopmentChart data={data} showLabels={false} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Nhấn để xem chi tiết sự phát triển của con
          </p>
        </>
      ) : (
        <div className="py-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-muted-foreground text-sm">
            Hoàn thành các hoạt động để theo dõi sự phát triển của con
          </p>
        </div>
      )}
    </div>
  );
}
