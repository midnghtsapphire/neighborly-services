import { Search, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden gradient-hero px-4 pt-6 pb-10">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl" />
      
      <div className="relative z-10 max-w-md mx-auto">
        <h1 className="font-display text-primary-foreground text-2xl sm:text-3xl font-semibold leading-tight mb-2">
          Your neighbors are ready to help
        </h1>
        <p className="text-primary-foreground/80 text-sm mb-6">
          Find trusted local services from people in your community
        </p>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="What do you need help with?"
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground shadow-warm-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["Dog walking", "Lawn care", "Tutoring"].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/30 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button asChild variant="secondary" className="flex-1 h-11 rounded-xl font-medium">
            <Link to="/post-job">
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Link>
          </Button>
          <Button asChild className="flex-1 h-11 rounded-xl font-medium bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link to="/add-service">
              <Sparkles className="w-4 h-4 mr-2" />
              List a Service
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
