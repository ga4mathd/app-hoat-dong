import { Music, MessageCircleQuestion, ShoppingBag, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomActions() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHome = location.pathname === '/';
  const isStoriesMusicActive = location.pathname === '/stories-music';
  const isAskExpertActive = location.pathname === '/ask-expert';
  const isShopActive = location.pathname === '/shop';

  const navItems = [
    {
      icon: Music,
      label: 'Nhạc & Truyện',
      path: '/stories-music',
      isActive: isStoriesMusicActive,
      gradient: 'from-purple to-pink',
      bgColor: 'bg-purple-light',
      iconColor: 'text-purple',
    },
    {
      icon: Home,
      label: 'Trang chủ',
      path: '/',
      isActive: isHome,
      gradient: 'from-primary to-blue-500',
      bgColor: 'bg-blue-light',
      iconColor: 'text-primary',
      isCenter: true,
    },
    {
      icon: MessageCircleQuestion,
      label: 'Hỏi chuyên gia',
      path: '/ask-expert',
      isActive: isAskExpertActive,
      gradient: 'from-blue to-primary',
      bgColor: 'bg-blue-light',
      iconColor: 'text-blue',
    },
    {
      icon: ShoppingBag,
      label: 'Shop',
      path: '/shop',
      isActive: isShopActive,
      gradient: 'from-orange to-yellow',
      bgColor: 'bg-orange-light',
      iconColor: 'text-orange',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t-2 border-border py-2 px-3 animate-fade-in z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
      <div className="w-full max-w-md mx-auto flex items-end justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Center home button with FAB style
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -mt-6 focus:outline-none"
              >
                <div className={`
                  relative p-4 rounded-full shadow-xl transition-all duration-300
                  ${item.isActive 
                    ? `bg-gradient-to-br ${item.gradient} scale-110` 
                    : 'bg-card border-2 border-border hover:scale-105'
                  }
                `}>
                  {/* Glow effect when active */}
                  {item.isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-full blur-md opacity-50`} />
                  )}
                  <Icon className={`relative h-7 w-7 ${item.isActive ? 'text-white' : item.iconColor}`} />
                </div>
                <span className={`block text-[10px] font-bold text-center mt-1 ${item.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 transition-all hover:scale-105 focus:outline-none py-1"
            >
              <div className={`
                p-3 rounded-2xl transition-all duration-300 shadow-md
                ${item.isActive 
                  ? `bg-gradient-to-br ${item.gradient}` 
                  : `${item.bgColor} hover:shadow-lg`
                }
              `}>
                <Icon className={`h-6 w-6 ${item.isActive ? 'text-white' : item.iconColor}`} />
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight ${
                item.isActive ? item.iconColor : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
