import { Music, Lightbulb, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isStoriesMusicActive = location.pathname === '/stories-music';
  const isActivitiesActive = location.pathname === '/activities' && location.search.includes('mode=tomorrow');
  const isShopActive = location.pathname === '/shop';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3 px-4 animate-fade-in z-50">
      <div className="w-full max-w-[400px] mx-auto flex items-center justify-between">
        {/* Truyện - nhạc button */}
        <button
          onClick={() => navigate('/stories-music')}
          className="flex flex-col items-center gap-1 transition-all"
        >
          <div className={`p-3 rounded-full transition-all ${isStoriesMusicActive ? 'bg-pink' : ''}`}>
            <Music className={`h-6 w-6 ${isStoriesMusicActive ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-xs font-medium text-center leading-tight ${isStoriesMusicActive ? 'text-pink' : 'text-muted-foreground'}`}>
            Truyện - nhạc<br/>nuôi dạy con
          </span>
        </button>

        {/* Xem hoạt động ngày mai */}
        <button
          onClick={() => navigate('/activities?mode=tomorrow')}
          className="flex flex-col items-center gap-1 transition-all"
        >
          <div className={`p-3 rounded-full transition-all ${isActivitiesActive ? 'bg-pink' : ''}`}>
            <Lightbulb className={`h-6 w-6 ${isActivitiesActive ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-xs font-medium text-center leading-tight ${isActivitiesActive ? 'text-pink' : 'text-muted-foreground'}`}>
            Xem hoạt động<br/>ngày mai
          </span>
        </button>

        {/* Shop */}
        <button
          onClick={() => navigate('/shop')}
          className="flex flex-col items-center gap-1 transition-all"
        >
          <div className={`p-3 rounded-full transition-all ${isShopActive ? 'bg-pink' : ''}`}>
            <ShoppingBag className={`h-6 w-6 ${isShopActive ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-xs font-medium text-center leading-tight ${isShopActive ? 'text-pink' : 'text-muted-foreground'}`}>
            Shop đồ tốt<br/>mẹ và bé
          </span>
        </button>
      </div>
    </div>
  );
}
