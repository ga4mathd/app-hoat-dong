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

  if (!activity) {
    return (
      <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in border-2 border-blue-light" style={{ animationDelay: '0.4s' }}>
        <p className="text-muted-foreground text-center">Không có hoạt động cho hôm nay</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-gradient-to-br from-blue-light/50 to-card rounded-2xl p-5 card-shadow animate-fade-in border-2 border-blue-light"
      style={{ animationDelay: '0.4s' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-bold text-base text-foreground">Hoạt động hôm nay</h3>
        <div className="flex gap-2">
          {activity.tags?.map((tag, index) => (
            <Badge 
              key={tag} 
              variant={index === 0 ? "default" : "outline"}
              className={index === 0 
                ? "bg-primary text-primary-foreground text-xs" 
                : "border-primary text-primary text-xs bg-transparent"
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-xl text-foreground mb-4">{activity.title}</h4>

      {/* Action Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => navigate(`/activity/${activity.id}?tab=goals`)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-muted transition-colors card-shadow"
        >
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
            <Target className="h-5 w-5 text-card" />
          </div>
          <span className="text-xs font-medium text-foreground text-center">Mục tiêu</span>
        </button>
        
        <button 
          onClick={() => navigate(`/activity/${activity.id}?tab=instructions`)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-muted transition-colors card-shadow"
        >
          <div className="w-10 h-10 rounded-full bg-pink flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground text-center leading-tight">Hướng dẫn thực hiện</span>
        </button>
        
        <button 
          onClick={() => navigate(`/activity/${activity.id}?tab=video`)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-muted transition-colors card-shadow"
        >
          <div className="w-10 h-10 rounded-full bg-pink-light flex items-center justify-center">
            <Video className="h-5 w-5 text-pink" />
          </div>
          <span className="text-xs font-medium text-foreground text-center leading-tight">Video hướng dẫn từ chuyên gia</span>
        </button>
      </div>
    </div>
  );
}
