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
    if (hour < 12) return 'Chào buổi sáng!';
    if (hour < 18) return 'Chào buổi chiều!';
    return 'Chào buổi tối!';
  };

  // Khi chưa đăng nhập
  if (!user) {
    return (
      <header className="flex items-center justify-between p-4 bg-card rounded-2xl card-shadow animate-fade-in">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-card shadow-md">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
              K
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h2 className="font-bold text-lg text-foreground">Khách</h2>
          </div>
        </div>
        
        <Link to="/auth">
          <Button className="gap-2 rounded-full">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </Link>
      </header>
    );
  }

  // Khi đã đăng nhập
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Bạn';
  const totalActivities = profile?.total_activities || 0;
  const totalPoints = profile?.total_points || 0;

  return (
    <header className="bg-card rounded-2xl p-4 card-shadow animate-fade-in">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-card shadow-md">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h2 className="font-bold text-lg text-foreground">{displayName}</h2>
          </div>
        </div>
        
        {/* Right: Month Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
          <Calendar className="h-4 w-4" />
          <span>{MONTHS[currentMonth]} {currentYear}</span>
        </div>
      </div>
      
      {/* Stats Badges */}
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-pink text-secondary-foreground rounded-full text-sm font-medium">
          <span>🏃</span>
          <span>{totalActivities} hoạt động</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium">
          <span>🏆</span>
          <span>{totalPoints} điểm</span>
        </div>
      </div>
    </header>
  );
}
