import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Flame, Star, Trophy, ChevronDown, ChevronUp, Play, CalendarDays, History, Sparkles, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VideoDialog } from '@/components/ui/video-dialog';
import { Confetti } from '@/components/decorative/Confetti';

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
  { text: "Hẹn gặp lại ngày mai!", emoji: "🌟" },
  { text: "Bạn thật tuyệt vời!", emoji: "💪" },
  { text: "Cứ tiếp tục như vậy nhé!", emoji: "🚀" },
  { text: "Một ngày thật ý nghĩa!", emoji: "✨" },
  { text: "Con bạn đang phát triển tuyệt vời!", emoji: "🌈" }
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
  const [showConfetti, setShowConfetti] = useState(true);

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
      <div className="bg-gradient-to-br from-yellow-light via-pink-light to-purple-light rounded-3xl p-8 shadow-xl border-2 border-yellow/30 animate-fade-in relative overflow-hidden">
        <Confetti active={showConfetti} />
        <div className="text-center py-8 relative z-10">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h3 className="text-2xl font-extrabold text-foreground mb-2">Tuyệt vời!</h3>
          <p className="text-muted-foreground text-lg">Bạn đã hoàn thành hoạt động hôm nay!</p>
        </div>
      </div>
    );
  }

  const goals = parseGoals(activity.goals);
  const instructions = parseInstructions(activity.instructions);

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Confetti effect */}
      <Confetti active={showConfetti} duration={4000} />

      {/* Celebration Card */}
      <div className="bg-gradient-to-br from-yellow-light via-pink-light to-purple-light rounded-3xl p-6 border-2 border-yellow/40 relative overflow-hidden shadow-xl">
        {/* Animated decorations */}
        <div className="absolute top-3 left-5 text-3xl animate-bounce" style={{ animationDuration: '2s' }}>🎊</div>
        <div className="absolute top-5 right-7 text-2xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}>✨</div>
        <div className="absolute bottom-5 left-10 text-xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>🌟</div>
        <div className="absolute bottom-3 right-5 text-2xl animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.7s' }}>🎈</div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4 animate-celebration">
            <PartyPopper className="h-10 w-10 text-yellow" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-4 drop-shadow-sm">TUYỆT VỜI! 🎉</h2>
          
          {/* Status Badge */}
          <div className="flex items-center justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-green/90 text-white px-5 py-2.5 rounded-full font-bold text-base shadow-lg">
              <Check className="w-5 h-5" />
              <span>Đã hoàn thành hôm nay!</span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg hover-lift">
              <div className="flex items-center justify-center gap-1.5 text-orange mb-1">
                <Flame className="w-6 h-6 animate-wiggle" />
                <span className="font-extrabold text-2xl">{currentStreak}</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground">ngày liên tiếp</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg hover-lift">
              <div className="flex items-center justify-center gap-1.5 text-yellow mb-1">
                <Star className="w-6 h-6 fill-current animate-sparkle" />
                <span className="font-extrabold text-2xl">+{pointsEarned}</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground">điểm hôm nay</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg hover-lift">
              <div className="flex items-center justify-center gap-1.5 text-purple mb-1">
                <Trophy className="w-6 h-6" />
                <span className="font-extrabold text-2xl">{totalPoints}</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground">tổng điểm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Activity Details (Collapsible) */}
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <div className="bg-card rounded-3xl border-2 shadow-lg overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-light to-green/20 flex items-center justify-center shadow">
                <Check className="w-6 h-6 text-green" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-muted-foreground">Hoạt động đã làm</p>
                <h3 className="font-bold text-foreground line-clamp-1">{activity.title}</h3>
              </div>
            </div>
            {isDetailsOpen ? (
              <ChevronUp className="w-6 h-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t-2 border-dashed">
              {/* Author */}
              <p className="text-sm text-muted-foreground pt-4 flex items-center gap-2">
                <span className="bg-muted px-2 py-0.5 rounded-full">👨‍🏫</span>
                By: {getAuthors()}
              </p>

              {/* Goals */}
              {goals.length > 0 && (
                <div className="bg-green-light/30 p-4 rounded-2xl">
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green" />
                    Mục tiêu:
                  </h4>
                  <ul className="space-y-2">
                    {goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-green font-bold">✓</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructions */}
              {instructions.length > 0 && (
                <div className="bg-blue-light/30 p-4 rounded-2xl">
                  <h4 className="font-bold text-foreground mb-3">📚 Hướng dẫn:</h4>
                  <div className="space-y-2 text-sm text-foreground">
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
                  className="flex items-center gap-3 text-primary hover:text-primary/80 font-bold transition-colors bg-primary/10 hover:bg-primary/20 px-4 py-3 rounded-2xl w-full"
                >
                  <div className="bg-primary rounded-full p-2">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <span>Xem lại video hướng dẫn</span>
                </button>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-primary/10 via-purple/10 to-pink/10 rounded-3xl p-6 text-center border-2 border-primary/20">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg mb-3">
          <span className="text-3xl">{randomMessage.emoji}</span>
        </div>
        <p className="text-xl font-bold text-foreground mb-4">💡 {randomMessage.text}</p>
        <Button
          variant="outline"
          onClick={() => navigate('/activities?mode=upcoming')}
          className="gap-2 rounded-2xl font-bold px-6 py-3 h-auto border-2 hover:bg-primary hover:text-white transition-all"
        >
          <CalendarDays className="w-5 h-5" />
          Xem hoạt động sắp tới
        </Button>
        
        {/* Past activities option */}
        <div className="mt-4">
          {!showPastOption ? (
            <button
              onClick={() => setShowPastOption(true)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Hoặc xem hoạt động đã qua
            </button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/activities?mode=past')}
              className="gap-2 animate-fade-in rounded-2xl font-medium"
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
