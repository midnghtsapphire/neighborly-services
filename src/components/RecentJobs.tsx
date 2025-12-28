import { useEffect, useState } from "react";
import { Briefcase, Plus, Clock, MapPin, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
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
  other: "Other",
};

interface Job {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget: number | null;
  is_urgent: boolean | null;
  location: string | null;
  created_at: string;
  poster_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface JobCardProps {
  title: string;
  description: string;
  budget: string;
  timeAgo: string;
  location: string;
  category: string;
  urgent?: boolean;
  posterId: string;
  onMessage: (posterId: string) => void;
  isOwnJob: boolean;
}

const JobCard = ({
  title,
  description,
  budget,
  timeAgo,
  location,
  category,
  urgent = false,
  posterId,
  onMessage,
  isOwnJob,
}: JobCardProps) => {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border hover:shadow-warm-md transition-all duration-200">
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
          {location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{location}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{timeAgo}</span>
          </div>
          {!isOwnJob && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onMessage(posterId);
              }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const JobCardSkeleton = () => (
  <div className="p-4 rounded-2xl bg-card border border-border">
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
      <Briefcase className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">No jobs posted yet</p>
    <p className="text-xs text-muted-foreground mt-1">Be the first to post a job!</p>
  </div>
);

const RecentJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { findOrCreateConversation } = useMessaging();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const handleMessage = async (posterId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const conversationId = await findOrCreateConversation(posterId);
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
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            description,
            category,
            budget,
            is_urgent,
            location,
            created_at,
            poster_id,
            profiles!jobs_poster_id_fkey (
              full_name
            )
          `)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        setJobs((data || []).map(job => ({
          ...job,
          profiles: job.profiles as Job["profiles"]
        })));
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Jobs Near You</h2>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">See all</button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              description={job.description || "No description provided"}
              budget={job.budget ? `$${job.budget}` : "Flexible"}
              timeAgo={formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              location={job.location || ""}
              category={categoryLabels[job.category] || job.category}
              urgent={job.is_urgent || false}
              posterId={job.poster_id}
              onMessage={handleMessage}
              isOwnJob={user?.id === job.poster_id}
            />
          ))}
        </div>
      )}

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
