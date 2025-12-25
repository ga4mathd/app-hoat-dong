import { Calendar, LogIn } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function Header() {
  const { user } = useAuth();
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
      <header className="flex items-center justify-between py-2 animate-fade-in">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-3 border-card shadow-lg">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback className="bg-blue-light text-primary font-bold text-xl">
              K
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h2 className="font-bold text-lg text-foreground">Khách</h2>
          </div>
        </div>
        
        <Link to="/auth">
          <Button className="gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2">
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
    <header className="py-2 animate-fade-in">
      <div className="flex items-start justify-between">
        {/* Left: Avatar + Info + Badges */}
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-3 border-card shadow-lg">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback className="bg-blue-light text-primary font-bold text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h2 className="font-bold text-xl text-foreground">{displayName}</h2>
            {/* Stats Badges inline */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-pink/20 text-pink rounded-full text-xs font-semibold">
                <span>🏃</span>
                <span>{totalActivities} hoạt động</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/30 text-orange rounded-full text-xs font-semibold">
                <span>🏆</span>
                <span>{totalPoints} điểm</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Month Badge */}
        <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-lg">
          <Calendar className="h-5 w-5" />
          <div className="text-center leading-tight">
            <div>{MONTHS[currentMonth]}</div>
            <div>{currentYear}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
