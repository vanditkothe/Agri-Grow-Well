import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Image, BarChart3, Droplets, Sprout, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SoilReport = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Soil Report Analysis</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your soil test report and get AI-powered recommendations for crops, fertilizers, and soil improvements.
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
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="flex-1"
                />
                <Button onClick={handleAnalyze} disabled={!uploadedFile || isAnalyzing} className="min-w-32">
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

          {/* AI Analysis Results */}
          {analysisResults && (
            <Tabs defaultValue="parameters" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="parameters">Soil Parameters</TabsTrigger>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="fertilizers">Fertilizers</TabsTrigger>
                <TabsTrigger value="treatments">Treatments</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              {/* Soil Parameters */}
              <TabsContent value="parameters">
                {analysisResults.parameters ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Soil Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(analysisResults.parameters).map(([key, value]: any) => (
                        <div key={key} className="space-y-2">
                          <Label>{key}</Label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: typeof value === 'number' ? `${value * 10}%` : '50%' }}></div>
                            </div>
                            <span className="font-medium">{value}</span>
                          </div>
                          <Badge variant="secondary">Info</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card><CardContent>{analysisResults.rawText || "No structured soil parameters returned."}</CardContent></Card>
                )}
              </TabsContent>

              {/* Crop Recommendations */}
              <TabsContent value="crops">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sprout className="h-5 w-5" />Recommended Crops</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysisResults.crops?.map((crop: string, idx: number) => (
                      <Card key={idx} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <h3 className="font-semibold text-lg">{crop}</h3>
                        </CardContent>
                      </Card>
                    )) || <p>No crop recommendations returned.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fertilizers */}
              <TabsContent value="fertilizers">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" />Fertilizers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisResults.fertilizers?.map((f: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{f}</Badge>
                    )) || <p>No fertilizer recommendations returned.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Treatments */}
              <TabsContent value="treatments">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Treatment Plans</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysisResults.treatments?.map((t: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                        <span className="text-sm">🌱 {t}</span>
                      </div>
                    )) || <p>No treatment plans returned.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Calendar */}
              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Seasonal Calendar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysisResults.calendar?.map((item: any, idx: number) => (
                      <div key={idx} className="p-2 bg-muted/20 rounded-lg">
                        <strong>{item.season}</strong>: {item.activities}
                      </div>
                    )) || <p>No calendar info returned.</p>}
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
