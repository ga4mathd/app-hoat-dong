import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Calendar, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  scheduled_date: string;
  points: number | null;
}

export default function Activities() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    const today = new Date();
    const nextWeek = addDays(today, 7);

    supabase
      .from('activities')
      .select('*')
      .gte('scheduled_date', today.toISOString().split('T')[0])
      .lte('scheduled_date', nextWeek.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .then(({ data }) => {
        if (data) setActivities(data);
      });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Hoạt động sắp tới</h1>
        </div>

        <div className="p-4 space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có hoạt động nào được lên lịch</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                className="bg-card rounded-2xl p-4 card-shadow animate-fade-in cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/activity/${activity.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-primary font-medium">
                      {format(new Date(activity.scheduled_date), 'EEEE, dd/MM', { locale: vi })}
                    </p>
                    <h3 className="font-bold text-lg text-foreground">{activity.title}</h3>
                  </div>
                  <button className="p-2 rounded-full bg-primary text-primary-foreground">
                    <Play className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex gap-2 mb-2">
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
                
                <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Điểm thưởng</span>
                  <span className="font-bold text-secondary">+{activity.points || 10}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
