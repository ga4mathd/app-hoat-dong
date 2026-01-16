import { Music, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BottomNavFixed() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border py-3 px-4 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Stories & Music */}
        <Button
          variant="outline"
          onClick={() => navigate('/stories-music')}
          className="flex-1 h-11 rounded-xl text-xs font-medium border-border"
        >
          <Music className="h-4 w-4 mr-1.5" />
          Nhạc, truyện free
        </Button>

        {/* Next Activity */}
        <Button
          variant="outline"
          onClick={() => navigate('/activities')}
          className="flex-1 h-11 rounded-xl text-xs font-medium border-border"
        >
          <ArrowRight className="h-4 w-4 mr-1.5" />
          Xem HĐ tiếp theo
        </Button>

        {/* Shop */}
        <Button
          variant="outline"
          onClick={() => navigate('/shop')}
          className="flex-1 h-11 rounded-xl text-xs font-medium border-border"
        >
          <ShoppingBag className="h-4 w-4 mr-1.5" />
          SHOP
        </Button>
      </div>
    </div>
  );
}
