import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader } from '@/components/home/SimpleHeader';
import { ActivityFullCard } from '@/components/home/ActivityFullCard';
import { ActivityCompletedCard } from '@/components/home/ActivityCompletedCard';
import { BottomActions } from '@/components/home/BottomActions';
import { GuestWelcome } from '@/components/home/GuestWelcome';
import { FeedbackBubble } from '@/components/home/FeedbackBubble';
import { AppGuideHint } from '@/components/home/AppGuideHint';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
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
  expert_avatar?: string | null;
  video_url?: string | null;
  points?: number | null;
  likes_count?: number | null;
}

interface UserStats {
  currentStreak: number;
  totalPoints: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();
  const { isPendingActivation, loading: subscriptionLoading } = useSubscription();
  const [todayActivity, setTodayActivity] = useState<Activity | null>(null);
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [userStats, setUserStats] = useState<UserStats>({ currentStreak: 0, totalPoints: 0 });

  const getDateString = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        // Fetch today's activity
        const { data: activityData } = await supabase
          .from('activities')
          .select('*')
          .eq('scheduled_date', getDateString(0))
          .limit(1)
          .maybeSingle();

        if (activityData) {
          setTodayActivity(activityData);

          // Check if user has completed this activity
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('points_earned')
            .eq('user_id', user.id)
            .eq('activity_id', activityData.id)
            .maybeSingle();

          if (progressData) {
            setIsActivityCompleted(true);
            setPointsEarned(progressData.points_earned || 0);
          }
        }

        // Fetch user stats from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('current_streak, total_points')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setUserStats({
            currentStreak: profileData.current_streak || 0,
            totalPoints: profileData.total_points || 0
          });
        }
      };

      fetchData();
    }
  }, [user]);

  // Redirect to activation if pending
  useEffect(() => {
    if (user && !subscriptionLoading && isPendingActivation) {
      navigate('/activation');
    }
  }, [user, isPendingActivation, subscriptionLoading, navigate]);

  if (loading || (user && subscriptionLoading)) {
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
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 pt-4 pb-8">
          <GuestWelcome />
        </div>
      </div>
    );
  }

  // Giao diện cho user đã đăng nhập - One Page Full Content
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Simple Header with Streak */}
        <SimpleHeader />

        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Main Content - Conditional based on completion status */}
        <div className="py-3">
          {isActivityCompleted ? (
            <ActivityCompletedCard 
              activity={todayActivity}
              pointsEarned={pointsEarned}
              currentStreak={userStats.currentStreak}
              totalPoints={userStats.totalPoints}
            />
          ) : (
            <ActivityFullCard activity={todayActivity} />
          )}
        </div>
      </div>

      {/* App Guide Hint */}
      <AppGuideHint />

      {/* Fixed Bottom Navigation */}
      <BottomActions />

      <FeedbackBubble />
    </div>
  );
};

export default Index;
