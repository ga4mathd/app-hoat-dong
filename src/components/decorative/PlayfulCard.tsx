import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PlayfulCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'rainbow' | 'celebration';
  hover?: boolean;
}

export function PlayfulCard({ 
  children, 
  className, 
  variant = 'default',
  hover = true 
}: PlayfulCardProps) {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';
  
  const variants = {
    default: 'bg-card border border-border shadow-lg card-shadow-playful',
    gradient: 'bg-gradient-to-br from-card via-pink-light/30 to-blue-light/30 border border-border shadow-lg',
    rainbow: 'border-rainbow shadow-xl',
    celebration: 'bg-gradient-to-br from-yellow-light via-pink-light to-purple-light border-2 border-yellow/30 shadow-xl',
  };

  const hoverStyles = hover ? 'hover-lift cursor-pointer' : '';

  return (
    <div className={cn(baseStyles, variants[variant], hoverStyles, className)}>
      {children}
    </div>
  );
}
