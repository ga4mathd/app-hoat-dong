import { useState } from 'react';
import { Heart, Play, Check, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VideoDialog } from '@/components/ui/video-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  likes_count?: number | null;
}

interface ActivityFullCardProps {
  activity: Activity | null;
}

const motivationalMessages = [
  "Chỉ 5-10 phút thôi, giá trị với con lắm đó!",
  "Giữ chuỗi đi mà!",
  "Đúng - đủ - đều bạn nha!",
  "Mỗi ngày một chút, thành công lớn!",
];

export function ActivityFullCard({ activity }: ActivityFullCardProps) {
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [childConfirmed, setChildConfirmed] = useState(false);
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  // Get today's date formatted
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });

  if (!activity) {
    return (
      <div className="bg-card rounded-2xl p-6 min-h-[300px] flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">Chưa có hoạt động hôm nay</p>
          <p className="text-muted-foreground/70 text-sm mt-1">Quay lại sau nhé!</p>
        </div>
      </div>
    );
  }

  // Format likes count
  const formatLikes = (count: number | null | undefined) => {
    if (!count) return '0';
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  // Parse goals into bullet points
  const parseGoals = (goals: string | null) => {
    if (!goals) return [];
    return goals.split('\n').filter(line => line.trim()).map(line => 
      line.replace(/^[-•]\s*/, '').replace(/^Bước\s*\d+[:.]\s*/, '').trim()
    );
  };

  // Parse instructions - keep original formatting
  const parseInstructions = (instructions: string | null) => {
    if (!instructions) return null;
    return instructions;
  };

  // Get author names
  const getAuthors = () => {
    if (!activity.expert_name) return 'Chuyên gia';
    return activity.expert_name;
  };

  const handleConfirmComplete = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để hoàn thành hoạt động');
      return;
    }

    setIsCompleting(true);
    try {
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_id', activity.id)
        .maybeSingle();

      if (existing) {
        toast.info('Bạn đã hoàn thành hoạt động này rồi!');
        setIsCompleting(false);
        setShowConfirmDialog(false);
        return;
      }

      await supabase.from('user_progress').insert({
        user_id: user.id,
        activity_id: activity.id,
        points_earned: activity.points || 25,
      });

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

      toast.success(`🎉 Chúc mừng! Bạn nhận được +${activity.points || 25} điểm`);
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCompleteClick = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để hoàn thành hoạt động');
      return;
    }
    setShowConfirmDialog(true);
    setChildConfirmed(false);
    setParentConfirmed(false);
  };

  const goalsList = parseGoals(activity.goals);
  const instructionsText = parseInstructions(activity.instructions);

  return (
    <div className="animate-fade-in pb-4">
      {/* Header Section */}
      <div className="mb-4">
        {/* Date */}
        <p className="text-muted-foreground text-sm mb-2">
          Hoạt động hôm nay: {dateFormatted}
        </p>

        {/* Title with Likes */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-foreground text-xl font-bold leading-tight flex-1">
            {activity.title}
          </h1>
          <div className="flex items-center gap-1 text-red-500 flex-shrink-0">
            <Heart className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{formatLikes(activity.likes_count)}</span>
          </div>
        </div>

        {/* Authors */}
        <p className="text-muted-foreground text-sm mt-1">
          By: {getAuthors()}
        </p>
      </div>

      {/* Goals Section */}
      {goalsList.length > 0 && (
        <div className="mb-4">
          <h2 className="text-foreground font-bold mb-2">Mục tiêu:</h2>
          <ul className="space-y-1.5">
            {goalsList.map((goal, index) => (
              <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions Section */}
      {instructionsText && (
        <div className="mb-4">
          <h2 className="text-foreground font-bold mb-2">Hướng dẫn:</h2>
          <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
            {instructionsText}
          </div>
        </div>
      )}

      {/* Video Link */}
      {activity.video_url && (
        <button
          onClick={() => setVideoDialogOpen(true)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium mb-6 transition-colors"
        >
          <Video className="h-4 w-4" />
          <span>📍 Xem video hướng dẫn bởi GV</span>
        </button>
      )}

      {/* Complete Button */}
      <Button
        onClick={handleCompleteClick}
        className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Check className="h-5 w-5 mr-2" />
        Hoàn thành (+{activity.points || 25} điểm)
      </Button>

      {/* Skip Button */}
      <Button
        variant="ghost"
        onClick={() => setShowSkipDialog(true)}
        className="w-full h-10 mt-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4 mr-1.5" />
        Không làm hôm nay
      </Button>

      {/* Skip Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">🌟 Đừng bỏ cuộc nhé!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base py-4">
              {randomMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={() => setShowSkipDialog(false)}
              className="w-full h-12 bg-gradient-to-r from-pink via-pink to-primary hover:opacity-90 rounded-xl font-bold"
            >
              <Heart className="h-4 w-4 mr-2" />
              Yes! Làm với con
            </AlertDialogAction>
            <AlertDialogCancel
              className="w-full h-10 mt-0 border-muted-foreground/30 text-muted-foreground rounded-xl"
            >
              Vẫn không làm
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">✅ Xác nhận hoàn thành</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm pt-2">
              Cần cả con và bố mẹ xác nhận để ghi nhận điểm
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3 py-4">
            <Button
              variant={childConfirmed ? "default" : "outline"}
              onClick={() => setChildConfirmed(true)}
              disabled={childConfirmed}
              className={`w-full h-14 rounded-xl text-base font-semibold transition-all duration-300 ${
                childConfirmed
                  ? 'bg-gradient-to-r from-yellow to-orange text-white shadow-md'
                  : 'border-2 border-yellow hover:bg-yellow/10'
              }`}
            >
              {childConfirmed ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Con đã xác nhận ✓
                </>
              ) : (
                '👧 Xác nhận của con'
              )}
            </Button>

            <Button
              variant={parentConfirmed ? "default" : "outline"}
              onClick={() => setParentConfirmed(true)}
              disabled={parentConfirmed}
              className={`w-full h-14 rounded-xl text-base font-semibold transition-all duration-300 ${
                parentConfirmed
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                  : 'border-2 border-primary hover:bg-primary/10'
              }`}
            >
              {parentConfirmed ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Bố mẹ đã xác nhận ✓
                </>
              ) : (
                '👨‍👩‍👧 Xác nhận của bố mẹ'
              )}
            </Button>
          </div>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleConfirmComplete}
              disabled={!childConfirmed || !parentConfirmed || isCompleting}
              className={`w-full h-12 rounded-xl font-bold transition-all duration-300 ${
                childConfirmed && parentConfirmed
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg animate-pulse'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isCompleting ? 'Đang xử lý...' : `🎉 Nhận ${activity.points || 25} điểm`}
            </Button>
            <AlertDialogCancel className="w-full h-10 mt-0 rounded-xl">Hủy</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VideoDialog
        open={videoDialogOpen}
        onOpenChange={setVideoDialogOpen}
        videoUrl={activity.video_url}
        title="Video hướng dẫn"
      />
    </div>
  );
}
