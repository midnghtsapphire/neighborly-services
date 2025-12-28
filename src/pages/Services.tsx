import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/hooks/useMessaging";
import { useToast } from "@/hooks/use-toast";

const categoryLabels: Record<string, string> = {
  pet_care: "Pet Care",
  lawn_garden: "Lawn & Garden",
  handyman: "Handyman",
  tutoring: "Tutoring",
  errands: "Errands",
  cleaning: "Cleaning",
  babysitting: "Babysitting",
  delivery: "Delivery",
  sewing: "Sewing",
  upholstery: "Upholstery",
  music_lessons: "Music Lessons",
  life_coaching: "Life Coaching",
  other: "Other",
};

interface Service {
  id: string;
  title: string;
  description: string | null;
  category: string;
  hourly_rate: number | null;
  provider_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  review_stats: {
    avg_rating: number;
    review_count: number;
  };
}

const Services = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const { user } = useAuth();
  const { findOrCreateConversation } = useMessaging();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const handleMessage = async (providerId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const conversationId = await findOrCreateConversation(providerId);
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    } else {
      toast({
        title: "Error",
        description: "Could not start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("services")
          .select(`
            id,
            title,
            description,
            category,
            hourly_rate,
            provider_id,
            profiles!services_provider_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (category) {
          query = query.eq("category", category as any);
        }

        const { data: servicesData, error: servicesError } = await query;

        if (servicesError) throw servicesError;

        const servicesWithStats = await Promise.all(
          (servicesData || []).map(async (service) => {
            const { data: reviews } = await supabase
              .from("reviews")
              .select("rating")
              .eq("reviewee_id", service.provider_id);

            const reviewCount = reviews?.length || 0;
            const avgRating = reviewCount > 0
              ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              : 5.0;

            return {
              ...service,
              profiles: service.profiles as Service["profiles"],
              review_stats: { avg_rating: avgRating, review_count: reviewCount },
            };
          })
        );

        setServices(servicesWithStats);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [category]);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const pageTitle = category ? categoryLabels[category] || category : "All Services";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-semibold">{pageTitle}</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex gap-3">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services found in this category.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/add-service")}
            >
              Be the first to offer this service
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => {
              const isOwnService = user?.id === service.provider_id;
              return (
                <div
                  key={service.id}
                  className="p-4 rounded-2xl bg-card border border-border hover:shadow-warm-md hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <div className="flex gap-3">
                    <Avatar className="w-14 h-14 ring-2 ring-border">
                      <AvatarImage
                        src={service.profiles?.avatar_url || undefined}
                        alt={service.profiles?.full_name || "Provider"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(service.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">
                            {service.profiles?.full_name || "Anonymous"}
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            {service.title}
                          </p>
                        </div>
                        <span className="text-primary font-semibold text-sm whitespace-nowrap">
                          {service.hourly_rate ? `$${service.hourly_rate}/hr` : "Contact"}
                        </span>
                      </div>

                      {service.description && (
                        <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                          <span className="text-xs font-medium text-foreground">
                            {service.review_stats.avg_rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({service.review_stats.review_count})
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {categoryLabels[service.category] || service.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-success">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-medium">Available</span>
                        </div>
                        {!isOwnService && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handleMessage(service.provider_id)}
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1" />
                            Message
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
