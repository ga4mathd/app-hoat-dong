import { Sparkles } from 'lucide-react';

export function MotivationBanner() {
  return (
    <div 
      className="bg-gradient-to-r from-pink to-secondary rounded-2xl p-4 text-secondary-foreground animate-fade-in card-shadow"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce-gentle">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Bạn đang làm rất tốt!</h3>
          <p className="text-sm opacity-90">Tiếp tục duy trì nhé, con bạn đang phát triển tuyệt vời!</p>
        </div>
      </div>
    </div>
  );
}
