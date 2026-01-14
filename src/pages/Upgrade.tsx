import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles,
  Calendar,
  Star,
  Zap
} from 'lucide-react';

const PRICE = 99000; // 99,000 VND per year

const Upgrade = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, daysRemaining, isTrial, isExpired } = useSubscription();
  const { toast } = useToast();
  const [processingPayment, setProcessingPayment] = useState<'momo' | 'vnpay' | null>(null);

  const handlePayment = async (method: 'momo' | 'vnpay') => {
    if (!user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để nâng cấp tài khoản.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setProcessingPayment(method);

    try {
      // Create cryptographically random order ID to prevent enumeration attacks
      const orderId = `ORDER_${crypto.randomUUID()}`;

      // Create subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          payment_method: method,
          amount: PRICE,
          order_id: orderId,
        });

      if (subError) {
        throw subError;
      }

      // For now, show a demo message since MoMo/VNPay requires API keys
      toast({
        title: "Đang chuyển hướng...",
        description: `Kết nối đến cổng thanh toán ${method === 'momo' ? 'MoMo' : 'VNPay'}`,
      });

      // Simulate payment redirect - in production, this would redirect to actual payment gateway
      setTimeout(() => {
        // Navigate to payment result page with demo success
        navigate(`/payment-result?orderId=${orderId}&status=demo`);
      }, 1500);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: error.message || "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  if (isPro) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="text-center py-12 md:py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 mb-6">
              <Crown className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Bạn đã là thành viên Pro! 👑
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Cảm ơn bạn đã ủng hộ. Hãy tận hưởng tất cả tính năng!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-6 py-8 md:py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 shadow-lg">
            <Crown className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Nâng cấp lên Pro
          </h1>
          {isTrial && daysRemaining !== null && (
            <p className="text-muted-foreground md:text-lg">
              Còn <span className="font-semibold text-primary">{daysRemaining} ngày</span> dùng thử
            </p>
          )}
          {isExpired && (
            <p className="text-destructive md:text-lg">
              Thời gian dùng thử đã hết
            </p>
          )}
        </div>

        {/* Price Card */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xl border-2 border-primary/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg md:text-xl font-semibold text-foreground">Pro 1 năm</span>
            <div className="text-right">
              <span className="text-3xl md:text-4xl font-bold text-primary">99.000đ</span>
              <span className="text-sm md:text-base text-muted-foreground">/năm</span>
            </div>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 md:p-3 text-center">
            Chỉ ~8.250đ/tháng • Tiết kiệm hơn 50%
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg mb-8">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2 md:text-lg">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Quyền lợi Pro
          </h2>
          <ul className="space-y-3 md:space-y-4">
            {[
              { icon: Calendar, text: "365 ngày truy cập không giới hạn" },
              { icon: Zap, text: "Tất cả hoạt động chi tiết" },
              { icon: Star, text: "Nội dung độc quyền Pro" },
              { icon: CheckCircle2, text: "Hỗ trợ ưu tiên" },
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-foreground">{benefit.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => handlePayment('momo')}
            disabled={processingPayment !== null}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-[#ae2070] hover:bg-[#9c1b64] text-white"
            size="lg"
          >
            {processingPayment === 'momo' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" 
                  alt="MoMo" 
                  className="w-6 h-6 mr-2 rounded"
                />
                Thanh toán qua MoMo
              </>
            )}
          </Button>

          <Button
            onClick={() => handlePayment('vnpay')}
            disabled={processingPayment !== null}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-[#0066b3] hover:bg-[#005599] text-white"
            size="lg"
          >
            {processingPayment === 'vnpay' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <img 
                  src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" 
                  alt="VNPay" 
                  className="w-6 h-6 mr-2"
                />
                Thanh toán qua VNPay
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Thanh toán an toàn • Hỗ trợ 24/7
        </p>
      </div>
    </div>
  );
};

export default Upgrade;
