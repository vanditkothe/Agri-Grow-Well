import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Upload, Leaf, Bug, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CropDetection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState("");
  const [location, setLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const cropTypes = [
    "Rice", "Wheat", "Corn", "Tomato", "Potato", "Cotton", 
    "Sugarcane", "Soybean", "Onion", "Chili", "Other"
  ];

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

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "Please upload an image",
        description: "Upload a photo of your crop to get AI analysis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis - would require Supabase backend
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Connect to Supabase to enable full AI crop disease detection",
      });
    }, 3000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
            {/* Main Form */}
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
                    Help us provide more accurate analysis by sharing details about your crop.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crop-type">Crop Type</Label>
                      <Select value={cropType} onValueChange={setCropType}>
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
                    <div className="space-y-2">
                      <Label htmlFor="location">Your Location</Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Detection Types */}
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

              {/* Photo Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Photo Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    • Take photos in good natural light
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Focus on affected plant parts
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Include close-up and wider shots
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Avoid blurry or dark images
                  </p>
                </CardContent>
              </Card>

              {/* Common Issues */}
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