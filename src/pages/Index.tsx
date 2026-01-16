import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader } from '@/components/home/SimpleHeader';
import { HeroCard } from '@/components/home/HeroCard';
import { ActivitySteps } from '@/components/home/ActivitySteps';
import { MiniNav } from '@/components/home/MiniNav';
import { GuestWelcome } from '@/components/home/GuestWelcome';
import { FeedbackBubble } from '@/components/home/FeedbackBubble';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

const Index = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();
  const { isPendingActivation, loading: subscriptionLoading } = useSubscription();
  const [todayActivity, setTodayActivity] = useState<Activity | null>(null);
  const [isActivityStarted, setIsActivityStarted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getDateString = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user) {
      // Fetch today's activity only
      supabase
        .from('activities')
        .select('*')
        .eq('scheduled_date', getDateString(0))
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setTodayActivity(data);
        });
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

  // Handle start activity
  const handleStartActivity = () => {
    setIsActivityStarted(true);
  };

  // Handle close activity steps
  const handleCloseSteps = () => {
    setIsActivityStarted(false);
  };

  // Handle save activity for later
  const handleSaveActivity = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success('Đã lưu hoạt động để xem sau!');
    } else {
      toast.info('Đã bỏ lưu hoạt động');
    }
  };

  // Giao diện cho user đã đăng nhập - Card Story Design
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Simple Header with Streak */}
        <SimpleHeader />

        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Main Content */}
        <div className="py-3">
          {!isActivityStarted ? (
            // Hero Card View - Activity Story Card
            <>
              <HeroCard 
                activity={todayActivity} 
                onStart={handleStartActivity}
                onSave={handleSaveActivity}
                isSaved={isSaved}
              />
              
              {/* Mini Navigation */}
              <MiniNav />
            </>
          ) : (
            // Activity Steps View - After clicking "Bắt đầu"
            todayActivity && (
              <ActivitySteps 
                activity={todayActivity} 
                onClose={handleCloseSteps}
              />
            )
          )}
        </div>
      </div>

      <FeedbackBubble />
    </div>
  );
};

export default Index;
