import { Bell, Crown, LogIn, User, History, LogOut, Shield, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useSubscription } from '@/hooks/useSubscription';
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

export function SimpleHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  // Khi chưa đăng nhập
  if (!user) {
    return (
      <header className="flex items-center justify-between py-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-border shadow-sm">
            <AvatarImage src={avatarBoy} alt="Avatar" className="object-cover" />
            <AvatarFallback className="bg-blue-light text-primary font-bold">K</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">Chào bạn!</span>
        </div>
        
        <Link to="/auth">
          <Button size="sm" className="gap-2 rounded-full bg-primary text-primary-foreground px-4">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </Link>
      </header>
    );
  }

  const displayName = profile?.full_name?.split(' ').slice(-1)[0] || user?.email?.split('@')[0] || 'Bạn';

  return (
    <header className="flex items-center justify-between py-3 animate-fade-in">
      {/* Left: Avatar + Name */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 focus:outline-none hover:opacity-80 transition-opacity">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-border shadow-sm">
                <AvatarImage src={avatarBoy} alt="Avatar" className="object-cover" />
                <AvatarFallback className="bg-blue-light text-primary font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isPro && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-0.5 shadow border border-white">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
            <span className="font-semibold text-foreground">Chào {displayName}!</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-card border shadow-lg z-50">
          <div className="px-3 py-2">
            <p className="font-semibold text-foreground">{profile?.full_name || displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Thông tin cá nhân
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/achievements')} className="cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            Lịch sử hoạt động
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
      
      {/* Right: Notification */}
      <button
        onClick={() => navigate('/activities')}
        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
      >
        <Bell className="h-4.5 w-4.5 text-muted-foreground" />
      </button>
    </header>
  );
}
