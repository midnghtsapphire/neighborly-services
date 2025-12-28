import { Star, MapPin, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  name: string;
  avatar: string;
  initials: string;
  service: string;
  rating: number;
  reviews: number;
  distance: string;
  availability: string;
  price: string;
  isVerified?: boolean;
}

const ServiceCard = ({
  name,
  avatar,
  initials,
  service,
  rating,
  reviews,
  distance,
  availability,
  price,
  isVerified = false,
}: ServiceCardProps) => {
  return (
    <div className="min-w-[280px] p-4 rounded-2xl bg-card shadow-warm-sm hover:shadow-warm-md transition-all duration-200 cursor-pointer group">
      <div className="flex gap-3">
        <div className="relative">
          <Avatar className="w-14 h-14 ring-2 ring-border">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-success-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-muted-foreground text-xs">{service}</p>
            </div>
            <span className="text-primary font-semibold text-sm whitespace-nowrap">{price}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="text-xs font-medium text-foreground">{rating}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{distance}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2 text-success">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">{availability}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const mockListings: ServiceCardProps[] = [
  {
    name: "Sarah M.",
    avatar: "",
    initials: "SM",
    service: "Dog Walking & Pet Sitting",
    rating: 4.9,
    reviews: 23,
    distance: "0.3 mi",
    availability: "Available today",
    price: "$20/hr",
    isVerified: true,
  },
  {
    name: "Marcus T.",
    avatar: "",
    initials: "MT",
    service: "Lawn Care & Landscaping",
    rating: 4.8,
    reviews: 31,
    distance: "0.5 mi",
    availability: "Available tomorrow",
    price: "$35/hr",
    isVerified: true,
  },
  {
    name: "Emily R.",
    avatar: "",
    initials: "ER",
    service: "Math & Science Tutoring",
    rating: 5.0,
    reviews: 15,
    distance: "0.4 mi",
    availability: "Available weekends",
    price: "$25/hr",
    isVerified: false,
  },
  {
    name: "James K.",
    avatar: "",
    initials: "JK",
    service: "Handyman Services",
    rating: 4.7,
    reviews: 42,
    distance: "0.8 mi",
    availability: "Available today",
    price: "$45/hr",
    isVerified: true,
  },
];

const FeaturedListings = () => {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Nearby Helpers</h2>
        <button className="text-sm text-primary font-medium hover:underline">View all</button>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {mockListings.map((listing, index) => (
          <ServiceCard key={index} {...listing} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedListings;
