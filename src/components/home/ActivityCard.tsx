import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, FileText, Play, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import avatarBoy from '@/assets/avatar-boy.png';

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
      {/* Expert Info - Box riêng */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 mb-4">
        <Avatar className="h-14 w-14 border-2 border-purple-200">
          <AvatarImage src={avatarBoy} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-purple-400 via-purple-500 to-pink-400 text-white font-bold text-lg">
            {activity.expert_name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs text-muted-foreground">Giáo viên hướng dẫn</p>
          <p className="font-bold text-foreground">{activity.expert_name || 'Chuyên gia'}</p>
          <p className="text-sm text-muted-foreground">{activity.expert_title || 'Chuyên gia giáo dục'}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="w-full bg-gray-100 shadow-inner p-1.5 rounded-full mb-5">
          <TabsTrigger 
            value="goals" 
            className="flex-1 rounded-full py-2.5 gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-200/50 data-[state=active]:text-foreground data-[state=active]:scale-105 transition-all duration-300 ease-out"
          >
            <Target className="h-4 w-4" />
            Mục tiêu
          </TabsTrigger>
          <TabsTrigger 
            value="instructions"
            className="flex-1 rounded-full py-2.5 gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-200/50 data-[state=active]:text-foreground data-[state=active]:scale-105 transition-all duration-300 ease-out"
          >
            <FileText className="h-4 w-4" />
            Hướng dẫn
          </TabsTrigger>
          <TabsTrigger 
            value="video"
            className="flex-1 rounded-full py-2.5 gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-200/50 data-[state=active]:text-foreground data-[state=active]:scale-105 transition-all duration-300 ease-out"
          >
            <Play className="h-4 w-4" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-0">
          <div className="bg-[#FFF8E7] rounded-2xl p-5 min-h-[100px] shadow-sm">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-pink-500 mt-0.5 shrink-0" />
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
          <div className="bg-[#FFF8E7] rounded-2xl p-5 min-h-[100px] shadow-sm">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-pink-500 mt-0.5 shrink-0" />
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
          <div className="bg-[#FFF8E7] rounded-2xl p-5 min-h-[100px] shadow-sm flex items-center justify-center">
            <button 
              onClick={() => navigate(`/activity/${activity.id}?tab=video`)}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                <Play className="h-8 w-8 text-pink-500" />
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
        className="w-full mt-6 h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-pink-400 via-pink-500 to-blue-500 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
