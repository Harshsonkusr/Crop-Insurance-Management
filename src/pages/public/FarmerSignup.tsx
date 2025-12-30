import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from '../../lib/api';
import logger from '../../utils/logger';
import { CheckCircle2, AlertCircle, Phone, User, Shield } from "lucide-react";

const FarmerSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    aadhaarNumber: "",
    address: "",
    village: "",
    district: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers for mobile number and Aadhaar
    if (name === "mobileNumber" || name === "aadhaarNumber") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    if (!formData.mobileNumber.trim()) {
      setError("Mobile number is required");
      return;
    }

    if (formData.mobileNumber.length < 10) {
      setError("Please enter a valid mobile number (at least 10 digits)");
      return;
    }

    if (!formData.aadhaarNumber.trim()) {
      setError("Aadhaar number is required");
      return;
    }

    if (formData.aadhaarNumber.length !== 12) {
      setError("Aadhaar number must be exactly 12 digits");
      return;
    }

    if (!consentGranted) {
      setError("Consent is required to use Aadhaar for policy lookup and verification");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions to continue");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/signup/farmer', {
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        aadhaarNumber: formData.aadhaarNumber.trim(),
        address: formData.address.trim(),
        village: formData.village.trim(),
        district: formData.district.trim(),
        consentGranted: consentGranted,
      });

      setSuccess(response.data.message || "Account created successfully! Please click 'Send OTP' to receive your verification code.");
      logger.farmer.register('Farmer registered successfully', { 
        mobileNumber: formData.mobileNumber.trim(),
        hasAadhaar: !!formData.aadhaarNumber 
      });
      
      // Show success message and redirect to login immediately (don't wait)
      navigate('/login', { 
        state: { 
          message: "Account created successfully! Please click 'Send OTP' to receive your verification code.",
          mobileNumber: formData.mobileNumber.trim(),
          showSendOtpButton: true
        } 
      });
    } catch (err: any) {
      logger.farmer.error("Farmer signup error", { error: err, mobileNumber: formData.mobileNumber.trim() });
      
      // Handle existing user - redirect to login
      if (err?.response?.status === 409 && err?.response?.data?.redirectToLogin) {
        navigate('/login', { 
          state: { 
            message: err.response.data.message || "A farmer with this information already exists. Please login.",
            mobileNumber: formData.mobileNumber.trim()
          } 
        });
        return;
      }
      
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.status === 409) {
        setError("A farmer with this mobile number or Aadhaar already exists. Please login instead.");
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
                Farmer Registration
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Create your account to access crop insurance services
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
                <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                  Mobile Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit mobile number"
                    required
                    maxLength={10}
                    className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You'll receive an OTP on this number for verification
                </p>
              </div>

              <div>
                <Label htmlFor="aadhaarNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                  Aadhaar Number *
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    type="tel"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="Enter your 12-digit Aadhaar number"
                    required
                    maxLength={12}
                    className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required for policy verification and linking
                </p>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="village" className="text-sm font-medium text-gray-700 mb-2 block">
                    Village
                  </Label>
                  <Input
                    id="village"
                    name="village"
                    type="text"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Village"
                    className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="district" className="text-sm font-medium text-gray-700 mb-2 block">
                    District
                  </Label>
                  <Input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                    className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consentGranted"
                    checked={consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5319] focus:ring-[#1A5319] cursor-pointer"
                    disabled={loading}
                  />
                  <Label htmlFor="consentGranted" className="text-sm text-gray-700 cursor-pointer">
                    I consent to Claimeasy using my Aadhaar number to lookup and verify my insurance policies with external insurers, and to link my Aadhaar to my account for verification purposes. *
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
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
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1A5319] hover:bg-[#1A5319]/90 text-white text-lg font-semibold rounded-lg shadow-md transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Farmer Account"
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#1A5319] hover:underline font-medium">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Information Panel */}
          <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-[#1A5319] to-[#2d7a2b] p-8 md:p-12 text-white">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Secure & Fast</h3>
                  <p className="text-sm text-white/90">OTP-based authentication for secure access</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Phone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mobile First</h3>
                  <p className="text-sm text-white/90">Works seamlessly with your mobile app</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Easy Access</h3>
                  <p className="text-sm text-white/90">Quick claim submission and tracking</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm text-white/80">
                <strong>Note:</strong> After registration, you'll be redirected to the login page. 
                Use your mobile number and the OTP sent to your phone to complete the login process.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Info Panel */}
        <div className="md:hidden mt-4 p-6 bg-gradient-to-br from-[#1A5319] to-[#2d7a2b] rounded-lg text-white">
          <h3 className="text-lg font-bold mb-3">Why Register?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Secure OTP-based authentication</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Works with your mobile app</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Quick claim submission and tracking</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FarmerSignup;

