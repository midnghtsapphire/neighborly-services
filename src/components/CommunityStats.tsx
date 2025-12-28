import { useEffect, useState } from "react";
import { Users, ShieldCheck, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  neighbors: number;
  providers: number;
  jobsCompleted: number;
}

const CommunityStats = () => {
  const [stats, setStats] = useState<Stats>({ neighbors: 0, providers: 0, jobsCompleted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total profiles count
        const { count: profilesCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch service providers count
        const { count: providersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_service_provider", true);

        // Fetch completed jobs count
        const { count: jobsCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed");

        setStats({
          neighbors: profilesCount || 0,
          providers: providersCount || 0,
          jobsCompleted: jobsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const displayStats = [
    { 
      icon: Users, 
      value: loading ? "..." : formatNumber(stats.neighbors), 
      label: "Neighbors" 
    },
    { 
      icon: ShieldCheck, 
      value: loading ? "..." : formatNumber(stats.providers), 
      label: "Providers" 
    },
    { 
      icon: Heart, 
      value: loading ? "..." : formatNumber(stats.jobsCompleted), 
      label: "Jobs Done" 
    },
  ];

  return (
    <section className="px-4 py-6 bg-secondary/30">
      <div className="text-center mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Maplewood Heights Community</h2>
        <p className="text-muted-foreground text-xs">Building trust, one neighbor at a time</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col items-center p-3 rounded-xl bg-card shadow-warm-sm">
              <Icon className="w-5 h-5 text-primary mb-1" />
              <span className="font-display font-bold text-foreground text-lg">{stat.value}</span>
              <span className="text-muted-foreground text-xs">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CommunityStats;
