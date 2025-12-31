import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import avatarBoy from '@/assets/avatar-boy.png';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  goals: string | null;
  instructions: string | null;
  expert_name: string | null;
  expert_title: string | null;
  image_url: string | null;
}

interface TodayActivityProps {
  todayActivity: Activity | null;
  yesterdayActivity: Activity | null;
  tomorrowActivity: Activity | null;
  availableTags: string[];
  totalActivities?: number;
  onDayChange?: (day: 'yesterday' | 'today' | 'tomorrow') => void;
}

export function TodayActivity({ 
  todayActivity, 
  yesterdayActivity, 
  tomorrowActivity,
  availableTags, 
  totalActivities = 0,
  onDayChange
}: TodayActivityProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: 1 });
  const [selectedIndex, setSelectedIndex] = useState(1);

  const dayLabels = ['Hoạt động hôm qua', 'Hoạt động hôm nay', 'Hoạt động ngày mai'];
  const activities = [yesterdayActivity, todayActivity, tomorrowActivity];
  const dayKeys: ('yesterday' | 'today' | 'tomorrow')[] = ['yesterday', 'today', 'tomorrow'];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    onDayChange?.(dayKeys[index]);
  }, [emblaApi, onDayChange]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="flex flex-col items-center text-center pt-2 pb-4 animate-fade-in">
      {/* Motivation Text - Marquee */}
      <div className="w-full overflow-hidden mb-2">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-white text-sm font-bold tracking-wide uppercase mx-8">
            Bạn đã thực hiện <span className="text-yellow">{totalActivities}</span> hoạt động trong tháng! Cố gắng nhé!
          </span>
          <span className="text-white text-sm font-bold tracking-wide uppercase mx-8">
            Bạn đã thực hiện <span className="text-yellow">{totalActivities}</span> hoạt động trong tháng! Cố gắng nhé!
          </span>
        </div>
      </div>

      {/* Day Label */}
      <h2 className="text-white/90 text-sm font-medium mb-4 tracking-wide">
        {dayLabels[selectedIndex]}
      </h2>

      {/* Swipeable Carousel */}
      <div className="w-full overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {activities.map((activity, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 flex flex-col items-center">
              {/* Large Avatar with gradient border */}
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue to-orange">
                  <div className="w-full h-full rounded-full overflow-hidden bg-card">
                    <img 
                      src={activity?.image_url || avatarBoy} 
                      alt="Activity"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Single Tag */}
              {activity?.tags && activity.tags.length > 0 && (
                <div className="mb-3">
                  <span className="px-4 py-1.5 text-sm font-medium bg-yellow text-foreground rounded-full">
                    {activity.tags[0]}
                  </span>
                </div>
              )}

              {/* Activity Title */}
              <h1 className="text-white text-2xl font-bold leading-tight px-4">
                {activity?.title || 'Chưa có hoạt động'}
              </h1>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center gap-2 mt-4">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              selectedIndex === index 
                ? 'w-6 h-2 bg-white' 
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={dayLabels[index]}
          />
        ))}
      </div>
    </div>
  );
}