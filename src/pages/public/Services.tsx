import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Satellite, Zap, ShieldCheck, Globe, Users, CheckCircle2 } from "lucide-react";
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
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in-down">Our Smart Solutions</h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90 animate-fade-in-down animation-delay-200">
            Leveraging AI and satellite technology to provide accurate, efficient, and transparent crop insurance solutions.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className={`bg-gradient-to-r ${service.color} p-4 rounded-lg w-fit mb-4`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link to="/contact">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose ClaimEasy?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with unparalleled expertise to secure your agricultural future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Accuracy",
                description: "Precise damage assessment and fraud detection using advanced AI models."
              },
              {
                title: "Satellite Verification",
                description: "Unbiased loss confirmation through real-time satellite imagery and NDVI analysis."
              },
              {
                title: "Rapid Claim Processing",
                description: "Streamlined digital workflows ensure faster approvals and payouts."
              }
            ].map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 animate-fade-in-up">
          <Card className="bg-gradient-hero text-white border-none shadow-soft">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Experience the Future of Crop Insurance?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Contact us today to learn how ClaimEasy can protect your farm with smart, reliable solutions.
              </p>
              <Button size="lg" variant="secondary" className="text-lg" asChild>
                <Link to="/contact">Get a Free Consultation</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Services;
