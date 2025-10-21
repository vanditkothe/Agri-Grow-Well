import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Utensils, Leaf, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import healthCheckIcon from "@/assets/health-check-icon.jpg";
import dietPlanIcon from "@/assets/diet-plan-icon.jpg";
import cropDiseaseIcon from "@/assets/crop-disease-icon.jpg";
import soilReportIcon from "@/assets/soil-report-icon.jpg";

const features = [
  {
    id: "health-check",
    title: "Health Self-Check & Disease Triage",
    description: "AI-powered health assessment system that helps farmers identify potential health issues early and provides guidance on when to seek medical attention.",
    icon: Heart,
    image: healthCheckIcon,
    color: "health",
    benefits: [
      "Early disease detection",
      "Symptom tracking & analysis", 
      "Medical guidance recommendations",
      "Rural-friendly health monitoring"
    ]
  },
  {
    id: "diet-plans",
    title: "Personalized Diet Plans for Chronic Diseases",
    description: "Customized nutrition plans designed specifically for farmers with chronic conditions, using locally available ingredients and traditional foods.",
    icon: Utensils,
    image: dietPlanIcon,
    color: "accent",
    benefits: [
      "Locally-sourced meal plans",
      "Chronic disease management",
      "Affordable nutrition guidance",
      "Traditional food integration"
    ]
  },
  {
    id: "crop-detection",
    title: "Crop Disease Detection & Farming Guidance",
    description: "Advanced AI system that identifies crop diseases through image analysis and provides actionable farming advice to improve yield and crop health.",
    icon: Leaf,
    image: cropDiseaseIcon,
    color: "primary",
    benefits: [
      "Instant disease identification",
      "Treatment recommendations",
      "Yield optimization tips",
      "Seasonal farming guidance"
    ]
  },
  {
    id: "soil-report",
    title: "Soil Report Analysis",
    description: "Upload your soil test reports and get AI-powered recommendations for optimal crop selection, fertilizer application, and soil improvement strategies.",
    icon: BarChart3,
    image: soilReportIcon,
    color: "accent",
    benefits: [
      "Soil parameter analysis",
      "Crop suitability recommendations", 
      "Fertilizer optimization",
      "Seasonal planting calendar"
    ]
  }
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  const getFeaturePath = (featureId: string) => {
    switch (featureId) {
      case "health-check":
        return "/health-check";
      case "diet-plans":
        return "/diet-plan";
      case "crop-detection":
        return "/crop-detection";
      case "soil-report":
        return "/soil-report";
      default:
        return "/";
    }
  };
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Complete AI Solution for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Modern Farming
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Four powerful AI tools in one platform, designed specifically 
            for farmers and rural communities to improve both personal health and agricultural productivity.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.id} className="p-8 bg-gradient-card border-0 shadow-medium hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                <div className="mb-6">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className={`absolute top-4 left-4 p-3 rounded-full ${
                      feature.color === 'health' ? 'bg-health' : 
                      feature.color === 'accent' ? 'bg-accent' : 'bg-primary'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        feature.color === 'health' ? 'text-health-foreground' : 
                        feature.color === 'accent' ? 'text-accent-foreground' : 'text-primary-foreground'
                      }`} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  variant={feature.color as "health" | "accent" | "default"} 
                  className="w-full"
                  onClick={() => navigate(getFeaturePath(feature.id))}
                >
                  Try {feature.title.split(' ')[0]} Feature
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Ready to Transform Your Farming Experience?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already using our AI platform to improve their health and crop yields.
          </p>
          <Button 
            variant="hero" 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate("/register")}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;