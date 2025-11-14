import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyEngagementChart } from "@/components/WeeklyEngagementChart";
import { apiFetch } from "@/lib/api";
import { BarChart2, FileText, Users, TrendingUp } from "lucide-react";

interface Post {
  post_id: string;
  client_id: string;
  category_id: string;
  topics: string[];
  caption: string;
  hashtags: string;
  finalized: string;
}

interface Client {
  id: string;
  name: string;
}

interface Category {
  category_id: string;
  category_name: string;
}

const Analytics = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, clientsRes, categoriesRes] = await Promise.all([
          apiFetch("/posts/get-all-posts"),
          apiFetch("/clients/all-clients"),
          apiFetch("/get-all-categories"),
        ]);

        const postsData = await postsRes.json();
        const clientsData = await clientsRes.json();
        const categoriesData = await categoriesRes.json();

        setPosts(postsData.posts || []);
        setClients(clientsData.clients || []);
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPosts = posts.length;
  const finalizedPosts = posts.filter(p => p.finalized === "True").length;
  const draftPosts = posts.filter(p => p.finalized === "False").length;
  
  // Calculate posts per client
  const postsPerClient = clients.map(client => ({
    name: client.name,
    count: posts.filter(p => p.client_id === client.id).length,
  }));

  // Calculate posts per category
  const postsPerCategory = categories.map(category => ({
    name: category.category_name,
    count: posts.filter(p => p.category_id === category.category_id).length,
  }));

  const statCards = [
    {
      title: "Total Posts",
      value: totalPosts,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Finalized Posts",
      value: finalizedPosts,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Draft Posts",
      value: draftPosts,
      icon: BarChart2,
      color: "text-orange-600",
    },
    {
      title: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "text-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Statistics</p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-2">
        <WeeklyEngagementChart />
        
        {/* Posts by Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">Posts by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {postsPerClient.map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{client.name}</span>
                  <span className="text-sm font-semibold">{client.count} posts</span>
                </div>
              ))}
              {postsPerClient.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No clients yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">Posts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {postsPerCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-primary rounded-full" style={{ width: `${(category.count / totalPosts) * 100}px` }} />
                    <span className="text-sm font-semibold">{category.count}</span>
                  </div>
                </div>
              ))}
              {postsPerCategory.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No categories yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.slice(0, 5).map((post, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.caption.slice(0, 50)}...</p>
                    <p className="text-xs text-muted-foreground">{post.hashtags.split(',').slice(0, 2).join(', ')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    post.finalized === "True" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {post.finalized === "True" ? "Final" : "Draft"}
                  </span>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No posts yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
