import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { toast } from "@/hooks/use-toast";

const data = [
  { name: "Mon", value: 45 },
  { name: "Tue", value: 52 },
  { name: "Wed", value: 48 },
  { name: "Thu", value: 61 },
  { name: "Fri", value: 55 },
  { name: "Sat", value: 43 },
  { name: "Sun", value: 38 },
];

export function WeeklyEngagementChart() {
  const handleChartClick = () => {
    toast({
      title: "Coming Soon",
      description: "Detailed analytics will be available soon!",
    });
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleChartClick}>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold">Weekly Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
