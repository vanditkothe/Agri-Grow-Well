import { Button } from "@/components/ui/button";
import { Leaf, Heart, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Agri-Health AI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </a>
          <a href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="/calendar" className="text-muted-foreground hover:text-foreground transition-colors">
            Calendar
          </a>
          <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <a href="/signin">Sign In</a>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <a href="/register">Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;