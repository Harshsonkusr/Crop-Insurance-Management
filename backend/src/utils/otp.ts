export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (mobileNumber: string, otp: string): Promise<void> => {
  console.log(`Sending OTP ${otp} to ${mobileNumber}`);
  // In a real application, you would integrate with an SMS gateway here (e.g., Twilio, MessageBird)
  // For demonstration purposes, we'll just log it.
  return new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
};
