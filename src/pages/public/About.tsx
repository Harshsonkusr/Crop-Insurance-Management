import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Award } from "lucide-react";
import handsImage from "@/assets/hands-soil.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in-down">About ClaimEasy</h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90 animate-fade-in-down animation-delay-200">
            For over 25 years, we've been protecting farmers and securing agricultural futures across the nation
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-in">
              <h2 className="text-4xl font-bold text-foreground">Our Story: Revolutionizing Agricultural Insurance</h2>
              <p className="text-lg text-muted-foreground">
                ClaimEasy was founded with a vision to transform agricultural insurance. Recognizing the challenges farmers face with traditional claim processes, we developed a smart and efficient platform that leverages Artificial Intelligence (AI) and satellite image verification.
              </p>
              <p className="text-lg text-muted-foreground">
                Our innovative approach ensures claims are processed quickly and accurately, acting as a transparent mediator between farmers and service providers. By automating verification and reducing manual intervention, ClaimEasy minimizes delays and detects genuine claims with unparalleled precision.
              </p>
              <p className="text-lg text-muted-foreground">
                We are committed to fostering transparency and trust, ensuring farmers receive their rightful compensation swiftly, and empowering service providers with advanced tools to combat fraud and streamline operations.
              </p>
            </div>
            <div className="animate-fade-in">
              <img
                src={handsImage}
                alt="Farming"
                className="rounded-lg shadow-soft w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Principles</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The foundational values driving our mission to revolutionize agricultural insurance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "Transparency",
                description: "Ensuring clear and open processes for all stakeholders in every claim."
              },
              {
                icon: Eye,
                title: "Efficiency",
                description: "Streamlining claim processing with AI and automation for rapid results."
              },
              {
                icon: Heart,
                title: "Innovation",
                description: "Continuously advancing our AI and satellite technologies for better outcomes."
              },
              {
                icon: Award,
                title: "Integrity",
                description: "Upholding the highest ethical standards in all our operations and interactions."
              }
            ].map((value, index) => (
              <Card key={index} className="text-center hover:shadow-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="bg-gradient-hero p-4 rounded-full w-fit mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="bg-gradient-hero p-3 rounded-lg w-fit mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-lg text-muted-foreground">
                  To provide a faster, more reliable, and transparent way to handle agricultural insurance claims through AI and satellite integration, ensuring fairness and minimizing fraud.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="bg-gradient-accent p-3 rounded-lg w-fit mb-4">
                  <Eye className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-lg text-muted-foreground">
                  To be the leading platform for agricultural insurance, recognized for our innovative use of technology to secure farmers' livelihoods and build trust in the claim process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Commitment to You</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our team is dedicated to providing farmers with the most advanced and reliable agricultural insurance claim process. We combine deep agricultural understanding with cutting-edge AI and satellite technology to ensure fair and efficient outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { stat: "AI-Powered", label: "Claim Verification" },
              { stat: "Satellite", label: "Loss Confirmation" },
              { stat: "Faster", label: "Processing & Payouts" }
            ].map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="text-3xl font-bold text-primary mb-2">{item.stat}</div>
                  <div className="text-lg text-muted-foreground">{item.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
