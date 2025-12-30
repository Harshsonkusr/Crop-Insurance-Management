import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Satellite, Zap, ShieldCheck, Globe, Users, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      icon: Brain,
      color: "from-purple-500 to-indigo-500",
      title: "AI-Powered Damage Assessment",
      description: "Utilizing advanced AI models to accurately assess crop damage from uploaded images.",
      features: [
        "Instant damage detection",
        "Severity estimation",
        "Fraud pattern recognition",
        "Reduced manual inspection"
      ]
    },
    {
      icon: Satellite,
      color: "from-green-500 to-teal-500",
      title: "Satellite Image Verification",
      description: "Verifying claims with real-time satellite imagery and NDVI analysis for unbiased confirmation.",
      features: [
        "Pre/post-damage comparison",
        "Vegetation index analysis (NDVI)",
        "Geospatial data integration",
        "Independent loss confirmation"
      ]
    },
    {
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      title: "Rapid Claim Processing",
      description: "Streamlining the entire claims workflow for faster approvals and quicker payouts to farmers.",
      features: [
        "Automated workflow management",
        "Digital documentation",
        "Real-time status updates",
        "Expedited financial settlements"
      ]
    },
    {
      icon: ShieldCheck,
      color: "from-blue-500 to-cyan-500",
      title: "Enhanced Fraud Detection",
      description: "Minimizing fraudulent claims through intelligent AI and satellite cross-verification.",
      features: [
        "AI anomaly detection",
        "Multi-source data validation",
        "Secure claim submission",
        "Increased trust and transparency"
      ]
    },
    {
      icon: Globe,
      color: "from-red-500 to-pink-500",
      title: "Comprehensive Coverage Plans",
      description: "Offering tailored insurance plans that integrate seamlessly with our AI and satellite tools.",
      features: [
        "Customizable policy options",
        "Risk assessment integration",
        "Flexible premium structures",
        "Protection against various perils"
      ]
    },
    {
      icon: Users,
      color: "from-indigo-500 to-purple-500",
      title: "Dedicated Farmer Support",
      description: "Providing farmers with expert assistance and an intuitive platform for all their insurance needs.",
      features: [
        "24/7 online support",
        "Easy claim submission portal",
        "Educational resources",
        "Personalized guidance"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-24 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium">Comprehensive Solutions</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-down">
            Our Smart Solutions
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90 animate-fade-in-down animation-delay-200">
            Leveraging AI and satellite technology to provide accurate, efficient, and transparent crop insurance solutions.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-in border-2" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className={`bg-gradient-to-r ${service.color} p-4 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="bg-gradient-hero p-1 rounded-full mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-muted-foreground text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full group/btn" asChild>
                    <Link to="/contact">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">ClaimEasy</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              We combine cutting-edge technology with unparalleled expertise to secure your agricultural future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Accuracy",
                description: "Precise damage assessment and fraud detection using advanced AI models.",
                icon: Brain
              },
              {
                title: "Satellite Verification",
                description: "Unbiased loss confirmation through real-time satellite imagery and NDVI analysis.",
                icon: Satellite
              },
              {
                title: "Rapid Claim Processing",
                description: "Streamlined digital workflows ensure faster approvals and payouts.",
                icon: Zap
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center border-2 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-8">
                    <div className="bg-gradient-hero p-4 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 animate-fade-in-up">
          <Card className="bg-gradient-hero text-white border-none shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <CardContent className="p-12 md:p-16 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Ready to Experience the Future of Crop Insurance?
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto">
                Contact us today to learn how ClaimEasy can protect your farm with smart, reliable solutions.
              </p>
              <Button size="lg" variant="secondary" className="text-lg px-8 group" asChild>
                <Link to="/contact">
                  Get a Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Services;
