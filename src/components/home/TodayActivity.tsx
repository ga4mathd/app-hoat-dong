import { Play, Target, FileText, Video } from 'lucide-react';
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
      <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <p className="text-muted-foreground text-center">Không có hoạt động cho hôm nay</p>
      </div>
    );
  }

  const tagColors: Record<string, string> = {
    'Trò chơi': 'bg-blue-light text-blue',
    'Khoa học': 'bg-green-light text-green',
    'Nghệ thuật': 'bg-pink-light text-pink',
    'Sáng tạo': 'bg-orange-light text-orange',
    'Toán học': 'bg-yellow-light text-accent-foreground',
  };

  return (
    <div 
      className="bg-card rounded-2xl p-6 card-shadow animate-fade-in"
      style={{ animationDelay: '0.4s' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Hoạt động hôm nay</h3>
        <button 
          onClick={() => navigate(`/activity/${activity.id}`)}
          className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Play className="h-5 w-5" />
        </button>
      </div>

      <h4 className="font-semibold text-xl text-foreground mb-2">{activity.title}</h4>
      
      <div className="flex gap-2 mb-4">
        {activity.tags?.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary"
            className={tagColors[tag] || 'bg-muted text-muted-foreground'}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <p className="text-muted-foreground mb-6">{activity.description}</p>

      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => navigate(`/activity/${activity.id}?tab=goals`)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-yellow-light hover:bg-accent transition-colors"
        >
          <Target className="h-6 w-6 text-accent-foreground" />
          <span className="text-sm font-medium text-accent-foreground">Mục tiêu</span>
        </button>
        
        <button 
          onClick={() => navigate(`/activity/${activity.id}?tab=instructions`)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-light hover:bg-primary/20 transition-colors"
        >
          <FileText className="h-6 w-6 text-blue" />
          <span className="text-sm font-medium text-blue">Hướng dẫn</span>
        </button>
        
        <button 
          onClick={() => navigate(`/activity/${activity.id}?tab=video`)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-pink-light hover:bg-secondary/20 transition-colors"
        >
          <Video className="h-6 w-6 text-pink" />
          <span className="text-sm font-medium text-pink">Video</span>
        </button>
      </div>
    </div>
  );
}
