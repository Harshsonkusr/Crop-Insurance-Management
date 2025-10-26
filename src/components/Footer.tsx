import { Link } from "react-router-dom";
import { Sprout, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "./Auth/AuthContext";

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  if (user) {
    return null; // Don't render footer if user is logged in
  }

  return (
    <footer className="bg-muted border-t border-border animate-fade-in">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-hero p-2 rounded-lg">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">ClaimEasy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Protecting your harvest, securing your future. Comprehensive crop insurance solutions for modern farmers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">AI-Powered Damage Assessment</li>
              <li className="text-sm text-muted-foreground">Satellite Image Verification</li>
              <li className="text-sm text-muted-foreground">Rapid Claim Processing</li>
              <li className="text-sm text-muted-foreground">Enhanced Fraud Detection</li>
              <li className="text-sm text-muted-foreground">Dedicated Farmer Support</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>123, Krishi Nagar, Kisan Gali, New Delhi, India</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>info@claimeasy.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ClaimEasy Insurance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
