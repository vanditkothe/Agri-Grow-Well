import { useState } from "react";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Image, BarChart3, Droplets, Sprout, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SoilReport = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    document.title = "Soil Report Analysis - Agri-Health AI Assistant";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Upload and analyze your soil test reports with AI. Get personalized recommendations for crops, fertilizers, and soil improvement based on your soil parameters.'
      );
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a soil report first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    // Simulate analysis process
    setTimeout(() => {
      setAnalysisResults({
        pH: 6.8,
        nitrogen: "Medium",
        phosphorus: "High", 
        potassium: "Low",
        organicMatter: 3.2,
        recommendations: {
          crops: ["Wheat", "Corn", "Soybeans"],
          fertilizers: ["NPK 10-10-10", "Organic Compost"],
          treatments: ["Add lime to increase pH", "Apply potassium fertilizer"]
        }
      });
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Your soil report has been analyzed successfully.",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Soil Report Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your soil test reports and get AI-powered recommendations for better crop yields and soil health
            </p>
          </div>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Soil Report
              </CardTitle>
              <CardDescription>
                Upload your soil test report in PDF, image, or text format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      {uploadedFile.type.includes('image') ? (
                        <Image className="h-8 w-8" />
                      ) : (
                        <FileText className="h-8 w-8" />
                      )}
                    </div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Drop your soil report here</p>
                      <p className="text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || isAnalyzing}
                  className="min-w-32"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Report"}
                </Button>
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing soil parameters...</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResults && (
            <Tabs defaultValue="parameters" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="parameters">Soil Parameters</TabsTrigger>
                <TabsTrigger value="crops">Crop Recommendations</TabsTrigger>
                <TabsTrigger value="fertilizers">Fertilizers</TabsTrigger>
                <TabsTrigger value="calendar">Planting Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value="parameters">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Soil Parameters Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>pH Level</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="font-medium">6.8</span>
                        </div>
                        <Badge variant="secondary">Slightly Acidic</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Nitrogen (N)</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <span className="font-medium">Medium</span>
                        </div>
                        <Badge variant="secondary">Adequate</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Phosphorus (P)</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="font-medium">High</span>
                        </div>
                        <Badge className="bg-green-500">Excellent</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Potassium (K)</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                          <span className="font-medium">Low</span>
                        </div>
                        <Badge variant="destructive">Needs Attention</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Organic Matter</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <span className="font-medium">3.2%</span>
                        </div>
                        <Badge variant="secondary">Good</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crops">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5" />
                      Recommended Crops
                    </CardTitle>
                    <CardDescription>
                      Based on your soil parameters and local conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisResults.recommendations.crops.map((crop, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4">
                            <h3 className="font-semibold text-lg">{crop}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Excellent match for your soil conditions
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-xs">Yield Potential:</span>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-primary' : 'bg-muted'}`}></div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fertilizers">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      Fertilizer Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {analysisResults.recommendations.fertilizers.map((fertilizer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{fertilizer}</h4>
                            <p className="text-sm text-muted-foreground">
                              Apply 50kg per hectare
                            </p>
                          </div>
                          <Badge>Recommended</Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Treatment Plans</h4>
                      <div className="space-y-2">
                        {analysisResults.recommendations.treatments.map((treatment, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <span className="text-sm">{treatment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Seasonal Planting Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 text-primary">Spring Season (March - May)</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Plant wheat in early March</li>
                          <li>• Apply base fertilizer before planting</li>
                          <li>• Ensure proper soil moisture</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 text-primary">Summer Season (June - August)</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Plant corn in late June</li>
                          <li>• Increase irrigation frequency</li>
                          <li>• Monitor for pest activity</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 text-primary">Monsoon Season (July - September)</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Perfect time for rice cultivation</li>
                          <li>• Ensure proper drainage</li>
                          <li>• Apply organic matter</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 text-primary">Winter Season (October - February)</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Plant winter vegetables</li>
                          <li>• Reduce watering frequency</li>
                          <li>• Prepare soil for next season</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default SoilReport;