import { Home, BookOpen, Star, User, LogOut, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: BookOpen, label: 'Hoạt động', path: '/activities' },
    { icon: Star, label: 'Thành tích', path: '/achievements' },
    { icon: User, label: 'Hồ sơ', path: '/profile' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
        {user ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-destructive transition-all"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs font-medium">Đăng xuất</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-primary hover:bg-primary/10 transition-all"
          >
            <LogIn className="h-6 w-6" />
            <span className="text-xs font-medium">Đăng nhập</span>
          </button>
        )}
      </div>
    </nav>
  );
}
