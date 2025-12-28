import { Users, ShieldCheck, Heart } from "lucide-react";

const stats = [
  { icon: Users, value: "1,250+", label: "Neighbors" },
  { icon: ShieldCheck, value: "98%", label: "Verified" },
  { icon: Heart, value: "4,800+", label: "Jobs Done" },
];

const CommunityStats = () => {
  return (
    <section className="px-4 py-6 bg-secondary/30">
      <div className="text-center mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Maplewood Heights Community</h2>
        <p className="text-muted-foreground text-xs">Building trust, one neighbor at a time</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
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
