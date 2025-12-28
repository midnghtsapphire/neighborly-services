import { Dog, Leaf, Wrench, GraduationCap, Car, Sparkles, Baby, ShoppingBag, Scissors, Sofa, Music, Heart, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { icon: Dog, label: "Pet Care", color: "bg-secondary text-secondary-foreground" },
  { icon: Leaf, label: "Lawn & Garden", color: "bg-success/10 text-success" },
  { icon: Wrench, label: "Handyman", color: "bg-primary/10 text-primary" },
  { icon: GraduationCap, label: "Tutoring", color: "bg-neighborhood/10 text-neighborhood" },
  { icon: Scissors, label: "Sewing", color: "bg-accent/50 text-accent-foreground" },
  { icon: Sofa, label: "Upholstery", color: "bg-neighborhood/10 text-neighborhood" },
  { icon: Sparkles, label: "Cleaning", color: "bg-secondary text-secondary-foreground" },
  { icon: Baby, label: "Babysitting", color: "bg-primary/10 text-primary" },
  { icon: Car, label: "Errands", color: "bg-success/10 text-success" },
  { icon: ShoppingBag, label: "Delivery", color: "bg-primary/10 text-primary" },
  { icon: Music, label: "Music Lessons", color: "bg-neighborhood/10 text-neighborhood" },
  { icon: Heart, label: "Life Coaching", color: "bg-secondary text-secondary-foreground" },
  { icon: HeartHandshake, label: "Recovery", color: "bg-accent/50 text-accent-foreground" },
];

const ServiceCategories = () => {
  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Browse Services</h2>
        <button className="text-sm text-primary font-medium hover:underline">See all</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.label}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:shadow-warm-md transition-all duration-200 group"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", category.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-foreground font-medium text-center leading-tight">{category.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceCategories;
