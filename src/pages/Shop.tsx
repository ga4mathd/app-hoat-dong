import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function Shop() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Shop</h1>
        </div>

        <div className="p-4">
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-yellow-light mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Sắp ra mắt!</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Shop đổi quà sẽ sớm được cập nhật. Hãy tích điểm để đổi những phần quà hấp dẫn nhé!
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
