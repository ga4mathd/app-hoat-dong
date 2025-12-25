import heroImage from '@/assets/hero-children.jpg';

export function HeroBanner() {
  return (
    <div 
      className="relative rounded-3xl overflow-hidden h-56 animate-fade-in"
      style={{ animationDelay: '0.2s' }}
    >
      <img 
        src={heroImage} 
        alt="Trẻ em vui chơi" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
