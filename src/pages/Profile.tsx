import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, User, Mail, Edit2, Save, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/layout/BottomNav';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
    total_points: number;
    total_activities: number;
  } | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      supabase
        .from('profiles')
        .select('full_name, avatar_url, total_points, total_activities')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfile(data);
            setEditName(data.full_name || '');
          }
        });
    }
  }, [user, loading, navigate]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName })
      .eq('user_id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, full_name: editName } : null);
      setIsEditing(false);
      toast({
        title: 'Đã cập nhật!',
        description: 'Thông tin hồ sơ đã được lưu',
      });
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Người dùng';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Hồ sơ</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Avatar & Name */}
          <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-primary hover:underline flex items-center gap-1 mx-auto"
                >
                  <Edit2 className="h-4 w-4" />
                  Chỉnh sửa
                </button>
              </>
            )}
          </div>

          {/* Email */}
          <div className="bg-card rounded-2xl p-4 card-shadow animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card rounded-2xl p-4 card-shadow text-center">
              <p className="text-3xl font-bold text-primary">{profile?.total_points || 0}</p>
              <p className="text-sm text-muted-foreground">Tổng điểm</p>
            </div>
            <div className="bg-card rounded-2xl p-4 card-shadow text-center">
              <p className="text-3xl font-bold text-secondary">{profile?.total_activities || 0}</p>
              <p className="text-sm text-muted-foreground">Hoạt động</p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
