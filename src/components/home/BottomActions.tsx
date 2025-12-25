import { Music, Lightbulb, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isStoriesMusicActive = location.pathname === '/stories-music';
  const isActivitiesActive = location.pathname === '/activities';
  const isShopActive = location.pathname === '/shop';

  const activeClass = 'px-5 py-3 bg-pink text-primary-foreground rounded-2xl font-medium text-xs shadow-lg';
  const inactiveClass = 'px-3 py-2 text-foreground hover:text-primary';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3 px-4 animate-fade-in z-50">
      <div className="w-full max-w-[400px] mx-auto flex items-center justify-between">
        {/* Truyện - nhạc button */}
        <button
          onClick={() => navigate('/stories-music')}
          className={`flex flex-col items-center gap-1 transition-all ${isStoriesMusicActive ? activeClass : inactiveClass}`}
        >
          <Music className={`h-6 w-6 ${isStoriesMusicActive ? '' : 'text-muted-foreground'}`} />
          <span className={`text-xs font-medium text-center leading-tight ${isStoriesMusicActive ? '' : 'text-muted-foreground'}`}>
            Truyện - nhạc<br/>nuôi dạy con
          </span>
        </button>

        {/* Xem hoạt động ngày mai */}
        <button
          onClick={() => navigate('/activities')}
          className={`flex flex-col items-center gap-1 transition-all ${isActivitiesActive ? activeClass : inactiveClass}`}
        >
          <Lightbulb className={`h-6 w-6 ${isActivitiesActive ? '' : 'text-muted-foreground'}`} />
          <span className={`text-xs font-medium text-center leading-tight ${isActivitiesActive ? '' : 'text-muted-foreground'}`}>
            Xem hoạt động<br/>ngày mai
          </span>
        </button>

        {/* Shop */}
        <button
          onClick={() => navigate('/shop')}
          className={`flex flex-col items-center gap-1 transition-all ${isShopActive ? activeClass : inactiveClass}`}
        >
          <ShoppingBag className={`h-6 w-6 ${isShopActive ? '' : 'text-muted-foreground'}`} />
          <span className={`text-xs font-medium text-center leading-tight ${isShopActive ? '' : 'text-muted-foreground'}`}>
            Shop đồ tốt<br/>mẹ và bé
          </span>
        </button>
      </div>
    </div>
  );
}
