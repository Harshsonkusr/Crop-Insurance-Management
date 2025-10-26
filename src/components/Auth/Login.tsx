import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("FARMER"); // Default role
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(120); // 2 minutes in seconds
  const [showResendButton, setShowResendButton] = useState(false);

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

  const handleResendOtp = () => {
    // Simulate resending OTP
    console.log(`Resending OTP to ${mobileNumber}`);
    setResendTimer(120); // Reset timer
    setShowResendButton(false);
    // In a real app, you'd call an API to resend the OTP here
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      // Signup logic
      console.log("Registering user:", { username, email, role });
    }

    if (role === "ADMIN" || role === "SERVICE_PROVIDER") { // Modified condition
      // Simulate admin/service provider login
      console.log(`${role} logging in:`, { email, password });
      if (role === "ADMIN") {
        login(role, "Admin User", "https://i.pravatar.cc/150?img=68");
        navigate("/admin-dashboard");
      } else if (role === "SERVICE_PROVIDER") {
        login(role, "Service Provider", "https://i.pravatar.cc/150?img=68");
        navigate("/service-provider-dashboard");
      }
    } else if (role === "FARMER") { // Only FARMER uses OTP now
      if (!otpSent) {
        // Simulate sending OTP
        console.log(`Sending OTP to ${mobileNumber} for role ${role}`);
        setOtpSent(true);
        setResendTimer(120); // Start the timer when OTP is sent
        // In a real app, you'd call an API to send the OTP here
      } else {
        // Simulate OTP verification
        console.log(`Verifying OTP ${otp} for ${mobileNumber} with role ${role}`);
        if (otp === "123456") { // Hardcoded OTP for demonstration
          login(role, "Rajesh Kumar", "https://i.pravatar.cc/150?img=68");
          navigate("/farmer-dashboard");
        } else {
          alert("Invalid OTP");
        }
      }
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-100 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          navigate("/");
        }
      }}
    >
      <div className={`flip-container ${!isLogin ? "flipped" : ""} relative h-[600px] w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-xl`}>
        <style>
          {`
          .flip-container {
            perspective: 1000px;
          }
          .flipper {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s;
            transform-style: preserve-3d;
          }
          .flip-container.flipped .flipper {
            transform: rotateY(180deg);
          }
          .front, .back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            display: flex;
            flex-direction: row;
          }
          .back {
            transform: rotateY(180deg);
          }
          `}
        </style>
        <div className="flipper">
          {/* Front Face: Login Form */}
          <div className="front">
            {/* Login Form */}
            <div className="flex w-full items-center justify-center p-8 md:w-1/2">
              <div className="mx-auto max-w-sm text-center">
                <h2 className="mb-6 text-3xl font-bold text-[#1A5319]">Log In</h2>
                <div className="space-y-4">
                  <Select value={role} onValueChange={(value) => {
                    setRole(value);
                    setOtpSent(false); // Reset OTP state on role change
                    setOtp(""); // Clear OTP on role change
                    setMobileNumber(""); // Clear mobile number on role change
                    setEmail(""); // Clear email on role change
                    setPassword(""); // Clear password on role change
                  }}>
                    <SelectTrigger className="h-12 rounded-lg border-[#1A5319] px-4">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FARMER">Farmer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
                    </SelectContent>
                  </Select>

                  {role === "ADMIN" || role === "SERVICE_PROVIDER" ? (
                    <>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-lg border-border px-4"
                      />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-lg border-border px-4"
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        id="mobileNumber"
                        type="text"
                        placeholder="Mobile Number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="h-12 rounded-lg border-[#1A5319] px-4 text-base"
                        disabled={otpSent}
                      />
                      {otpSent && (
                        <Input
                        id="otp"
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="h-12 rounded-lg border-[#1A5319] px-4 text-base"
                      />
                      )}
                    </>
                  )}

                  {role === "ADMIN" || role === "SERVICE_PROVIDER" ? (
                    <div className="flex items-center justify-start gap-16 text-sm">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember-me"
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <Label htmlFor="remember-me">Remember me</Label>
                      </div>
                      <Link to="#" className="text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  ) : (
                    <div className="h-2"></div>
                  )}
                  {role === "FARMER" && otpSent ? ( // Modified condition
                    <div className="flex w-full space-x-2">
                      <Button className="h-12 w-1/2 rounded-lg bg-[#1A5319] text-lg font-semibold text-white hover:bg-[#1A5319]/90" onClick={handleSubmit}>
                        VERIFY OTP
                      </Button>
                      <Button
                        className="h-12 w-1/2 rounded-lg bg-[#81B29A] text-lg font-semibold text-white hover:bg-[#81B29A]/90"
                        onClick={handleResendOtp}
                        disabled={!showResendButton}
                      >
                        {showResendButton ? (
                          "Resend"
                        ) : (
                          `Resend in ${Math.floor(resendTimer / 60)}:${("0" + (resendTimer % 60)).slice(-2)}s`
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button className="h-12 w-full rounded-lg bg-[#1A5319] text-lg font-semibold text-white hover:bg-[#1A5319]/90" onClick={handleSubmit}>
                      {role === "ADMIN" || role === "SERVICE_PROVIDER" ? "LOG IN" : "SEND OTP"}
                    </Button>
                  )}
                </div>
               
              </div>
            </div>

            {/* Welcome Panel for Login */}
            <div className="relative flex w-full items-center justify-center rounded-r-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground md:w-1/2">
              <div className="flex flex-col items-center justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="mb-4 h-16 w-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <h3 className="mb-2 text-2xl font-bold">Hello, friend!</h3>
                <p className="mb-6 text-sm">
                  Enter your personal details and start journey with us
                </p>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => setIsLogin(false)}
                >
                  REGISTER <span className="ml-2 text-lg">→</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Back Face: Sign Up Form */}
          <div className="back">
            {/* Welcome Back Panel for Sign Up */}
            <div className="relative flex w-full items-center justify-center rounded-l-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground md:w-1/2">
              <div className="flex flex-col items-center justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="mb-4 h-16 w-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
                <h3 className="mb-2 text-2xl font-bold">Welcome Back!</h3>
                <p className="mb-6 text-sm">
                  To keep connected with us please login with your personal info
                </p>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => setIsLogin(true)}
                >
                  LOG IN
                </Button>
              </div>
            </div>

            {/* Sign Up Form */}
            <div className="flex w-full items-center justify-center p-8 md:w-1/2">
              <div className="mx-auto max-w-sm text-center">
                <h2 className="mb-6 text-3xl font-bold text-[#1A5319]">Sign Up</h2>
                <div className="space-y-4">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 rounded-lg border-border px-4"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-lg border-border px-4"
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-lg border-border px-4"
                  />
                  <div className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      id="accept-terms"
                      className="h-4 w-4 rounded border-border text-[#1A5319] focus:ring-[#1A5319]"
                    />
                    <Label htmlFor="accept-terms">I accept terms</Label>
                  </div>
                  <Button className="h-12 w-full rounded-lg bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90" onClick={handleSubmit}>
                    SUBMIT
                  </Button>
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