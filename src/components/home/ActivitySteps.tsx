import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Check, X, Play, Heart, Target, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { convertToEmbedUrl } from '@/lib/youtube';
import avatarBoy from '@/assets/avatar-boy.png';
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
}

interface ActivityStepsProps {
  activity: Activity;
  onClose: () => void;
}

type Step = 'goals' | 'instructions' | 'video' | 'complete';

const motivationalMessages = [
  "Chỉ 5-10 phút thôi, giá trị với con lắm đó!",
  "Giữ chuỗi đi mà!",
  "Đúng - đủ - đều bạn nha!",
  "Mỗi ngày một chút, thành công lớn!",
];

export function ActivitySteps({ activity, onClose }: ActivityStepsProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('goals');
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [childConfirmed, setChildConfirmed] = useState(false);
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  // Determine which steps are available
  const hasVideo = !!activity.video_url;
  const steps: Step[] = hasVideo ? ['goals', 'instructions', 'video', 'complete'] : ['goals', 'instructions', 'complete'];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
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
      onClose();
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

  // Parse content into readable format
  const parseContent = (content: string | null) => {
    if (!content) return [];
    const steps = content.split(/(?=Bước\s*\d+)/);
    return steps.filter(step => step.trim());
  };

  // Handle YouTube video click
  const handleYouTubeClick = (url: string) => {
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = 'https://' + url;
    }
    setCurrentVideoUrl(fullUrl);
    setVideoDialogOpen(true);
  };

  const goalSteps = parseContent(activity.goals || activity.description);
  const instructionSteps = parseContent(activity.instructions);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'goals':
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Mục tiêu hôm nay</h2>
            </div>
            <div className="bg-orange-light rounded-2xl p-4 space-y-3">
              {goalSteps.length > 0 ? (
                goalSteps.map((step, index) => (
                  <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                    {step}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Trải nghiệm hoạt động vui vẻ cùng con</p>
              )}
            </div>
          </div>
        );

      case 'instructions':
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Cách thực hiện</h2>
            </div>
            <div className="bg-yellow-light rounded-2xl p-4 space-y-3">
              {instructionSteps.length > 0 ? (
                instructionSteps.map((step, index) => (
                  <p key={index} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {step}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Hướng dẫn chi tiết sẽ được cập nhật</p>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Video hướng dẫn</h2>
            </div>
            <div className="bg-blue-light rounded-2xl overflow-hidden">
              {activity.video_url && (
                <div className="aspect-video w-full">
                  <iframe
                    src={convertToEmbedUrl(activity.video_url) || ''}
                    title={activity.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="animate-fade-in text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green mx-auto mb-4 flex items-center justify-center">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Sẵn sàng hoàn thành!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Nhấn nút bên dưới để ghi nhận điểm
            </p>
          </div>
        );
    }
  };

  const getButtonText = () => {
    if (currentStep === 'complete') {
      return `Hoàn thành (+${activity.points || 25} điểm)`;
    }
    return 'Tiếp tục';
  };

  const handleMainAction = () => {
    if (currentStep === 'complete') {
      handleCompleteClick();
    } else {
      goNext();
    }
  };

  return (
    <div className="pb-6">
      {/* Progress Bar */}
      <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-green transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Expert Badge - Compact */}
      <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 mb-5">
        <Avatar className="h-6 w-6 border border-pink-200">
          <AvatarImage src={activity.expert_avatar || avatarBoy} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-500 text-white font-bold text-xs">
            {activity.expert_name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{activity.expert_name || 'Chuyên gia'}</span>
        </span>
      </div>

      {/* Step Content */}
      <div className="min-h-[200px]">
        {renderStepContent()}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Button
          onClick={handleMainAction}
          className={`w-full h-14 text-base font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
            currentStep === 'complete'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          {currentStep === 'complete' ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              {getButtonText()}
            </>
          ) : (
            <>
              {getButtonText()}
              <ChevronRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowSkipDialog(true)}
          className="w-full h-10 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1.5" />
          Không làm hôm nay
        </Button>
      </div>

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
              onClick={onClose}
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
        videoUrl={currentVideoUrl}
        title="Video hướng dẫn"
      />
    </div>
  );
}
