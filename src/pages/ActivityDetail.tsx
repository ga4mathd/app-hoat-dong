import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { ArrowLeft, Target, FileText, Video, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  goals: string | null;
  instructions: string | null;
  video_url: string | null;
  expert_name: string | null;
  expert_title: string | null;
  points: number | null;
}

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { canAccessFullContent, isExpired, loading: subscriptionLoading } = useSubscription();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const defaultTab = searchParams.get('tab') || 'goals';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (id) {
      supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setActivity(data);
        });

      if (user) {
        supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('activity_id', id)
          .maybeSingle()
          .then(({ data }) => {
            setIsCompleted(!!data);
          });
      }
    }
  }, [id, user, loading, navigate]);

  const handleMarkComplete = async () => {
    if (!user || !activity) return;

    setIsMarking(true);
    
    const { error } = await supabase.from('user_progress').insert({
      user_id: user.id,
      activity_id: activity.id,
      points_earned: activity.points || 10,
    });

    if (!error) {
      // Update profile points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, total_activities')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        await supabase.from('profiles').update({
          total_points: (profile.total_points || 0) + (activity.points || 10),
          total_activities: (profile.total_activities || 0) + 1,
        }).eq('user_id', user.id);
      }

      setIsCompleted(true);
      toast({
        title: 'Tuyệt vời! 🎉',
        description: `Bạn đã hoàn thành hoạt động và nhận được ${activity.points || 10} điểm!`,
      });
    }

    setIsMarking(false);
  };

  if (loading || subscriptionLoading || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const tagColors: Record<string, string> = {
    'Trò chơi': 'bg-blue-light text-blue',
    'Khoa học': 'bg-green-light text-green',
    'Nghệ thuật': 'bg-pink-light text-pink',
    'Sáng tạo': 'bg-orange-light text-orange',
    'Toán học': 'bg-yellow-light text-accent-foreground',
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg flex-1">Chi tiết hoạt động</h1>
          {isCompleted && (
            <Badge className="bg-green text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Đã hoàn thành
            </Badge>
          )}
        </div>

        <div className="p-4 md:p-6 space-y-6 md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
          {/* Title & Tags */}
          <div className="space-y-3 md:col-span-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{activity.title}</h2>
            <div className="flex gap-2 flex-wrap">
              {activity.tags?.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className={`${tagColors[tag] || 'bg-muted text-muted-foreground'} md:text-sm md:px-3 md:py-1`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground md:text-lg">{activity.description}</p>
          </div>

          {/* Expert Info */}
          <div className="flex items-center gap-3 p-4 md:p-5 bg-card rounded-xl card-shadow md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold md:text-lg">
              {activity.expert_name?.charAt(0) || 'J'}
            </div>
            <div>
              <p className="font-semibold text-foreground md:text-lg">{activity.expert_name || 'Chuyên gia Jenna'}</p>
              <p className="text-sm md:text-base text-muted-foreground">{activity.expert_title || 'Chuyên gia Tâm lý Giáo dục'}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full md:col-span-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Mục tiêu
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Hướng dẫn
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="goals" className="mt-4">
              <div className="bg-yellow-light rounded-xl p-6 md:p-8">
                <h3 className="font-bold text-lg md:text-xl text-accent-foreground mb-3">🎯 Mục tiêu hoạt động</h3>
                <p className="text-accent-foreground whitespace-pre-line md:text-lg">
                  {activity.goals || 'Phát triển kỹ năng và khả năng tư duy cho bé'}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="mt-4">
              {canAccessFullContent ? (
                <div className="bg-blue-light rounded-xl p-6 md:p-8">
                  <h3 className="font-bold text-lg md:text-xl text-blue mb-3">📋 Hướng dẫn thực hiện</h3>
                  <p className="text-blue whitespace-pre-line md:text-lg">
                    {activity.instructions || 'Hướng dẫn chi tiết sẽ được cập nhật'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-light rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-light/95 z-10" />
                    <h3 className="font-bold text-lg text-blue mb-3">📋 Hướng dẫn thực hiện</h3>
                    <p className="text-blue whitespace-pre-line line-clamp-3 blur-sm">
                      {activity.instructions || 'Hướng dẫn chi tiết sẽ được cập nhật'}
                    </p>
                  </div>
                  <UpgradePrompt 
                    title="Mở khóa hướng dẫn chi tiết"
                    description="Nâng cấp Pro để xem đầy đủ hướng dẫn thực hiện"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="video" className="mt-4">
              {canAccessFullContent ? (
                <div className="bg-pink-light rounded-xl p-6 md:p-8">
                  <h3 className="font-bold text-lg md:text-xl text-pink mb-3">🎬 Video hướng dẫn</h3>
                  {activity.video_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-card">
                      <iframe
                        src={activity.video_url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <p className="text-pink">Video sẽ được cập nhật sớm</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-pink-light rounded-xl p-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-pink-light/80 rounded-xl z-10">
                      <Lock className="w-12 h-12 text-pink/50" />
                    </div>
                    <h3 className="font-bold text-lg text-pink mb-3">🎬 Video hướng dẫn</h3>
                    <div className="aspect-video rounded-lg bg-muted" />
                  </div>
                  <UpgradePrompt 
                    title="Mở khóa video hướng dẫn"
                    description="Nâng cấp Pro để xem video chi tiết"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Complete Button */}
          {!isCompleted && canAccessFullContent && (
            <div className="md:col-span-2">
              <Button 
                onClick={handleMarkComplete}
                disabled={isMarking}
                className="w-full h-14 md:h-16 text-lg md:text-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {isMarking ? 'Đang xử lý...' : `Hoàn thành (+${activity.points || 10} điểm)`}
              </Button>
            </div>
          )}
          
          {/* Expired user prompt */}
          {isExpired && !isCompleted && (
            <div className="md:col-span-2">
              <UpgradePrompt 
                title="Nâng cấp để hoàn thành hoạt động"
                description="Bạn cần tài khoản Pro để hoàn thành và nhận điểm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
