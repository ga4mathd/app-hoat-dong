import { Music, Lightbulb, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 animate-fade-in z-50">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Truyện - nhạc button */}
        <button
          onClick={() => navigate('/stories-music')}
          className="flex items-center gap-2 px-4 py-3 bg-pink text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Music className="h-5 w-5" />
          <span className="hidden sm:inline">Truyện - nhạc nuôi dạy con</span>
          <span className="sm:hidden">Truyện - nhạc</span>
        </button>

        {/* Xem hoạt động ngày mai */}
        <button
          onClick={() => navigate('/activities')}
          className="flex items-center gap-2 px-3 py-3 text-foreground hover:text-primary transition-colors"
        >
          <Lightbulb className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium hidden sm:inline">Xem hoạt động ngày mai</span>
          <span className="text-sm font-medium sm:hidden">Ngày mai</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 px-3 py-3 text-foreground hover:text-primary transition-colors"
        >
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium hidden sm:inline">Shop đồ tốt mẹ và bé</span>
          <span className="text-sm font-medium sm:hidden">Shop</span>
        </button>
      </div>
    </div>
  );
}
