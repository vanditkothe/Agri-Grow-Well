import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Upload, Leaf, Bug, Droplets, AlertTriangle, CheckCircle2, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CropDetection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState("");
  const [customCropType, setCustomCropType] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const cropTypes = [
    "Rice", "Wheat", "Corn", "Tomato", "Potato", "Cotton", 
    "Sugarcane", "Soybean", "Onion", "Chili", "Other"
  ];

  // Get the actual crop type to send to API
  const getActualCropType = () => {
    if (cropType === "Other" && customCropType.trim()) {
      return customCropType.trim();
    }
    return cropType;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "Please upload an image",
        description: "Upload a photo of your crop to get AI analysis",
        variant: "destructive",
      });
      return;
    }

    if (cropType === "Other" && !customCropType.trim()) {
      toast({
        title: "Please specify crop type",
        description: "Enter the name of your crop in the text field",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const actualCropType = getActualCropType();
      const response = await fetch("http://localhost:8000/api/crop/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage, cropType: actualCropType }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Analysis failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      } else {
        setAiResult(data.analysis);
        toast({
          title: "Analysis Complete",
          description: "AI crop disease detection finished",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
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
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Crop Disease Detection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload photos of your crops to detect diseases, pests, and get treatment recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Image Upload */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Upload Crop Image
                  </CardTitle>
                  <CardDescription>
                    Take a clear photo of the affected crop parts - leaves, stems, fruits, or entire plant.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {selectedImage ? (
                      <div className="relative">
                        <img
                          src={selectedImage}
                          alt="Uploaded crop"
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={triggerFileInput}
                          className="absolute top-2 right-2"
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Click to upload crop image</p>
                        <p className="text-sm text-muted-foreground">
                          Supports JPG, PNG, HEIC formats
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Crop Info */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Crop Information</CardTitle>
                  <CardDescription>
                    Select your crop type for more accurate analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crop-type">Crop Type</Label>
                    <Select value={cropType} onValueChange={(value) => {
                      setCropType(value);
                      if (value !== "Other") {
                        setCustomCropType("");
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom crop type input - shows when "Other" is selected */}
                  {cropType === "Other" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="custom-crop">Enter Crop Name</Label>
                      <Input
                        id="custom-crop"
                        placeholder="e.g., Banana, Mango, Grapes..."
                        value={customCropType}
                        onChange={(e) => setCustomCropType(e.target.value)}
                        className="border-primary/50 focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Please specify the name of your crop for accurate analysis
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !selectedImage}
                    className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                    size="lg"
                  >
                    {isAnalyzing ? "Analyzing your crop..." : "Analyze Crop Health"}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Result */}
              {aiResult && (
                <div className="space-y-6">
                  {/* Overall Health Status */}
                  {aiResult.healthStatus && (
                    <Card className={`shadow-elegant ${
                      aiResult.healthStatus.status === 'Healthy' ? 'bg-green-50' :
                      aiResult.healthStatus.status === 'Diseased' ? 'bg-red-50' :
                      'bg-yellow-50'
                    }`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {aiResult.healthStatus.status === 'Healthy' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          )}
                          Overall Health Status: {aiResult.healthStatus.status}
                        </CardTitle>
                        <CardDescription className="text-base">
                          Confidence: {aiResult.healthStatus.confidence}
                        </CardDescription>
                      </CardHeader>
                      {aiResult.healthStatus.summary && (
                        <CardContent>
                          <p className="text-sm">{aiResult.healthStatus.summary}</p>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Identified Issues */}
                  {aiResult.identifiedIssues && aiResult.identifiedIssues.length > 0 && (
                    <Card className="shadow-elegant">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bug className="h-5 w-5 text-red-500" />
                          Identified Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {aiResult.identifiedIssues.map((issue: any, index: number) => (
                          <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                            <h4 className="font-semibold text-lg mb-1">{issue.name}</h4>
                            <Badge variant="destructive" className="mb-2">
                              {issue.type} - Severity: {issue.severity}
                            </Badge>
                            <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                            {issue.symptoms && issue.symptoms.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Symptoms:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {issue.symptoms.map((symptom: string, i: number) => (
                                    <li key={i}>{symptom}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Treatment Recommendations */}
                  {aiResult.treatmentRecommendations && (
                    <Card className="shadow-elegant bg-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sprout className="h-5 w-5 text-blue-600" />
                          Treatment Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {aiResult.treatmentRecommendations.immediate && (
                          <div>
                            <h4 className="font-semibold text-red-700 mb-2">🚨 Immediate Actions:</h4>
                            <ul className="space-y-2">
                              {aiResult.treatmentRecommendations.immediate.map((action: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-red-600 mt-1">•</span>
                                  <span className="text-sm">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiResult.treatmentRecommendations.organic && (
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2">🌿 Organic Solutions:</h4>
                            <ul className="space-y-2">
                              {aiResult.treatmentRecommendations.organic.map((solution: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-green-600 mt-1">•</span>
                                  <span className="text-sm">{solution}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiResult.treatmentRecommendations.chemical && (
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2">⚗️ Chemical Treatments:</h4>
                            <ul className="space-y-2">
                              {aiResult.treatmentRecommendations.chemical.map((treatment: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span className="text-sm">{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiResult.treatmentRecommendations.preventive && (
                          <div>
                            <h4 className="font-semibold text-purple-700 mb-2">🛡️ Preventive Measures:</h4>
                            <ul className="space-y-2">
                              {aiResult.treatmentRecommendations.preventive.map((measure: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-1">•</span>
                                  <span className="text-sm">{measure}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Additional Care Tips */}
                  {aiResult.additionalTips && aiResult.additionalTips.length > 0 && (
                    <Card className="shadow-elegant">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Droplets className="h-5 w-5 text-blue-500" />
                          Additional Care Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiResult.additionalTips.map((tip: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">💡</span>
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Disclaimer */}
                  <Card className="shadow-elegant border-yellow-400">
                    <CardContent className="pt-6">
                      <p className="text-xs text-muted-foreground">
                        ⚠️ <strong>Disclaimer:</strong> This AI analysis is for informational purposes only. 
                        For severe infestations or diseases, please consult with a local agricultural expert or extension officer.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What We Detect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Bug className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">Pest Infestations</p>
                      <p className="text-xs text-muted-foreground">Insects, worms, aphids</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Plant Diseases</p>
                      <p className="text-xs text-muted-foreground">Fungal, bacterial, viral</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-sm">Nutrient Deficiency</p>
                      <p className="text-xs text-muted-foreground">N, P, K deficiencies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Photo Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">• Take photos in good natural light</p>
                  <p className="text-sm text-muted-foreground">• Focus on affected plant parts</p>
                  <p className="text-sm text-muted-foreground">• Include close-up and wider shots</p>
                  <p className="text-sm text-muted-foreground">• Avoid blurry or dark images</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Crop Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Leaf Spot</Badge>
                    <Badge variant="secondary">Blight</Badge>
                    <Badge variant="secondary">Rust</Badge>
                    <Badge variant="secondary">Aphids</Badge>
                    <Badge variant="secondary">Wilt</Badge>
                    <Badge variant="secondary">Yellowing</Badge>
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

export default CropDetection;