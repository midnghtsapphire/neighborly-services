import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  isPrimary?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, isPrimary, onClick }: NavItemProps) => {
  if (isPrimary) {
    return (
      <button
        onClick={onClick}
        className="relative -top-4 flex flex-col items-center gap-1"
      >
        <div className="w-14 h-14 rounded-full gradient-hero shadow-glow flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-2 px-4 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-end justify-around max-w-md mx-auto pb-1">
        <NavItem icon={Home} label="Home" isActive />
        <NavItem icon={Search} label="Explore" />
        <NavItem icon={PlusCircle} label="Post" isPrimary />
        <NavItem icon={MessageCircle} label="Messages" />
        <NavItem icon={User} label="Profile" />
      </div>
    </nav>
  );
};

export default BottomNav;
