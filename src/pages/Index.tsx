import { Header } from '@/components/home/Header';
import { MotivationBanner } from '@/components/home/MotivationBanner';
import { TodayActivity } from '@/components/home/TodayActivity';
import { ExpertSection } from '@/components/home/ExpertSection';
import { BottomActions } from '@/components/home/BottomActions';
import { useAuth } from '@/hooks/useAuth';
import childrenBg from '@/assets/children-background.jpg';

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
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `url(${childrenBg})`,
        backgroundPosition: 'bottom center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% auto',
        backgroundColor: 'hsl(var(--background))'
      }}
    >
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Header />
        <MotivationBanner />
        <TodayActivity />
        <ExpertSection />
      </div>
      <BottomActions />
    </div>
  );
};

export default Index;
