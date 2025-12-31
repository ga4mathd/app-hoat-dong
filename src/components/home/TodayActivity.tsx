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

export function TodayActivity({ activity, availableTags, selectedTag, onTagSelect }: TodayActivityProps) {
  return (
    <div className="flex flex-col items-center text-center pt-2 pb-6 animate-fade-in">
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

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        {availableTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            className={`cursor-pointer px-4 py-1.5 text-sm font-medium transition-all ${
              selectedTag === tag
                ? 'bg-yellow text-foreground border-yellow hover:bg-yellow/90'
                : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
            }`}
            onClick={() => onTagSelect(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Activity Title */}
      <h1 className="text-white text-2xl font-bold leading-tight px-4">
        {activity?.title || 'Chưa có hoạt động'}
      </h1>
    </div>
  );
}
