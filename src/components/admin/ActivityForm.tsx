import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tables } from '@/integrations/supabase/types';

type Activity = Tables<'activities'>;

interface ActivityFormProps {
  activity?: Activity | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Activity>) => void;
  loading?: boolean;
}

export const ActivityForm = ({ activity, open, onClose, onSave, loading }: ActivityFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: new Date(),
    tags: [] as string[],
    instructions: '',
    goals: '',
    video_url: '',
    points: 10,
    expert_name: 'Chuyên gia Jenna',
    expert_title: 'Chuyên gia Tâm lý Giáo dục',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        scheduled_date: activity.scheduled_date ? new Date(activity.scheduled_date) : new Date(),
        tags: activity.tags || [],
        instructions: activity.instructions || '',
        goals: activity.goals || '',
        video_url: activity.video_url || '',
        points: activity.points || 10,
        expert_name: activity.expert_name || 'Chuyên gia Jenna',
        expert_title: activity.expert_title || 'Chuyên gia Tâm lý Giáo dục',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        scheduled_date: new Date(),
        tags: [],
        instructions: '',
        goals: '',
        video_url: '',
        points: 10,
        expert_name: 'Chuyên gia Jenna',
        expert_title: 'Chuyên gia Tâm lý Giáo dục',
      });
    }
    setTagInput('');
  }, [activity, open]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      scheduled_date: format(formData.scheduled_date, 'yyyy-MM-dd'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Ngày hiển thị *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduled_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_date 
                      ? format(formData.scheduled_date, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, scheduled_date: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Điểm thưởng</Label>
              <Input
                id="points"
                type="number"
                min={0}
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tên hoạt động *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="VD: Vẽ tranh thiên nhiên"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về hoạt động..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Danh mục (Tags)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Nhập tag và nhấn Thêm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Thêm
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Hướng dẫn thực hiện</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Các bước thực hiện hoạt động..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Mục đích / Mục tiêu</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              placeholder="Mục tiêu đạt được sau hoạt động..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Link video hướng dẫn</Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expert_name">Tên chuyên gia</Label>
              <Input
                id="expert_name"
                value={formData.expert_name}
                onChange={(e) => setFormData(prev => ({ ...prev, expert_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expert_title">Chức danh</Label>
              <Input
                id="expert_title"
                value={formData.expert_title}
                onChange={(e) => setFormData(prev => ({ ...prev, expert_title: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? 'Đang lưu...' : activity ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
