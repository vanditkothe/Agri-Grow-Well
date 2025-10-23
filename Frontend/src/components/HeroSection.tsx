import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-agri-health.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/80" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              One-Stop AI Platform for{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Farmers' Health
              </span>{" "}
              & Crop Care
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Combining advanced AI technology to monitor your personal health, 
              create personalized nutrition plans, and detect crop diseases - 
              all in one comprehensive platform designed for rural communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/health-check'}>

                Start Health Check

                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Farmers Helped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-glow">
              <img 
                src={heroImage} 
                alt="Farmer using AI technology for health and crop management"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;