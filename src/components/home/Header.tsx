import { Calendar, LogIn, User, History, LogOut, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import avatarBoy from '@/assets/avatar-boy.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; total_activities: number; total_points: number } | null>(null);
  const [currentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  const MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name, total_activities, total_points')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  // Khi chưa đăng nhập
  if (!user) {
    return (
      <header className="flex items-center justify-between py-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 border-4 border-card shadow-lg ring-2 ring-primary/20">
            <AvatarImage src={avatarBoy} alt="Avatar" className="object-cover" />
            <AvatarFallback className="bg-blue-light text-primary font-bold text-xl">
              K
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground leading-tight">{getGreeting()}</p>
            <h2 className="font-bold text-lg text-foreground leading-tight">Khách</h2>
          </div>
        </div>
        
        <Link to="/auth">
          <Button className="gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </Link>
      </header>
    );
  }

  // Khi đã đăng nhập
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Bạn';
  const totalActivities = profile?.total_activities || 13;
  const totalPoints = profile?.total_points || 100;

  return (
    <header className="py-3 animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar className="h-12 w-12 flex-shrink-0 border-3 border-card shadow-lg ring-2 ring-primary/20 cursor-pointer hover:ring-4 hover:ring-primary/30 transition-all">
                  <AvatarImage src={avatarBoy} alt="Avatar" className="object-cover" />
                  <AvatarFallback className="bg-blue-light text-primary font-bold text-base">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-card border shadow-lg z-50">
              <div className="px-3 py-2">
                <p className="font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/achievements')} className="cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                Hoạt động đã thực hiện
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Quản trị
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex flex-col min-w-0">
            <p className="text-xs text-white/80 leading-tight">{getGreeting()}</p>
            <h2 className="font-bold text-sm text-white leading-tight truncate">{displayName}</h2>
            
            {/* Stats Badges - Always horizontal with light colors */}
            <div className="flex items-center gap-1 mt-1 flex-nowrap">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-semibold whitespace-nowrap border border-white/30">
                🏃 {totalActivities} hoạt động
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-semibold whitespace-nowrap border border-white/30">
                🏆 {totalPoints} điểm
              </span>
            </div>
          </div>
        </div>
        
        {/* Right: Date Badge - Clickable */}
        <button
          onClick={() => navigate(`/activities?month=${currentMonth}&year=${currentYear}`)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-2xl shadow-lg hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="h-6 w-6" />
          <div className="text-center leading-tight">
            <div className="text-xs font-bold">{new Date().getDate()} {MONTHS[currentMonth]}</div>
            <div className="text-base font-bold">{currentYear}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
