import { Star, Heart, Sparkles, Cloud } from 'lucide-react';

interface FloatingElementsProps {
  variant?: 'stars' | 'hearts' | 'mixed' | 'clouds';
  density?: 'low' | 'medium' | 'high';
}

export function FloatingElements({ variant = 'mixed', density = 'medium' }: FloatingElementsProps) {
  const counts = {
    low: 3,
    medium: 5,
    high: 8
  };

  const count = counts[density];

  const getIcon = (index: number) => {
    if (variant === 'stars') return <Star className="fill-current" />;
    if (variant === 'hearts') return <Heart className="fill-current" />;
    if (variant === 'clouds') return <Cloud className="fill-current" />;
    
    // Mixed
    const icons = [Star, Heart, Sparkles];
    const Icon = icons[index % icons.length];
    return <Icon className="fill-current" />;
  };

  const getColor = (index: number) => {
    const colors = [
      'text-pink/30',
      'text-yellow/40',
      'text-purple/30',
      'text-blue/30',
      'text-orange/30',
      'text-green/30',
    ];
    return colors[index % colors.length];
  };

  const getPosition = (index: number) => {
    const positions = [
      { top: '5%', left: '10%' },
      { top: '15%', right: '8%' },
      { top: '35%', left: '5%' },
      { top: '50%', right: '12%' },
      { top: '65%', left: '15%' },
      { top: '80%', right: '5%' },
      { top: '25%', left: '85%' },
      { top: '70%', left: '90%' },
    ];
    return positions[index % positions.length];
  };

  const getSize = (index: number) => {
    const sizes = ['h-4 w-4', 'h-5 w-5', 'h-6 w-6', 'h-3 w-3'];
    return sizes[index % sizes.length];
  };

  const getAnimation = (index: number) => {
    return index % 2 === 0 ? 'animate-float' : 'animate-float-delayed';
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const position = getPosition(i);
        return (
          <div
            key={i}
            className={`absolute ${getColor(i)} ${getSize(i)} ${getAnimation(i)}`}
            style={{
              ...position,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {getIcon(i)}
          </div>
        );
      })}
    </div>
  );
}
