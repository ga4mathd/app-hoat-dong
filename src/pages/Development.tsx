import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Lightbulb, TrendingUp } from 'lucide-react';
import { BottomActions } from '@/components/home/BottomActions';
import { Progress } from '@/components/ui/progress';
import { DevelopmentChart } from '@/components/achievements/DevelopmentChart';
import {
  calculateDevelopmentData,
  getDevelopmentSuggestion,
  developmentCategories,
  DevelopmentData,
} from '@/lib/developmentCategories';

export default function Development() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [developmentData, setDevelopmentData] = useState<DevelopmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalActivities, setTotalActivities] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchDevelopmentData();
    }
  }, [user, loading, navigate]);

  const fetchDevelopmentData = async () => {
    if (!user) return;

    try {
      // Fetch all completed activities with their tags
      const { data: progressData, error } = await supabase
        .from('user_progress')
        .select('activity_id, activities(tags)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      // Extract all tags from completed activities
      const allTags: string[] = [];
      progressData?.forEach((item: any) => {
        const tags = item.activities?.tags;
        if (tags && Array.isArray(tags)) {
          allTags.push(...tags);
        }
      });

      setTotalActivities(progressData?.length || 0);
      
      // Calculate development data
      const data = calculateDevelopmentData(allTags);
      setDevelopmentData(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestion = getDevelopmentSuggestion(developmentData);
  const maxValue = Math.max(...developmentData.map(d => d.value), 1);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/achievements')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">Phát triển toàn diện</h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi sự phát triển của con
            </p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Summary Stats */}
          <div className="bg-gradient-to-br from-primary to-blue rounded-2xl p-5 text-primary-foreground animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm opacity-90">Tổng hoạt động đã thực hiện</span>
            </div>
            <p className="text-4xl font-bold">{totalActivities}</p>
            <p className="text-sm opacity-80 mt-1">
              trên {developmentCategories.length} lĩnh vực phát triển
            </p>
          </div>

          {/* Radar Chart */}
          <div className="bg-card rounded-2xl p-5 card-shadow animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-bold text-foreground mb-2 text-center">
              Biểu đồ phát triển
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Nhìn tổng quan các lĩnh vực con đã phát triển
            </p>
            <DevelopmentChart data={developmentData} />
          </div>

          {/* Expert Suggestion */}
          <div className="bg-gradient-to-br from-accent/20 to-yellow-light rounded-2xl p-5 border border-accent/30 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-orange" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Gợi ý từ chuyên gia</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {suggestion.message}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-card rounded-2xl p-5 card-shadow animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-bold text-foreground mb-4">Chi tiết từng lĩnh vực</h3>
            <div className="space-y-4">
              {developmentData.map((item, index) => {
                const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                return (
                  <div key={item.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium text-foreground text-sm">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {item.value} hoạt động
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-muted/50 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h4 className="font-medium text-foreground mb-3 text-sm">Các lĩnh vực phát triển</h4>
            <div className="grid grid-cols-2 gap-2">
              {developmentCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomActions />
    </div>
  );
}
