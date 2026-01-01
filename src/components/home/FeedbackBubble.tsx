import { useState } from 'react';
import { MessageCircle, Gift, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function FeedbackBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Vui lòng nhập góp ý",
        description: "Hãy chia sẻ ý kiến của bạn để nhận điểm thưởng",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add 50 points to user profile if logged in
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ total_points: (profile.total_points || 0) + 50 })
            .eq('user_id', user.id);
        }
      }

      toast({
        title: "🎉 Cảm ơn bạn đã góp ý!",
        description: "Bạn đã nhận được 50 điểm thưởng",
      });

      setFeedback('');
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Fixed Bubble Button - positioned above footer */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-4 z-40 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in flex items-center justify-center"
      >
        <Gift className="h-5 w-5" />
      </button>

      {/* Feedback Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-foreground leading-relaxed">
              Cùng chúng tôi cải tiến app để hỗ trợ con bạn tốt hơn
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Gift Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange to-yellow flex items-center justify-center shadow-lg">
                <Gift className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Feedback Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Chia sẻ ý kiến của bạn
              </label>
              <Textarea
                placeholder="Nhập góp ý của bạn tại đây..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] resize-none rounded-xl border-border focus:border-primary"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange to-yellow hover:from-orange/90 hover:to-yellow/90 text-white font-bold py-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Nhận ngay 50 điểm
                </span>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Mỗi góp ý của bạn giúp chúng tôi hoàn thiện ứng dụng hơn
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
