import { Target, BookOpen, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  goals: string | null;
  instructions: string | null;
  expert_name: string | null;
  expert_title: string | null;
}

interface TodayActivityProps {
  activity: Activity | null;
  availableTags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export function TodayActivity({ activity, availableTags, selectedTag, onTagSelect }: TodayActivityProps) {
  const navigate = useNavigate();

  // Default activity for display when no data
  const displayActivity = activity || {
    id: 'demo',
    title: 'Xiên bóng bay không nổ',
    tags: ['Trò chơi', 'Khoa học'],
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
      {/* Activity Info Card */}
      <div className="bg-gradient-to-br from-blue-light via-blue-light/80 to-blue-light/60 rounded-3xl p-5 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-base text-foreground">Hoạt động hôm nay</h3>
          <div className="flex gap-2">
            {availableTags.map((tag) => (
              <Badge 
                key={tag} 
                onClick={() => onTagSelect(tag)}
                className={`cursor-pointer transition-all duration-300 text-xs px-3 py-1 rounded-full font-medium ${
                  selectedTag === tag 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "border-foreground/50 text-foreground bg-transparent hover:bg-foreground/10 border"
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Title with transition */}
        <h4 className="font-bold text-2xl text-foreground transition-all duration-300">
          {displayActivity.title}
        </h4>
      </div>

      {/* Action Cards - Outside the blue card */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => navigate(`/activity/${displayActivity.id}?tab=goals`)}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Target className="h-7 w-7 text-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground text-center">Mục tiêu</span>
        </button>
        
        <button 
          onClick={() => navigate(`/activity/${displayActivity.id}?tab=instructions`)}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-pink/30 hover:bg-pink-light/30 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-pink-light flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-pink" />
          </div>
          <span className="text-sm font-medium text-foreground text-center leading-tight">Hướng dẫn<br/>thực hiện</span>
        </button>
        
        <button 
          onClick={() => navigate(`/activity/${displayActivity.id}?tab=video`)}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-pink/30 hover:bg-pink-light/30 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-pink-light flex items-center justify-center">
            <Video className="h-7 w-7 text-pink" />
          </div>
          <span className="text-sm font-medium text-foreground text-center leading-tight">Video hướng dẫn<br/>từ chuyên gia</span>
        </button>
      </div>
    </div>
  );
}
