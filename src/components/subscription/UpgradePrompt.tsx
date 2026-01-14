import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function UpgradePrompt({ 
  title = "Nội dung dành cho thành viên Pro",
  description = "Nâng cấp để xem chi tiết đầy đủ",
  compact = false 
}: UpgradePromptProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
        <Button
          onClick={() => navigate('/upgrade')}
          size="sm"
          variant="outline"
          className="h-8"
        >
          <Crown className="w-3 h-3 mr-1" />
          Nâng cấp
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-6 text-center border border-primary/20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="font-bold text-lg text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6">
        {description}
      </p>

      <Button
        onClick={() => navigate('/upgrade')}
        className="w-full h-12 rounded-xl"
        size="lg"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Nâng cấp Pro ngay
      </Button>

      <p className="text-xs text-muted-foreground mt-3">
        Chỉ 99.000đ/năm • Truy cập tất cả tính năng
      </p>
    </div>
  );
}
