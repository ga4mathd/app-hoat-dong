import { useState } from 'react';
import { MoreHorizontal, UserCog, Shield, GraduationCap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RoleDialog } from './RoleDialog';
import type { AppRole } from '@/hooks/useRole';

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
}

interface UserTableProps {
  users: UserWithRole[];
  onRoleChange: (userId: string, newRole: AppRole) => Promise<void>;
  loading?: boolean;
}

const getRoleBadge = (role: AppRole) => {
  switch (role) {
    case 'admin':
      return (
        <Badge variant="destructive" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    case 'expert':
      return (
        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
          <GraduationCap className="h-3 w-3" />
          Chuyên gia
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <User className="h-3 w-3" />
          User
        </Badge>
      );
  }
};

export function UserTable({ users, onRoleChange, loading }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRoleClick = (user: UserWithRole) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleRoleSave = async (newRole: AppRole) => {
    if (selectedUser) {
      await onRoleChange(selectedUser.user_id, newRole);
      setDialogOpen(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Chưa có người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'Chưa đặt tên'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {user.user_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleClick(user)}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Đổi vai trò
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RoleDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleRoleSave}
      />
    </>
  );
}
