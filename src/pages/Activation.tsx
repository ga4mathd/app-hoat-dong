import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Gift, Clock, CheckCircle2 } from 'lucide-react';

const Activation = () => {
  const navigate = useNavigate();
  const { activateTrial, isPendingActivation, loading } = useSubscription();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    const result = await activateTrial();
    setActivating(false);

    if (result.success) {
      toast({
        title: "🎉 Kích hoạt thành công!",
        description: "Bạn có 30 ngày dùng thử miễn phí tất cả tính năng.",
      });
      navigate('/');
    } else {
      toast({
        title: "Lỗi kích hoạt",
        description: result.error || "Không thể kích hoạt tài khoản. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isPendingActivation) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="w-full max-w-[400px] mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Chào mừng bạn đến với App Hoạt Động! 🎊
          </h1>
          <p className="text-muted-foreground">
            Kích hoạt tài khoản để bắt đầu trải nghiệm
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quyền lợi 30 ngày dùng thử
          </h2>
          <ul className="space-y-3">
            {[
              "Truy cập tất cả hoạt động hàng ngày",
              "Xem chi tiết hướng dẫn đầy đủ",
              "Theo dõi thành tích của bé",
              "Xem video và truyện cổ tích",
              "Tích lũy điểm thưởng",
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trial Info */}
        <div className="bg-primary/10 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              30 ngày miễn phí
            </p>
            <p className="text-xs text-muted-foreground">
              Sau đó nâng cấp Pro để tiếp tục sử dụng
            </p>
          </div>
        </div>

        {/* Activate Button */}
        <Button
          onClick={handleActivate}
          disabled={activating}
          className="w-full h-14 text-lg font-semibold rounded-xl"
          size="lg"
        >
          {activating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
              Đang kích hoạt...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Bắt đầu dùng thử miễn phí
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Không cần thẻ tín dụng • Hủy bất cứ lúc nào
        </p>
      </div>
    </div>
  );
};

export default Activation;
