import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Heart, AlertTriangle, CheckCircle, Loader2, AlertCircle, Upload, X, FileText, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportText, setReportText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // You can change this to 'hi-IN' for Hindi or other languages

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak your symptoms clearly",
      });
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update symptoms with final transcript
      if (finalTranscript) {
        setSymptoms(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = "Failed to recognize speech";
      if (event.error === 'no-speech') {
        errorMessage = "No speech detected. Please try again.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "Microphone access denied. Please allow microphone access.";
      } else if (event.error === 'network') {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Speech Recognition Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast({
        title: "Stopped listening",
        description: "Voice input stopped",
      });
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setReportFile(file);
    
    // Convert to base64 for sending to backend
    const reader = new FileReader();
    reader.onloadend = () => {
      setReportText(reader.result as string);
    };
    reader.readAsDataURL(file);

    toast({
      title: "Report uploaded",
      description: `${file.name} uploaded successfully`,
    });
  };

  const removeReport = () => {
    setReportFile(null);
    setReportText("");
  };

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
      const API_URL = import.meta.env.VITE_API_URL ;
      
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
          reportImage: reportText || null,
          hasReport: !!reportFile,
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
                      <select
                        id="gender"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={isAnalyzing}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="symptoms">Describe your symptoms</Label>
                      {speechSupported && (
                        <Button
                          type="button"
                          variant={isListening ? "destructive" : "outline"}
                          size="sm"
                          onClick={toggleVoiceInput}
                          disabled={isAnalyzing}
                          className="gap-2"
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-4 w-4" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4" />
                              Voice Input
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Textarea
                        id="symptoms"
                        placeholder="Example: I have been feeling tired and weak for 3 days. I also have a headache and my stomach hurts after eating..."
                        className={`min-h-[120px] ${isListening ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        disabled={isAnalyzing}
                      />
                      {isListening && (
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Listening...
                          </div>
                        </div>
                      )}
                    </div>
                    {isListening && (
                      <p className="text-xs text-muted-foreground">
                        Speak clearly into your microphone. Your speech will be converted to text automatically.
                      </p>
                    )}
                  </div>

                  {/* Medical Report Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="report">Medical Test Report (Optional)</Label>
                    <div className="text-xs text-muted-foreground mb-2">
                      Upload blood test, X-ray, or other medical reports for more accurate analysis
                    </div>
                    
                    {!reportFile ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <input
                          id="report"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          disabled={isAnalyzing}
                          className="hidden"
                        />
                        <label
                          htmlFor="report"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium text-foreground">
                            Click to upload report
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, or PDF (Max 5MB)
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="border border-muted rounded-lg p-4 flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {reportFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(reportFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeReport}
                          disabled={isAnalyzing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
                      <div
  className="prose prose-sm sm:prose-base max-w-none leading-relaxed text-foreground"
>
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {analysisResult.analysis.replace(/\n(?!\n)/g, '\n\n')}
  </ReactMarkdown>
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
                        setReportFile(null);
                        setReportText("");
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

              {/* Voice Input Info */}
              {speechSupported && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                      <Mic className="h-5 w-5" />
                      Voice Input Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-700">
                      Click the microphone button to speak your symptoms instead of typing. Make sure to allow microphone access when prompted.
                    </p>
                  </CardContent>
                </Card>
              )}

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