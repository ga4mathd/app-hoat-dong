import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function MotivationBanner() {
  const { user } = useAuth();
  const [totalActivities, setTotalActivities] = useState(13);

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

  return (
    <div 
      className="bg-primary rounded-2xl px-4 py-3 text-primary-foreground animate-fade-in overflow-hidden"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="relative h-5 flex items-center">
        <p className="font-bold text-sm leading-tight tracking-wide whitespace-nowrap animate-marquee">
          BẠN ĐÃ THỰC HIỆN {totalActivities} HOẠT ĐỘNG TRONG THÁNG! ⭐ PHÁT HUY NHÉ! 🎉
        </p>
      </div>
    </div>
  );
}
