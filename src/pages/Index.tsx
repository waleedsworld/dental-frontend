import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardCard } from "@/components/DashboardCard";
import { WeeklyEngagementChart } from "@/components/WeeklyEngagementChart";
import { ContentCalendar } from "@/components/ContentCalendar";
import { toast } from "@/hooks/use-toast";
import { FileText, Users, BarChart, Share2, MessageSquare, Youtube, Zap, BookOpen, LifeBuoy } from "lucide-react";
import homePageAsset from "@/assets/home_page_asset.png";

const Index = () => {
  const showComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} feature will be available soon!`,
    });
  };

  const handleTaskToggle = (taskLabel: string) => {
    showComingSoon(taskLabel);
  };

  const jumpstartTasks = [
    { id: 1, label: "Create my business", completed: false },
    { id: 2, label: "Set up my brand", completed: false },
    { id: 3, label: "Edit a post", completed: false },
    { id: 4, label: "Schedule a post", completed: false },
    { id: 5, label: "Publish a post", completed: false },
  ];

  const completedPercentage = Math.round(
    (jumpstartTasks.filter((task) => task.completed).length / jumpstartTasks.length) * 100,
  );

  const quickActions = [
    {
      icon: FileText,
      title: "Generate Posts",
      description: "Create new posts with AI",
    },
    {
      icon: BarChart,
      title: "View Analytics",
      description: "See recent sharing performance",
    },
    {
      icon: Share2,
      title: "Connect Socials",
      description: "Connect your social media accounts",
    },
    {
      icon: Users,
      title: "Invite to Business",
      description: "Invite people to your business",
    },
  ];

  const helpfulLinks = [
    {
      icon: MessageSquare,
      title: "AI content generation: Community",
      description: "Connect with other AI Content generation users, ask questions and share tips.",
    },
    {
      icon: Youtube,
      title: "YouTube",
      description: "Watch tutorials, feature walkthroughs, and product updates.",
    },
    {
      icon: BookOpen,
      title: "Blog",
      description: "Read the latest news, tips, and inspiration for the AI Content",
    },
    {
      icon: Zap,
      title: "What's New",
      description: "See the latest releases",
    },
    {
      icon: LifeBuoy,
      title: "Support",
      description: "Chat with team for faster or technical support",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Welcome to AI Content generation !</h1>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Jumpstart Progress */}
        {/* Combined Card */}
        <Card className="lg:col-span-2 p-3 sm:p-4 lg:p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left – Jumpstart Progress */}
            <div>
              <CardHeader className="p-0">
                <CardTitle className="text-base sm:text-lg font-semibold">Jumpstart Progress</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{completedPercentage}% complete</CardDescription>
              </CardHeader>

              <CardContent className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 p-0">
                {jumpstartTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(task.label)}
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-sm cursor-pointer"
                      onClick={() => handleTaskToggle(task.label)}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </CardContent>
            </div>

            {/* Right – Efficient & Powerful */}
            <div className="flex flex-col justify-center items-center">
              <img
                src={homePageAsset}
                alt="Efficient & Powerful AI"
                className="w-full h-auto max-w-full md:max-w-[600px] lg:max-w-[900px] object-contain"
              />
            </div>
          </div>
        </Card>

        {/* Weekly Engagement */}
        <WeeklyEngagementChart />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => showComingSoon("Create Unlimited Creative Posts")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Create Unlimited Creative Posts</CardTitle>
                    <CardDescription className="text-xs">From text or multimedia content to uploads</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => showComingSoon("Request Live Demo")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Request Live Demo</CardTitle>
                    <CardDescription className="text-xs">An onboarding and walkthrough with our team</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {quickActions.map((action, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => showComingSoon(action.title)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{action.title}</CardTitle>
                        <CardDescription className="text-xs">{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Helpful Links */}
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3">Helpful Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {helpfulLinks.map((link, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => showComingSoon(link.title)}
                >
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="p-2 bg-primary/10 rounded-lg w-fit">
                        <link.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{link.title}</CardTitle>
                        <CardDescription className="text-xs">{link.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Content Calendar */}
        <div className="xl:col-span-1">
          <ContentCalendar />
        </div>
      </div>
    </div>
  );
};

export default Index;
