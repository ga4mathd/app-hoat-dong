import { useState } from 'react';
import { Crown, UserX, Clock, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubscriptionDialog } from './SubscriptionDialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

interface SubscriptionTableProps {
  users: SubscriptionUser[];
  loading: boolean;
  onRefresh: () => void;
}

export function SubscriptionTable({ users, loading, onRefresh }: SubscriptionTableProps) {
  const [selectedUser, setSelectedUser] = useState<SubscriptionUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'upgrade' | 'revoke' | 'extend'>('upgrade');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pro':
        return <Badge className="bg-primary text-primary-foreground"><Crown className="h-3 w-3 mr-1" />Pro</Badge>;
      case 'trial':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Trial</Badge>;
      case 'expired':
        return <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" />Hết hạn</Badge>;
      default:
        return <Badge variant="outline">Chờ kích hoạt</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const openDialog = (user: SubscriptionUser, action: 'upgrade' | 'revoke' | 'extend') => {
    setSelectedUser(user);
    setDialogAction(action);
    setDialogOpen(true);
  };

  // Stats
  const proCount = users.filter(u => u.subscription_status === 'pro').length;
  const trialCount = users.filter(u => u.subscription_status === 'trial').length;
  const expiredCount = users.filter(u => u.subscription_status === 'expired').length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-sm text-muted-foreground">Tổng người dùng</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="text-2xl font-bold text-primary">{proCount}</div>
          <div className="text-sm text-muted-foreground">Pro Members</div>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <div className="text-2xl font-bold text-secondary-foreground">{trialCount}</div>
          <div className="text-sm text-muted-foreground">Đang dùng thử</div>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <div className="text-2xl font-bold text-destructive">{expiredCount}</div>
          <div className="text-sm text-muted-foreground">Đã hết hạn</div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày hết hạn</TableHead>
              <TableHead>Còn lại</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Chưa có người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const expiresAt = user.subscription_status === 'pro' 
                  ? user.pro_expires_at 
                  : user.subscription_status === 'trial' 
                    ? user.trial_ends_at 
                    : null;
                const daysRemaining = getDaysRemaining(expiresAt);

                return (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="font-medium">{user.full_name || 'Chưa cập nhật'}</div>
                      <div className="text-xs text-muted-foreground">
                        Đăng ký: {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                      {user.phone_number && (
                        <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                    <TableCell>{formatDate(expiresAt)}</TableCell>
                    <TableCell>
                      {daysRemaining !== null ? (
                        <span className={daysRemaining <= 7 ? 'text-destructive font-medium' : ''}>
                          {daysRemaining} ngày
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.subscription_status !== 'pro' && (
                            <DropdownMenuItem onClick={() => openDialog(user, 'upgrade')}>
                              <Crown className="h-4 w-4 mr-2 text-primary" />
                              Nâng cấp Pro
                            </DropdownMenuItem>
                          )}
                          {user.subscription_status === 'pro' && (
                            <>
                              <DropdownMenuItem onClick={() => openDialog(user, 'extend')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Gia hạn Pro
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDialog(user, 'revoke')}
                                className="text-destructive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Thu hồi Pro
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <SubscriptionDialog
        user={selectedUser}
        action={dialogAction}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
}
