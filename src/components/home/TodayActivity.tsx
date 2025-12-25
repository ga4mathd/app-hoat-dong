import { Target, BookOpen, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function TodayActivity() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    supabase
      .from('activities')
      .select('*')
      .eq('scheduled_date', new Date().toISOString().split('T')[0])
      .maybeSingle()
      .then(({ data }) => {
        if (data) setActivity(data);
      });
  }, []);

  // Default activity for display
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
            {displayActivity.tags?.map((tag, index) => (
              <Badge 
                key={tag} 
                variant={index === 0 ? "default" : "outline"}
                className={index === 0 
                  ? "bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium" 
                  : "border-foreground/50 text-foreground text-xs px-3 py-1 rounded-full bg-transparent font-medium"
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-bold text-2xl text-foreground">{displayActivity.title}</h4>
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
