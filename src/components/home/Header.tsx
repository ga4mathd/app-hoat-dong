import { Bell, Settings, LogIn } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function Header() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; total_activities: number; total_points: number } | null>(null);

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
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Khi chưa đăng nhập
  if (!user) {
    return (
      <header className="flex items-center justify-between p-4 bg-card rounded-2xl card-shadow animate-fade-in">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h2 className="font-bold text-lg text-foreground">Khách</h2>
          </div>
        </div>
        
        <Link to="/auth">
          <Button className="gap-2">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </Link>
      </header>
    );
  }

  // Khi đã đăng nhập
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Bạn';

  return (
    <header className="flex items-center justify-between p-4 bg-card rounded-2xl card-shadow animate-fade-in">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
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
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-4 mr-2">
          <div className="text-center">
            <span className="text-xl font-bold text-primary">{profile?.total_activities || 0}</span>
            <p className="text-xs text-muted-foreground">Hoạt động</p>
          </div>
          <div className="text-center">
            <span className="text-xl font-bold text-secondary">{profile?.total_points || 0}</span>
            <p className="text-xs text-muted-foreground">Điểm</p>
          </div>
        </div>
        <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
