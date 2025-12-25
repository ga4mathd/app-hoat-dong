import { PartyPopper } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function MotivationBanner() {
  const { user } = useAuth();
  const [totalActivities, setTotalActivities] = useState(0);

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
      className="bg-primary rounded-2xl p-4 text-primary-foreground animate-fade-in card-shadow"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-bounce-gentle">
          <PartyPopper className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base leading-tight">
            BẠN ĐÃ THỰC HIỆN {totalActivities} HOẠT ĐỘNG TRONG THÁNG! PHÁT HUY NHÉ !!!
          </p>
        </div>
      </div>
    </div>
  );
}
