import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Award, Sparkles, TrendingUp, Users as UsersIcon } from "lucide-react";
import handsImage from "@/assets/hands-soil.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-24 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-down">
            About ClaimEasy
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90 animate-fade-in-down animation-delay-200">
            For over 25 years, we've been protecting farmers and securing agricultural futures across the nation
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-in">
              <div className="inline-block">
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Our Journey</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Our Story: Revolutionizing Agricultural Insurance
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                ClaimEasy was founded with a vision to transform agricultural insurance. Recognizing the challenges farmers face with traditional claim processes, we developed a smart and efficient platform that leverages Artificial Intelligence (AI) and satellite image verification.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our innovative approach ensures claims are processed quickly and accurately, acting as a transparent mediator between farmers and insurers. By automating verification and reducing manual intervention, ClaimEasy minimizes delays and detects genuine claims with unparalleled precision.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are committed to fostering transparency and trust, ensuring farmers receive their rightful compensation swiftly, and empowering insurers with advanced tools to combat fraud and streamline operations.
              </p>
            </div>
            <div className="animate-fade-in">
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={handsImage}
                  alt="Farming"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Our Core <span className="text-primary">Principles</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              The foundational values driving our mission to revolutionize agricultural insurance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "Transparency",
                description: "Ensuring clear and open processes for all stakeholders in every claim.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Eye,
                title: "Efficiency",
                description: "Streamlining claim processing with AI and automation for rapid results.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Heart,
                title: "Innovation",
                description: "Continuously advancing our AI and satellite technologies for better outcomes.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Award,
                title: "Integrity",
                description: "Upholding the highest ethical standards in all our operations and interactions.",
                color: "from-orange-500 to-red-500"
              }
            ].map((value, index) => (
              <Card key={index} className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in border-2 group" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className={`bg-gradient-to-r ${value.color} p-4 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 md:p-10">
                <div className="bg-gradient-hero p-3 rounded-lg w-fit mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To provide a faster, more reliable, and transparent way to handle agricultural insurance claims through AI and satellite integration, ensuring fairness and minimizing fraud.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 md:p-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg w-fit mb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To be the leading platform for agricultural insurance, recognized for our innovative use of technology to secure farmers' livelihoods and build trust in the claim process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Our Commitment to <span className="text-primary">You</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our team is dedicated to providing farmers with the most advanced and reliable agricultural insurance claim process. We combine deep agricultural understanding with cutting-edge AI and satellite technology to ensure fair and efficient outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { stat: "AI-Powered", label: "Claim Verification", icon: TrendingUp },
              { stat: "Satellite", label: "Loss Confirmation", icon: Target },
              { stat: "Faster", label: "Processing & Payouts", icon: UsersIcon }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="text-center border-2 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="bg-gradient-hero p-4 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{item.stat}</div>
                    <div className="text-lg text-muted-foreground font-medium">{item.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
