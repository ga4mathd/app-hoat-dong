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
    </div>
  );
}
