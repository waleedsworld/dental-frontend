import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Category {
  category_id: string;
  category_name: string;
}

interface Topic {
  topic_id: string;
  category_id: string;
  title: string;
  description: string;
}

// API functions
const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiFetch("/get-all-categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  const data = await response.json();
  return data.categories;
};

const fetchTopics = async (): Promise<Topic[]> => {
  const response = await apiFetch("/get-all-topics");
  if (!response.ok) throw new Error("Failed to fetch topics");
  const data = await response.json();
  return data.topics;
};

const createCategory = async (categoryName: string) => {
  const response = await apiFetch("/create-category", {
    method: "POST",
    body: JSON.stringify({ category_name: categoryName }),
  });
  if (!response.ok) throw new Error("Failed to create category");
  return response.json();
};

const createTopic = async (data: { category_id: string; title: string; description: string }) => {
  const response = await apiFetch("/create-topic", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create topic");
  return response.json();
};

const deleteTopic = async (topicId: string) => {
  const response = await apiFetch(`/remove-topic?topic_id=${topicId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete topic");
  return response.json();
};

export default function Topics() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Fetch topics
  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Category Created",
        description: `"${newCategoryName}" has been added successfully.`,
      });
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast({
        title: "Topic Created",
        description: `"${newTopic.title}" has been added successfully.`,
      });
      setNewTopic({ title: "", description: "" });
      setIsAddTopicOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete topic mutation
  const deleteTopicMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast({
        title: "Topic Removed",
        description: "Topic has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate(newCategoryName);
    }
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.title.trim() && newTopic.description.trim() && selectedCategory) {
      createTopicMutation.mutate({
        category_id: selectedCategory,
        title: newTopic.title,
        description: newTopic.description,
      });
    }
  };

  const handleDeleteTopic = (topicId: string) => {
    deleteTopicMutation.mutate(topicId);
  };

  const handleTopicClick = (topicTitle: string) => {
    toast({
      title: "Opening Posts",
      description: `Loading posts for "${topicTitle}"...`,
    });
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.category_id === categoryId)?.category_name || "Unknown";
  };

  // Filter topics by selected category
  const filteredTopics = selectedCategory ? topics.filter((t) => t.category_id === selectedCategory) : topics;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Topics</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage content topics and categories for your clients</p>
      </div>


      {/* Top Panel */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-stretch sm:items-end">
            {/* Select Category */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="category-select">Select Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-select" disabled={categoriesLoading}>
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "Choose a category..."} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Category */}
            {isAddCategoryOpen ? (
              <div className="flex gap-2 items-end">
                <div>
                  <Label htmlFor="new-category">New Category</Label>
                  <Input
                    id="new-category"
                    placeholder="Category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCategory();
                      if (e.key === "Escape") setIsAddCategoryOpen(false);
                    }}
                    disabled={createCategoryMutation.isPending}
                  />
                </div>
                <Button onClick={handleAddCategory} size="sm" disabled={createCategoryMutation.isPending}>
                  Save
                </Button>
                <Button
                  onClick={() => setIsAddCategoryOpen(false)}
                  variant="ghost"
                  size="sm"
                  disabled={createCategoryMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsAddCategoryOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}

            {/* Add Topic */}
            <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!selectedCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddTopic}>
                  <DialogHeader>
                    <DialogTitle>Add New Topic</DialogTitle>
                    <DialogDescription>Create a new content topic for your selected category</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic-title">Title *</Label>
                      <Input
                        id="topic-title"
                        placeholder="Enter topic title..."
                        value={newTopic.title}
                        onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                        required
                        disabled={createTopicMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topic-description">Description *</Label>
                      <Textarea
                        id="topic-description"
                        placeholder="Describe the topic..."
                        value={newTopic.description}
                        onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                        required
                        disabled={createTopicMutation.isPending}
                      />
                    </div>
                    {selectedCategory && (
                      <div className="text-sm text-muted-foreground">
                        Category: <span className="font-medium">{getCategoryName(selectedCategory)}</span>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createTopicMutation.isPending}>
                      {createTopicMutation.isPending ? "Saving..." : "Save Topic"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Topics Grid */}
      {topicsLoading ? (
        <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground">Loading topics...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.topic_id}
              className="group cursor-pointer hover:shadow-lg transition-all relative"
              onClick={() => handleTopicClick(topic.title)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(topic.topic_id);
                    }}
                    disabled={deleteTopicMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  <span>{getCategoryName(topic.category_id)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Topic Card */}
          <Card
            className="border-dashed cursor-pointer hover:border-primary hover:bg-accent/50 transition-all flex items-center justify-center min-h-[200px]"
            onClick={() =>
              selectedCategory
                ? setIsAddTopicOpen(true)
                : toast({
                    title: "Select a category",
                    description: "Please select a category first to add a topic.",
                    variant: "destructive",
                  })
            }
          >
            <CardContent className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium">Add New Topic</p>
                <p className="text-sm text-muted-foreground">Create a content topic</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
