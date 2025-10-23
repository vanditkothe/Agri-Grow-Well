import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Heart, AlertTriangle, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  analysis: string;
  severity: string;
  timestamp: string;
  disclaimer: string;
}

const HealthCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    // Validation
    if (!symptoms.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "Enter your symptoms to get AI health guidance",
        variant: "destructive",
      });
      return;
    }

    if (!age.trim() || !gender.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your age and gender",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      // Updated to match your backend URL pattern
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/api/health/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          symptoms,
          age,
          gender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const data = await response.json();
      setAnalysisResult(data);
      
      toast({
        title: "Analysis Complete",
        description: "Your health analysis is ready",
      });
    } catch (err) {
      setError("Unable to connect to the health analysis service. Please make sure the backend is running.");
      toast({
        title: "Analysis Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-green-100 border-green-300 text-green-800';
    }
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
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Health Self-Check
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Describe your symptoms and get AI-powered health guidance tailored for farmers
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Tell us about your symptoms
                  </CardTitle>
                  <CardDescription>
                    Describe how you're feeling using simple, everyday language. Include when symptoms started and how severe they are.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Your age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        disabled={isAnalyzing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        placeholder="Male/Female/Other"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={isAnalyzing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Describe your symptoms</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Example: I have been feeling tired and weak for 3 days. I also have a headache and my stomach hurts after eating..."
                      className="min-h-[120px]"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>

                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing symptoms...
                      </>
                    ) : (
                      "Get AI Health Guidance"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <Card className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Your Health Analysis
                      </CardTitle>
                      <Badge className={getSeverityColor(analysisResult.severity)}>
                        {analysisResult.severity.toUpperCase()} SEVERITY
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {analysisResult.analysis}
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {analysisResult.disclaimer}
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setAnalysisResult(null);
                        setSymptoms("");
                        setAge("");
                        setGender("");
                      }}
                    >
                      New Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Stay hydrated, especially during farming work
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Wear protective gear when handling chemicals
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Take regular breaks during long work hours
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Warning */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Warning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700">
                    If you have severe chest pain, difficulty breathing, or other emergency symptoms, seek immediate medical attention.
                  </p>
                </CardContent>
              </Card>

              {/* Common Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Farmer Health Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Back Pain</Badge>
                    <Badge variant="secondary">Heat Stress</Badge>
                    <Badge variant="secondary">Skin Issues</Badge>
                    <Badge variant="secondary">Respiratory</Badge>
                    <Badge variant="secondary">Joint Pain</Badge>
                    <Badge variant="secondary">Eye Strain</Badge>
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

export default HealthCheck;