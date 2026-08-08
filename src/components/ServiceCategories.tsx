import { useNavigate } from "react-router-dom";
import {
  Dog,
  Leaf,
  Wrench,
  GraduationCap,
  Car,
  Sparkles,
  Baby,
  ShoppingBag,
  Scissors,
  Sofa,
  Music,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICE_CATEGORIES, type ServiceCategoryValue } from "@/lib/categories";

const CATEGORY_ICONS: Record<ServiceCategoryValue, LucideIcon> = {
  pet_care: Dog,
  lawn_garden: Leaf,
  handyman: Wrench,
  tutoring: GraduationCap,
  sewing: Scissors,
  upholstery: Sofa,
  cleaning: Sparkles,
  babysitting: Baby,
  errands: Car,
  delivery: ShoppingBag,
  music_lessons: Music,
  life_coaching: Heart,
  other: Sparkles,
};

const ServiceCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Browse Services</h2>
        <button
          onClick={() => navigate("/services")}
          className="text-sm text-primary font-medium hover:underline"
        >
          See all
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {SERVICE_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.value] ?? Sparkles;
          return (
            <button
              key={category.value}
              onClick={() => navigate(`/services?category=${category.value}`)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:shadow-warm-md transition-all duration-200 group"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                  category.color,
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-foreground font-medium text-center leading-tight">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceCategories;
