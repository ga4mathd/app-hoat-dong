import { Clock, Play, Bookmark, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import avatarBoy from '@/assets/avatar-boy.png';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  goals: string | null;
  expert_name: string | null;
  expert_title: string | null;
  expert_avatar?: string | null;
}

interface HeroCardProps {
  activity: Activity | null;
  onStart: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function HeroCard({ activity, onStart, onSave, isSaved = false }: HeroCardProps) {
  // Get today's date formatted
  const today = new Date();
  const dayName = today.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dateFormatted = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  if (!activity) {
    return (
      <div className="bg-card rounded-3xl p-6 shadow-lg border border-border min-h-[320px] flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">Chưa có hoạt động hôm nay</p>
          <p className="text-muted-foreground/70 text-sm mt-1">Quay lại sau nhé!</p>
        </div>
      </div>
    );
  }

  const mainTag = activity.tags?.[0] || 'Hoạt động';
  
  // Extract first goal/objective
  const firstGoal = activity.goals?.split('\n')[0]?.replace(/^(Bước\s*\d+[:.]\s*|[-•]\s*)/, '') || 
                    activity.description?.substring(0, 100) || 
                    'Phát triển kỹ năng cho bé';

  return (
    <div className="bg-card rounded-3xl shadow-lg border border-border overflow-hidden animate-fade-in">
      {/* Date Label */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium capitalize">
          {dayName}, {dateFormatted}
        </span>
        <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">
          {mainTag}
        </span>
      </div>

      {/* Activity Title - Large & Clear */}
      <div className="px-5 pb-4">
        <h1 className="text-foreground text-2xl font-bold leading-tight line-clamp-3">
          {activity.title}
        </h1>
      </div>

      {/* Expert Info - Compact */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border-2 border-pink-light">
            <AvatarImage src={activity.expert_avatar || avatarBoy} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-pink to-secondary text-white font-bold text-xs">
              {activity.expert_name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{activity.expert_name || 'Chuyên gia'}</span>
            <span className="text-xs text-muted-foreground">{activity.expert_title || 'Chuyên gia Giáo dục'}</span>
          </div>
        </div>
      </div>

      {/* Goal Box */}
      <div className="mx-5 mb-4 p-4 bg-orange-light rounded-2xl">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center flex-shrink-0 mt-0.5">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-orange uppercase tracking-wide mb-1">Mục tiêu</p>
            <p className="text-sm text-foreground leading-relaxed line-clamp-2">
              {firstGoal}
            </p>
          </div>
        </div>
      </div>

      {/* Time Estimate */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm font-medium">5-15 phút</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 pb-5 space-y-3">
        {/* Primary CTA */}
        <Button
          onClick={onStart}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="h-5 w-5 mr-2 fill-current" />
          Bắt đầu ngay
        </Button>

        {/* Secondary Action - Save */}
        {onSave && (
          <Button
            onClick={onSave}
            variant="outline"
            className={`w-full h-11 font-medium rounded-xl border-2 transition-all ${
              isSaved 
                ? 'bg-yellow-light border-yellow text-yellow' 
                : 'border-border text-muted-foreground hover:border-yellow hover:text-yellow'
            }`}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Đã lưu' : 'Lưu lại xem sau'}
          </Button>
        )}
      </div>
    </div>
  );
}
