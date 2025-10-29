import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Calendar from "./pages/Calendar";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import HealthCheck from "./pages/HealthCheck";
import DietPlan from "./pages/DietPlan";
import CropDetection from "./pages/CropDetection";
import SoilReport from "./pages/SoilReport";
import NotFound from "./pages/Contact";
import AiAssistant from "./pages/AiAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/health-check" element={<HealthCheck />} />
          <Route path="/diet-plan" element={<DietPlan />} />
          <Route path="/crop-detection" element={<CropDetection />} />
          <Route path="/soil-report" element={<SoilReport />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
