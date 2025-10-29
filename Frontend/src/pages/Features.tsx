import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Stethoscope, Sprout, MessageCircle, Shield, Users } from "lucide-react";

const Features = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Features - Agri-Health AI Assistant";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Discover all features of Agri-Health AI Assistant: health self-checks, personalized diet plans, crop disease detection, AI chat support for farmers and rural communities.'
      );
    }
  }, []);

  const features = [
    {
      icon: Stethoscope,
      title: "Health Self-Check & Disease Triage",
      description: "Enter symptoms in simple language and get AI-powered health assessments with recommended next steps.",
      benefits: [
        "Early detection of health issues",
        "Emergency alerts for critical symptoms", 
        "Home remedy suggestions",
        "Doctor consultation recommendations"
      ],
      link: "/health-check"
    },
    {
      icon: Heart,
      title: "Personalized Diet Plans",
      description: "Get customized daily and weekly diet charts for managing chronic diseases using locally available foods.",
      benefits: [
        "Diabetes management nutrition",
        "Hypertension-friendly meals",
        "Culturally appropriate recipes",
        "Affordable, local ingredients"
      ],
      link: "/diet-plan"
    },
    {
      icon: Sprout,
      title: "Crop Disease Detection",
      description: "Upload crop images to detect diseases, pests, and nutrient deficiencies with treatment recommendations.",
      benefits: [
        "Early disease detection",
        "Treatment and fertilizer guidance",
        "Preventive farming tips",
        "Seasonal crop rotation advice"
      ],
      link: "/crop-detection"
    },
    {
      icon: MessageCircle,
      title: "AI Chat Assistant",
      description: "Friendly chatbot support for all your health and farming questions with voice input capabilities.",
      benefits: [
        "24/7 assistance available",
        "Voice input for easy interaction",
        "Multi-language support",
        "Visual aids and explanations"
      ],
      link: "/ai-assistant"
    },
    {
      icon: Shield,
      title: "Trusted & Secure",
      description: "Your health and farming data is protected with enterprise-grade security and privacy measures.",
      benefits: [
        "End-to-end encryption",
        "HIPAA-compliant storage",
        "No data sharing with third parties",
        "Offline mode available"
      ],
      link: null
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with other farmers and access expert guidance through our supportive community platform.",
      benefits: [
        "Success stories sharing",
        "Expert farming tips",
        "Peer-to-peer support",
        "Local farming networks"
      ],
      link: null
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Complete Farming & Health Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how Agri-Health AI Assistant empowers farmers and rural communities 
              with comprehensive health monitoring and advanced crop management tools.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className={`group hover:shadow-elegant transition-all duration-300 ${feature.link ? 'cursor-pointer' : ''}`}
                  onClick={() => feature.link && navigate(feature.link)}
                >
                  <CardHeader>
                    <div className="p-3 bg-gradient-primary rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                Built for Farmers, By Farmers
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Agri-Health AI Assistant was created with deep understanding of rural challenges. 
                Our platform combines cutting-edge AI technology with farmer-friendly design, 
                ensuring that advanced healthcare and agricultural guidance is accessible to everyone, 
                regardless of technical experience.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">500K+</div>
                  <div className="text-muted-foreground">Farmers Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;