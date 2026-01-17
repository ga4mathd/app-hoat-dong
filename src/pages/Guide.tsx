import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Flame, Calendar, Gift, Star, CheckCircle2 } from 'lucide-react';

const Guide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Star,
      title: 'Hoạt động hàng ngày',
      content: 'Mỗi ngày sẽ có 1 hoạt động mới dành riêng cho bé. Các hoạt động được thiết kế bởi chuyên gia để phù hợp với từng độ tuổi và giúp bé phát triển toàn diện.'
    },
    {
      icon: CheckCircle2,
      title: 'Cách hoàn thành hoạt động',
      content: 'Đọc hướng dẫn và làm theo các bước. Sau khi làm xong hoạt động cùng bé, bấm nút "Hoàn thành" để ghi nhận và nhận điểm thưởng.'
    },
    {
      icon: Flame,
      title: 'Streak & Điểm thưởng',
      content: 'Làm hoạt động liên tục mỗi ngày để duy trì streak 🔥. Streak càng cao, điểm thưởng càng nhiều. Nếu bỏ lỡ 1 ngày, streak sẽ reset về 0.'
    },
    {
      icon: Calendar,
      title: 'Xem lịch hoạt động',
      content: 'Bấm vào badge ngày tháng ở góc trên để xem hoạt động của 7 ngày tiếp theo và lịch tháng. Bạn có thể lên kế hoạch trước cho các hoạt động sắp tới.'
    },
    {
      icon: Gift,
      title: 'Shop & Ưu đãi',
      content: 'Ghé thăm Shop để xem các sản phẩm, đồ chơi giáo dục được đề xuất. Đây là các sản phẩm chất lượng giúp bổ trợ cho hoạt động của bé.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Hướng dẫn sử dụng
          </h1>
          <p className="text-muted-foreground mt-2">
            Cách sử dụng app hiệu quả nhất cho bé
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-8">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {index + 1}. {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-8">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            💡 Mẹo nhỏ
          </h3>
          <p className="text-sm text-muted-foreground">
            Dành khoảng 15-30 phút mỗi ngày để làm hoạt động cùng bé. Thời điểm lý tưởng là sau bữa ăn hoặc trước khi đi ngủ.
          </p>
        </div>

        {/* Home Button */}
        <Button 
          onClick={() => navigate('/')}
          className="w-full h-14 text-lg font-semibold gap-2"
          size="lg"
        >
          <Home className="h-5 w-5" />
          Quay về trang chủ
        </Button>
      </div>
    </div>
  );
};

export default Guide;
