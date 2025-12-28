import { Briefcase, Plus, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  title: string;
  description: string;
  budget: string;
  postedBy: string;
  timeAgo: string;
  distance: string;
  category: string;
  urgent?: boolean;
}

const JobCard = ({
  title,
  description,
  budget,
  postedBy,
  timeAgo,
  distance,
  category,
  urgent = false,
}: JobCardProps) => {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border hover:shadow-warm-md transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
            {urgent && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Urgent
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs line-clamp-2">{description}</p>
        </div>
        <span className="text-primary font-bold text-sm whitespace-nowrap">{budget}</span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px]">{category}</Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">{distance}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

const mockJobs: JobCardProps[] = [
  {
    title: "Need help moving furniture",
    description: "Looking for someone to help move a couch and dresser from 2nd floor to ground level.",
    budget: "$50",
    postedBy: "Mike S.",
    timeAgo: "2h ago",
    distance: "0.2 mi",
    category: "Moving",
    urgent: true,
  },
  {
    title: "Weekly dog walking",
    description: "Need someone to walk my golden retriever Mon-Fri around 12pm. He's very friendly!",
    budget: "$15/walk",
    postedBy: "Lisa K.",
    timeAgo: "5h ago",
    distance: "0.4 mi",
    category: "Pet Care",
  },
  {
    title: "Backyard cleanup",
    description: "Leaves need raking and some basic trimming. Approximately 2-3 hours of work.",
    budget: "$75",
    postedBy: "Tom R.",
    timeAgo: "1d ago",
    distance: "0.6 mi",
    category: "Lawn",
  },
];

const RecentJobs = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Jobs Near You</h2>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">See all</button>
      </div>

      <div className="space-y-3">
        {mockJobs.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </div>

      {/* Post a Job CTA */}
      <button 
        onClick={() => navigate("/post-job")}
        className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 group"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-medium text-primary text-sm">Post a Job</span>
      </button>
    </section>
  );
};

export default RecentJobs;
