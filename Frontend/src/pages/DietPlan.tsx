import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Utensils, Leaf, Apple } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DietPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [condition, setCondition] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const conditions = [
    "Diabetes",
    "High Blood Pressure",
    "Heart Disease",
    "Malnutrition",
    "Obesity",
    "Digestive Issues",
    "General Health"
  ];

  const commonAllergies = [
    "Nuts", "Dairy", "Gluten", "Eggs", "Seafood", "Soy"
  ];

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setAllergies([...allergies, allergy]);
    } else {
      setAllergies(allergies.filter(a => a !== allergy));
    }
  };

  const handleGeneratePlan = async () => {
    if (!age || !weight || !height || !condition) {
      toast({
        title: "Please fill all required fields",
        description: "Complete your profile to generate a personalized diet plan",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI plan generation - would require Supabase backend
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Diet Plan Ready!",
        description: "Connect to Supabase to enable full AI diet plan generation",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full mb-6">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Personalized Diet Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get AI-powered nutrition plans using locally available, affordable foods
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Your Health Profile
                  </CardTitle>
                  <CardDescription>
                    Tell us about yourself to create a personalized diet plan that fits your lifestyle and health needs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        placeholder="30"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        placeholder="70"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input
                        id="height"
                        placeholder="170"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condition">Health Condition *</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary health focus" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((cond) => (
                          <SelectItem key={cond} value={cond}>
                            {cond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Food Allergies (optional)</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {commonAllergies.map((allergy) => (
                        <div key={allergy} className="flex items-center space-x-2">
                          <Checkbox
                            id={allergy}
                            checked={allergies.includes(allergy)}
                            onCheckedChange={(checked) => 
                              handleAllergyChange(allergy, checked as boolean)
                            }
                          />
                          <Label htmlFor={allergy} className="text-sm">
                            {allergy}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                    size="lg"
                  >
                    {isGenerating ? "Creating your diet plan..." : "Generate My Diet Plan"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Local Foods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Local Superfoods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Millets</Badge>
                    <Badge variant="secondary">Lentils</Badge>
                    <Badge variant="secondary">Leafy Greens</Badge>
                    <Badge variant="secondary">Seasonal Fruits</Badge>
                    <Badge variant="secondary">Yogurt</Badge>
                    <Badge variant="secondary">Nuts & Seeds</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Apple className="h-5 w-5 text-red-500" />
                    Farmer Nutrition Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    • Eat protein-rich foods for muscle recovery after farm work
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Include complex carbs for sustained energy throughout the day
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Stay hydrated with water, buttermilk, or coconut water
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Eat seasonal produce for maximum nutrition and affordability
                  </p>
                </CardContent>
              </Card>

              {/* Sample Meal */}
              <Card className="bg-gradient-subtle">
                <CardHeader>
                  <CardTitle className="text-lg">Sample Farmer's Meal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Breakfast</p>
                    <p className="text-sm text-muted-foreground">
                      Millet porridge with jaggery, banana, and nuts
                    </p>
                    <p className="font-medium text-sm mt-3">Lunch</p>
                    <p className="text-sm text-muted-foreground">
                      Rice, dal, vegetables, and buttermilk
                    </p>
                    <p className="font-medium text-sm mt-3">Dinner</p>
                    <p className="text-sm text-muted-foreground">
                      Roti, seasonal vegetables, and yogurt
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DietPlan;