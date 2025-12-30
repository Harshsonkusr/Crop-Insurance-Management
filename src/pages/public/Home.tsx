import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Users, Award, CheckCircle2, ArrowRight, Sparkles, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farmland.jpg";
import cropsImage from "@/assets/crops-variety.jpg";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[700px] md:h-[800px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/50" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-medium">AI-Powered Insurance Solutions</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              AI-Powered Crop Insurance for a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                Secure Tomorrow
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Streamlining agricultural insurance claims with AI and satellite verification for faster, fairer, and fraud-free processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 group">
                Get a Free Quote
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/services">Explore Coverage</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { number: "10,000+", label: "Farmers Protected", icon: Users },
              { number: "₹500M+", label: "Claims Paid", icon: DollarSign },
              { number: "25+", label: "Years Experience", icon: Clock },
              { number: "98%", label: "Client Satisfaction", icon: Award },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="bg-gradient-hero p-3 rounded-lg w-fit mx-auto mb-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">ClaimEasy</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of agricultural insurance with smart, efficient, and transparent claim processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "AI-Powered Verification",
                description: "Advanced AI analyzes crop damage photos for accurate assessments.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: TrendingUp,
                title: "Satellite Image Confirmation",
                description: "Utilizing satellite data (NDVI) to verify losses and prevent fraud.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Users,
                title: "Faster Claim Processing",
                description: "Streamlined workflow ensures quick approvals and reduced waiting times.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Award,
                title: "Enhanced Transparency",
                description: "Clear and trustworthy process between farmers and service providers.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in group" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in order-2 lg:order-1">
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={cropsImage}
                  alt="Various crops"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
            <div className="space-y-6 animate-fade-in order-1 lg:order-2">
              <div className="inline-block">
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Our Solutions</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Smart Insurance Solutions for Modern Agriculture
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Leveraging AI and satellite technology to provide accurate, efficient, and transparent crop insurance.
              </p>
              
              <div className="space-y-4 pt-4">
                {[
                  "AI-powered damage assessment for precise claims",
                  "Satellite verification (NDVI) for unbiased loss confirmation",
                  "Reduced claim processing time for farmers",
                  "Minimized fraud and increased trust",
                  "Comprehensive coverage tailored to your needs"
                ].map((service, index) => (
                  <div key={index} className="flex items-start space-x-3 animate-fade-in group" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="bg-gradient-hero p-1.5 rounded-full mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-foreground text-base leading-relaxed">{service}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-6 group" asChild>
                <Link to="/services">
                  View All Services <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-hero text-white border-none shadow-2xl overflow-hidden relative animate-fade-in">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <CardContent className="p-12 md:p-16 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Ready to Protect Your Farm?
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Get a personalized quote in minutes and discover how ClaimEasy can secure your agricultural future
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 group">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-white text-white hover:bg-white/10" asChild>
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
