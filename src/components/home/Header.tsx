import { Calendar, Bell, LogIn, User, History, LogOut, Shield, CheckCircle, AlertCircle, ListTodo } from 'lucide-react';
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

interface NotificationData {
  completedThisMonth: number;
  missedDays: string[];
  remainingActivities: number;
  totalActivitiesThisMonth: number;
}

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; total_activities: number; total_points: number } | null>(null);
  const [notifications, setNotifications] = useState<NotificationData>({
    completedThisMonth: 0,
    missedDays: [],
    remainingActivities: 0,
    totalActivitiesThisMonth: 0
  });

  useEffect(() => {
    if (user) {
      // Fetch profile
      supabase
        .from('profiles')
        .select('full_name, total_activities, total_points')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      // Fetch notification data
      fetchNotificationData(user.id);
    }
  }, [user]);

  const fetchNotificationData = async (userId: string) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    // Get all activities this month
    const { data: monthActivities } = await supabase
      .from('activities')
      .select('id, scheduled_date')
      .gte('scheduled_date', firstDayOfMonth)
      .lte('scheduled_date', lastDayOfMonth);

    // Get user's completed activities this month
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('activity_id, completed_at')
      .eq('user_id', userId);

    const completedActivityIds = new Set(userProgress?.map(p => p.activity_id) || []);
    
    // Calculate completed this month
    const completedThisMonth = monthActivities?.filter(a => completedActivityIds.has(a.id)).length || 0;
    
    // Calculate remaining activities (future activities not completed)
    const remainingActivities = monthActivities?.filter(
      a => a.scheduled_date && a.scheduled_date >= today && !completedActivityIds.has(a.id)
    ).length || 0;

    // Find missed days (past activities not completed)
    const missedActivities = monthActivities?.filter(
      a => a.scheduled_date && a.scheduled_date < today && !completedActivityIds.has(a.id)
    ) || [];
    
    const missedDays = missedActivities.map(a => {
      const date = new Date(a.scheduled_date!);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    });

    setNotifications({
      completedThisMonth,
      missedDays: missedDays.slice(0, 3), // Show max 3 missed days
      remainingActivities,
      totalActivitiesThisMonth: monthActivities?.length || 0
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  // Khi chưa đăng nhập
  if (!user) {
    return (
      <header className="flex items-center justify-between py-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-2 border-border shadow-md">
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
    <header className="py-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-border shadow-md cursor-pointer hover:shadow-lg transition-all">
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
            <p className="text-sm text-muted-foreground leading-tight">{getGreeting()}</p>
            <h2 className="font-bold text-lg text-[hsl(210,85%,35%)] leading-tight truncate">{displayName}</h2>
            
            {/* Stats Badges - Orange/Yellow colors */}
            <div className="flex items-center gap-2 mt-1.5 flex-nowrap">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange whitespace-nowrap">
                🚀 {totalActivities} hoạt động
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-yellow whitespace-nowrap">
                🏆 {totalPoints} điểm
              </span>
            </div>
          </div>
        </div>
        
        {/* Right: Calendar and Bell icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/activities')}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-all"
          >
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-all relative"
              >
                <Bell className="h-5 w-5 text-primary-foreground" />
                {(notifications.missedDays.length > 0 || notifications.remainingActivities > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                    {notifications.missedDays.length + (notifications.remainingActivities > 0 ? 1 : 0)}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-card border shadow-lg z-50">
              <div className="px-3 py-2 border-b">
                <p className="font-semibold text-foreground">Thông báo</p>
              </div>
              
              {/* Completed activities this month */}
              <DropdownMenuItem className="cursor-pointer flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Hoạt động đã thực hiện</p>
                  <p className="text-xs text-muted-foreground">
                    Bạn đã thực hiện <span className="font-bold text-green-600">{notifications.completedThisMonth}</span> hoạt động trong tháng này
                  </p>
                </div>
              </DropdownMenuItem>

              {/* Missed days notification */}
              {notifications.missedDays.length > 0 && (
                <DropdownMenuItem className="cursor-pointer flex items-start gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Ngày bỏ lỡ hoạt động</p>
                    <p className="text-xs text-muted-foreground">
                      Bạn đã không thực hiện hoạt động vào ngày: <span className="font-bold text-orange">{notifications.missedDays.join(', ')}</span>
                      {notifications.missedDays.length >= 3 && '...'}
                    </p>
                  </div>
                </DropdownMenuItem>
              )}

              {/* Remaining activities */}
              <DropdownMenuItem className="cursor-pointer flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ListTodo className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Hoạt động còn lại</p>
                  <p className="text-xs text-muted-foreground">
                    Tháng này còn <span className="font-bold text-primary">{notifications.remainingActivities}</span> hoạt động đang chờ bạn
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/achievements')} className="cursor-pointer justify-center text-primary font-medium">
                Xem tất cả hoạt động
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}