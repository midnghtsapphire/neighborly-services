import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, DollarSign, Loader2, Sparkles } from "lucide-react";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

const categories: { value: ServiceCategory; label: string }[] = [
  { value: "pet_care", label: "Pet Care" },
  { value: "lawn_garden", label: "Lawn & Garden" },
  { value: "handyman", label: "Handyman" },
  { value: "tutoring", label: "Tutoring" },
  { value: "sewing", label: "Sewing" },
  { value: "upholstery", label: "Upholstery" },
  { value: "cleaning", label: "Cleaning" },
  { value: "babysitting", label: "Babysitting" },
  { value: "errands", label: "Errands" },
  { value: "delivery", label: "Delivery" },
  { value: "music_lessons", label: "Music Lessons" },
  { value: "life_coaching", label: "Life Coaching" },
  { value: "recovery_coaching", label: "Recovery Coaching" },
  { value: "other", label: "Other" },
];

const serviceSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  hourly_rate: z.number().min(1, "Rate must be at least $1").max(500, "Rate must be less than $500").optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const EditService = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<ServiceFormData>>({
    title: "",
    description: "",
    category: undefined,
    hourly_rate: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Fetch existing service
  useEffect(() => {
    const fetchService = async () => {
      if (!user || !id) return;

      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .eq("provider_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Service not found",
            description: "This service doesn't exist or you don't have permission to edit it.",
            variant: "destructive",
          });
          navigate("/profile");
          return;
        }

        setFormData({
          title: data.title,
          description: data.description || "",
          category: data.category,
          hourly_rate: data.hourly_rate ? Number(data.hourly_rate) : undefined,
        });
      } catch (error: any) {
        toast({
          title: "Failed to load service",
          description: error.message,
          variant: "destructive",
        });
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchService();
    }
  }, [user, id, navigate, toast]);

  const validateForm = (): boolean => {
    const result = serviceSchema.safeParse({
      ...formData,
      hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : undefined,
    });

    if (!result.success) {
      const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ServiceFormData;
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

    if (!validateForm() || !user || !id) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("services")
        .update({
          title: formData.title!.trim(),
          description: formData.description?.trim() || null,
          category: formData.category as ServiceCategory,
          hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
        })
        .eq("id", id)
        .eq("provider_id", user.id);

      if (error) throw error;

      toast({
        title: "Service updated!",
        description: "Your changes have been saved.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Failed to update service",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

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
          <h1 className="font-display text-lg font-semibold text-foreground">Edit Service</h1>
        </div>
      </header>

      {/* Form */}
      <main className="p-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Service Title <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="title"
                placeholder="e.g., Dog Walking & Pet Sitting"
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
              placeholder="Describe your service, experience, and what makes you great at it..."
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
                setFormData({ ...formData, category: value });
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

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourly_rate" className="text-sm font-medium">
              Hourly Rate
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="hourly_rate"
                type="number"
                placeholder="25"
                value={formData.hourly_rate || ""}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined;
                  setFormData({ ...formData, hourly_rate: value });
                  setErrors({ ...errors, hourly_rate: undefined });
                }}
                className="pl-10 h-12 rounded-xl bg-card border-border"
                min={1}
                max={500}
              />
            </div>
            <p className="text-xs text-muted-foreground">Leave blank if you prefer to quote per job</p>
            {errors.hourly_rate && <p className="text-destructive text-xs">{errors.hourly_rate}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default EditService;
