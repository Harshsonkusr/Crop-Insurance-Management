import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Bot, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useState } from "react";

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
    ...(googleMapsApiKey ? {} : { libraries: [] })
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Office",
      content: "123 AI Farm Lane, AgriTech City, AG 56789"
    },
    {
      icon: Phone,
      title: "Phone Support",
      content: (
        <>
          +1 (555) 123-4567 (General Inquiries)<br />
          +1 (555) 987-6543 (Claim Assistance)
        </>
      )
    },
    {
      icon: Mail,
      title: "Email",
      content: (
        <>
          General: info@claimeasy.com<br />
          Support: support@claimeasy.com<br />
          Claims: claims@claimeasy.com
        </>
      )
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: (
        <>
          Monday - Friday: 9:00 AM - 5:00 PM (EST)<br />
          Saturday: 10:00 AM - 2:00 PM (EST)
        </>
      )
    },
    {
      icon: Bot,
      title: "AI Chatbot Support",
      content: "Available 24/7 for instant answers and guidance."
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
            <span className="text-sm text-white font-medium">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-down">
            Get in Touch with ClaimEasy
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90 animate-fade-in-down animation-delay-200">
            Have questions about AI-powered crop insurance or need assistance with a claim? We're here to help.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <Card className="lg:col-span-2 animate-fade-in-up border-2 shadow-lg">
              <CardContent className="p-8 md:p-10">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Send Us a Message</h2>
                  <p className="text-muted-foreground">Fill out the form below and we'll get back to you as soon as possible.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Rahul" required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Sharma" required className="h-11" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="rahul.sharma@example.com" required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+91 98765 43210" className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your insurance needs..." 
                      rows={6}
                      required 
                      className="resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full group" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6 animate-fade-in-up animation-delay-200">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card key={index} className="border-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-hero p-3 rounded-lg flex-shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2 text-lg">{info.title}</h3>
                          <p className="text-muted-foreground leading-relaxed text-sm">
                            {info.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 md:py-24 bg-muted">
        <div className="container mx-auto px-4 animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Visit Our Office</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              We're conveniently located in the heart of agricultural country
            </p>
          </div>
          <Card className="border-2 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center relative">
                {googleMapsApiKey && isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                  >
                    <Marker position={center} />
                  </GoogleMap>
                ) : (
                  <div className="text-center p-8">
                    <div className="bg-gradient-hero p-4 rounded-full w-fit mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-foreground font-medium mb-2 text-lg">123 AI Farm Lane, AgriTech City, AG 56789</p>
                    {!googleMapsApiKey && (
                      <p className="text-sm text-muted-foreground">
                        Add VITE_GOOGLE_MAPS_API_KEY to .env to enable map
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
