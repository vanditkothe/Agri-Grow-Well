import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Leaf, User, Mail, Lock, MapPin, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    farmLocation: "",
    farmSize: "",
    primaryCrops: "",
    agreeTerms: false,
    agreePrivacy: false
  });

  useEffect(() => {
    document.title = "Get Started - Agri-Health AI Assistant";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Join Agri-Health AI Assistant today. Create your free account to access personalized health monitoring and advanced crop management tools for farmers.'
      );
    }
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic will be implemented after Supabase connection
    console.log("Registration attempt:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="pt-20">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-elegant">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto p-3 bg-gradient-primary rounded-full w-fit">
                    <Leaf className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Join Agri-Health AI</CardTitle>
                  <CardDescription>
                    Create your account to start improving your health and farming success
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Alert>
                    <AlertDescription>
                      User registration requires Supabase connection. Connect Supabase to enable account creation.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="firstName"
                              placeholder="First name"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create password"
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm password"
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Farm Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Farm Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="farmLocation">Farm Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="farmLocation"
                            placeholder="City, State/Province, Country"
                            value={formData.farmLocation}
                            onChange={(e) => handleInputChange("farmLocation", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="farmSize">Farm Size</Label>
                          <Select onValueChange={(value) => handleInputChange("farmSize", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select farm size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small (0-5 acres)</SelectItem>
                              <SelectItem value="medium">Medium (5-25 acres)</SelectItem>
                              <SelectItem value="large">Large (25-100 acres)</SelectItem>
                              <SelectItem value="commercial">Commercial (100+ acres)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primaryCrops">Primary Crops</Label>
                          <Input
                            id="primaryCrops"
                            placeholder="e.g., Wheat, Rice, Corn"
                            value={formData.primaryCrops}
                            onChange={(e) => handleInputChange("primaryCrops", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms and Privacy */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="agreeTerms" 
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                          required
                        />
                        <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and understand that this platform provides guidance only and is not a substitute for professional medical or agricultural advice.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="agreePrivacy" 
                          checked={formData.agreePrivacy}
                          onCheckedChange={(checked) => handleInputChange("agreePrivacy", checked as boolean)}
                          required
                        />
                        <Label htmlFor="agreePrivacy" className="text-sm leading-relaxed">
                          I agree to the{" "}
                          <Link to="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>{" "}
                          and consent to the secure processing of my health and farming data.
                        </Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Create Account
                    </Button>
                  </form>

                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or sign up with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm">
                        Google
                      </Button>
                      <Button variant="outline" size="sm">
                        Facebook
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link to="/signin" className="text-primary hover:underline font-medium">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="mt-8 text-center space-y-4">
                <h4 className="font-semibold text-foreground">Why join Agri-Health AI?</h4>
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <div className="text-2xl mb-1">🏥</div>
                    <div>Health Monitoring</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🌾</div>
                    <div>Crop Management</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🤖</div>
                    <div>AI Assistance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;