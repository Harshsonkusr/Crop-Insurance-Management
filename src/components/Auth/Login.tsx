import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "./AuthContext";
import api from '../../lib/api';
import { CheckCircle2, AlertCircle, Phone, Mail, Lock, User } from "lucide-react";

const Login = () => {
  const location = useLocation();
  const [role, setRole] = useState("FARMER"); // Default role for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(120); // 2 minutes in seconds
  const [showResendButton, setShowResendButton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle location state (from signup redirect)
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
    if (location.state?.mobileNumber) {
      setMobileNumber(location.state.mobileNumber);
      setRole("FARMER");
      // If coming from signup, don't auto-send OTP - wait for user to click "Send OTP"
      if (location.state?.showSendOtpButton) {
        setOtpSent(false); // Ensure OTP is not sent automatically
      }
    }
  }, [location]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setShowResendButton(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleResendOtp = async () => {
    setError(null);
    try {
      await api.post('/auth/send-otp', { mobileNumber });
      setResendTimer(120); // Reset timer
      setShowResendButton(false);
      setOtpSent(true);
      setSuccess("OTP resent successfully!");
    } catch (err) {
      console.error("Error resending OTP:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to resend OTP. Please try again.");
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (role === "ADMIN" || role === "SERVICE_PROVIDER" || role === "SUPER_ADMIN") {
        if (!email || !password) {
          setError("Email and password are required");
          return;
        }
        const response = await api.post('/auth/login/admin-service-provider', {
          email,
          password,
        });
        // Wait for login to complete (fetches user data from backend)
        await login(response.data.token, response.data.user);
        // Navigate after user data is loaded
        if (response.data.user.role === "ADMIN" || response.data.user.role === "SUPER_ADMIN") {
          navigate("/admin-dashboard");
        } else if (response.data.user.role === "SERVICE_PROVIDER") {
          navigate("/service-provider-dashboard");
        }
      } else if (role === "FARMER") {
        if (!mobileNumber.trim()) {
          setError("Mobile number is required");
          return;
        }
        if (mobileNumber.length < 10) {
          setError("Please enter a valid mobile number");
          return;
        }
        
        if (!otpSent) {
          // Send OTP
          await api.post('/auth/send-otp', { mobileNumber: mobileNumber.trim() });
          setOtpSent(true);
          setResendTimer(120); // Start the timer when OTP is sent
          setSuccess("OTP sent to your mobile number. Please check your phone.");
          // Focus OTP input after a short delay to ensure it's rendered
          setTimeout(() => {
            const otpInput = document.getElementById('otp');
            if (otpInput) {
              otpInput.focus();
            }
          }, 100);
        } else {
          // Verify OTP
          if (!otp.trim()) {
            setError("Please enter the OTP");
            return;
          }
          const response = await api.post('/auth/verify-otp', {
            mobileNumber: mobileNumber.trim(),
            otp: otp.trim(),
          });
          // Wait for login to complete (fetches user data from backend)
          await login(response.data.token, response.data.user);
          // Navigate after user data is loaded
          navigate("/farmer-dashboard");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setOtpSent(false);
    setOtp("");
    setMobileNumber("");
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Left Side - Login Form */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center text-[#1A5319] hover:text-[#1A5319]/80 mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A5319] mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Sign in to access your account
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
                <p className="text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Your Role
                </Label>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-12 rounded-lg border-gray-300">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FARMER">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Farmer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SERVICE_PROVIDER">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Service Provider</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === "ADMIN" || role === "SERVICE_PROVIDER" ? (
                <>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember-me"
                        className="h-4 w-4 rounded border-gray-300 text-[#1A5319] focus:ring-[#1A5319]"
                      />
                      <Label htmlFor="remember-me" className="text-gray-600">Remember me</Label>
                    </div>
                    <Link to="#" className="text-[#1A5319] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="Enter your 10-digit mobile number"
                        value={mobileNumber}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, "");
                          setMobileNumber(numericValue);
                        }}
                        className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        disabled={otpSent}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-2 block">
                        Enter OTP
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, "");
                          setOtp(numericValue);
                        }}
                        className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319] text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                        autoFocus
                        autoComplete="one-time-code"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        OTP sent to {mobileNumber}. Check your phone.
                      </p>
                    </div>
                  )}
                </>
              )}

              {role === "FARMER" && otpSent ? (
                <div className="flex w-full space-x-2">
                  <Button
                    type="submit"
                    className="h-12 w-1/2 rounded-lg bg-[#1A5319] text-lg font-semibold text-white hover:bg-[#1A5319]/90"
                  >
                    VERIFY OTP
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-1/2 rounded-lg border-[#1A5319] text-[#1A5319] hover:bg-[#1A5319]/10"
                    onClick={handleResendOtp}
                    disabled={!showResendButton}
                  >
                    {showResendButton ? (
                      "Resend"
                    ) : (
                      `Resend in ${Math.floor(resendTimer / 60)}:${("0" + (resendTimer % 60)).slice(-2)}`
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#1A5319] hover:bg-[#1A5319]/90 text-white text-lg font-semibold rounded-lg shadow-md"
                >
                  {role === "ADMIN" || role === "SERVICE_PROVIDER" ? "LOG IN" : "SEND OTP"}
                </Button>
              )}

              <div className="pt-4 space-y-2">
                {role === "FARMER" && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link to="/signup/farmer" className="text-[#1A5319] hover:underline font-medium">
                        Register as Farmer
                      </Link>
                    </p>
                  </div>
                )}
                {role === "SERVICE_PROVIDER" && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link to="/signup/service-provider" className="text-[#1A5319] hover:underline font-medium">
                        Register as Service Provider
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: Service Provider accounts require admin approval
                    </p>
                  </div>
                )}
                {role === "ADMIN" && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Admin accounts are created by Super Admin only
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Side - Information Panel */}
          <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-[#1A5319] to-[#2d7a2b] p-8 md:p-12 text-white">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Smart Crop Claim Assist</h2>
                <p className="text-white/90">
                  Your gateway to efficient agricultural insurance management
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Fast Processing</h3>
                    <p className="text-sm text-white/80">Reduced claim processing time from 5-6 months to under 1 month</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">AI-Powered</h3>
                    <p className="text-sm text-white/80">Automated crop damage detection using satellite imagery</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure Access</h3>
                    <p className="text-sm text-white/80">OTP-based authentication for farmers, secure login for admins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
