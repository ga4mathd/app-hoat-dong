import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Flame, Star, Trophy, ChevronDown, ChevronUp, Play, CalendarDays, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VideoDialog } from '@/components/ui/video-dialog';

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
  video_url?: string | null;
}

interface ActivityCompletedCardProps {
  activity: Activity | null;
  pointsEarned: number;
  currentStreak: number;
  totalPoints: number;
}

const motivationalMessages = [
  "Hẹn gặp lại ngày mai! 🌟",
  "Bạn thật tuyệt vời! 💪",
  "Cứ tiếp tục như vậy nhé! 🚀",
  "Một ngày thật ý nghĩa! ✨",
  "Con bạn đang phát triển tuyệt vời! 🌈"
];

export const ActivityCompletedCard = ({ 
  activity, 
  pointsEarned, 
  currentStreak, 
  totalPoints 
}: ActivityCompletedCardProps) => {
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showPastOption, setShowPastOption] = useState(false);

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const parseGoals = (goals: string | null): string[] => {
    if (!goals) return [];
    return goals.split('\n').filter(g => g.trim());
  };

  const parseInstructions = (instructions: string | null): string[] => {
    if (!instructions) return [];
    return instructions.split('\n').filter(i => i.trim());
  };

  const getAuthors = (): string => {
    if (!activity?.expert_name) return 'Chuyên gia Jenna';
    return activity.expert_name;
  };

  if (!activity) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border animate-fade-in">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-foreground mb-2">Tuyệt vời!</h3>
          <p className="text-muted-foreground">Bạn đã hoàn thành hoạt động hôm nay!</p>
        </div>
      </div>
    );
  }

  const goals = parseGoals(activity.goals);
  const instructions = parseInstructions(activity.instructions);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Celebration Card */}
      <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
        {/* Confetti decoration */}
        <div className="absolute top-2 left-4 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</div>
        <div className="absolute top-4 right-6 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
        <div className="absolute bottom-4 left-8 text-lg animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
        
        <div className="text-center relative z-10">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">TUYỆT VỜI!</h2>
          
          {/* Status Badge - moved below TUYỆT VỜI */}
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-medium text-sm">
              <Check className="w-4 h-4" />
              <span>Đã hoàn thành hôm nay</span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-5 h-5" />
                <span className="font-bold text-lg">{currentStreak}</span>
              </div>
              <p className="text-xs text-muted-foreground">ngày liên tiếp</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                <Star className="w-5 h-5" />
                <span className="font-bold text-lg">+{pointsEarned}</span>
              </div>
              <p className="text-xs text-muted-foreground">điểm hôm nay</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="font-bold text-lg">{totalPoints}</span>
              </div>
              <p className="text-xs text-muted-foreground">tổng điểm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Activity Details (Collapsible) */}
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Hoạt động đã làm</p>
                <h3 className="font-semibold text-foreground line-clamp-1">{activity.title}</h3>
              </div>
            </div>
            {isDetailsOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t">
              {/* Author */}
              <p className="text-sm text-muted-foreground pt-3">
                By: {getAuthors()}
              </p>

              {/* Goals */}
              {goals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Mục tiêu:</h4>
                  <ul className="space-y-1.5">
                    {goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructions */}
              {instructions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Hướng dẫn:</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {instructions.map((instruction, index) => (
                      <p key={index}>{instruction}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Link */}
              {activity.video_url && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Xem lại video hướng dẫn</span>
                </button>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Motivational Message */}
      <div className="bg-muted/50 rounded-2xl p-4 text-center">
        <p className="text-lg font-medium text-foreground mb-3">💡 {randomMessage}</p>
        <Button
          variant="outline"
          onClick={() => navigate('/activities?mode=upcoming')}
          className="gap-2"
        >
          <CalendarDays className="w-4 h-4" />
          Xem hoạt động sắp tới
        </Button>
        
        {/* Past activities option */}
        <div className="mt-3">
          {!showPastOption ? (
            <button
              onClick={() => setShowPastOption(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Hoặc xem hoạt động đã qua
            </button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/activities?mode=past')}
              className="gap-2 animate-fade-in"
            >
              <History className="w-4 h-4" />
              Xem hoạt động đã qua
            </Button>
          )}
        </div>
      </div>

      {/* Video Dialog */}
      {activity.video_url && (
        <VideoDialog
          open={showVideo}
          onOpenChange={setShowVideo}
          videoUrl={activity.video_url}
          title={activity.title}
        />
      )}
    </div>
  );
};
