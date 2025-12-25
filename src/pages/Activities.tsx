import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Calendar, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BottomActions } from '@/components/home/BottomActions';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  scheduled_date: string;
  points: number | null;
}

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function Activities() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  // Get month/year from URL params (default to current month)
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const currentDate = new Date();
  const month = monthParam !== null ? parseInt(monthParam) : currentDate.getMonth();
  const year = yearParam !== null ? parseInt(yearParam) : currentDate.getFullYear();

  // Get all days in the selected month
  const targetDate = new Date(year, month, 1);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(targetDate),
    end: endOfMonth(targetDate)
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    supabase
      .from('activities')
      .select('*')
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .lte('scheduled_date', endDate.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .then(({ data }) => {
        if (data) setActivities(data);
      });
  }, [user, loading, navigate, month, year]);

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

  // Get activities for a specific day
  const getActivitiesForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return activities.filter((a) => a.scheduled_date === dateStr);
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
          <h1 className="font-bold text-lg">
            {MONTHS[month]} {year}
          </h1>
        </div>

        <div className="p-4 space-y-4">
          {daysInMonth.map((day, index) => {
            const dayActivities = getActivitiesForDay(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            
            return (
              <div 
                key={day.toISOString()} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* Day Header */}
                <div className={`flex items-center gap-3 mb-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <span className="font-bold text-sm">{format(day, 'd')}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm capitalize">
                      {format(day, 'EEEE', { locale: vi })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(day, 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>

                {/* Activities for this day */}
                {dayActivities.length > 0 ? (
                  <div className="ml-5 pl-8 border-l-2 border-primary/20 space-y-2">
                    {dayActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-card rounded-2xl p-4 card-shadow cursor-pointer hover:scale-[1.01] transition-transform"
                        onClick={() => navigate(`/activity/${activity.id}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-sm text-foreground mb-1">{activity.title}</h3>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {activity.tags?.map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="secondary"
                                  className={`text-[10px] px-1.5 py-0.5 ${tagColors[tag] || 'bg-muted text-muted-foreground'}`}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <button className="p-2 rounded-full bg-primary/10 text-primary">
                              <Play className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-bold text-secondary">+{activity.points || 10}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-5 pl-8 border-l-2 border-muted py-2">
                    <p className="text-xs text-muted-foreground italic">Chưa có hoạt động</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <BottomActions />
    </div>
  );
}
