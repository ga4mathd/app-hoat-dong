import heroImage from '@/assets/hero-children.jpg';
import volcanoImage from '@/assets/volcano-science.png';

interface HeroBannerProps {
  imageUrl?: string | null;
  activityTag?: string;
}

export function HeroBanner({ imageUrl, activityTag }: HeroBannerProps) {
  const getDefaultImage = () => {
    if (activityTag === 'Khoa học') return volcanoImage;
    return heroImage;
  };

  const imageSrc = imageUrl || getDefaultImage();

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
