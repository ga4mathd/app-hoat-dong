import { Music, Lightbulb, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3 px-4 animate-fade-in z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Truyện - nhạc button */}
        <button
          onClick={() => navigate('/stories-music')}
          className="flex flex-col items-center gap-1 px-5 py-3 bg-pink text-primary-foreground rounded-2xl font-medium text-xs hover:opacity-90 transition-opacity shadow-lg"
        >
          <Music className="h-6 w-6" />
          <span className="leading-tight text-center">Truyện - nhạc<br/>nuôi dạy con</span>
        </button>

        {/* Xem hoạt động ngày mai */}
        <button
          onClick={() => navigate('/activities')}
          className="flex flex-col items-center gap-1 px-3 py-2 text-foreground hover:text-primary transition-colors"
        >
          <Lightbulb className="h-6 w-6 text-accent" />
          <span className="text-xs font-medium text-center leading-tight text-muted-foreground">Xem hoạt động<br/>ngày mai</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => navigate('/shop')}
          className="flex flex-col items-center gap-1 px-3 py-2 text-foreground hover:text-primary transition-colors"
        >
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-medium text-center leading-tight text-muted-foreground">Shop đồ tốt<br/>mẹ và bé</span>
        </button>
      </div>
    </div>
  );
}
