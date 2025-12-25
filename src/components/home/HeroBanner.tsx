import heroImage from '@/assets/hero-children.jpg';

interface HeroBannerProps {
  imageUrl?: string | null;
}

export function HeroBanner({ imageUrl }: HeroBannerProps) {
  const imageSrc = imageUrl || heroImage;

  return (
    <div 
      className="relative rounded-3xl overflow-hidden h-56 animate-fade-in"
      style={{ animationDelay: '0.2s' }}
    >
      <img 
        src={imageSrc} 
        alt="Hoạt động hôm nay" 
        className="w-full h-full object-cover transition-all duration-500"
      />
    </div>
  );
}
