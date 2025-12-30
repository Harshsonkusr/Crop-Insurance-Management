import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from '../../lib/api';
import { CheckCircle2, AlertCircle, Mail, Lock, Phone, User, Building, MapPin, Briefcase } from "lucide-react";

const ServiceProviderSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    address: "",
    servicesProvided: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("Name, email, password, and phone are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/signup/service-provider', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessName: formData.businessName,
        address: formData.address,
        servicesProvided: formData.servicesProvided,
      });

      setSuccess(response.data.message);
      alert(response.data.message + "\n\nYou will be redirected to login page.");
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error("Service Provider signup error:", err);
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Left Side - Signup Form */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center text-[#1A5319] hover:text-[#1A5319]/80 mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A5319] mb-2">
                Service Provider Registration
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Create your account to provide services to farmers
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{success}</p>
                  <p className="text-xs mt-1">Redirecting to login page...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, phone: numericValue });
                      }}
                      placeholder="Enter your phone number"
                      required
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Business Name
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter business name (optional)"
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password (min 6 characters)"
                      required
                      minLength={6}
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                  Business Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter your business address (optional)"
                    className="pl-10 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1A5319] focus:outline-none focus:ring-1 focus:ring-[#1A5319]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="servicesProvided" className="text-sm font-medium text-gray-700 mb-2 block">
                  Services Provided
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="servicesProvided"
                    name="servicesProvided"
                    value={formData.servicesProvided}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the services you provide... (optional)"
                    className="pl-10 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1A5319] focus:outline-none focus:ring-1 focus:ring-[#1A5319]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5319] focus:ring-[#1A5319] cursor-pointer"
                  disabled={loading}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                  I accept the{" "}
                  <Link to="/terms" className="text-[#1A5319] hover:underline font-medium">
                    terms and conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-[#1A5319] hover:underline font-medium">
                    privacy policy
                  </Link>
                </Label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Important:</strong> Your registration will be reviewed by an administrator. 
                You will be notified via email once your account is approved. 
                You can only login after approval.
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1A5319] hover:bg-[#1A5319]/90 text-white text-lg font-semibold rounded-lg shadow-md"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "Register as Service Provider"
                )}
              </Button>

              <div className="text-center pt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#1A5319] hover:underline font-medium">
                    Login here
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Are you a farmer?{" "}
                  <Link to="/signup/farmer" className="text-[#1A5319] hover:underline font-medium">
                    Register as Farmer
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Information Panel */}
          <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-[#1A5319] to-[#2d7a2b] p-8 md:p-12 text-white">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Service Provider Portal</h2>
                <p className="text-white/90">
                  Join our network to provide services to farmers
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Claim Verification</h3>
                    <p className="text-sm text-white/80">Review and verify crop insurance claims</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Field Inspection</h3>
                    <p className="text-sm text-white/80">Conduct on-site inspections and assessments</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Admin Approval Required</h3>
                    <p className="text-sm text-white/80">Your account will be reviewed before activation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Info Panel */}
        <div className="md:hidden mt-4 p-6 bg-gradient-to-br from-[#1A5319] to-[#2d7a2b] rounded-lg text-white">
          <h3 className="text-lg font-bold mb-3">Service Provider Benefits</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Claim verification and processing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Field inspection tools</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Admin approval required</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderSignup;



