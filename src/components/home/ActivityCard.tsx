import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, FileText, Play, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  points?: number | null;
}

interface ActivityCardProps {
  activity: Activity | null;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (!user || !activity) {
      toast.error('Vui lòng đăng nhập để hoàn thành hoạt động');
      return;
    }

    setIsCompleting(true);
    try {
      // Check if already completed
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_id', activity.id)
        .maybeSingle();

      if (existing) {
        toast.info('Bạn đã hoàn thành hoạt động này rồi!');
        setIsCompleting(false);
        return;
      }

      // Record completion
      await supabase.from('user_progress').insert({
        user_id: user.id,
        activity_id: activity.id,
        points_earned: activity.points || 25,
      });

      // Update profile stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_activities, total_points')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            total_activities: (profile.total_activities || 0) + 1,
            total_points: (profile.total_points || 0) + (activity.points || 25),
          })
          .eq('user_id', user.id);
      }

      toast.success(`Chúc mừng! Bạn nhận được +${activity.points || 25} điểm`);
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!activity) {
    return (
      <div className="bg-card rounded-t-[2rem] p-6 min-h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Không có hoạt động nào hôm nay</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Expert Info */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar className="h-12 w-12 border-2 border-orange/30">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-orange-light text-orange font-bold">
            {activity.expert_name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-foreground">{activity.expert_name || 'Chuyên gia'}</p>
          <p className="text-sm text-muted-foreground">{activity.expert_title || 'Chuyên gia giáo dục'}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="w-full bg-muted/50 p-1 rounded-xl mb-4">
          <TabsTrigger 
            value="goals" 
            className="flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg gap-1.5 text-sm"
          >
            <Target className="h-4 w-4" />
            Mục tiêu
          </TabsTrigger>
          <TabsTrigger 
            value="instructions"
            className="flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg gap-1.5 text-sm"
          >
            <FileText className="h-4 w-4" />
            Hướng dẫn
          </TabsTrigger>
          <TabsTrigger 
            value="video"
            className="flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg gap-1.5 text-sm"
          >
            <Play className="h-4 w-4" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-0">
          <div className="bg-muted/30 rounded-xl p-4 min-h-[100px]">
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-orange mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">Mục tiêu hoạt động</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activity.goals || activity.description || 'Trải nghiệm hoạt động vui vẻ cùng con'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="mt-0">
          <div className="bg-muted/30 rounded-xl p-4 min-h-[100px]">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">Hướng dẫn thực hiện</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activity.instructions || 'Hướng dẫn chi tiết sẽ được cập nhật'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          <div className="bg-muted/30 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
            <button 
              onClick={() => navigate(`/activity/${activity.id}?tab=video`)}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium">Xem video hướng dẫn</span>
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        disabled={isCompleting}
        className="w-full mt-5 h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-pink to-secondary hover:opacity-90 transition-opacity"
      >
        {isCompleting ? (
          'Đang xử lý...'
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            Hoàn thành (+{activity.points || 25} điểm)
          </>
        )}
      </Button>
    </div>
  );
}
