import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Briefcase, DollarSign, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { z } from "zod";

const categories = [
  { value: "pet_care", label: "Pet Care" },
  { value: "lawn_garden", label: "Lawn & Garden" },
  { value: "handyman", label: "Handyman" },
  { value: "tutoring", label: "Tutoring" },
  { value: "errands", label: "Errands" },
  { value: "cleaning", label: "Cleaning" },
  { value: "babysitting", label: "Babysitting" },
  { value: "delivery", label: "Delivery" },
  { value: "other", label: "Other" },
];

const jobSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  category: z.enum(["pet_care", "lawn_garden", "handyman", "tutoring", "errands", "cleaning", "babysitting", "delivery", "other"]),
  budget: z.number().min(1, "Budget must be at least $1").max(10000, "Budget must be less than $10,000").optional(),
  location: z.string().trim().max(200, "Location must be less than 200 characters").optional(),
  is_urgent: z.boolean(),
});

type JobFormData = z.infer<typeof jobSchema>;

const PostJob = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<JobFormData>>({
    title: "",
    description: "",
    category: undefined,
    budget: undefined,
    location: "",
    is_urgent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const validateForm = (): boolean => {
    const result = jobSchema.safeParse({
      ...formData,
      budget: formData.budget ? Number(formData.budget) : undefined,
    });

    if (!result.success) {
      const newErrors: Partial<Record<keyof JobFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof JobFormData;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("jobs").insert({
        poster_id: user!.id,
        title: formData.title!.trim(),
        description: formData.description?.trim() || null,
        category: formData.category!,
        budget: formData.budget ? Number(formData.budget) : null,
        location: formData.location?.trim() || null,
        is_urgent: formData.is_urgent || false,
      });

      if (error) throw error;

      toast({
        title: "Job posted!",
        description: "Your job has been posted to the neighborhood.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Failed to post job",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-semibold text-foreground">Post a Job</h1>
        </div>
      </header>

      {/* Form */}
      <main className="p-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              What do you need help with? <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="title"
                placeholder="e.g., Need help moving furniture"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setErrors({ ...errors, title: undefined });
                }}
                className="pl-10 h-12 rounded-xl bg-card border-border"
                maxLength={100}
              />
            </div>
            {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the job..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrors({ ...errors, description: undefined });
              }}
              className="min-h-[120px] rounded-xl bg-card border-border resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.description?.length || 0}/1000
            </p>
            {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData({ ...formData, category: value as JobFormData["category"] });
                setErrors({ ...errors, category: undefined });
              }}
            >
              <SelectTrigger className="h-12 rounded-xl bg-card border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-destructive text-xs">{errors.category}</p>}
          </div>

          {/* Budget & Location Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium">
                Budget
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="50"
                  value={formData.budget || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    setFormData({ ...formData, budget: value });
                    setErrors({ ...errors, budget: undefined });
                  }}
                  className="pl-10 h-12 rounded-xl bg-card border-border"
                  min={1}
                  max={10000}
                />
              </div>
              {errors.budget && <p className="text-destructive text-xs">{errors.budget}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Oak Street"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    setErrors({ ...errors, location: undefined });
                  }}
                  className="pl-10 h-12 rounded-xl bg-card border-border"
                  maxLength={200}
                />
              </div>
              {errors.location && <p className="text-destructive text-xs">{errors.location}</p>}
            </div>
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Mark as Urgent</p>
                <p className="text-xs text-muted-foreground">Get faster responses</p>
              </div>
            </div>
            <Switch
              checked={formData.is_urgent}
              onCheckedChange={(checked) => setFormData({ ...formData, is_urgent: checked })}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Posting...
              </>
            ) : (
              "Post Job"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default PostJob;
