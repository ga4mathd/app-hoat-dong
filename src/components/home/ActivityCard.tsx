import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, FileText, Play, Check, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { convertToEmbedUrl } from '@/lib/youtube';
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
  expert_avatar?: string | null;
  video_url?: string | null;
  points?: number | null;
}

interface ActivityCardProps {
  activity: Activity | null;
}

export function ActivityCard({ activity }: ActivityCardProps) {
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
      <div className="px-5 pt-6 pb-8 min-h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Không có hoạt động nào hôm nay</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Expert Info Section */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-14 w-14 border-2 border-pink-200">
          <AvatarImage 
            src={activity.expert_avatar || avatarBoy} 
            className="object-cover" 
          />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-500 text-white font-bold text-lg">
            {activity.expert_name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs text-muted-foreground">Giáo viên hướng dẫn</p>
          <p className="font-bold text-foreground">{activity.expert_name || 'Chuyên gia'}</p>
          <p className="text-sm text-muted-foreground">{activity.expert_title || 'Chuyên gia giáo dục & phát triển trẻ em'}</p>
        </div>
      </div>

      {/* Divider Line */}
      <div className="h-[1px] bg-border mb-5" />

      {/* Large Icon Tabs */}
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="w-full bg-transparent p-0 mb-5 flex justify-center gap-6">
          <TabsTrigger 
            value="goals" 
            className="flex flex-col items-center gap-1.5 p-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <div className="w-14 h-14 rounded-full bg-orange-light flex items-center justify-center">
              <Target className="h-7 w-7 text-orange" />
            </div>
            <span className="text-xs font-medium text-muted-foreground data-[state=active]:text-foreground">Mục tiêu</span>
          </TabsTrigger>
          <TabsTrigger 
            value="instructions"
            className="flex flex-col items-center gap-1.5 p-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none group"
          >
            <div className="w-14 h-14 rounded-full bg-yellow-light flex items-center justify-center group-data-[state=active]:ring-2 group-data-[state=active]:ring-foreground">
              <FileText className="h-7 w-7 text-yellow" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-data-[state=active]:text-foreground group-data-[state=active]:border group-data-[state=active]:border-foreground group-data-[state=active]:rounded-full group-data-[state=active]:px-2">Hướng dẫn</span>
          </TabsTrigger>
          <TabsTrigger 
            value="video"
            className="flex flex-col items-center gap-1.5 p-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <div className="w-14 h-14 rounded-full bg-blue-light flex items-center justify-center">
              <Play className="h-7 w-7 text-primary fill-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground data-[state=active]:text-foreground">Video</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-0">
          <div className="bg-[#FFF8E7] rounded-2xl p-5 min-h-[100px] shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1">
                <FileText className="h-5 w-5 text-orange" />
                <Heart className="h-3 w-3 text-pink -ml-1" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(0,70%,45%)] mb-2">Mục tiêu hoạt động</p>
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
              <div className="flex items-center gap-1">
                <FileText className="h-5 w-5 text-orange" />
                <Heart className="h-3 w-3 text-pink -ml-1" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(0,70%,45%)] mb-2">Hướng dẫn thực hiện</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activity.instructions || 'Hướng dẫn chi tiết sẽ được cập nhật'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          <div className="bg-[#FFF8E7] rounded-2xl overflow-hidden shadow-sm">
            {activity.video_url ? (
              <div className="aspect-video w-full">
                <iframe
                  src={convertToEmbedUrl(activity.video_url) || ''}
                  title={activity.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-5 min-h-[100px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-blue-light flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Chưa có video</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        disabled={isCompleting}
        className="w-full mt-6 h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-pink via-pink to-primary hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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