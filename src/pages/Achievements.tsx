import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Trophy, Star, Target, CheckCircle } from 'lucide-react';
import { BottomActions } from '@/components/home/BottomActions';
import { Progress } from '@/components/ui/progress';
import { DevelopmentSummary } from '@/components/achievements/DevelopmentSummary';
import { calculateDevelopmentData, DevelopmentData } from '@/lib/developmentCategories';

interface UserProgress {
  id: string;
  completed_at: string;
  points_earned: number;
  activities: {
    title: string;
  } | null;
}

export default function Achievements() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<{ total_points: number; total_activities: number } | null>(null);
  const [completedActivities, setCompletedActivities] = useState<UserProgress[]>([]);
  const [developmentData, setDevelopmentData] = useState<DevelopmentData[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      supabase
        .from('profiles')
        .select('total_points, total_activities')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      supabase
        .from('user_progress')
        .select('id, completed_at, points_earned, activities(title, tags)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setCompletedActivities(data as UserProgress[]);
            
            // Calculate development data from tags
            const allTags: string[] = [];
            data.forEach((item: any) => {
              const tags = item.activities?.tags;
              if (tags && Array.isArray(tags)) {
                allTags.push(...tags);
              }
            });
            setDevelopmentData(calculateDevelopmentData(allTags));
          }
        });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const milestones = [
    { points: 50, label: 'Người mới bắt đầu', icon: '🌱' },
    { points: 100, label: 'Nhà hoạt động', icon: '⭐' },
    { points: 250, label: 'Siêu phụ huynh', icon: '🏆' },
    { points: 500, label: 'Chuyên gia', icon: '👑' },
  ];

  const currentPoints = profile?.total_points || 0;
  const nextMilestone = milestones.find(m => m.points > currentPoints) || milestones[milestones.length - 1];
  const progress = (currentPoints / nextMilestone.points) * 100;

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
          <h1 className="font-bold text-lg">Thành tích</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-blue rounded-2xl p-6 text-primary-foreground animate-fade-in">
              <Trophy className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">{profile?.total_points || 0}</p>
              <p className="text-sm opacity-90">Tổng điểm</p>
            </div>
            <div className="bg-gradient-to-br from-secondary to-pink rounded-2xl p-6 text-secondary-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Target className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">{profile?.total_activities || 0}</p>
              <p className="text-sm opacity-90">Hoạt động</p>
            </div>
          </div>

          {/* Development Summary Card */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <DevelopmentSummary data={developmentData} />
          </div>

          {/* Progress to next milestone */}
          <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Tiến độ cấp bậc</h3>
              <span className="text-2xl">{nextMilestone.icon}</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{currentPoints} điểm</span>
              <span className="text-primary font-medium">{nextMilestone.label}: {nextMilestone.points} điểm</span>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-bold text-foreground mb-4">Cấp bậc</h3>
            <div className="space-y-4">
              {milestones.map((milestone, index) => {
                const isAchieved = currentPoints >= milestone.points;
                return (
                  <div
                    key={milestone.points}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      isAchieved ? 'bg-green-light' : 'bg-muted'
                    }`}
                  >
                    <span className="text-2xl">{milestone.icon}</span>
                    <div className="flex-1">
                      <p className={`font-medium ${isAchieved ? 'text-green' : 'text-foreground'}`}>
                        {milestone.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{milestone.points} điểm</p>
                    </div>
                    {isAchieved && <CheckCircle className="h-6 w-6 text-green" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Activities */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-bold text-foreground mb-4">Hoạt động đã hoàn thành</h3>
            {completedActivities.length === 0 ? (
              <div className="bg-card rounded-2xl p-6 text-center card-shadow">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Chưa có hoạt động nào được hoàn thành</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedActivities.map((item) => (
                  <div key={item.id} className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-light flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.activities?.title || 'Hoạt động'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.completed_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className="font-bold text-secondary">+{item.points_earned}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomActions />
    </div>
  );
}
