import { useEffect, useState } from "react";
import { Star, MapPin, Clock, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels: Record<string, string> = {
  pet_care: "Pet Care",
  lawn_garden: "Lawn & Garden",
  handyman: "Handyman",
  tutoring: "Tutoring",
  errands: "Errands",
  cleaning: "Cleaning",
  babysitting: "Babysitting",
  delivery: "Delivery",
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

interface ServiceCardProps {
  name: string;
  avatar: string;
  initials: string;
  service: string;
  rating: number;
  reviews: number;
  price: string;
}

const ServiceCard = ({
  name,
  avatar,
  initials,
  service,
  rating,
  reviews,
  price,
}: ServiceCardProps) => {
  return (
    <div className="min-w-[280px] p-4 rounded-2xl bg-card shadow-warm-sm hover:shadow-warm-md transition-all duration-200 cursor-pointer group">
      <div className="flex gap-3">
        <div className="relative">
          <Avatar className="w-14 h-14 ring-2 ring-border">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-muted-foreground text-xs line-clamp-1">{service}</p>
            </div>
            <span className="text-primary font-semibold text-sm whitespace-nowrap">{price}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">Nearby</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2 text-success">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCardSkeleton = () => (
  <div className="min-w-[280px] p-4 rounded-2xl bg-card shadow-warm-sm">
    <div className="flex gap-3">
      <Skeleton className="w-14 h-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
      <Users className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">No service providers yet</p>
    <p className="text-xs text-muted-foreground mt-1">Be the first to offer services!</p>
  </div>
);

const FeaturedListings = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch services with provider profiles
        const { data: servicesData, error: servicesError } = await supabase
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
          .order("created_at", { ascending: false })
          .limit(10);

        if (servicesError) throw servicesError;

        // Fetch review stats for each provider
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
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Nearby Helpers</h2>
        <button className="text-sm text-primary font-medium hover:underline">View all</button>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              name={service.profiles?.full_name || "Anonymous"}
              avatar={service.profiles?.avatar_url || ""}
              initials={getInitials(service.profiles?.full_name)}
              service={service.title}
              rating={service.review_stats.avg_rating}
              reviews={service.review_stats.review_count}
              price={service.hourly_rate ? `$${service.hourly_rate}/hr` : "Contact"}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedListings;
