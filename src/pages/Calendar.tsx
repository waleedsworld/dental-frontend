import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek } from "date-fns";
import { apiFetch } from "@/lib/api";

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  time: string;
  day: number;
  hour: number;
  color: string;
}

const Calendar = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiFetch("/posts/get-all-posts");
        const data = await response.json();
        
        // Convert posts to scheduled format with mock scheduling
        const colors = [
          "bg-blue-100 border-blue-300",
          "bg-pink-100 border-pink-300",
          "bg-green-100 border-green-300",
          "bg-purple-100 border-purple-300",
          "bg-yellow-100 border-yellow-300",
        ];
        
        const mockScheduled = (data.posts || []).slice(0, 8).map((post: any, index: number) => ({
          id: post.post_id,
          title: post.caption.slice(0, 30) + "...",
          platform: ["Instagram", "LinkedIn", "Twitter", "Facebook"][index % 4],
          time: `${9 + (index % 8)}:00`,
          day: (index % 5) + 1,
          hour: 9 + (index % 8),
          color: colors[index % colors.length],
        }));
        
        setScheduledPosts(mockScheduled);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    platform: "",
    day: 1,
    time: "09:00",
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleSchedulePost = () => {
    if (!newPost.title || !newPost.platform) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = newPost.time.split(":").map(Number);
    const colors = [
      "bg-blue-100 border-blue-300",
      "bg-pink-100 border-pink-300",
      "bg-green-100 border-green-300",
      "bg-purple-100 border-purple-300",
      "bg-yellow-100 border-yellow-300",
    ];

    const newScheduledPost: ScheduledPost = {
      id: Date.now().toString(),
      title: newPost.title,
      platform: newPost.platform,
      time: newPost.time,
      day: newPost.day,
      hour: hours,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setScheduledPosts([...scheduledPosts, newScheduledPost]);
    setIsDialogOpen(false);
    setNewPost({ title: "", platform: "", day: 1, time: "09:00" });
    
    toast({
      title: "Post Scheduled!",
      description: `${newPost.title} scheduled for ${format(weekDays[newPost.day], "EEE, MMM d")} at ${newPost.time}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Welcome to AI Content generation !</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={newPost.platform} onValueChange={(value) => setNewPost({ ...newPost, platform: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Day of Week</Label>
                  <Select value={newPost.day.toString()} onValueChange={(value) => setNewPost({ ...newPost, day: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {format(day, "EEEE, MMM d")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newPost.time}
                    onChange={(e) => setNewPost({ ...newPost, time: e.target.value })}
                  />
                </div>

                <Button onClick={handleSchedulePost} className="w-full">
                  Schedule Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar Controls */}
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <span className="text-sm sm:text-base font-medium">
                {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="icon" onClick={handlePreviousWeek} className="h-8 w-8 sm:h-10 sm:w-10">
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
                This week
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek} className="h-8 w-8 sm:h-10 sm:w-10">
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[700px] xl:min-w-0">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-2 text-sm font-medium border-r"></div>
                {weekDays.map((day, i) => (
                  <div key={i} className="p-2 text-center text-sm font-medium border-r last:border-r-0">
                    <div>{format(day, "EEE")}</div>
                    <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                    <div className="p-2 text-xs text-muted-foreground border-r bg-muted/30">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    {weekDays.map((_, dayIndex) => (
                      <div key={dayIndex} className="border-r last:border-r-0 bg-gradient-to-b from-background to-muted/10 relative p-1">
                        {scheduledPosts
                          .filter((post) => post.day === dayIndex && post.hour === hour)
                          .map((post) => (
                            <div
                              key={post.id}
                              className={`${post.color} border rounded p-2 text-xs cursor-pointer hover:shadow-md transition-shadow`}
                              onClick={() => {
                                toast({
                                  title: post.title,
                                  description: `${post.platform} - ${post.time}`,
                                });
                              }}
                            >
                              <div className="font-medium">{post.time}</div>
                              <div className="font-semibold truncate">{post.title}</div>
                              <div className="text-muted-foreground">{post.platform}</div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
