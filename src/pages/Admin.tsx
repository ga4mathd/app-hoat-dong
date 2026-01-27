import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Shield, LogIn, Users, Crown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRole, type AppRole } from '@/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { ActivityTable } from '@/components/admin/ActivityTable';
import { ActivityForm } from '@/components/admin/ActivityForm';
import { ExcelImport } from '@/components/admin/ExcelImport';
import { StoryMusicTable } from '@/components/admin/StoryMusicTable';
import { StoryMusicImport } from '@/components/admin/StoryMusicImport';
import { ShopProductTable } from '@/components/admin/ShopProductTable';
import { ShopProductImport } from '@/components/admin/ShopProductImport';
import { UserTable } from '@/components/admin/UserTable';
import { SubscriptionTable } from '@/components/admin/SubscriptionTable';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { Tables } from '@/integrations/supabase/types';
import { convertToEmbedUrl } from '@/lib/youtube';

type Activity = Tables<'activities'>;
type StoryMusic = Tables<'stories_music'>;
type ShopProduct = Tables<'shop_products'>;

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
}

interface SubscriptionUser {
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  subscription_status: string;
  activated_at: string | null;
  trial_ends_at: string | null;
  pro_expires_at: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, hasContentAccess, loading: roleLoading } = useRole();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [storiesMusic, setStoriesMusic] = useState<StoryMusic[]>([]);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [subscriptionUsers, setSubscriptionUsers] = useState<SubscriptionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [storyMusicImportOpen, setStoryMusicImportOpen] = useState(false);
  const [shopProductImportOpen, setShopProductImportOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState('activities');

  const fetchActivities = async () => {
    const { data } = await supabase.from('activities').select('*').order('scheduled_date', { ascending: false });
    setActivities(data || []);
  };

  const fetchStoriesMusic = async () => {
    const { data } = await supabase.from('stories_music').select('*').order('created_at', { ascending: false });
    setStoriesMusic(data || []);
  };

  const fetchShopProducts = async () => {
    const { data } = await supabase.from('shop_products').select('*').order('created_at', { ascending: false });
    setShopProducts(data || []);
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setUsersLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
      }

      // Combine profiles with their roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          user_id: profile.user_id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: (userRole?.role as AppRole) || 'user'
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (hasContentAccess) {
      Promise.all([fetchActivities(), fetchStoriesMusic(), fetchShopProducts()]).finally(() => setLoading(false));
    }
  }, [hasContentAccess]);

  const fetchSubscriptions = async () => {
    if (!isAdmin) return;
    
    setSubscriptionsLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_all_subscriptions');
      
      if (error) {
        console.error('Error fetching subscriptions:', error);
        return;
      }
      
      setSubscriptionUsers((data as SubscriptionUser[]) || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchSubscriptions();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      // First, delete existing role for this user
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // If new role is not 'user', insert the new role
      if (newRole !== 'user') {
        const { error } = await supabase.from('user_roles').insert({
          user_id: userId,
          role: newRole
        });

        if (error) {
          throw error;
        }
      }

      toast({ title: 'Thành công', description: 'Đã cập nhật vai trò' });
      fetchUsers();
    } catch (error) {
      console.error('Error changing role:', error);
      toast({ title: 'Lỗi', description: 'Không thể cập nhật vai trò', variant: 'destructive' });
    }
  };

  const handleSave = async (data: Partial<Activity>) => {
    setSaving(true);
    try {
      const saveData = { ...data, video_url: convertToEmbedUrl(data.video_url) || data.video_url };
      if (editingActivity) {
        const { error } = await supabase.from('activities').update(saveData).eq('id', editingActivity.id);
        if (error) {
          if (error.code === '42501' || error.message?.includes('row-level security')) {
            toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
            return;
          }
          throw error;
        }
        toast({ title: 'Thành công', description: 'Đã cập nhật hoạt động' });
      } else {
        const { error } = await supabase.from('activities').insert({ title: saveData.title as string, ...saveData });
        if (error) {
          if (error.code === '42501' || error.message?.includes('row-level security')) {
            toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
            return;
          }
          throw error;
        }
        toast({ title: 'Thành công', description: 'Đã thêm hoạt động mới' });
      }
      setFormOpen(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể lưu hoạt động', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        toast({ title: 'Không có quyền', description: 'Bạn không có quyền xóa hoạt động này', variant: 'destructive' });
        return;
      }
      toast({ title: 'Lỗi', description: 'Không thể xóa hoạt động', variant: 'destructive' });
      return;
    }
    toast({ title: 'Thành công', description: 'Đã xóa hoạt động' });
    fetchActivities();
  };

  const handleImport = async (parsedActivities: Array<{ scheduled_date: string; title: string; description: string; tags: string[]; instructions: string; goals: string; video_url: string; points: number; expert_name: string; expert_title: string; image_url: string; expert_avatar: string }>, mode: 'add' | 'replace') => {
    setSaving(true);
    try {
      if (mode === 'replace') {
        const { error: deleteError } = await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError?.code === '42501' || deleteError?.message?.includes('row-level security')) {
          toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
          return;
        }
      }
      const { error } = await supabase.from('activities').insert(parsedActivities);
      if (error?.code === '42501' || error?.message?.includes('row-level security')) {
        toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
        return;
      }
      if (error) throw error;
      toast({ title: 'Thành công', description: `Đã import ${parsedActivities.length} hoạt động` });
      setImportOpen(false);
      fetchActivities();
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể import hoạt động', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleStoryMusicImport = async (data: Array<{ title: string; type: string; description: string | null; content_url: string | null; thumbnail_url: string | null; duration_minutes: number | null }>, mode: 'add' | 'replace') => {
    setSaving(true);
    try {
      if (mode === 'replace') {
        const { error: deleteError } = await supabase.from('stories_music').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError?.code === '42501' || deleteError?.message?.includes('row-level security')) {
          toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
          return;
        }
      }
      const { error } = await supabase.from('stories_music').insert(data);
      if (error?.code === '42501' || error?.message?.includes('row-level security')) {
        toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
        return;
      }
      if (error) throw error;
      toast({ title: 'Thành công', description: `Đã import ${data.length} mục` });
      setStoryMusicImportOpen(false);
      fetchStoriesMusic();
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể import', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleShopProductImport = async (data: Array<{ name: string; description: string | null; price: number | null; image_url: string | null; category: string | null; link: string | null }>, mode: 'add' | 'replace') => {
    setSaving(true);
    try {
      if (mode === 'replace') {
        const { error: deleteError } = await supabase.from('shop_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError?.code === '42501' || deleteError?.message?.includes('row-level security')) {
          toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
          return;
        }
      }
      const { error } = await supabase.from('shop_products').insert(data);
      if (error?.code === '42501' || error?.message?.includes('row-level security')) {
        toast({ title: 'Không có quyền', description: 'Bạn không có quyền thực hiện thao tác này', variant: 'destructive' });
        return;
      }
      if (error) throw error;
      toast({ title: 'Thành công', description: `Đã import ${data.length} sản phẩm` });
      setShopProductImportOpen(false);
      fetchShopProducts();
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể import', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4"><div className="text-center space-y-4"><LogIn className="h-16 w-16 mx-auto text-muted-foreground" /><h1 className="text-2xl font-bold">Vui lòng đăng nhập</h1><Button onClick={() => navigate('/auth')}>Đăng nhập</Button></div></div>;
  }

  if (!hasContentAccess) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4"><div className="text-center space-y-4"><Shield className="h-16 w-16 mx-auto text-destructive" /><h1 className="text-2xl font-bold">Không có quyền truy cập</h1><p className="text-muted-foreground">Bạn cần có vai trò Admin hoặc Chuyên gia để truy cập trang này</p><Button variant="outline" onClick={() => navigate('/')}>Về trang chủ</Button></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Quản trị</h1>
            </div>
          </div>
          {activeTab !== 'users' && activeTab !== 'analytics' && (
            <Button onClick={() => {
              if (activeTab === 'activities') setImportOpen(true);
              else if (activeTab === 'stories') setStoryMusicImportOpen(true);
              else setShopProductImportOpen(true);
            }} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />Import Excel
            </Button>
          )}
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="activities">Hoạt động</TabsTrigger>
            <TabsTrigger value="stories">Truyện & Nhạc</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="analytics" className="gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="gap-1">
                  <Crown className="h-4 w-4" />
                  Subscriptions
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-1">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="activities">
            {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : (
              <ActivityTable activities={activities} onEdit={(a) => { setEditingActivity(a); setFormOpen(true); }} onDelete={handleDelete} onAdd={() => { setEditingActivity(null); setFormOpen(true); }} />
            )}
          </TabsContent>
          
          <TabsContent value="stories">
            <StoryMusicTable items={storiesMusic} onEdit={() => {}} onDelete={async (id) => { await supabase.from('stories_music').delete().eq('id', id); fetchStoriesMusic(); }} onAdd={() => setStoryMusicImportOpen(true)} />
          </TabsContent>
          
          <TabsContent value="shop">
            <ShopProductTable items={shopProducts} onEdit={() => {}} onDelete={async (id) => { await supabase.from('shop_products').delete().eq('id', id); fetchShopProducts(); }} onAdd={() => setShopProductImportOpen(true)} />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>
              <TabsContent value="subscriptions">
                <SubscriptionTable 
                  users={subscriptionUsers}
                  loading={subscriptionsLoading}
                  onRefresh={fetchSubscriptions}
                />
              </TabsContent>
              <TabsContent value="users">
                <UserTable 
                  users={users} 
                  onRoleChange={handleRoleChange}
                  loading={usersLoading}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <ActivityForm activity={editingActivity} open={formOpen} onClose={() => { setFormOpen(false); setEditingActivity(null); }} onSave={handleSave} loading={saving} />
      <ExcelImport open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} loading={saving} />
      <StoryMusicImport open={storyMusicImportOpen} onClose={() => setStoryMusicImportOpen(false)} onImport={handleStoryMusicImport} loading={saving} />
      <ShopProductImport open={shopProductImportOpen} onClose={() => setShopProductImportOpen(false)} onImport={handleShopProductImport} loading={saving} />
    </div>
  );
};

export default Admin;
