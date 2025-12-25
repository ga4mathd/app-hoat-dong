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
    <div className="min-h-screen bg-background pb-24">
      {/* Hero section với ảnh trẻ em làm background */}
      <div 
        className="relative px-4 pt-4 pb-8"
        style={{
          backgroundImage: `url(${childrenBg})`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-md mx-auto">
          <Header />
        </div>
      </div>
      
      {/* Nội dung chính */}
      <div className="max-w-md mx-auto px-4 space-y-4 -mt-2">
        <MotivationBanner />
        <TodayActivity />
        <ExpertSection />
      </div>
      <BottomActions />
    </div>
  );
};

export default Index;
