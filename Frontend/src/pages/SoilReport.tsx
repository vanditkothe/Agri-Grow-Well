import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Image, BarChart3, Droplets, Sprout, Calendar, ArrowLeft, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SoilReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    document.title = "Soil Report Analysis - Agri-Health AI Assistant";
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
    if (files.length > 0) handleFileUpload(files[0]);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a soil report first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const fileText = await uploadedFile.text();

if (!fileText || fileText.trim().length === 0) {
  toast({
    title: "Invalid File",
    description: "The uploaded file is empty or unreadable. Please upload a valid .txt soil report.",
    variant: "destructive",
  });
  setIsAnalyzing(false);
  return;
}

const res = await fetch("http://localhost:8000/api/soil/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ reportText: fileText }),
});

      const data = await res.json();

      setAnalysisResults(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your soil report successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Analysis Failed",
        description: "AI could not analyze your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getParameterStatus = (value: string, optimalRange: string) => {
    if (!optimalRange) return null;
    const numValue = parseFloat(value);
    const [min, max] = optimalRange.split("-").map(s => parseFloat(s.trim()));
    
    if (numValue < min) return { status: "low", color: "text-red-500", icon: TrendingDown };
    if (numValue > max) return { status: "high", color: "text-orange-500", icon: TrendingUp };
    return { status: "optimal", color: "text-green-500", icon: CheckCircle2 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
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

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full mb-6">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Soil Report Analysis</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your soil test report and get AI-powered recommendations for crops, fertilizers, and soil improvements.
            </p>
          </div>

          {/* Upload Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Soil Report
              </CardTitle>
              <CardDescription>
 Upload your soil test report in TEXT (.txt) format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      {uploadedFile.type.includes('image') ? <Image className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                    </div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Drop your soil report here</p>
                      <p className="text-muted-foreground">or click to browse files</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".txt"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!uploadedFile || isAnalyzing} 
                  className="min-w-32 bg-gradient-primary hover:opacity-90 text-white"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Report"}
                </Button>
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing soil parameters...</span>
                    <span>Processing...</span>
                  </div>
                  <Progress value={75} className="animate-pulse" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          {analysisResults && (
            <div className="space-y-6">
              {/* Soil Health Summary */}
              {analysisResults.soilHealthSummary && (
                <Card className={`shadow-elegant ${
                  analysisResults.soilHealthSummary.overallHealth === 'Good' ? 'bg-green-50' :
                  analysisResults.soilHealthSummary.overallHealth === 'Poor' ? 'bg-red-50' :
                  'bg-yellow-50'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {analysisResults.soilHealthSummary.overallHealth === 'Good' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      )}
                      Soil Health Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold">Overall Health</Label>
                        <p className="text-2xl font-bold">{analysisResults.soilHealthSummary.overallHealth}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Soil Type</Label>
                        <p className="text-lg">{analysisResults.soilHealthSummary.soilType}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2">Summary</Label>
                      <p className="text-sm">{analysisResults.soilHealthSummary.summary}</p>
                    </div>
                    {analysisResults.soilHealthSummary.keyIssues && analysisResults.soilHealthSummary.keyIssues.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold mb-2">Key Issues to Address</Label>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.soilHealthSummary.keyIssues.map((issue: string, idx: number) => (
                            <Badge key={idx} variant="destructive">{issue}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="parameters" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="crops">Crops</TabsTrigger>
                  <TabsTrigger value="fertilizers">Fertilizers</TabsTrigger>
                  <TabsTrigger value="treatments">Treatments</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                {/* Soil Parameters */}
                <TabsContent value="parameters" className="space-y-4">
                  {analysisResults.parameters && analysisResults.parameters.length > 0 ? (
                    <div className="grid gap-4">
                      {analysisResults.parameters.map((param: any, idx: number) => {
                        const StatusIcon = param.status === 'Optimal' ? CheckCircle2 :
                                         param.status === 'Low' ? TrendingDown : TrendingUp;
                        const statusColor = param.status === 'Optimal' ? 'text-green-500' :
                                          param.status === 'Low' ? 'text-red-500' : 'text-orange-500';
                        
                        return (
                          <Card key={idx} className="shadow-md">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{param.name}</h3>
                                    <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                                  </div>
                                  <Badge variant={param.status === 'Optimal' ? 'default' : 'destructive'}>
                                    {param.status}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">{param.value} {param.unit}</p>
                                  {param.optimalRange && (
                                    <p className="text-xs text-muted-foreground">
                                      Optimal: {param.optimalRange} {param.unit}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {param.interpretation && (
                                <p className="text-sm text-muted-foreground mb-2">{param.interpretation}</p>
                              )}
                              
                              {param.recommendation && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-blue-900">
                                    💡 Recommendation: {param.recommendation}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card><CardContent className="pt-6">No structured soil parameters returned.</CardContent></Card>
                  )}
                </TabsContent>

                {/* Crop Recommendations */}
                <TabsContent value="crops" className="space-y-4">
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" />
                        Recommended Crops
                      </CardTitle>
                      <CardDescription>
                        Based on your soil analysis, these crops are best suited for your land
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysisResults.cropRecommendations && analysisResults.cropRecommendations.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {analysisResults.cropRecommendations.map((crop: any, idx: number) => (
                            <Card key={idx} className="border-l-4 border-l-green-500 shadow-sm">
                              <CardContent className="pt-4 space-y-2">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-semibold text-lg">{crop.name}</h3>
                                  <Badge variant="outline" className="bg-green-50">
                                    {crop.suitability}
                                  </Badge>
                                </div>
                                {crop.season && (
                                  <p className="text-sm text-muted-foreground">🌱 Best Season: {crop.season}</p>
                                )}
                                {crop.reason && (
                                  <p className="text-sm">{crop.reason}</p>
                                )}
                                {crop.expectedYield && (
                                  <p className="text-sm font-medium text-green-700">
                                    📊 Expected Yield: {crop.expectedYield}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p>No crop recommendations available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fertilizers */}
                <TabsContent value="fertilizers" className="space-y-4">
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        Fertilizer Recommendations
                      </CardTitle>
                      <CardDescription>
                        Recommended fertilizers and application methods
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysisResults.fertilizerRecommendations && analysisResults.fertilizerRecommendations.length > 0 ? (
                        analysisResults.fertilizerRecommendations.map((fert: any, idx: number) => (
                          <Card key={idx} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-lg">{fert.name}</h3>
                                <Badge>{fert.type}</Badge>
                              </div>
                              {fert.dosage && (
                                <p className="text-sm">
                                  <span className="font-medium">Dosage:</span> {fert.dosage}
                                </p>
                              )}
                              {fert.applicationMethod && (
                                <p className="text-sm">
                                  <span className="font-medium">Application:</span> {fert.applicationMethod}
                                </p>
                              )}
                              {fert.timing && (
                                <p className="text-sm">
                                  <span className="font-medium">Timing:</span> {fert.timing}
                                </p>
                              )}
                              {fert.purpose && (
                                <p className="text-sm text-muted-foreground">{fert.purpose}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p>No fertilizer recommendations available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Treatments */}
                <TabsContent value="treatments" className="space-y-4">
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-purple-600" />
                        Soil Improvement Plan
                      </CardTitle>
                      <CardDescription>
                        Step-by-step soil treatment and improvement recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResults.soilTreatments && analysisResults.soilTreatments.length > 0 ? (
                        analysisResults.soilTreatments.map((treatment: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                              {idx + 1}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-semibold">{treatment.title}</h4>
                              <p className="text-sm">{treatment.description}</p>
                              {treatment.priority && (
                                <Badge variant={treatment.priority === 'High' ? 'destructive' : 'secondary'}>
                                  {treatment.priority} Priority
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No treatment plans available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Calendar */}
                <TabsContent value="calendar" className="space-y-4">
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        Seasonal Planting Calendar
                      </CardTitle>
                      <CardDescription>
                        Month-wise activities and crop cultivation guide
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResults.seasonalCalendar && analysisResults.seasonalCalendar.length > 0 ? (
                        analysisResults.seasonalCalendar.map((item: any, idx: number) => (
                          <Card key={idx} className="border-l-4 border-l-orange-500">
                            <CardContent className="pt-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-lg">{item.season}</h4>
                                {item.months && <Badge variant="outline">{item.months}</Badge>}
                              </div>
                              {item.activities && (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Activities:</p>
                                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {item.activities.map((activity: string, i: number) => (
                                      <li key={i}>{activity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p>No calendar information available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Disclaimer */}
              <Card className="shadow-elegant border-yellow-400">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">
                    ⚠️ <strong>Disclaimer:</strong> This AI analysis is for informational purposes only. 
                    For professional soil management and accurate fertilizer prescriptions, please consult with a certified soil scientist or agricultural extension officer.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SoilReport;