import { Header } from '@/components/home/Header';
import { HeroBanner } from '@/components/home/HeroBanner';
import { MotivationBanner } from '@/components/home/MotivationBanner';
import { TodayActivity } from '@/components/home/TodayActivity';
import { ExpertSection } from '@/components/home/ExpertSection';
import { BottomActions } from '@/components/home/BottomActions';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Header />
        <HeroBanner />
        <MotivationBanner />
        <TodayActivity />
        <ExpertSection />
      </div>
      <BottomActions />
    </div>
  );
};

export default Index;
