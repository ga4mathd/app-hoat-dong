import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, FileText, Play, Check, X, Heart } from 'lucide-react';
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

interface ActivityCardProps {
  activity: Activity | null;
}

// Motivational messages for skip popup
const motivationalMessages = [
  "Chỉ 5-10 phút thôi, giá trị với con lắm đó!",
  "Giữ chuỗi đi mà!",
  "Đúng - đủ - đều bạn nha!",
  "Mỗi ngày một chút, thành công lớn!",
  "Con đang làm rất tốt, đừng dừng lại nhé!",
];

export function ActivityCard({ activity }: ActivityCardProps) {
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [childConfirmed, setChildConfirmed] = useState(false);
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState('goals');
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const handleConfirmComplete = async () => {
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
        setShowConfirmDialog(false);
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

      toast.success(`🎉 Chúc mừng! Bạn nhận được +${activity.points || 25} điểm`);
      setShowConfirmDialog(false);
      setChildConfirmed(false);
      setParentConfirmed(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle complete button click
  const handleCompleteClick = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để hoàn thành hoạt động');
      return;
    }
    setShowConfirmDialog(true);
    setChildConfirmed(false);
    setParentConfirmed(false);
  };

  // Parse content into steps for displaying with dividers
  // Split by "Bước X" pattern instead of newlines
  const parseSteps = (content: string | null) => {
    if (!content) return [];
    // Split by "Bước" but keep "Bước" in the result
    const steps = content.split(/(?=Bước\s*\d+)/);
    return steps.filter(step => step.trim());
  };

  // Handle YouTube video click - open in dialog
  const handleYouTubeClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Ensure URL has https protocol
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = 'https://' + url;
    }
    setCurrentVideoUrl(fullUrl);
    setVideoDialogOpen(true);
  };

  // Render step content with bold "Bước X:" prefix and inline YouTube buttons
  const renderStepContent = (step: string) => {
    const match = step.match(/^(Bước\s*\d+\s*:?)/);
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?/g;
    
    // Split content by YouTube URLs and create mixed content
    const parts: (string | { type: 'youtube'; url: string })[] = [];
    let lastIndex = 0;
    let matchResult;
    
    while ((matchResult = youtubeRegex.exec(step)) !== null) {
      // Add text before the URL
      if (matchResult.index > lastIndex) {
        parts.push(step.slice(lastIndex, matchResult.index));
      }
      // Add YouTube URL marker
      parts.push({ type: 'youtube', url: matchResult[0] });
      lastIndex = matchResult.index + matchResult[0].length;
    }
    // Add remaining text
    if (lastIndex < step.length) {
      parts.push(step.slice(lastIndex));
    }

    // Render with bold prefix for first part if it matches "Bước X:"
    return (
      <>
        {parts.map((part, idx) => {
          if (typeof part === 'string') {
            // Check if this is the first part and contains "Bước X:"
            if (idx === 0 && match) {
              const boldPart = match[1];
              const rest = part.slice(boldPart.length);
              return (
                <span key={idx}>
                  <span className="font-bold text-foreground">{boldPart}</span>
                  {rest}
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          } else {
            // Render YouTube button inline
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleYouTubeClick(e, part.url)}
                className="inline-flex mx-1 my-1 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3 w-3 fill-white" />
                Xem video ngay
              </button>
            );
          }
        })}
      </>
    );
  };

  if (!activity) {
    return (
      <div className="px-5 pt-6 pb-8 min-h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Không có hoạt động nào hôm nay</p>
      </div>
    );
  }

  const goalSteps = parseSteps(activity.goals || activity.description);
  const instructionSteps = parseSteps(activity.instructions);

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Expert Info Badge - Compact */}
      <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 mb-4">
        <Avatar className="h-7 w-7 border border-pink-200">
          <AvatarImage 
            src={activity.expert_avatar || avatarBoy} 
            className="object-cover" 
          />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-500 text-white font-bold text-xs">
            {activity.expert_name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{activity.expert_name || 'Chuyên gia'}</span>
          {activity.expert_title && (
            <>
              <span className="mx-1.5">•</span>
              <span>{activity.expert_title.split(' ').slice(0, 3).join(' ')}</span>
            </>
          )}
        </span>
      </div>

      {/* Large Icon Tabs - Improved Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-transparent p-0 mb-10 flex justify-around px-2 sm:justify-center sm:gap-16">
          {/* Mục tiêu Tab */}
          <TabsTrigger 
            value="goals" 
            className="flex flex-col items-center gap-2 p-0 bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              activeTab === 'goals' 
                ? 'bg-orange shadow-orange/30 shadow-lg' 
                : 'bg-orange-light hover:bg-orange/20'
            }`}>
              <Target className={`h-7 w-7 transition-colors duration-300 ${
                activeTab === 'goals' ? 'text-white' : 'text-orange'
              }`} />
            </div>
            <span className={`text-xs font-semibold transition-all duration-300 px-3 py-1 rounded-full ${
              activeTab === 'goals' 
                ? 'bg-orange text-white shadow-sm' 
                : 'text-muted-foreground bg-transparent'
            }`}>Mục tiêu</span>
          </TabsTrigger>
          
          {/* Hướng dẫn Tab */}
          <TabsTrigger 
            value="instructions"
            className="flex flex-col items-center gap-2 p-0 bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              activeTab === 'instructions' 
                ? 'bg-yellow shadow-yellow/30 shadow-lg' 
                : 'bg-yellow-light hover:bg-yellow/20'
            }`}>
              <FileText className={`h-7 w-7 transition-colors duration-300 ${
                activeTab === 'instructions' ? 'text-white' : 'text-yellow'
              }`} />
            </div>
            <span className={`text-xs font-semibold transition-all duration-300 px-3 py-1 rounded-full ${
              activeTab === 'instructions' 
                ? 'bg-yellow text-white shadow-sm' 
                : 'text-muted-foreground bg-transparent'
            }`}>Hướng dẫn</span>
          </TabsTrigger>
          
          {/* Video Tab */}
          <TabsTrigger 
            value="video"
            className="flex flex-col items-center gap-2 p-0 bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              activeTab === 'video' 
                ? 'bg-primary shadow-primary/30 shadow-lg' 
                : 'bg-blue-light hover:bg-primary/20'
            }`}>
              <Play className={`h-7 w-7 transition-colors duration-300 ${
                activeTab === 'video' ? 'text-white fill-white' : 'text-primary fill-primary'
              }`} />
            </div>
            <span className={`text-xs font-semibold transition-all duration-300 px-3 py-1 rounded-full ${
              activeTab === 'video' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-muted-foreground bg-transparent'
            }`}>Video</span>
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab Content */}
        <TabsContent value="goals" className="mt-4 animate-fade-in">
          <div className="bg-[#FFF8E7] rounded-2xl p-4 min-h-[100px] shadow-sm">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-orange flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[hsl(0,70%,45%)] mb-3">Mục tiêu hoạt động</p>
                {goalSteps.length > 0 ? (
                  <div className="space-y-0">
                    {goalSteps.map((step, index) => (
                      <div key={index}>
                        <p className="text-sm text-muted-foreground leading-relaxed py-2">
                          {step}
                        </p>
                        {index < goalSteps.length - 1 && (
                          <div className="h-[1px] bg-orange/20" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Trải nghiệm hoạt động vui vẻ cùng con
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Instructions Tab Content */}
        <TabsContent value="instructions" className="mt-4 animate-fade-in">
          <div className="bg-[#FFF8E7] rounded-2xl p-4 min-h-[100px] shadow-sm">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-orange flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[hsl(0,70%,45%)] mb-3">Hướng dẫn thực hiện</p>
                {instructionSteps.length > 0 ? (
                  <div className="space-y-0">
                    {instructionSteps.map((step, index) => (
                      <div key={index}>
                        <p className="text-sm text-muted-foreground leading-relaxed py-2 whitespace-pre-wrap">
                          {renderStepContent(step)}
                        </p>
                        {index < instructionSteps.length - 1 && (
                          <div className="h-[1px] bg-orange/20" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Hướng dẫn chi tiết sẽ được cập nhật
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Video Tab Content */}
        <TabsContent value="video" className="mt-4 animate-fade-in">
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
        onClick={handleCompleteClick}
        disabled={isCompleting}
        className="w-full mt-5 h-12 text-base font-bold rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
      >
        <Check className="h-5 w-5 mr-2" />
        Hoàn thành (+{activity.points || 25} điểm)
      </Button>

      {/* Skip Button */}
      <Button
        variant="ghost"
        onClick={() => setShowSkipDialog(true)}
        className="w-full mt-3 h-10 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
      >
        <X className="h-4 w-4 mr-1.5" />
        Không làm hôm nay
      </Button>

      {/* Skip Motivation Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">
              🌟 Đừng bỏ cuộc nhé!
            </AlertDialogTitle>
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
            <AlertDialogTitle className="text-center text-lg">
              ✅ Xác nhận hoàn thành
            </AlertDialogTitle>
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
              {isCompleting ? (
                'Đang xử lý...'
              ) : (
                <>
                  🎉 Nhận {activity.points || 25} điểm
                </>
              )}
            </Button>
            <AlertDialogCancel className="w-full h-10 mt-0 rounded-xl">
              Hủy
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Dialog for inline YouTube videos */}
      <VideoDialog
        open={videoDialogOpen}
        onOpenChange={setVideoDialogOpen}
        videoUrl={currentVideoUrl}
        title="Video hướng dẫn"
      />
    </div>
  );
}
