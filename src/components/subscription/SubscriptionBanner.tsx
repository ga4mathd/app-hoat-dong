import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Crown, Clock, AlertTriangle } from 'lucide-react';

export function SubscriptionBanner() {
  const navigate = useNavigate();
  const { status, daysRemaining, isTrial, isExpired, isPro, loading } = useSubscription();

  if (loading || isPro) return null;

  if (isExpired) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mx-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-destructive text-sm">
              Thời gian dùng thử đã hết
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nâng cấp Pro để tiếp tục sử dụng đầy đủ tính năng
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/upgrade')}
          size="sm"
          className="w-full mt-3 bg-destructive hover:bg-destructive/90"
        >
          <Crown className="w-4 h-4 mr-2" />
          Nâng cấp ngay
        </Button>
      </div>
    );
  }

  if (isTrial && daysRemaining !== null) {
    const isUrgent = daysRemaining <= 7;
    
    return (
      <div className={`${isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-primary/5 border-primary/10'} border rounded-xl p-4 mx-4 mb-4`}>
        <div className="flex items-start gap-3">
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-orange-500' : 'text-primary'} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`font-semibold text-sm ${isUrgent ? 'text-orange-700' : 'text-foreground'}`}>
              Còn {daysRemaining} ngày dùng thử
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nâng cấp Pro để không bị gián đoạn
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/upgrade')}
          size="sm"
          variant={isUrgent ? "default" : "outline"}
          className={`w-full mt-3 ${isUrgent ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          <Crown className="w-4 h-4 mr-2" />
          Nâng cấp Pro
        </Button>
      </div>
    );
  }

  return null;
}
