import { Crown, LogIn, User, History, LogOut, Shield, Flame, Star } from 'lucide-react';
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
import DateBadge from './DateBadge';
import ActivityCalendarDialog from './ActivityCalendarDialog';

interface Profile {
  full_name: string | null;
  current_streak?: number | null;
}

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Buổi sáng tốt lành', emoji: '🌅' };
  if (hour < 18) return { text: 'Chào buổi chiều', emoji: '☀️' };
  return { text: 'Chào buổi tối', emoji: '🌙' };
};

export function SimpleHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const greeting = getGreeting();

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          // Fetch current_streak separately since types may not be updated yet
          supabase.rpc('check_subscription_status').then(() => {
            // After rpc call, re-fetch profile with streak
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle()
              .then(({ data: fullData }) => {
                if (fullData) {
                  setProfile({
                    full_name: fullData.full_name,
                    current_streak: (fullData as any).current_streak || 0
                  });
                }
              });
          });
          if (data) {
            setProfile({
              full_name: data.full_name,
              current_streak: 0
            });
          }
        });
    }
  }, [user]);

  // Khi chưa đăng nhập
  if (!user) {
    return (
      <header className="flex items-center justify-between py-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink via-purple to-blue rounded-full blur opacity-40" />
            <Avatar className="relative h-12 w-12 border-3 border-white shadow-lg">
              <AvatarImage src={avatarBoy} alt="Avatar" className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-light to-pink-light text-primary font-bold">K</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{greeting.emoji} {greeting.text}</p>
            <span className="font-bold text-foreground text-lg">Chào bạn!</span>
          </div>
        </div>
        
        <Link to="/auth">
          <Button size="sm" className="gap-2 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white px-5 shadow-lg btn-bounce font-bold">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </Link>
      </header>
    );
  }

  const displayName = profile?.full_name?.split(' ').slice(-1)[0] || user?.email?.split('@')[0] || 'Bạn';
  const streak = profile?.current_streak || 0;

  return (
    <header className="flex items-center justify-between py-3 animate-fade-in">
      {/* Left: Avatar + Name */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 focus:outline-none hover:opacity-90 transition-all group">
            <div className="relative">
              {/* Rainbow gradient border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink via-purple to-blue rounded-full blur opacity-50 group-hover:opacity-70 transition-opacity" />
              <Avatar className="relative h-12 w-12 border-3 border-white shadow-lg">
                <AvatarImage src={avatarBoy} alt="Avatar" className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-blue-light to-pink-light text-primary font-bold text-base">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isPro && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow to-orange rounded-full p-1 shadow-lg border-2 border-white animate-bounce" style={{ animationDuration: '3s' }}>
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {greeting.emoji} {greeting.text}
              </p>
              <span className="font-bold text-foreground text-base">{displayName}!</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 bg-card border-2 shadow-xl rounded-2xl z-50">
          <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-pink/10 rounded-t-xl">
            <p className="font-bold text-foreground">{profile?.full_name || displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer py-3 px-4">
            <User className="mr-3 h-5 w-5 text-primary" />
            <span className="font-medium">Thông tin cá nhân</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/achievements')} className="cursor-pointer py-3 px-4">
            <History className="mr-3 h-5 w-5 text-purple" />
            <span className="font-medium">Lịch sử hoạt động</span>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer py-3 px-4">
              <Shield className="mr-3 h-5 w-5 text-orange" />
              <span className="font-medium">Quản trị</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive py-3 px-4">
            <LogOut className="mr-3 h-5 w-5" />
            <span className="font-medium">Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Center: Date Badge */}
      <DateBadge onClick={() => setCalendarOpen(true)} />
      
      {/* Right: Streak Badge with flame animation */}
      <button 
        onClick={() => setCalendarOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg ${
          streak > 0 
            ? 'bg-gradient-to-r from-orange to-orange-gradient-end text-white' 
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <div className={`relative ${streak > 0 ? 'animate-wiggle' : ''}`}>
          <Flame className={`h-5 w-5 ${streak > 0 ? 'text-yellow' : ''}`} />
          {streak > 0 && (
            <Star className="absolute -top-1 -right-1 h-2.5 w-2.5 text-yellow fill-yellow animate-sparkle" />
          )}
        </div>
        <span className="text-base">{streak}</span>
      </button>

      {/* Calendar Dialog */}
      <ActivityCalendarDialog open={calendarOpen} onOpenChange={setCalendarOpen} />
    </header>
  );
}
