import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Users, Eye, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RealtimeStats {
  online_users: number;
  today_views: number;
  today_unique_users: number;
  today_avg_duration: number;
}

interface DailyAnalytics {
  date: string;
  page_views: number;
  unique_users: number;
  sessions: number;
  avg_duration_seconds: number;
}

interface PopularPage {
  page_path: string;
  view_count: number;
  unique_viewers: number;
}

const chartConfig = {
  page_views: {
    label: "Lượt xem",
    color: "hsl(var(--primary))",
  },
  unique_users: {
    label: "Người dùng",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

const pageNameMap: Record<string, string> = {
  '/': 'Trang chủ',
  '/auth': 'Đăng nhập',
  '/activities': 'Hoạt động',
  '/stories-music': 'Truyện & Nhạc',
  '/shop': 'Shop',
  '/profile': 'Hồ sơ',
  '/achievements': 'Thành tích',
  '/development': 'Phát triển',
  '/ask-expert': 'Hỏi chuyên gia',
  '/admin': 'Quản trị',
  '/upgrade': 'Nâng cấp',
  '/guide': 'Hướng dẫn',
};

const getPageName = (path: string): string => {
  if (pageNameMap[path]) return pageNameMap[path];
  if (path.startsWith('/activity/')) return 'Chi tiết hoạt động';
  return path;
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const AnalyticsDashboard = () => {
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState<string>('7');

  const fetchData = useCallback(async () => {
    try {
      const [realtimeResult, dailyResult, pagesResult] = await Promise.all([
        supabase.rpc('admin_get_realtime_stats'),
        supabase.rpc('admin_get_daily_analytics', { p_days: parseInt(days) }),
        supabase.rpc('admin_get_popular_pages', { p_days: parseInt(days) })
      ]);

      if (realtimeResult.data) {
        setRealtimeStats(realtimeResult.data as unknown as RealtimeStats);
      }

      if (dailyResult.data) {
        setDailyAnalytics(dailyResult.data as unknown as DailyAnalytics[]);
      }

      if (pagesResult.data) {
        setPopularPages(pagesResult.data as unknown as PopularPage[]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const chartData = dailyAnalytics.map(item => ({
    ...item,
    dateLabel: format(new Date(item.date), 'dd/MM', { locale: vi })
  }));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Thống kê truy cập</h2>
          <p className="text-sm text-muted-foreground">
            Theo dõi lượt truy cập và thời gian sử dụng app
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="14">14 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Realtime Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đang online</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.online_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Hoạt động trong 5 phút qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượt xem hôm nay</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.today_views || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tổng page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Người dùng hôm nay</CardTitle>
            <Users className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.today_unique_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thời gian TB</CardTitle>
            <Clock className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(realtimeStats?.today_avg_duration || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mỗi phiên hôm nay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng truy cập</CardTitle>
          <CardDescription>
            Lượt xem và số người dùng trong {days} ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dateLabel" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
                <Line 
                  type="monotone" 
                  dataKey="page_views" 
                  stroke="var(--color-page_views)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-page_views)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="unique_users" 
                  stroke="var(--color-unique_users)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-unique_users)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Popular Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trang phổ biến</CardTitle>
          <CardDescription>
            Top 10 trang được xem nhiều nhất trong {days} ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trang</TableHead>
                <TableHead className="text-right">Lượt xem</TableHead>
                <TableHead className="text-right">Người xem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                popularPages.map((page, index) => (
                  <TableRow key={page.page_path}>
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground mr-2">#{index + 1}</span>
                      {getPageName(page.page_path)}
                    </TableCell>
                    <TableCell className="text-right">{page.view_count}</TableCell>
                    <TableCell className="text-right">{page.unique_viewers}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
