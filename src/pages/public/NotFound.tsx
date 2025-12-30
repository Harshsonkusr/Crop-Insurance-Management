import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/services", label: "Services", icon: Search },
    { path: "/about", label: "About Us", icon: HelpCircle },
    { path: "/contact", label: "Contact", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8 animate-fade-in-down">
          <div className="relative inline-block">
            <div className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-hero p-6 rounded-full shadow-lg">
                <Search className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 animate-fade-in-down animation-delay-200">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-sm text-muted-foreground">
            The requested URL <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{location.pathname}</code> was not found.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-400">
          <Button size="lg" asChild className="text-lg">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.history.back()} className="text-lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="animate-fade-in-up animation-delay-600">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={index}
                    to={link.path}
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <div className="bg-gradient-hero p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground animate-fade-in-up animation-delay-800">
          If you believe this is an error, please{" "}
          <Link to="/contact" className="text-primary hover:underline font-medium">
            contact our support team
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;
