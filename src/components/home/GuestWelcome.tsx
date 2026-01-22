import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, Sparkles, Star, Heart, Rocket, Rainbow } from 'lucide-react';
import heroChildren from '@/assets/hero-children.jpg';
import { FloatingElements } from '@/components/decorative/FloatingElements';

export function GuestWelcome() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'Đăng nhập thất bại');
        } else {
          toast.success('Đăng nhập thành công!');
        }
      } else {
        const { error } = await signUp(email, password, fullName, childAge, childGender, phoneNumber);
        if (error) {
          toast.error(error.message || 'Đăng ký thất bại');
        } else {
          toast.success('Đăng ký thành công! Vui lòng kiểm tra email.');
        }
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center pt-4 pb-6 animate-fade-in relative">
      {/* Floating decorative elements */}
      <FloatingElements variant="mixed" density="medium" />

      {/* Decorative top icons with bigger bounce */}
      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="animate-bounce" style={{ animationDuration: '2s' }}>
          <Star className="h-8 w-8 text-yellow fill-yellow drop-shadow-lg" />
        </div>
        <div className="animate-wiggle">
          <Sparkles className="h-7 w-7 text-white/90" />
        </div>
        <div className="animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}>
          <Heart className="h-8 w-8 text-pink fill-pink drop-shadow-lg" />
        </div>
      </div>

      {/* Welcome Text with playful styling */}
      <div className="mb-5 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Rainbow className="h-6 w-6 text-yellow" />
          <h1 className="text-white text-3xl font-extrabold drop-shadow-lg">
            Chào mừng bé!
          </h1>
          <Rocket className="h-6 w-6 text-yellow animate-bounce" />
        </div>
        <p className="text-white/90 text-base px-4 font-medium">
          🎮 Khám phá <span className="text-yellow font-bold">100+</span> hoạt động thú vị cùng bé yêu! 🌈
        </p>
      </div>

      {/* Hero Image with playful border */}
      <div className="relative mb-6 z-10">
        <div className="absolute -inset-2 bg-gradient-to-r from-yellow via-pink to-purple rounded-full blur-md opacity-60 animate-pulse" />
        <div className="relative w-40 h-40 rounded-full p-1.5 bg-gradient-to-br from-yellow via-pink to-blue shadow-2xl">
          <div className="w-full h-full rounded-full overflow-hidden bg-card border-4 border-white/50">
            <img 
              src={heroChildren} 
              alt="Kids playing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Free badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow to-orange text-foreground px-5 py-1.5 rounded-full text-sm font-extrabold shadow-xl border-2 border-white animate-bounce" style={{ animationDuration: '3s' }}>
          🎉 Miễn phí!
        </div>
      </div>

      {/* Login/Signup Form Card */}
      <div className="w-full bg-card rounded-3xl p-6 shadow-2xl relative overflow-hidden border-2 border-white/20">
        {/* Card decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-light to-transparent rounded-bl-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-light to-transparent rounded-tr-full opacity-50" />
        
        {/* Toggle Tabs with playful design */}
        <div className="flex bg-muted rounded-full p-1.5 mb-6 shadow-inner relative z-10">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              isLogin 
                ? 'bg-gradient-to-r from-primary to-blue-500 shadow-lg text-white transform scale-105' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔑 Đăng nhập
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              !isLogin 
                ? 'bg-gradient-to-r from-pink to-secondary shadow-lg text-white transform scale-105' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ✨ Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
                <Input
                  type="text"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary text-base pl-12 shadow-sm"
                  required={!isLogin}
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📱</span>
                <Input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-14 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary text-base pl-12 shadow-sm"
                />
              </div>
              
              <Select value={childAge} onValueChange={setChildAge}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary text-base shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👶</span>
                    <SelectValue placeholder="Độ tuổi con bạn" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0 - 1 tuổi 🍼</SelectItem>
                  <SelectItem value="1-2">1 - 2 tuổi 👣</SelectItem>
                  <SelectItem value="2-3">2 - 3 tuổi 🎈</SelectItem>
                  <SelectItem value="3-4">3 - 4 tuổi 🎨</SelectItem>
                  <SelectItem value="4-5">4 - 5 tuổi 📚</SelectItem>
                  <SelectItem value="5-6">5 - 6 tuổi 🎓</SelectItem>
                  <SelectItem value="6+">Trên 6 tuổi 🌟</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={childGender} onValueChange={setChildGender}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary text-base shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎀</span>
                    <SelectValue placeholder="Giới tính con" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">👦 Bé trai</SelectItem>
                  <SelectItem value="female">👧 Bé gái</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">✉️</span>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary text-base pl-12 shadow-sm"
              required
            />
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary text-base pl-12 pr-12 shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange to-pink text-white font-extrabold text-lg shadow-xl btn-bounce border-2 border-white/30"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Đang xử lý...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? '🚀 Đăng nhập' : '🎉 Đăng ký ngay'}
              </span>
            )}
          </Button>
        </form>

        {/* Features with playful icons */}
        <div className="mt-6 pt-6 border-t-2 border-dashed border-muted relative z-10">
          <p className="text-sm text-muted-foreground mb-4 font-medium">✨ Tại sao chọn KidsPlay?</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-pink-light/50 to-transparent hover-lift cursor-pointer">
              <span className="text-3xl">🎮</span>
              <span className="text-xs font-bold text-foreground">100+ Trò chơi</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-blue-light/50 to-transparent hover-lift cursor-pointer">
              <span className="text-3xl">📚</span>
              <span className="text-xs font-bold text-foreground">Học qua chơi</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-yellow-light/50 to-transparent hover-lift cursor-pointer">
              <span className="text-3xl">👨‍👩‍👧</span>
              <span className="text-xs font-bold text-foreground">Cùng gia đình</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
