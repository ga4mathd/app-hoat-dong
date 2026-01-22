import { useState } from 'react';
import { Crown, UserX, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionUser {
  user_id: string;
  email: string;
  full_name: string | null;
  subscription_status: string;
}

interface SubscriptionDialogProps {
  user: SubscriptionUser | null;
  action: 'upgrade' | 'revoke' | 'extend';
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubscriptionDialog({ user, action, open, onClose, onSuccess }: SubscriptionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState('12');

  const handleAction = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let result;
      
      if (action === 'upgrade') {
        const { data, error } = await supabase.rpc('admin_upgrade_user_to_pro', {
          p_user_id: user.user_id,
          p_duration_months: parseInt(months)
        });
        if (error) throw error;
        result = data as { success: boolean; error?: string };
      } else if (action === 'revoke') {
        const { data, error } = await supabase.rpc('admin_revoke_pro', {
          p_user_id: user.user_id
        });
        if (error) throw error;
        result = data as { success: boolean; error?: string };
      } else if (action === 'extend') {
        const { data, error } = await supabase.rpc('admin_extend_pro', {
          p_user_id: user.user_id,
          p_months: parseInt(months)
        });
        if (error) throw error;
        result = data as { success: boolean; error?: string };
      }

      if (result?.success) {
        const messages = {
          upgrade: `Đã nâng cấp ${user.full_name || user.email} lên Pro ${months} tháng`,
          revoke: `Đã thu hồi Pro của ${user.full_name || user.email}`,
          extend: `Đã gia hạn Pro thêm ${months} tháng cho ${user.full_name || user.email}`
        };
        toast({ title: 'Thành công', description: messages[action] });
        onSuccess();
        onClose();
      } else {
        throw new Error(result?.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ 
        title: 'Lỗi', 
        description: error instanceof Error ? error.message : 'Không thể thực hiện thao tác', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getDialogContent = () => {
    switch (action) {
      case 'upgrade':
        return {
          title: 'Nâng cấp Pro',
          description: `Nâng cấp tài khoản ${user?.full_name || user?.email} lên gói Pro`,
          icon: <Crown className="h-5 w-5 text-primary" />,
          buttonText: 'Nâng cấp Pro',
          buttonVariant: 'default' as const,
          showMonthSelect: true
        };
      case 'revoke':
        return {
          title: 'Thu hồi Pro',
          description: `Bạn có chắc muốn thu hồi quyền Pro của ${user?.full_name || user?.email}? Tài khoản sẽ chuyển về trạng thái "Hết hạn".`,
          icon: <UserX className="h-5 w-5 text-destructive" />,
          buttonText: 'Thu hồi Pro',
          buttonVariant: 'destructive' as const,
          showMonthSelect: false
        };
      case 'extend':
        return {
          title: 'Gia hạn Pro',
          description: `Gia hạn thêm thời gian Pro cho ${user?.full_name || user?.email}`,
          icon: <Plus className="h-5 w-5 text-primary" />,
          buttonText: 'Gia hạn',
          buttonVariant: 'default' as const,
          showMonthSelect: true
        };
    }
  };

  const content = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.icon}
            {content.title}
          </DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        {content.showMonthSelect && (
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Số tháng</label>
            <Select value={months} onValueChange={setMonths}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 tháng</SelectItem>
                <SelectItem value="3">3 tháng</SelectItem>
                <SelectItem value="6">6 tháng</SelectItem>
                <SelectItem value="12">12 tháng (1 năm)</SelectItem>
                <SelectItem value="24">24 tháng (2 năm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            variant={content.buttonVariant}
            onClick={handleAction}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {content.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
