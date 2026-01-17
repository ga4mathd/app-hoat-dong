import { ArrowLeft, MessageCircleQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { BottomActions } from '@/components/home/BottomActions';

export default function AskExpert() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Hỏi chuyên gia</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <MessageCircleQuestion className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Sắp ra mắt!</h2>
        <p className="text-muted-foreground max-w-sm">
          Tính năng hỏi đáp với chuyên gia nuôi dạy con sẽ sớm được cập nhật. Bạn sẽ có thể đặt câu hỏi và nhận tư vấn từ các chuyên gia hàng đầu.
        </p>
      </div>

      <BottomActions />
    </div>
  );
}
