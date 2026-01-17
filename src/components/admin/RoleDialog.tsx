import { useState, useEffect } from 'react';
import { Shield, GraduationCap, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { AppRole } from '@/hooks/useRole';

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: { user_id: string; full_name: string | null; role: AppRole } | null;
  onSave: (role: AppRole) => Promise<void>;
}

export function RoleDialog({ open, onClose, user, onSave }: RoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedRole);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Cập nhật vai trò cho: {user?.full_name || 'Người dùng'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
            <div className="space-y-3">
              <Label
                htmlFor="role-user"
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === 'user' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value="user" id="role-user" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4" />
                    User (Mặc định)
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Người dùng thông thường, chỉ xem nội dung
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="role-expert"
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === 'expert' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value="expert" id="role-expert" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Chuyên gia (Expert)
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Có quyền upload và quản lý nội dung
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="role-admin"
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === 'admin' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value="admin" id="role-admin" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Shield className="h-4 w-4 text-destructive" />
                    Admin
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Toàn quyền quản trị, bao gồm quản lý người dùng
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
