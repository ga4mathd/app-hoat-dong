import { Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
}

interface HeroCardProps {
  activity: Activity | null;
  onStart: () => void;
}

export function HeroCard({ activity, onStart }: HeroCardProps) {
  // Get today's date formatted
  const today = new Date();
  const dayName = today.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dateFormatted = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  if (!activity) {
    return (
      <div className="bg-gradient-to-br from-[hsl(210,85%,55%)] via-[hsl(230,70%,50%)] to-[hsl(270,60%,50%)] rounded-3xl p-6 shadow-xl min-h-[280px] flex items-center justify-center">
        <p className="text-white/80 text-lg">Chưa có hoạt động hôm nay</p>
      </div>
    );
  }

  const mainTag = activity.tags?.[0] || 'Hoạt động';

  return (
    <div className="bg-gradient-to-br from-[hsl(210,85%,55%)] via-[hsl(230,70%,50%)] to-[hsl(270,60%,50%)] rounded-3xl p-6 shadow-xl animate-fade-in">
      {/* Date Label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/70 text-sm font-medium capitalize">
          {dayName}, {dateFormatted}
        </span>
        <span className="px-3 py-1 text-xs font-bold bg-green text-white rounded-full">
          {mainTag}
        </span>
      </div>

      {/* Activity Title - Large & Clear */}
      <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-6">
        {activity.title}
      </h1>

      {/* Estimated Time */}
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-4 w-4 text-white/70" />
        <span className="text-white/80 text-sm font-medium">5-15 phút</span>
      </div>

      {/* CTA Button - Full Width */}
      <Button
        onClick={onStart}
        size="lg"
        className="w-full h-14 text-lg font-bold rounded-2xl bg-white text-primary hover:bg-white/90 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Play className="h-5 w-5 mr-2 fill-current" />
        Bắt đầu ngay
      </Button>
    </div>
  );
}
