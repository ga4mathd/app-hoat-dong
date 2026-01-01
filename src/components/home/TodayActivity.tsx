import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Heart } from 'lucide-react';

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
  points?: number | null;
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

  // Get current date formatted
  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

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
      {/* Motivation Text - Marquee with orange text */}
      <div className="w-full overflow-hidden mb-4">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-orange text-sm font-bold tracking-wide uppercase mx-8">
            BẠN ĐÃ THỰC HIỆN <span className="text-orange">{totalActivities}</span> HOẠT ĐỘNG TRONG THÁNG! PHÁT HUY NHÉ !!!
          </span>
          <span className="text-orange text-sm font-bold tracking-wide uppercase mx-8">
            BẠN ĐÃ THỰC HIỆN <span className="text-orange">{totalActivities}</span> HOẠT ĐỘNG TRONG THÁNG! PHÁT HUY NHÉ !!!
          </span>
        </div>
      </div>

      {/* Swipeable Carousel */}
      <div className="w-full overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {activities.map((activity, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 px-2">
              {/* Blue Gradient Activity Card */}
              <div className="bg-gradient-to-br from-[hsl(210,85%,55%)] via-[hsl(230,70%,50%)] to-[hsl(270,60%,50%)] rounded-3xl p-5 shadow-xl">
                {/* Header: Label + Date */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/90 text-sm font-medium">
                    {dayLabels[index]}
                  </span>
                  <span className="text-white/80 text-sm font-medium">
                    {getCurrentDate()}
                  </span>
                </div>

                {/* Activity Title */}
                <h1 className="text-white text-2xl font-bold leading-tight mb-4 text-left">
                  {activity?.title || 'Chưa có hoạt động'}
                </h1>

                {/* Badges Row */}
                <div className="flex items-center gap-3">
                  {/* Tag Badge - Green */}
                  {activity?.tags && activity.tags.length > 0 && (
                    <span className="px-4 py-1.5 text-sm font-semibold bg-green text-white rounded-full">
                      {activity.tags[0]}
                    </span>
                  )}
                  
                  {/* Likes Badge - Red with heart */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-[hsl(0,70%,55%)] text-white rounded-full">
                    <Heart className="h-4 w-4 fill-white" />
                    2.5K
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator - Dark dots on white background */}
      <div className="flex items-center gap-2 mt-4">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              selectedIndex === index 
                ? 'w-6 h-2 bg-foreground' 
                : 'w-2 h-2 bg-foreground/30 hover:bg-foreground/50'
            }`}
            aria-label={dayLabels[index]}
          />
        ))}
      </div>
    </div>
  );
}