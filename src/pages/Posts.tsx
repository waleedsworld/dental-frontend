import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Check, Sparkles, Trash2, CheckCircle, Upload, X } from "lucide-react";
import { apiFetch, BASE_URL } from "@/lib/api";

interface Client {
  id: string;
  name: string;
}

interface Category {
  category_id: string;
  category_name: string;
}

interface Topic {
  topic_id: string;
  title: string;
}

interface Post {
  post_id: string;
  client_id: string;
  category_id: string;
  topics: string[];
  caption: string;
  hashtags: string;
  image_url: string;
  visual_style: string | null;
  finalized: string;
}

export default function Posts() {
  const { toast } = useToast();

  // Dropdown data
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Selected values
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  // Post state
  const [isGenerating, setIsGenerating] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [caption, setCaption] = useState("");

  // Saved posts feed
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  // Custom prompt
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Fetch clients
  useEffect(() => {
    apiFetch("/clients/all-clients")
      .then((res) => res.json())
      .then((data) => {
        if (data.clients) {
          setClients(data.clients);
        }
      })
      .catch((err) => console.error("Failed to fetch clients:", err));
  }, []);

  // Fetch saved posts
  useEffect(() => {
    apiFetch("/posts/get-all-posts")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) {
          setSavedPosts(data.posts);
        }
      })
      .catch((err) => console.error("Failed to fetch posts:", err));
  }, []);

  // Fetch categories
  useEffect(() => {
    apiFetch("/get-all-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Fetch topics
  useEffect(() => {
    apiFetch("/get-all-topics")
      .then((res) => res.json())
      .then((data) => {
        if (data.topics) {
          setTopics(data.topics);
        }
      })
      .catch((err) => console.error("Failed to fetch topics:", err));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImagePreview("");
    setUploadedImageUrl("");
  };

  const generatePost = async () => {
    if (!selectedClient || !selectedCategory || !selectedTopic || !selectedStyle) {
      toast({
        title: "Missing Information",
        description: "Please select all options before generating.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setPost(null);

    try {
      let imageUrl: string | null = null;

      // Upload image first if provided
      if (referenceImage) {
        const formData = new FormData();
        formData.append("file", referenceImage);
        formData.append("image_name", referenceImage.name);
        formData.append("client_id", selectedClient);

        const uploadResponse = await fetch(`${BASE_URL}/images/upload`, {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.url) {
          imageUrl = uploadData.url;
          setUploadedImageUrl(imageUrl);
          toast({
            title: "Image Uploaded",
            description: "Reference image uploaded successfully.",
          });
        }
      }

      // Prepare request body
      const requestBody = {
        client_id: selectedClient,
        category_id: selectedCategory,
        topics: [selectedTopic],
        number_of_posts: 1,
        custom_prompt: customPrompt,
        visual_style: selectedStyle,
        ...(imageUrl && { reference_image: [imageUrl] }),
      };

      // Create post with image URL
      const response = await apiFetch("/posts/create", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        const newPost = data.posts[0];
        setPost(newPost);
        setCaption(newPost.caption + (newPost.hashtags ? `\n\n${newPost.hashtags}` : ""));

        // Refresh saved posts
        const postsResponse = await apiFetch("/posts/get-all-posts");
        const postsData = await postsResponse.json();
        if (postsData.posts) {
          setSavedPosts(postsData.posts);
        }

        toast({
          title: "Post Generated",
          description: "Your post has been created successfully.",
        });
      }
    } catch (err) {
      console.error("Failed to generate post:", err);
      toast({
        title: "Generation Failed",
        description: "Failed to generate post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const regeneratePost = async () => {
    if (!selectedClient || !selectedCategory || !selectedTopic || !selectedStyle) return;

    setIsGenerating(true);

    try {
      let imageUrl: string | null = null;

      // Upload image first if provided
      if (referenceImage) {
        const formData = new FormData();
        formData.append("file", referenceImage);
        formData.append("image_name", referenceImage.name);
        formData.append("client_id", selectedClient);

        const uploadResponse = await fetch(`${BASE_URL}/images/upload`, {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.url) {
          imageUrl = uploadData.url;
          setUploadedImageUrl(imageUrl);
        }
      }

      const response = await apiFetch("/posts/create", {
        method: "POST",
        body: JSON.stringify({
          client_id: selectedClient,
          category_id: selectedCategory,
          topics: [selectedTopic],
          number_of_posts: 1,
          custom_prompt: customPrompt,
          visual_style: selectedStyle,
          ...(imageUrl && { reference_image: [imageUrl] }),
        }),
      });

      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        const newPost = data.posts[0];
        setPost(newPost);
        setCaption(newPost.caption + (newPost.hashtags ? `\n\n${newPost.hashtags}` : ""));

        // Refresh saved posts
        const postsResponse = await apiFetch("/posts/get-all-posts");
        const postsData = await postsResponse.json();
        if (postsData.posts) {
          setSavedPosts(postsData.posts);
        }
      }
    } catch (err) {
      console.error("Failed to regenerate post:", err);
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
    toast({
      title: "Caption Copied",
      description: "Caption has been copied to clipboard.",
    });
  };

  const finalizePost = async () => {
    if (!post) return;

    try {
      await apiFetch("/posts/finalize-post", {
        method: "POST",
        body: JSON.stringify({
          client_id: post.client_id,
          post_ids: [post.post_id],
        }),
      });

      setPost({ ...post, finalized: "True" });
      setSavedPosts((prevPosts) =>
        prevPosts.map((p) => (p.post_id === post.post_id ? { ...p, finalized: "True" } : p)),
      );

      toast({
        title: "Post Finalized",
        description: "Post finalized and sent for review.",
      });
    } catch (err) {
      console.error("Failed to finalize post:", err);
      toast({
        title: "Finalization Failed",
        description: "Failed to finalize post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const finalizeSavedPost = async (postId: string) => {
    const postToFinalize = savedPosts.find((p) => p.post_id === postId);
    if (!postToFinalize) return;

    try {
      await apiFetch("/posts/finalize-post", {
        method: "POST",
        body: JSON.stringify({
          client_id: postToFinalize.client_id,
          post_ids: [postId],
        }),
      });

      setSavedPosts((prevPosts) => prevPosts.map((p) => (p.post_id === postId ? { ...p, finalized: "True" } : p)));

      toast({
        title: "Post Finalized",
        description: "Post finalized and sent for review.",
      });
    } catch (err) {
      console.error("Failed to finalize post:", err);
      toast({
        title: "Finalization Failed",
        description: "Failed to finalize post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteSavedPost = async (postId: string) => {
    try {
      await apiFetch("/posts/remove", {
        method: "DELETE",
        body: JSON.stringify({
          post_id: postId,
        }),
      });

      setSavedPosts((prevPosts) => prevPosts.filter((p) => p.post_id !== postId));

      toast({
        title: "Post Deleted",
        description: "Post has been removed.",
      });
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Generate Posts</h1>
      </div>

      {/* Top Bar with Dropdowns */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.topic_id} value={topic.topic_id}>
                    {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Poster/Ad Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bold">Bold & Eye-Catching</SelectItem>
                <SelectItem value="elegant">Elegant & Sophisticated</SelectItem>
                <SelectItem value="vibrant">Vibrant & Colorful</SelectItem>
                <SelectItem value="vintage">Vintage & Retro</SelectItem>
                <SelectItem value="minimal">Clean & Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt" className="text-sm font-medium">
              Custom Prompt (Optional)
            </Label>
            <Textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add any specific instructions for post generation..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Reference Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="reference-image" className="text-sm font-medium">
              Reference Image (Optional)
            </Label>
            <div className="flex gap-2 items-start">
              {!referenceImagePreview ? (
                <div className="flex-1">
                  <Input
                    id="reference-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
              ) : (
                <div className="flex-1 relative">
                  <div className="relative inline-block">
                    <img
                      src={referenceImagePreview}
                      alt="Reference"
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removeReferenceImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generatePost} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? "Generating..." : "Generate Post"}
          </Button>

          {/* Debug Section */}
          <Card className="mt-4 bg-muted/30 border-dashed">
            <CardContent className="p-4">
              <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Debug: Request Payload
              </Label>
              <pre className="text-xs overflow-auto max-h-48 p-3 bg-background/50 rounded border text-foreground/80 font-mono">
{JSON.stringify({
  client_id: selectedClient,
  category_id: selectedCategory,
  topics: selectedTopic ? [selectedTopic] : [],
  number_of_posts: 1,
  custom_prompt: customPrompt || "",
  visual_style: selectedStyle,
  reference_image: uploadedImageUrl ? [uploadedImageUrl] : []
}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Post Feed Area */}
      <div className="space-y-6">
        {isGenerating && (
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <Skeleton className="w-full aspect-square mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </CardContent>
          </Card>
        )}

        {post && !isGenerating && (
          <Card
            className={`animate-fade-in transition-all duration-500 ${
              post.finalized === "True" ? "ring-2 ring-green-500/50 shadow-lg shadow-green-500/20" : ""
            }`}
          >
            <CardContent className="p-6 relative">
              {post.finalized === "True" && (
                <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 animate-scale-in">
                  <Check className="h-5 w-5" />
                </div>
              )}

              <img
                src={post.image_url}
                alt="Generated post"
                className="w-full aspect-square object-cover rounded-lg mb-4 animate-fade-in"
              />

              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption will appear here..."
                className="min-h-[120px] mb-4 resize-none"
                disabled={post.finalized === "True"}
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={copyCaption} className="flex-1" disabled={post.finalized === "True"}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Caption
                </Button>

                <Button
                  variant="outline"
                  onClick={regeneratePost}
                  className="flex-1"
                  disabled={isGenerating || post.finalized === "True"}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>

                <Button onClick={finalizePost} className="flex-1" disabled={post.finalized === "True"}>
                  <Check className="h-4 w-4 mr-2" />
                  Finalize Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!post && !isGenerating && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select options above and click Generate to create a post</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Saved Posts Feed */}
      {savedPosts.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {savedPosts.map((savedPost) => (
              <Card
                key={savedPost.post_id}
                className={`animate-fade-in transition-all duration-300 hover:shadow-lg relative ${
                  savedPost.finalized === "True" ? "ring-2 ring-green-500/30" : ""
                }`}
              >
                <CardContent className="p-0">
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={() => finalizeSavedPost(savedPost.post_id)}
                      disabled={savedPost.finalized === "True"}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => deleteSavedPost(savedPost.post_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Finalized Badge */}
                  {savedPost.finalized === "True" && (
                    <div className="absolute top-3 left-3 z-10 animate-scale-in">
                      <div className="bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                  {/* Post Image */}
                  <div className="relative w-full overflow-hidden">
                    <img
                      src={savedPost.image_url}
                      alt={`Post ${savedPost.post_id}`}
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  {/* Caption */}
                  <div className="p-4">
                    <p className="text-sm text-foreground whitespace-pre-line line-clamp-4">{savedPost.caption}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
