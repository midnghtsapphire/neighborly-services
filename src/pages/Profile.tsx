import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Phone, FileText, Briefcase, Loader2, LogOut, MapPin } from "lucide-react";
import { z } from "zod";
import MyServices from "@/components/MyServices";

const profileSchema = z.object({
  full_name: z.string().trim().max(100, "Name must be less than 100 characters").optional(),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  is_service_provider: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  phone: string | null;
  neighborhood: string | null;
  is_service_provider: boolean | null;
  avatar_url: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    bio: "",
    phone: "",
    is_service_provider: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || "",
            bio: data.bio || "",
            phone: data.phone || "",
            is_service_provider: data.is_service_provider || false,
          });
        }
      } catch (error: any) {
        toast({
          title: "Failed to load profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  const validateForm = (): boolean => {
    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ProfileFormData;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name?.trim() || null,
          bio: formData.bio?.trim() || null,
          phone: formData.phone?.trim() || null,
          is_service_provider: formData.is_service_provider,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
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
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">Profile</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="rounded-full"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6">
          <Avatar className="w-24 h-24 ring-4 ring-border mb-4">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-display font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{profile?.neighborhood || "Maplewood Heights"}</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => {
                  setFormData({ ...formData, full_name: e.target.value });
                  setErrors({ ...errors, full_name: undefined });
                }}
                className="pl-10 h-12 rounded-xl bg-card border-border"
                maxLength={100}
              />
            </div>
            {errors.full_name && <p className="text-destructive text-xs">{errors.full_name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setErrors({ ...errors, phone: undefined });
                }}
                className="pl-10 h-12 rounded-xl bg-card border-border"
                maxLength={20}
              />
            </div>
            {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Textarea
                id="bio"
                placeholder="Tell your neighbors a bit about yourself..."
                value={formData.bio}
                onChange={(e) => {
                  setFormData({ ...formData, bio: e.target.value });
                  setErrors({ ...errors, bio: undefined });
                }}
                className="pl-10 min-h-[100px] rounded-xl bg-card border-border resize-none"
                maxLength={500}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {formData.bio?.length || 0}/500
            </p>
            {errors.bio && <p className="text-destructive text-xs">{errors.bio}</p>}
          </div>

          {/* Service Provider Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Service Provider</p>
                <p className="text-xs text-muted-foreground">Offer services to neighbors</p>
              </div>
            </div>
            <Switch
              checked={formData.is_service_provider}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_service_provider: checked })
              }
            />
          </div>

          {formData.is_service_provider && (
            <>
              <div className="p-4 rounded-xl bg-secondary/50 border border-secondary">
                <p className="text-sm text-secondary-foreground">
                  As a service provider, you can list your services and get hired by neighbors.
                </p>
              </div>
              
              {/* My Services Section */}
              <MyServices userId={user.id} />
            </>
          )}
        </div>

        {/* Sign Out */}
        <div className="pt-6 border-t border-border">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
