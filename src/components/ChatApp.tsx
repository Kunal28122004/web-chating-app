import { useState, useEffect } from "react";
import { LoginForm } from "./auth/LoginForm";
import { RegisterForm } from "./auth/RegisterForm";
import { OTPForm } from "./auth/OTPForm";
import { ChatInterface } from "./chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: Date;
  bio?: string;
  location?: string;
  joinedAt?: Date;
}

type AuthMode = "login" | "register" | "otp" | "chat";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export function ChatApp() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize auth state and check for existing session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile from database
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
          setAuthMode("chat");
        } else {
          setCurrentUser(null);
          setAuthMode("login");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        setAuthMode("chat");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // For now, create a default user profile until the database migration is approved
      // Once the migration is run, this code will work with the actual database
      const defaultUser: UserProfile = {
        id: userId,
        name: user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
        status: "online",
        bio: 'Hello! I\'m using ChatApp',
        location: '',
        joinedAt: new Date()
      };
      
      setCurrentUser(defaultUser);

      // TODO: Uncomment this code after running the database migration
      // const { data: profile, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single();

      // if (error && error.code !== 'PGRST116') {
      //   throw error;
      // }

      // if (profile) {
      //   setCurrentUser({
      //     id: userId,
      //     name: profile.display_name || user?.email?.split('@')[0] || 'User',
      //     email: user?.email || '',
      //     avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
      //     status: "online",
      //     bio: profile.bio || '',
      //     location: profile.location || '',
      //     joinedAt: new Date(profile.created_at)
      //   });
      // } else {
      //   // Create profile if it doesn't exist
      //   const newProfile = {
      //     user_id: userId,
      //     display_name: user?.email?.split('@')[0] || 'User',
      //     bio: 'Hello! I\'m using ChatApp',
      //     location: ''
      //   };

      //   const { error: insertError } = await supabase
      //     .from('profiles')
      //     .insert([newProfile]);

      //   if (!insertError) {
      //     setCurrentUser({
      //       id: userId,
      //       name: newProfile.display_name,
      //       email: user?.email || '',
      //       avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
      //       status: "online",
      //       bio: newProfile.bio,
      //       location: newProfile.location,
      //       joinedAt: new Date()
      //     });
      //   }
      // }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to default user
      setCurrentUser({
        id: userId,
        name: user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
        status: "online",
        bio: 'Hello! I\'m using ChatApp',
        location: '',
        joinedAt: new Date()
      });
    }
  };

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName,
          }
        }
      });

      if (error) throw error;

      setPendingEmail(data.email);
      setAuthMode("otp");
      
      toast({
        title: "Account created!",
        description: "Please check your email for verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (otp: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      toast({
        title: "Email verified!",
        description: "Welcome to ChatApp! You can now start chatting.",
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP. Please check your email for the verification code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: "OTP resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password reset",
      description: "Password reset feature will be available soon!",
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setCurrentUser(null);
      setUser(null);
      setSession(null);
      setAuthMode("login");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render based on current auth mode
  switch (authMode) {
    case "login":
      return (
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToRegister={() => setAuthMode("register")}
            onForgotPassword={handleForgotPassword}
            isLoading={isLoading}
          />
        </div>
      );

    case "register":
      return (
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
          <RegisterForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => setAuthMode("login")}
            isLoading={isLoading}
          />
        </div>
      );

    case "otp":
      return (
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
          <OTPForm
            email={pendingEmail}
            onSubmit={handleOTPVerification}
            onResendOTP={handleResendOTP}
            isLoading={isLoading}
          />
        </div>
      );

    case "chat":
      return currentUser ? (
        <ChatInterface
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      ) : null;

    default:
      return null;
  }
}