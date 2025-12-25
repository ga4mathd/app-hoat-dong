import heroImage from '@/assets/hero-children.jpg';

export function HeroBanner() {
  return (
    <div 
      className="relative rounded-2xl overflow-hidden h-48 md:h-64 animate-fade-in card-shadow"
      style={{ animationDelay: '0.2s' }}
    >
      <img 
        src={heroImage} 
        alt="Trẻ em vui chơi" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-lg">🎉</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Chào mừng bạn đến với hành trình nuôi dạy con!</p>
            <p className="text-sm text-muted-foreground">Cùng khám phá những hoạt động thú vị mỗi ngày</p>
          </div>
        </div>
      </div>
    </div>
  );
}
