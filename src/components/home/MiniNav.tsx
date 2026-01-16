import { Calendar, Music, ShoppingBag, Bookmark } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function MiniNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Calendar,
      label: 'Hoạt động',
      path: '/activities',
      active: location.pathname === '/activities',
    },
    {
      icon: Music,
      label: 'Truyện & Nhạc',
      path: '/stories-music',
      active: location.pathname === '/stories-music',
    },
    {
      icon: ShoppingBag,
      label: 'Shop',
      path: '/shop',
      active: location.pathname === '/shop',
    },
  ];

  return (
    <div className="flex items-center justify-center gap-2 py-5 mt-2">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            item.active
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
