import { Music, Calendar, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Music,
      label: 'Truyện - Nhạc',
      color: 'bg-pink-light text-pink',
      path: '/stories-music',
    },
    {
      icon: Calendar,
      label: 'Hoạt động ngày mai',
      color: 'bg-blue-light text-blue',
      path: '/activities',
    },
    {
      icon: ShoppingBag,
      label: 'Shop',
      color: 'bg-yellow-light text-accent-foreground',
      path: '/shop',
    },
  ];

  return (
    <div 
      className="grid grid-cols-3 gap-3 animate-fade-in"
      style={{ animationDelay: '0.6s' }}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.path)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${action.color} hover:opacity-80 transition-all card-shadow`}
        >
          <action.icon className="h-8 w-8" />
          <span className="text-sm font-medium text-center">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
