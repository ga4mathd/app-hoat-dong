import { Header } from '@/components/home/Header';
import { MonthSelector } from '@/components/home/MonthSelector';
import { HeroBanner } from '@/components/home/HeroBanner';
import { MotivationBanner } from '@/components/home/MotivationBanner';
import { TodayActivity } from '@/components/home/TodayActivity';
import { ExpertSection } from '@/components/home/ExpertSection';
import { BottomActions } from '@/components/home/BottomActions';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Header />
        <MonthSelector />
        <HeroBanner />
        <MotivationBanner />
        <TodayActivity />
        <ExpertSection />
        <BottomActions />
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
