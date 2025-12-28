import { forwardRef } from "react";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  onClick?: () => void;
}

const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(
  ({ icon: Icon, label, path, isActive, isPrimary, onClick }, ref) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  if (isPrimary) {
    return (
      <button
        ref={ref}
        onClick={handleClick}
        className="relative -top-4 flex flex-col items-center gap-1"
      >
        <div className="w-14 h-14 rounded-full gradient-hero shadow-glow flex items-center justify-center hover:scale-105 transition-transform">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      </button>
    );
  }

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-1 py-2 px-4 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
});

NavItem.displayName = "NavItem";

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-end justify-around max-w-md mx-auto pb-1">
        <NavItem icon={Home} label="Home" path="/" isActive={currentPath === "/"} />
        <NavItem icon={Search} label="Explore" path="/explore" isActive={currentPath === "/explore"} />
        <NavItem icon={PlusCircle} label="Post" path="/post-job" isPrimary />
        <NavItem icon={MessageCircle} label="Messages" path="/messages" isActive={currentPath === "/messages"} />
        <NavItem icon={User} label="Profile" path="/profile" isActive={currentPath === "/profile"} />
      </div>
    </nav>
  );
};

export default BottomNav;
