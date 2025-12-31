import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Shield, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { ActivityTable } from '@/components/admin/ActivityTable';
import { ActivityForm } from '@/components/admin/ActivityForm';
import { ExcelImport } from '@/components/admin/ExcelImport';
import { Tables } from '@/integrations/supabase/types';

type Activity = Tables<'activities'>;

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách hoạt động',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchActivities();
    }
  }, [isAdmin]);

  // Add or update activity
  const handleSave = async (data: Partial<Activity>) => {
    setSaving(true);
    try {
      if (editingActivity) {
        const { error } = await supabase
          .from('activities')
          .update(data)
          .eq('id', editingActivity.id);
        
        if (error) throw error;
        toast({ title: 'Thành công', description: 'Đã cập nhật hoạt động' });
      } else {
        const insertData = {
          title: data.title as string,
          description: data.description,
          scheduled_date: data.scheduled_date,
          tags: data.tags,
          instructions: data.instructions,
          goals: data.goals,
          video_url: data.video_url,
          points: data.points,
          expert_name: data.expert_name,
          expert_title: data.expert_title,
        };
        
        const { error } = await supabase
          .from('activities')
          .insert(insertData);
        
        if (error) throw error;
        toast({ title: 'Thành công', description: 'Đã thêm hoạt động mới' });
      }
      
      setFormOpen(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (error: unknown) {
      console.error('Error saving activity:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể lưu hoạt động',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete activity
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: 'Thành công', description: 'Đã xóa hoạt động' });
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa hoạt động',
        variant: 'destructive',
      });
    }
  };

  // Import from Excel
  const handleImport = async (
    parsedActivities: Array<{
      scheduled_date: string;
      title: string;
      description: string;
      tags: string[];
      instructions: string;
      goals: string;
      video_url: string;
      points: number;
      expert_name: string;
      expert_title: string;
    }>,
    mode: 'add' | 'replace'
  ) => {
    setSaving(true);
    try {
      if (mode === 'replace') {
        // Delete all existing activities
        const { error: deleteError } = await supabase
          .from('activities')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        
        if (deleteError) throw deleteError;
      }

      // Insert new activities
      const { error } = await supabase
        .from('activities')
        .insert(parsedActivities);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: `Đã import ${parsedActivities.length} hoạt động`,
      });
      
      setImportOpen(false);
      fetchActivities();
    } catch (error: unknown) {
      console.error('Error importing activities:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể import hoạt động',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setEditingActivity(null);
    setFormOpen(true);
  };

  // Loading state
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <LogIn className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Vui lòng đăng nhập</h1>
          <p className="text-muted-foreground">
            Bạn cần đăng nhập để truy cập trang quản trị
          </p>
          <Button onClick={() => navigate('/auth')}>
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
          <p className="text-muted-foreground">
            Bạn không có quyền admin để truy cập trang này
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Quản trị hoạt động
              </h1>
              <p className="text-xs text-muted-foreground">
                Quản lý và import hoạt động cho ứng dụng
              </p>
            </div>
          </div>
          <Button onClick={() => setImportOpen(true)} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Import Excel
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ActivityTable
            activities={activities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        )}
      </main>

      {/* Activity Form Dialog */}
      <ActivityForm
        activity={editingActivity}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSave}
        loading={saving}
      />

      {/* Excel Import Dialog */}
      <ExcelImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        loading={saving}
      />
    </div>
  );
};

export default Admin;
