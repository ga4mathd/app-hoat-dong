import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, Sparkles, Star, Heart } from 'lucide-react';
import heroChildren from '@/assets/hero-children.jpg';

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
    <div className="flex flex-col items-center text-center pt-4 pb-6 animate-fade-in">
      {/* Decorative Icons */}
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-6 w-6 text-yellow animate-bounce-gentle" />
        <Star className="h-5 w-5 text-white/80" />
        <Heart className="h-6 w-6 text-pink animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Welcome Text */}
      <h1 className="text-white text-2xl font-bold mb-2">
        Chào mừng đến với KidsPlay!
      </h1>
      <p className="text-white/80 text-sm mb-6 px-4">
        Khám phá hàng trăm hoạt động thú vị cho bé yêu của bạn
      </p>

      {/* Hero Image */}
      <div className="relative mb-6">
        <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-yellow via-pink to-blue">
          <div className="w-full h-full rounded-full overflow-hidden bg-card">
            <img 
              src={heroChildren} 
              alt="Kids playing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow text-foreground px-4 py-1 rounded-full text-xs font-bold shadow-lg">
          🎉 Miễn phí!
        </div>
      </div>

      {/* Login/Signup Form */}
      <div className="w-full bg-card rounded-3xl p-6 shadow-xl">
        {/* Toggle Tabs */}
        <div className="flex bg-muted rounded-full p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
              isLogin 
                ? 'bg-white shadow-md text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
              !isLogin 
                ? 'bg-white shadow-md text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                type="text"
                placeholder="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
                required={!isLogin}
              />
              
              <Input
                type="tel"
                placeholder="Số điện thoại"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
              />
              
              <Select value={childAge} onValueChange={setChildAge}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0 text-sm">
                  <SelectValue placeholder="Độ tuổi con bạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0 - 1 tuổi</SelectItem>
                  <SelectItem value="1-2">1 - 2 tuổi</SelectItem>
                  <SelectItem value="2-3">2 - 3 tuổi</SelectItem>
                  <SelectItem value="3-4">3 - 4 tuổi</SelectItem>
                  <SelectItem value="4-5">4 - 5 tuổi</SelectItem>
                  <SelectItem value="5-6">5 - 6 tuổi</SelectItem>
                  <SelectItem value="6+">Trên 6 tuổi</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={childGender} onValueChange={setChildGender}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0 text-sm">
                  <SelectValue placeholder="Giới tính con" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Bé trai</SelectItem>
                  <SelectItem value="female">Bé gái</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
            required
          />
          
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 text-sm pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange to-pink text-white font-bold text-base shadow-lg hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              isLogin ? 'Đăng nhập' : 'Đăng ký ngay'
            )}
          </Button>
        </form>

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Tại sao chọn KidsPlay?</p>
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🎮</span>
              <span className="text-muted-foreground">100+ Trò chơi</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📚</span>
              <span className="text-muted-foreground">Học qua chơi</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">👨‍👩‍👧</span>
              <span className="text-muted-foreground">Cùng gia đình</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}