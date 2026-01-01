import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Shield, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { ActivityTable } from '@/components/admin/ActivityTable';
import { ActivityForm } from '@/components/admin/ActivityForm';
import { ExcelImport } from '@/components/admin/ExcelImport';
import { StoryMusicTable } from '@/components/admin/StoryMusicTable';
import { StoryMusicImport } from '@/components/admin/StoryMusicImport';
import { ShopProductTable } from '@/components/admin/ShopProductTable';
import { ShopProductImport } from '@/components/admin/ShopProductImport';
import { Tables } from '@/integrations/supabase/types';
import { convertToEmbedUrl } from '@/lib/youtube';

type Activity = Tables<'activities'>;
type StoryMusic = Tables<'stories_music'>;
type ShopProduct = Tables<'shop_products'>;

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [storiesMusic, setStoriesMusic] = useState<StoryMusic[]>([]);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (isAdmin) {
      Promise.all([fetchActivities(), fetchStoriesMusic(), fetchShopProducts()]).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleSave = async (data: Partial<Activity>) => {
    setSaving(true);
    try {
      const saveData = { ...data, video_url: convertToEmbedUrl(data.video_url) || data.video_url };
      if (editingActivity) {
        await supabase.from('activities').update(saveData).eq('id', editingActivity.id);
        toast({ title: 'Thành công', description: 'Đã cập nhật hoạt động' });
      } else {
        await supabase.from('activities').insert({ title: saveData.title as string, ...saveData });
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
    await supabase.from('activities').delete().eq('id', id);
    toast({ title: 'Thành công', description: 'Đã xóa hoạt động' });
    fetchActivities();
  };

  const handleImport = async (parsedActivities: Array<{ scheduled_date: string; title: string; description: string; tags: string[]; instructions: string; goals: string; video_url: string; points: number; expert_name: string; expert_title: string; image_url: string; expert_avatar: string }>, mode: 'add' | 'replace') => {
    setSaving(true);
    try {
      if (mode === 'replace') await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('activities').insert(parsedActivities);
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
      if (mode === 'replace') await supabase.from('stories_music').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('stories_music').insert(data);
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
      if (mode === 'replace') await supabase.from('shop_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('shop_products').insert(data);
      toast({ title: 'Thành công', description: `Đã import ${data.length} sản phẩm` });
      setShopProductImportOpen(false);
      fetchShopProducts();
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể import', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || adminLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4"><div className="text-center space-y-4"><LogIn className="h-16 w-16 mx-auto text-muted-foreground" /><h1 className="text-2xl font-bold">Vui lòng đăng nhập</h1><Button onClick={() => navigate('/auth')}>Đăng nhập</Button></div></div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4"><div className="text-center space-y-4"><Shield className="h-16 w-16 mx-auto text-destructive" /><h1 className="text-2xl font-bold">Không có quyền truy cập</h1><Button variant="outline" onClick={() => navigate('/')}>Về trang chủ</Button></div></div>;
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
          <Button onClick={() => {
            if (activeTab === 'activities') setImportOpen(true);
            else if (activeTab === 'stories') setStoryMusicImportOpen(true);
            else setShopProductImportOpen(true);
          }} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />Import Excel
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="activities">Hoạt động</TabsTrigger>
            <TabsTrigger value="stories">Truyện & Nhạc</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
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
