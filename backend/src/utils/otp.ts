import dotenv from 'dotenv';
dotenv.config();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (mobileNumber: string, otp: string): Promise<void> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      // Dynamic import to avoid dependency issues if not using Twilio
      const twilio = await import('twilio');
      const client = twilio.default(accountSid, authToken);
      
      await client.messages.create({
        body: `Your ClaimEasy verification code is: ${otp}. Valid for 5 minutes.`,
        from: fromNumber,
        to: mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}` // Default to India +91
      });
      
      console.log(`✅ Real SMS sent to ${mobileNumber} via Twilio`);
      return;
    } catch (error) {
      console.error('❌ Twilio Error:', error);
      // Fallback to logs if Twilio fails
    }
  }

  // FALLBACK: Log to console if Twilio is not configured
  console.log('------------------------------------');
  console.log(`📱 DEMO MODE: OTP for ${mobileNumber} is ${otp}`);
  console.log('------------------------------------');
  return new Promise(resolve => setTimeout(resolve, 500));
};
