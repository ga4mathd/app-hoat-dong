import { useState, useEffect } from 'react';
import { Header } from '@/components/home/Header';
import { TodayActivity } from '@/components/home/TodayActivity';
import { ActivityCard } from '@/components/home/ActivityCard';
import { BottomActions } from '@/components/home/BottomActions';
import { GuestWelcome } from '@/components/home/GuestWelcome';
import { useAuth } from '@/hooks/useAuth';
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
  image_url: string | null;
  points?: number | null;
}

const Index = () => {
  const { loading, user } = useAuth();
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [yesterdayActivities, setYesterdayActivities] = useState<Activity[]>([]);
  const [tomorrowActivities, setTomorrowActivities] = useState<Activity[]>([]);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [currentDay, setCurrentDay] = useState<'yesterday' | 'today' | 'tomorrow'>('today');

  const getDateString = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user) {
      // Fetch today's activities
      supabase
        .from('activities')
        .select('*')
        .eq('scheduled_date', getDateString(0))
        .then(({ data }) => {
          if (data) setTodayActivities(data);
        });

      // Fetch yesterday's activities
      supabase
        .from('activities')
        .select('*')
        .eq('scheduled_date', getDateString(-1))
        .then(({ data }) => {
          if (data) setYesterdayActivities(data);
        });

      // Fetch tomorrow's activities
      supabase
        .from('activities')
        .select('*')
        .eq('scheduled_date', getDateString(1))
        .then(({ data }) => {
          if (data) setTomorrowActivities(data);
        });
    }
  }, [user]);

  // Fetch user's total activities for this month
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('total_activities')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setTotalActivities(data.total_activities || 0);
        });
    }
  }, [user]);

  // Get first activity from each day
  const todayActivity = todayActivities[0] || null;
  const yesterdayActivity = yesterdayActivities[0] || null;
  const tomorrowActivity = tomorrowActivities[0] || null;

  // Get current activity based on selected day
  const getCurrentActivity = () => {
    switch (currentDay) {
      case 'yesterday': return yesterdayActivity;
      case 'tomorrow': return tomorrowActivity;
      default: return todayActivity;
    }
  };

  // Lấy tags từ activities hôm nay
  const availableTags = [...new Set(todayActivities.flatMap(a => a.tags || []))].slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Giao diện cho khách (chưa đăng nhập)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500">
        <div className="w-full max-w-[400px] mx-auto px-4 pt-4 pb-8">
          <GuestWelcome />
        </div>
      </div>
    );
  }

  // Giao diện cho user đã đăng nhập
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500">
      {/* Header section */}
      <div className="w-full max-w-[400px] mx-auto px-4 pt-2">
        <Header />
      </div>

      {/* Activity Section */}
      <div className="w-full max-w-[400px] mx-auto px-4">
        <TodayActivity 
          todayActivity={todayActivity}
          yesterdayActivity={yesterdayActivity}
          tomorrowActivity={tomorrowActivity}
          availableTags={availableTags.length > 0 ? availableTags : ['Trò chơi']}
          totalActivities={totalActivities}
          onDayChange={setCurrentDay}
        />
      </div>
      
      {/* White card section - full width on mobile */}
      <div className="w-full mt-2 bg-card rounded-t-3xl min-h-[calc(100vh-380px)] pb-24">
        <div className="max-w-[400px] mx-auto">
          <ActivityCard activity={getCurrentActivity()} />
        </div>
      </div>
      
      <BottomActions />
    </div>
  );
};

export default Index;
