import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function MotivationBanner() {
  const { user } = useAuth();
  const [totalActivities, setTotalActivities] = useState(13);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'scroll' | 'blink'>('scroll');
  const [animationKey, setAnimationKey] = useState(0);

  const sentences = [
    `BẠN ĐÃ THỰC HIỆN ${totalActivities} HOẠT ĐỘNG TRONG THÁNG!`,
    'PHÁT HUY NHÉ! 🎉'
  ];

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('total_activities')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.total_activities) setTotalActivities(data.total_activities);
        });
    }
  }, [user]);

  const handleScrollEnd = useCallback(() => {
    setPhase('blink');
  }, []);

  const handleBlinkEnd = useCallback(() => {
    setPhase('scroll');
    setCurrentIndex((prev) => (prev + 1) % sentences.length);
    setAnimationKey((prev) => prev + 1);
  }, [sentences.length]);

  return (
    <div 
      className="bg-primary rounded-2xl px-4 py-3 text-primary-foreground animate-fade-in overflow-hidden"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="relative h-5 flex items-center justify-center">
        <p 
          key={`${currentIndex}-${animationKey}`}
          className={`font-bold text-sm leading-tight tracking-wide whitespace-nowrap absolute ${
            phase === 'scroll' ? 'animate-marquee' : 'animate-blink'
          }`}
          onAnimationEnd={phase === 'scroll' ? handleScrollEnd : handleBlinkEnd}
        >
          {sentences[currentIndex]}
        </p>
      </div>
    </div>
  );
}
