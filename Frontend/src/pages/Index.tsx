import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";

const Index = () => {
  useEffect(() => {
    // Update document title and meta description for SEO
    document.title = "Agri-Health AI Assistant - Complete Farming & Health Platform";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'AI-powered platform for farmers combining health self-checks, personalized diet plans, and crop disease detection. Improve your health and farming success with advanced AI technology.'
      );
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Agri-Health AI Assistant",
      "description": "Complete AI platform for farmers' health and crop management",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Health Self-Check & Disease Triage",
        "Personalized Diet Plans for Chronic Diseases", 
        "Crop Disease Detection & Farming Guidance"
      ]
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Index;