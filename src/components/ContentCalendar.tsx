import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const currentDate = new Date();
const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
const currentYear = currentDate.getFullYear();
const today = currentDate.getDate();

const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();

const events = [
  { title: "Event Update", time: "10:00-11:30" },
  { title: "Team Collaboration", time: "12 pm | 3 hrs" },
  { title: "Product Intro", time: "10:00-10:45" },
  { title: "Brainstorming Process", time: "13:00-13:45" },
];

export function ContentCalendar() {
  const [selectedDate, setSelectedDate] = useState<number>(today);
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    toast({
      title: "Date Selected",
      description: `You selected ${currentMonth} ${day}, ${currentYear}`,
    });
  };

  const handleEventClick = (event: typeof events[0]) => {
    toast({
      title: event.title,
      description: `Scheduled for ${event.time}`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Content Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Large Date Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold">{today}</div>
            <div className="text-sm text-muted-foreground">{currentMonth}</div>
          </div>
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Mini Calendar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">{currentMonth} {currentYear}</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map(day => (
              <div key={day} className="text-xs text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today;
              const isSelected = day === selectedDate;
              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`text-xs py-1 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : isToday
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events */}
        <div className="space-y-2 pt-2 border-t">
          {events.map((event, i) => (
            <div 
              key={i} 
              className="text-xs p-2 rounded hover:bg-muted cursor-pointer transition-colors"
              onClick={() => handleEventClick(event)}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-muted-foreground">{event.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
