import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Calendar, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BottomActions } from '@/components/home/BottomActions';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
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

  // Get month/year from URL params
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const isMonthlyView = monthParam !== null && yearParam !== null;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    let startDate: Date;
    let endDate: Date;

    if (isMonthlyView) {
      // Monthly view: show all activities for the selected month
      const targetDate = new Date(parseInt(yearParam!), parseInt(monthParam!), 1);
      startDate = startOfMonth(targetDate);
      endDate = endOfMonth(targetDate);
    } else {
      // Default: show next 7 days
      startDate = new Date();
      endDate = addDays(startDate, 7);
    }

    supabase
      .from('activities')
      .select('*')
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .lte('scheduled_date', endDate.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .then(({ data }) => {
        if (data) setActivities(data);
      });
  }, [user, loading, navigate, monthParam, yearParam, isMonthlyView]);

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
          <h1 className="font-bold text-lg">
            {isMonthlyView 
              ? `Hoạt động ${MONTHS[parseInt(monthParam!)]} ${yearParam}` 
              : 'Hoạt động sắp tới'}
          </h1>
        </div>

        <div className="p-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có hoạt động nào được lên lịch</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="bg-card rounded-2xl p-3 card-shadow animate-fade-in cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/activity/${activity.id}`)}
                >
                  <p className="text-xs text-primary font-medium mb-1">
                    {format(new Date(activity.scheduled_date), 'EEEE, dd/MM', { locale: vi })}
                  </p>
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-2">{activity.title}</h3>
                  
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
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{activity.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Điểm thưởng</span>
                    <span className="font-bold text-sm text-secondary">+{activity.points || 10}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomActions />
    </div>
  );
}
