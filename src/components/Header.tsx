import { MapPin, Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-top">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">N</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-foreground text-sm leading-tight">NeighborHub</span>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <MapPin className="w-3 h-3" />
              <span>Maplewood Heights</span>
            </button>
          </div>
        </div>

        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default Header;
