import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Utensils, Leaf, Apple, Loader2, Info, CheckCircle, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const DietPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [dietType, setDietType] = useState<"vegetarian" | "non-vegetarian">("vegetarian");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietPlan, setDietPlan] = useState<any | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedPlan, setTranslatedPlan] = useState<any | null>(null);
  const [showHindi, setShowHindi] = useState(false);

  const availableConditions = [
    "Diabetes",
    "High Blood Pressure",
    "Heart Disease",
    "Malnutrition",
    "Obesity",
    "Digestive Issues",
    "General Health",
  ];

  const commonAllergies = ["Nuts", "Dairy", "Gluten", "Eggs", "Seafood", "Soy"];

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setConditions([...conditions, condition]);
    } else {
      setConditions(conditions.filter((c) => c !== condition));
    }
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setAllergies([...allergies, allergy]);
    } else {
      setAllergies(allergies.filter((a) => a !== allergy));
    }
  };

  const calculateBMI = () => {
    if (!weight || !height) return null;
    const heightInMeters = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { text: "Normal", color: "text-green-600" };
    if (bmi < 30) return { text: "Overweight", color: "text-yellow-600" };
    return { text: "Obese", color: "text-red-600" };
  };

  const handleGeneratePlan = async () => {
    if (!age || !weight || !height || conditions.length === 0) {
      toast({
        title: "Please fill all required fields",
        description: "Complete your profile and select at least one health condition",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setDietPlan(null);
    setTranslatedPlan(null);
    setShowHindi(false);

    try {
      const API_URL = import.meta.env.VITE_API_URL ;

      const response = await fetch(`${API_URL}/api/diet/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        
        body: JSON.stringify({
          age,
          weight,
          height,
          condition: conditions.join(", "), // Send multiple conditions
          dietType,
          allergies,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate diet plan");

      const data = await response.json();
      setDietPlan(data.plan);

      toast({
        title: "Diet Plan Ready!",
        description: "Check your personalized diet plan below 🎉",
      });
    } catch (err) {
      toast({
        title: "Failed to generate diet plan",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslateToHindi = async () => {
    if (!dietPlan) return;

    setIsTranslating(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL ;

      const response = await fetch(`${API_URL}/api/diet/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        
        body: JSON.stringify({
          dietPlan,
        }),
      });

      if (!response.ok) throw new Error("Failed to translate diet plan");

      const data = await response.json();
      setTranslatedPlan(data.translatedPlan);
      setShowHindi(true);

      toast({
        title: "Translated to Hindi!",
        description: "आपका आहार योजना हिंदी में तैयार है",
      });
    } catch (err) {
      toast({
        title: "Translation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  const currentPlan = showHindi
  ? translatedPlan ?? null
  : dietPlan ?? null;


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
            <h1 className="text-4xl font-bold text-foreground mb-4">Personalized Diet Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get AI-powered nutrition plans using locally available, affordable foods
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
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
                        type="number"
                        placeholder="30" 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input 
                        id="weight" 
                        type="number"
                        placeholder="70" 
                        value={weight} 
                        onChange={(e) => setWeight(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input 
                        id="height" 
                        type="number"
                        placeholder="170" 
                        value={height} 
                        onChange={(e) => setHeight(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                  </div>

                  {/* BMI Display */}
                  {bmi && bmiCategory && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Your BMI: <span className="font-semibold">{bmi}</span> - 
                        <span className={`font-semibold ml-1 ${bmiCategory.color}`}>
                          {bmiCategory.text}
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Health Conditions - Multiple Selection */}
                  <div className="space-y-3">
                    <Label>Health Conditions * (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableConditions.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={condition}
                            checked={conditions.includes(condition)}
                            onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                            disabled={isGenerating}
                          />
                          <Label htmlFor={condition} className="text-sm cursor-pointer font-medium">
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {conditions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {conditions.map((condition) => (
                          <Badge key={condition} variant="default">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Diet Type */}
                  <div className="space-y-3">
                    <Label>Diet Preference</Label>
                    <RadioGroup value={dietType} onValueChange={(value: any) => setDietType(value)}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                          dietType === "vegetarian" 
                            ? "border-green-500 bg-green-50" 
                            : "border-muted hover:border-green-300"
                        }`}>
                          <RadioGroupItem value="vegetarian" id="vegetarian" />
                          <Label htmlFor="vegetarian" className="flex items-center gap-2 cursor-pointer">
                            <Leaf className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-semibold">Vegetarian</div>
                              <div className="text-xs text-muted-foreground">Plant-based diet</div>
                            </div>
                          </Label>
                        </div>

                        <div className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                          dietType === "non-vegetarian" 
                            ? "border-orange-500 bg-orange-50" 
                            : "border-muted hover:border-orange-300"
                        }`}>
                          <RadioGroupItem value="non-vegetarian" id="non-vegetarian" />
                          <Label htmlFor="non-vegetarian" className="flex items-center gap-2 cursor-pointer">
                            <Apple className="h-5 w-5 text-orange-600" />
                            <div>
                              <div className="font-semibold">Non-Vegetarian</div>
                              <div className="text-xs text-muted-foreground">Includes meat & fish</div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Food Allergies (optional)</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {commonAllergies.map((allergy) => (
                        <div key={allergy} className="flex items-center space-x-2">
                          <Checkbox
                            id={allergy}
                            checked={allergies.includes(allergy)}
                            onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                            disabled={isGenerating}
                          />
                          <Label htmlFor={allergy} className="text-sm cursor-pointer">
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
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating your diet plan...
                      </>
                    ) : (
                      "Generate My Diet Plan"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Diet Plan Display */}
              {currentPlan?.weeklyPlan && Array.isArray(currentPlan.weeklyPlan) && (
                 <Card className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Your Personalized Diet Plan
                        </CardTitle>
                        <CardDescription>
                          AI-generated nutrition plan based on your profile
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleTranslateToHindi}
                        disabled={isTranslating}
                        variant={showHindi ? "default" : "outline"}
                        size="sm"
                      >
                        {isTranslating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <Languages className="h-4 w-4 mr-2" />
                            {showHindi ? "Show English" : "हिंदी में देखें"}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">

  <p><strong>{showHindi ? "बीएमआई" : "BMI"}:</strong> {currentPlan?.bmi}</p>
  <p><strong>{showHindi ? "श्रेणी" : "Category"}:</strong> {currentPlan?.bmiCategory}</p>
  <p><strong>{showHindi ? "दैनिक कैलोरी" : "Daily Calories"}:</strong> {currentPlan?.calorieTarget}</p>

  <div>
    <h3 className="font-semibold">{showHindi ? "पोषण लक्ष्य" : "Nutrition Goals"}</h3>
    <ul className="list-disc ml-6">
      <li>{showHindi ? "प्रोटीन" : "Protein"}: {currentPlan?.nutritionGoals?.protein ?? "N/A"}</li>
<li>{showHindi ? "कार्बोहाइड्रेट" : "Carbs"}: {currentPlan?.nutritionGoals?.carbs ?? "N/A"}</li>
<li>{showHindi ? "वसा" : "Fats"}: {currentPlan?.nutritionGoals?.fats ?? "N/A"}</li>
<li>{showHindi ? "फाइबर" : "Fiber"}: {currentPlan?.nutritionGoals?.fiber ?? "N/A"}</li>

    </ul>
  </div>

  <div>
    <h3 className="font-semibold">{showHindi ? "साप्ताहिक योजना" : "Weekly Plan"}</h3>

{(currentPlan?.weeklyPlan || []).map((day: any, index: number) => (
  <div key={index} className="border rounded p-3 mt-2">
    <p className="font-medium">{day?.day}</p>
    <p>🍳 {showHindi ? "नाश्ता" : "Breakfast"}: {
  day?.meals?.breakfast?.items?.length
    ? day.meals.breakfast.items
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.name || JSON.stringify(item)
        )
        .join(", ")
    : "N/A"
}</p>
    <p>🍛 {showHindi ? "दोपहर का भोजन" : "Lunch"}: {
  day?.meals?.lunch?.items?.length
    ? day.meals.lunch.items
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.name || JSON.stringify(item)
        )
        .join(", ")
    : "N/A"
}</p>
    <p>🍽 {showHindi ? "रात का खाना" : "Dinner"}: {
  day?.meals?.dinner?.items?.length
    ? day.meals.dinner.items
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.name || JSON.stringify(item)
        )
        .join(", ")
    : "N/A"
}</p>
  </div>
))}

  </div>

  <div>
    <h3 className="font-semibold">{showHindi ? "स्वास्थ्य सुझाव" : "Health Tips"}</h3>
    <ul className="list-disc ml-6">
      {(currentPlan?.tips || []).map((tip: string, i: number)=> (
        <li key={i}>{tip}</li>
      ))}
    </ul>
  </div>

</div>

                    
                    <Alert className="mt-6">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {showHindi 
                          ? "⚠️ यह आहार योजना शैक्षिक उद्देश्यों के लिए AI द्वारा तैयार की गई है। पेशेवर चिकित्सा सलाह के लिए कृपया प्रमाणित पोषण विशेषज्ञ या आहार विशेषज्ञ से परामर्श करें।"
                          : "⚠️ This diet plan is AI-generated for educational purposes. Please consult a certified nutritionist or dietitian for professional medical advice."
                        }
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => {
                        setDietPlan(null);
                        setTranslatedPlan(null);
                        setShowHindi(false);
                        setAge("");
                        setWeight("");
                        setHeight("");
                        setConditions([]);
                        setAllergies([]);
                      }}
                    >
                      {showHindi ? "नई योजना बनाएं" : "Create New Plan"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose Us?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Personalized plans based on your health conditions
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Uses locally available, affordable ingredients
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Considers allergies and dietary preferences
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Available in English and Hindi
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Foods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Rice</Badge>
                    <Badge variant="secondary">Wheat</Badge>
                    <Badge variant="secondary">Lentils</Badge>
                    <Badge variant="secondary">Vegetables</Badge>
                    <Badge variant="secondary">Fruits</Badge>
                    <Badge variant="secondary">Milk</Badge>
                    {dietType === "non-vegetarian" && (
                      <>
                        <Badge variant="secondary">Chicken</Badge>
                        <Badge variant="secondary">Fish</Badge>
                        <Badge variant="secondary">Eggs</Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Nutrition Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Drink plenty of water throughout the day, especially during farm work. Stay hydrated to maintain energy levels and good health.
                  </p>
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