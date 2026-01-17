import { Music, MessageCircleQuestion, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isStoriesMusicActive = location.pathname === '/stories-music';
  const isAskExpertActive = location.pathname === '/ask-expert';
  const isShopActive = location.pathname === '/shop';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border py-2 md:py-3 px-4 animate-fade-in z-50">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto flex items-center justify-between md:justify-center md:gap-16 lg:gap-24">
        {/* Nhạc, truyện free */}
        <button
          onClick={() => navigate('/stories-music')}
          className="flex flex-col items-center gap-0.5 md:gap-1 transition-all hover:scale-105"
        >
          <div className={`p-2.5 md:p-3 rounded-full transition-all ${isStoriesMusicActive ? 'bg-purple-500' : 'bg-purple-100 hover:bg-purple-200'}`}>
            <Music className={`h-5 w-5 md:h-6 md:w-6 ${isStoriesMusicActive ? 'text-white' : 'text-purple-600'}`} />
          </div>
          <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isStoriesMusicActive ? 'text-purple-600' : 'text-muted-foreground'}`}>
            Nhạc, truyện<br className="md:hidden"/>free
          </span>
        </button>

        {/* Hỏi chuyên gia */}
        <button
          onClick={() => navigate('/ask-expert')}
          className="flex flex-col items-center gap-0.5 md:gap-1 transition-all hover:scale-105"
        >
          <div className={`p-2.5 md:p-3 rounded-full transition-all ${isAskExpertActive ? 'bg-blue-500' : 'bg-blue-100 hover:bg-blue-200'}`}>
            <MessageCircleQuestion className={`h-5 w-5 md:h-6 md:w-6 ${isAskExpertActive ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isAskExpertActive ? 'text-blue-600' : 'text-muted-foreground'}`}>
            Hỏi chuyên<br className="md:hidden"/>gia
          </span>
        </button>

        {/* Shop */}
        <button
          onClick={() => navigate('/shop')}
          className="flex flex-col items-center gap-0.5 md:gap-1 transition-all hover:scale-105"
        >
          <div className={`p-2.5 md:p-3 rounded-full transition-all ${isShopActive ? 'bg-orange-500' : 'bg-orange-100 hover:bg-orange-200'}`}>
            <ShoppingBag className={`h-5 w-5 md:h-6 md:w-6 ${isShopActive ? 'text-white' : 'text-orange-600'}`} />
          </div>
          <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isShopActive ? 'text-orange-600' : 'text-muted-foreground'}`}>
            SHOP
          </span>
        </button>
      </div>
    </div>
  );
}
