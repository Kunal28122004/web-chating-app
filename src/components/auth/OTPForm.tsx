import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Mail } from "lucide-react";

interface OTPFormProps {
  email: string;
  onSubmit: (otp: string) => void;
  onResendOTP: () => void;
  isLoading?: boolean;
}

export function OTPForm({ email, onSubmit, onResendOTP, isLoading }: OTPFormProps) {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(otp);
      toast({
        title: "Email verified!",
        description: "Your account has been successfully verified.",
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await onResendOTP();
      toast({
        title: "OTP resent",
        description: "A new OTP has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend OTP",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          We've sent a 6-digit verification code to
        </CardDescription>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          <Mail className="w-4 h-4" />
          {email}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            className="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>

          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-primary hover:text-primary-glow font-medium transition-colors disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
        </Button>
      </CardFooter>
    </Card>
  );
}