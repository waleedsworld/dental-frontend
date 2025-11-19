import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Briefcase, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function CreateBusiness() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    focus: "",
    services: "",
    business_description: "",
    audience: "",
    writing_instructions: "",
    tagline: "",
    call_to_actions: "",
    caption_ending: "",
    writing_samples: "",
    contact_info: "",
    website: "",
    number: "",
    mail: "",
    brand_colors: "",
    typography: "",
    design_style: "",
    image_mood: "",
    dos_donts: "",
    reference_links: "",
    asset_notes: "",
    format_preferences: "",
    design_checkpoints: "",
    logo_urls: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Transform form data to API format
      const apiData = {
        client_name: formData.client_name,
        focus: formData.focus,
        services: formData.services,
        business_description: formData.business_description,
        audience: formData.audience,
        writing_instructions: formData.writing_instructions,
        tagline: formData.tagline,
        call_to_actions: formData.call_to_actions.split(",").map((s) => s.trim()),
        caption_ending: formData.caption_ending,
        writing_samples: formData.writing_samples
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s),
        contact_info: formData.contact_info,
        website: formData.website,
        number: formData.number,
        mail: formData.mail,
        design_guide: {
          brand_colors: formData.brand_colors.split(",").map((s) => s.trim()),
          typography: formData.typography,
          design_style: formData.design_style,
          image_mood: formData.image_mood,
          dos_donts: formData.dos_donts,
          reference_links: formData.reference_links
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s),
          asset_notes: formData.asset_notes,
          format_preferences: formData.format_preferences.split(",").map((s) => s.trim()),
          design_checkpoints: formData.design_checkpoints,
        },
        logo_urls: formData.logo_urls
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      const response = await apiFetch("/clients/create", {
        method: "POST",
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Client created successfully with ID: ${result.client_id}`,
        });
        navigate("/clients");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create client",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-5xl">
      <div className="mb-3 sm:mb-4 lg:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Create New Business</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">Fill in the details to create a new business profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 h-auto p-1">
            <TabsTrigger value="basic" className="text-xs sm:text-sm py-2">Basic</TabsTrigger>
            <TabsTrigger value="writing" className="text-xs sm:text-sm py-2">Writing</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">Contact</TabsTrigger>
            <TabsTrigger value="design" className="text-xs sm:text-sm py-2">Design</TabsTrigger>
            <TabsTrigger value="assets" className="text-xs sm:text-sm py-2">Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core details about the business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    placeholder="e.g., Zuhd Dental"
                    value={formData.client_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focus">Focus *</Label>
                  <Input
                    id="focus"
                    name="focus"
                    placeholder="e.g., Cosmetic Dentistry"
                    value={formData.focus}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="services">Services *</Label>
                  <Textarea
                    id="services"
                    name="services"
                    placeholder="e.g., Teeth Whitening, Veneers, Smile Design"
                    value={formData.services}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_description">Business Description *</Label>
                  <Textarea
                    id="business_description"
                    name="business_description"
                    placeholder="Describe the business..."
                    value={formData.business_description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Textarea
                    id="audience"
                    name="audience"
                    placeholder="e.g., High-income professionals aged 25–50"
                    value={formData.audience}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="writing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Writing Guidelines</CardTitle>
                <CardDescription>Content and tone specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="writing_instructions">Writing Instructions *</Label>
                  <Textarea
                    id="writing_instructions"
                    name="writing_instructions"
                    placeholder="e.g., Use a luxury and clean tone"
                    value={formData.writing_instructions}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline *</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    placeholder="e.g., @zuhddental"
                    value={formData.tagline}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call_to_actions">Call to Actions (comma-separated) *</Label>
                  <Input
                    id="call_to_actions"
                    name="call_to_actions"
                    placeholder="e.g., Book Now, Get a Consultation"
                    value={formData.call_to_actions}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption_ending">Caption Ending *</Label>
                  <Input
                    id="caption_ending"
                    name="caption_ending"
                    placeholder="e.g., ✨ Experience refined dental artistry."
                    value={formData.caption_ending}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="writing_samples">Writing Samples (one per line) *</Label>
                  <Textarea
                    id="writing_samples"
                    name="writing_samples"
                    placeholder="https://example.com/sample1"
                    value={formData.writing_samples}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How to reach the business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_info">Contact Info *</Label>
                  <Input
                    id="contact_info"
                    name="contact_info"
                    placeholder="e.g., Zuhd Dental Care, Downtown, LA"
                    value={formData.contact_info}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website *</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Phone Number *</Label>
                  <Input
                    id="number"
                    name="number"
                    type="tel"
                    placeholder="+1 (872) 258-9898"
                    value={formData.number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mail">Email *</Label>
                  <Input
                    id="mail"
                    name="mail"
                    type="email"
                    placeholder="care@example.com"
                    value={formData.mail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Design Guide</CardTitle>
                <CardDescription>Visual identity and brand guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_colors">Brand Colors (comma-separated hex codes) *</Label>
                  <Input
                    id="brand_colors"
                    name="brand_colors"
                    placeholder="e.g., #E9E6DF, #7DA89A, #1C1C1C"
                    value={formData.brand_colors}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typography">Typography *</Label>
                  <Input
                    id="typography"
                    name="typography"
                    placeholder="e.g., Sans-serif (Lato / Playfair Display)"
                    value={formData.typography}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design_style">Design Style *</Label>
                  <Input
                    id="design_style"
                    name="design_style"
                    placeholder="e.g., Luxury, Minimalist, Clean"
                    value={formData.design_style}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_mood">Image Mood *</Label>
                  <Textarea
                    id="image_mood"
                    name="image_mood"
                    placeholder="e.g., Bright, airy, elegant, with warm tones"
                    value={formData.image_mood}
                    onChange={handleChange}
                    rows={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dos_donts">Do's and Don'ts *</Label>
                  <Textarea
                    id="dos_donts"
                    name="dos_donts"
                    placeholder="e.g., Avoid clutter and overly smiling stock faces"
                    value={formData.dos_donts}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design_checkpoints">Design Checkpoints *</Label>
                  <Input
                    id="design_checkpoints"
                    name="design_checkpoints"
                    placeholder="e.g., Spacing, shadows, tone, typography alignment"
                    value={formData.design_checkpoints}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assets & References</CardTitle>
                <CardDescription>Logos, references, and format preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_urls">Logo URLs (one per line) *</Label>
                  <Textarea
                    id="logo_urls"
                    name="logo_urls"
                    placeholder="https://imgbb.com/logo.png"
                    value={formData.logo_urls}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference_links">Reference Links (one per line) *</Label>
                  <Textarea
                    id="reference_links"
                    name="reference_links"
                    placeholder="https://example.com/reference"
                    value={formData.reference_links}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset_notes">Asset Notes *</Label>
                  <Textarea
                    id="asset_notes"
                    name="asset_notes"
                    placeholder="e.g., Use porcelain or natural textures"
                    value={formData.asset_notes}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format_preferences">Format Preferences (comma-separated) *</Label>
                  <Input
                    id="format_preferences"
                    name="format_preferences"
                    placeholder="e.g., 1:1 square, 1080x1080"
                    value={formData.format_preferences}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/clients")} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Business
          </Button>
        </div>
      </form>
    </div>
  );
}
