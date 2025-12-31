import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tables } from '@/integrations/supabase/types';

type Activity = Tables<'activities'>;

interface ActivityTableProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const ActivityTable = ({ activities, onEdit, onDelete, onAdd }: ActivityTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          Danh sách hoạt động ({activities.length})
        </h2>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm hoạt động
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Ngày</TableHead>
              <TableHead className="min-w-[200px]">Hoạt động</TableHead>
              <TableHead className="w-[150px]">Danh mục</TableHead>
              <TableHead className="w-[80px]">Điểm</TableHead>
              <TableHead className="w-[120px]">Video</TableHead>
              <TableHead className="w-[100px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Chưa có hoạt động nào. Hãy thêm hoạt động mới hoặc import từ Excel.
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.scheduled_date 
                      ? format(new Date(activity.scheduled_date), 'dd/MM/yyyy', { locale: vi })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">{activity.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {activity.description || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {activity.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(activity.tags?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(activity.tags?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.points || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {activity.video_url ? (
                      <a
                        href={activity.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Xem
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(activity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hoạt động này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
