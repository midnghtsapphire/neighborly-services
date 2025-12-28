import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceCategories from "@/components/ServiceCategories";
import FeaturedListings from "@/components/FeaturedListings";
import RecentJobs from "@/components/RecentJobs";
import CommunityStats from "@/components/CommunityStats";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main>
        <HeroSection />
        <ServiceCategories />
        <FeaturedListings />
        <CommunityStats />
        <RecentJobs />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
