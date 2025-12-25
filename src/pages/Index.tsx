import { useState, useEffect } from 'react';
import { Header } from '@/components/home/Header';
import { HeroBanner } from '@/components/home/HeroBanner';
import { MotivationBanner } from '@/components/home/MotivationBanner';
import { TodayActivity } from '@/components/home/TodayActivity';
import { ExpertSection } from '@/components/home/ExpertSection';
import { BottomActions } from '@/components/home/BottomActions';
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
}

const Index = () => {
  const { loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('Trò chơi');

  useEffect(() => {
    supabase
      .from('activities')
      .select('*')
      .eq('scheduled_date', new Date().toISOString().split('T')[0])
      .then(({ data }) => {
        if (data && data.length > 0) {
          setActivities(data);
        }
      });
  }, []);

  // Tìm activity phù hợp với tag được chọn
  const selectedActivity = activities.find(
    (activity) => activity.tags?.includes(selectedTag)
  ) || activities[0] || null;

  // Lấy 2 tags đầu tiên từ activities hôm nay
  const availableTags = [...new Set(activities.flatMap(a => a.tags || []))].slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-light/30 via-background to-background pb-28">
      <div className="w-full max-w-[400px] mx-auto px-4 pt-2 space-y-4">
        <Header />
        <HeroBanner imageUrl={selectedActivity?.image_url} activityTag={selectedTag} />
        <MotivationBanner />
        <TodayActivity 
          activity={selectedActivity}
          availableTags={availableTags.length > 0 ? availableTags : ['Trò chơi', 'Khoa học']}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />
        <ExpertSection />
      </div>
      <BottomActions />
    </div>
  );
};

export default Index;
