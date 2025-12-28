import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];

const categoryLabels: Record<string, string> = {
  pet_care: "Pet Care",
  lawn_garden: "Lawn & Garden",
  handyman: "Handyman",
  tutoring: "Tutoring",
  sewing: "Sewing",
  upholstery: "Upholstery",
  cleaning: "Cleaning",
  babysitting: "Babysitting",
  errands: "Errands",
  delivery: "Delivery",
  music_lessons: "Music Lessons",
  life_coaching: "Life Coaching",
  recovery_coaching: "Recovery Coaching",
  other: "Other",
};

interface MyServicesProps {
  userId: string;
}

const MyServices = ({ userId }: MyServicesProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("provider_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load services",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [userId]);

  const handleDelete = async (serviceId: string) => {
    setDeletingId(serviceId);
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      setServices(services.filter((s) => s.id !== serviceId));
      toast({
        title: "Service deleted",
        description: "Your service has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete service",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !service.is_active })
        .eq("id", service.id);

      if (error) throw error;

      setServices(
        services.map((s) =>
          s.id === service.id ? { ...s, is_active: !s.is_active } : s
        )
      );

      toast({
        title: service.is_active ? "Service paused" : "Service activated",
        description: service.is_active
          ? "Your service is now hidden from neighbors."
          : "Your service is now visible to neighbors.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update service",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">
          My Services
        </h2>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => navigate("/add-service")}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl bg-card border border-border">
          <p className="text-muted-foreground text-sm mb-4">
            You haven't listed any services yet.
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate("/add-service")}
          >
            <Plus className="w-4 h-4 mr-2" />
            List Your First Service
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-xl bg-card border border-border transition-opacity ${
                !service.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {service.title}
                    </h3>
                    {!service.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {categoryLabels[service.category] || service.category}
                  </p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  {service.hourly_rate && (
                    <div className="flex items-center gap-1 mt-2 text-sm font-medium text-primary">
                      <DollarSign className="w-4 h-4" />
                      {service.hourly_rate}/hr
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                  onClick={() => toggleActive(service)}
                >
                  {service.is_active ? "Pause" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => navigate(`/edit-service/${service.id}`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-destructive hover:text-destructive"
                      disabled={deletingId === service.id}
                    >
                      {deletingId === service.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this service?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{service.title}" from your
                        listings. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(service.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;
