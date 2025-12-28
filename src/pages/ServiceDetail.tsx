import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Phone, Star, MessageCircle, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MessageButton from "@/components/MessageButton";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  neighborhood: string | null;
  phone: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  category: string;
  hourly_rate: number | null;
  is_active: boolean | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

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

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Profile | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) return;

      // Fetch the main service
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (serviceError || !serviceData) {
        console.error("Error fetching service:", serviceError);
        setLoading(false);
        return;
      }

      setService(serviceData);

      // Fetch provider profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", serviceData.provider_id)
        .maybeSingle();

      if (profileData) {
        setProvider(profileData);
      }

      // Fetch all services by this provider
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("provider_id", serviceData.provider_id)
        .eq("is_active", true);

      if (servicesData) {
        setAllServices(servicesData);
      }

      // Fetch reviews for this provider
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
        `)
        .eq("reviewee_id", serviceData.provider_id)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData as Review[]);
      }

      setLoading(false);
    };

    fetchServiceDetails();
  }, [id]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!service || !provider) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Service not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary/10 p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={provider.avatar_url || undefined} />
            <AvatarFallback className="text-xl">
              {provider.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{provider.full_name || "Service Provider"}</h1>
            
            {provider.neighborhood && (
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{provider.neighborhood}</span>
              </div>
            )}
            
            {reviews.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            )}
          </div>
        </div>
        
        {provider.bio && (
          <p className="mt-4 text-muted-foreground">{provider.bio}</p>
        )}
        
        {user && user.id !== provider.id && (
          <div className="mt-4">
            <MessageButton userId={provider.id} className="w-full" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Current Service Highlight */}
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {categoryLabels[service.category] || service.category}
                </Badge>
                <h2 className="text-xl font-semibold">{service.title}</h2>
              </div>
              {service.hourly_rate && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary font-bold text-lg">
                    <DollarSign className="h-4 w-4" />
                    {service.hourly_rate}
                    <span className="text-sm font-normal text-muted-foreground">/hr</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {service.description || "No description provided."}
            </p>
          </CardContent>
        </Card>

        {/* All Services */}
        {allServices.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">All Services by {provider.full_name?.split(" ")[0]}</h3>
            <div className="space-y-3">
              {allServices
                .filter((s) => s.id !== service.id)
                .map((s) => (
                  <Card
                    key={s.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => navigate(`/service/${s.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-1 text-xs">
                            {categoryLabels[s.category] || s.category}
                          </Badge>
                          <h4 className="font-medium">{s.title}</h4>
                          {s.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {s.description}
                            </p>
                          )}
                        </div>
                        {s.hourly_rate && (
                          <span className="text-primary font-semibold">${s.hourly_rate}/hr</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h3>
          
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Star className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                        <AvatarFallback>
                          {review.reviewer?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {review.reviewer?.full_name || "Anonymous"}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
