import { Calendar, Music, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function MiniNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isStoriesMusicActive = location.pathname === '/stories-music';
  const isActivitiesActive = location.pathname === '/activities';
  const isShopActive = location.pathname === '/shop';

  const navItems = [
    {
      icon: Calendar,
      label: 'Lịch sử',
      path: '/activities',
      active: isActivitiesActive,
    },
    {
      icon: Music,
      label: 'Truyện & Nhạc',
      path: '/stories-music',
      active: isStoriesMusicActive,
    },
    {
      icon: ShoppingBag,
      label: 'Shop',
      path: '/shop',
      active: isShopActive,
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            item.active
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
