import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Users, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farmland.jpg";
import cropsImage from "@/assets/crops-variety.jpg";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              AI-Powered Crop Insurance for a Secure Tomorrow
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Streamlining agricultural insurance claims with AI and satellite verification for faster, fairer, and fraud-free processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg">
                Get a Free Quote
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/services">Explore Coverage</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Farmers Protected" },
              { number: "₹500M+", label: "Claims Paid" },
              { number: "25+", label: "Years Experience" },
              { number: "98%", label: "Client Satisfaction" },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why ClaimEasy?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of agricultural insurance with smart, efficient, and transparent claim processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "AI-Powered Verification",
                description: "Advanced AI analyzes crop damage photos for accurate assessments."
              },
              {
                icon: TrendingUp,
                title: "Satellite Image Confirmation",
                description: "Utilizing satellite data (NDVI) to verify losses and prevent fraud."
              },
              {
                icon: Users,
                title: "Faster Claim Processing",
                description: "Streamlined workflow ensures quick approvals and reduced waiting times."
              },
              {
                icon: Award,
                title: "Enhanced Transparency",
                description: "Clear and trustworthy process between farmers and service providers."
              }
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="bg-gradient-hero p-3 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in">
              <img
                src={cropsImage}
                alt="Various crops"
                className="rounded-lg shadow-soft w-full"
              />
            </div>
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-4xl font-bold text-foreground">Smart Insurance Solutions for Modern Agriculture</h2>
              <p className="text-lg text-muted-foreground">
                Leveraging AI and satellite technology to provide accurate, efficient, and transparent crop insurance.
              </p>
              
              <div className="space-y-4">
                {[
                  "AI-powered damage assessment for precise claims",
                  "Satellite verification (NDVI) for unbiased loss confirmation",
                  "Reduced claim processing time for farmers",
                  "Minimized fraud and increased trust",
                  "Comprehensive coverage tailored to your needs"
                ].map((service, index) => (
                  <div key={index} className="flex items-start space-x-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{service}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-6" asChild>
                <Link to="/services">
                  View All Services <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-hero text-white border-none shadow-soft animate-fade-in">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Protect Your Farm?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Get a personalized quote in minutes and discover how ClaimEasy can secure your agricultural future
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg">
                  Get Free Quote
                </Button>
                <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white/10" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
