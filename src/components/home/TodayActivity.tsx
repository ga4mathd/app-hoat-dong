import { Badge } from '@/components/ui/badge';
import avatarBoy from '@/assets/avatar-boy.png';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  goals: string | null;
  instructions: string | null;
  expert_name: string | null;
  expert_title: string | null;
  image_url: string | null;
}

interface TodayActivityProps {
  activity: Activity | null;
  availableTags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

interface TodayActivityPropsExtended extends TodayActivityProps {
  totalActivities?: number;
}

export function TodayActivity({ activity, availableTags, selectedTag, onTagSelect, totalActivities = 0 }: TodayActivityPropsExtended) {
  return (
    <div className="flex flex-col items-center text-center pt-2 pb-6 animate-fade-in">
      {/* Motivation Text - Marquee */}
      <div className="w-full overflow-hidden mb-2">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-white/80 text-xs font-medium tracking-wide uppercase mx-8">
            Bạn đã thực hiện <span className="text-yellow font-bold">{totalActivities}</span> hoạt động trong tháng! Cố gắng nhé!
          </span>
          <span className="text-white/80 text-xs font-medium tracking-wide uppercase mx-8">
            Bạn đã thực hiện <span className="text-yellow font-bold">{totalActivities}</span> hoạt động trong tháng! Cố gắng nhé!
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-white/90 text-sm font-medium mb-4 tracking-wide">
        Hoạt động hôm nay
      </h2>

      {/* Large Avatar with gradient border */}
      <div className="relative mb-4">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue to-orange">
          <div className="w-full h-full rounded-full overflow-hidden bg-card">
            <img 
              src={activity?.image_url || avatarBoy} 
              alt="Activity"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Single Tag - Only show first available tag */}
      {availableTags.length > 0 && (
        <div className="mb-3">
          <span className="px-4 py-1.5 text-sm font-medium bg-yellow text-foreground rounded-full">
            {availableTags[0]}
          </span>
        </div>
      )}

      {/* Activity Title */}
      <h1 className="text-white text-2xl font-bold leading-tight px-4">
        {activity?.title || 'Chưa có hoạt động'}
      </h1>
    </div>
  );
}
