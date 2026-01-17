import { useState, useEffect } from "react";
import { format, addDays, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  title: string;
  scheduled_date: string;
}

interface ActivityCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ActivityCalendarDialog = ({ open, onOpenChange }: ActivityCalendarDialogProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const today = new Date();

  useEffect(() => {
    if (open) {
      fetchActivities();
    }
  }, [open, currentMonth]);

  const fetchActivities = async () => {
    setLoading(true);
    
    const startDate = format(today, "yyyy-MM-dd");
    const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("activities")
      .select("id, title, scheduled_date")
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .order("scheduled_date", { ascending: true });

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  // Get activities for next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  
  const getActivityForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return activities.find(a => a.scheduled_date === dateStr);
  };

  // Dates that have activities (for calendar highlighting)
  const activityDates = activities.map(a => new Date(a.scheduled_date));

  const formatDayOfWeek = (date: Date) => {
    const dayFormat = format(date, "EEEE", { locale: vi });
    // Capitalize first letter
    return dayFormat.charAt(0).toUpperCase() + dayFormat.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Lịch hoạt động
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-80px)]">
          <div className="px-4 pb-4 space-y-4">
            {/* 7 Days Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                7 ngày tới
              </h3>
              <div className="space-y-2">
                {next7Days.map((date, index) => {
                  const activity = getActivityForDate(date);
                  const isToday = index === 0;
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        isToday
                          ? "bg-primary/5 border-primary/30 shadow-sm"
                          : "bg-card border-border/50 hover:border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {isToday && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                                Hôm nay
                              </span>
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              isToday ? "text-primary" : "text-foreground"
                            )}>
                              {formatDayOfWeek(date)}, {format(date, "d/M")}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm mt-1",
                            activity ? "text-foreground" : "text-muted-foreground italic"
                          )}>
                            {activity ? activity.title : "Chưa có hoạt động"}
                          </p>
                        </div>
                        {activity && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Xem theo tháng
              </h3>
              <div className="border rounded-xl p-2 bg-card">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={vi}
                  modifiers={{
                    hasActivity: activityDates,
                    today: [today],
                  }}
                  modifiersClassNames={{
                    hasActivity: "bg-primary/20 text-primary font-semibold",
                    today: "ring-2 ring-primary ring-offset-2",
                  }}
                  className="w-full"
                  classNames={{
                    months: "flex flex-col",
                    month: "space-y-2",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-semibold",
                    nav: "space-x-1 flex items-center",
                    table: "w-full border-collapse",
                    head_row: "flex justify-around",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-1 justify-around",
                    cell: "h-9 w-9 text-center text-sm p-0 relative",
                    day: "h-9 w-9 p-0 font-normal rounded-full hover:bg-accent transition-colors",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                  }}
                />
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30" />
                  <span>Có hoạt động</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full ring-2 ring-primary ring-offset-1" />
                  <span>Hôm nay</span>
                </div>
              </div>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-sm font-medium">
                  {format(selectedDate, "EEEE, d MMMM yyyy", { locale: vi })}
                </p>
                {(() => {
                  const activity = getActivityForDate(selectedDate);
                  return activity ? (
                    <p className="text-sm text-primary mt-1">{activity.title}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      Chưa có hoạt động cho ngày này
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityCalendarDialog;
