import { Music, Lightbulb, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isStoriesMusicActive = location.pathname === '/stories-music';
  const isActivitiesActive = location.pathname === '/activities' && location.search.includes('mode=tomorrow');
  const isShopActive = location.pathname === '/shop';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border py-2 md:py-3 px-4 animate-fade-in z-50">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto flex items-center justify-between md:justify-center md:gap-16 lg:gap-24">
        {/* Truyện - nhạc button */}
        <button
          onClick={() => navigate('/stories-music')}
          className="flex flex-col items-center gap-0.5 md:gap-1 transition-all hover:scale-105"
        >
          <div className={`p-2 md:p-3 rounded-full transition-all ${isStoriesMusicActive ? 'bg-pink' : 'hover:bg-muted'}`}>
            <Music className={`h-5 w-5 md:h-6 md:w-6 ${isStoriesMusicActive ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isStoriesMusicActive ? 'text-pink' : 'text-muted-foreground'}`}>
            Truyện - nhạc<br className="md:hidden"/>nuôi dạy con
          </span>
        </button>

        {/* Xem hoạt động ngày mai */}
        <button
          onClick={() => navigate('/activities?mode=tomorrow')}
          className="flex flex-col items-center gap-0.5 md:gap-1 transition-all hover:scale-105"
        >
          <div className={`p-2 md:p-3 rounded-full transition-all ${isActivitiesActive ? 'bg-pink' : 'hover:bg-muted'}`}>
            <Lightbulb className={`h-5 w-5 md:h-6 md:w-6 ${isActivitiesActive ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isActivitiesActive ? 'text-pink' : 'text-muted-foreground'}`}>
            Xem hoạt động<br className="md:hidden"/>ngày mai
          </span>
        </button>

        {/* Shop */}
        <button
          onClick={() => navigate('/shop')}
          className="flex flex-col items-center gap-0.5 md:gap-1 transition-all hover:scale-105"
        >
          <div className={`p-2 md:p-3 rounded-full transition-all ${isShopActive ? 'bg-pink' : 'hover:bg-muted'}`}>
            <ShoppingBag className={`h-5 w-5 md:h-6 md:w-6 ${isShopActive ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isShopActive ? 'text-pink' : 'text-muted-foreground'}`}>
            Shop đồ tốt<br className="md:hidden"/>mẹ và bé
          </span>
        </button>
      </div>
    </div>
  );
}
