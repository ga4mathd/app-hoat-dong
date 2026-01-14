import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Home, Crown, RefreshCw } from 'lucide-react';

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');

  useEffect(() => {
    const processPayment = async () => {
      if (!orderId) {
        setProcessing(false);
        return;
      }

      try {
        // For demo mode, simulate successful payment
        if (status === 'demo') {
          // Call upgrade function
          const { data, error } = await supabase.rpc('upgrade_to_pro', {
            p_order_id: orderId,
            p_transaction_id: `DEMO_${Date.now()}`,
          });

          if (error) throw error;

          const result = data as { success: boolean; error?: string };
          
          if (result.success) {
            setSuccess(true);
            await refreshSubscription();
            toast({
              title: "🎉 Thanh toán thành công!",
              description: "Bạn đã nâng cấp lên tài khoản Pro.",
            });
          } else {
            throw new Error(result.error || 'Payment failed');
          }
        } else if (status === 'success') {
          // Real payment success callback
          setSuccess(true);
          await refreshSubscription();
        } else {
          setSuccess(false);
        }
      } catch (error: any) {
        console.error('Payment processing error:', error);
        setSuccess(false);
        toast({
          title: "Lỗi xử lý thanh toán",
          description: error.message || "Vui lòng liên hệ hỗ trợ.",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [orderId, status, refreshSubscription, toast]);

  if (processing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground">Đang xử lý thanh toán...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-background px-6">
        <div className="text-center max-w-[320px]">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Thanh toán thành công! 🎉
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Chúc mừng bạn đã trở thành thành viên Pro! 
            Hãy tận hưởng tất cả tính năng đặc biệt.
          </p>

          <div className="bg-card rounded-2xl p-4 shadow-lg mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Pro 1 năm</p>
              <p className="text-sm text-muted-foreground">Đã kích hoạt</p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/')}
            className="w-full h-12 text-lg rounded-xl"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-background px-6">
      <div className="text-center max-w-[320px]">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Thanh toán thất bại
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Đã có lỗi xảy ra trong quá trình thanh toán. 
          Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/upgrade')}
            className="w-full h-12 rounded-xl"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Thử lại
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full h-12 rounded-xl"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
