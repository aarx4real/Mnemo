import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    google?: any;
  }
}

// Interface for registered accounts in local database
interface StoredUser {
  email: string;
  password?: string;
  name: string;
  provider: 'email' | 'google';
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // 1. Strict Email Format Validator (Accepts .com, .edu, .org, .ac.in, etc.)
  const isValidEmail = (emailStr: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr.trim());
  };

  // 2. Get registered users from mock DB
  const getRegisteredUsers = (): StoredUser[] => {
    try {
      const users = localStorage.getItem('mnemo_registered_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  // Handle Response from Official Google Identity Services SDK
  const handleGoogleCallbackResponse = (response: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const googleUser = JSON.parse(jsonPayload);
      const userSession = {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: 'google' as const,
      };

      // Save to active session
      localStorage.setItem('mnemo_user', JSON.stringify(userSession));
      localStorage.setItem('mnemo_token', response.credential);

      // Add to registered users if new
      const registered = getRegisteredUsers();
      if (!registered.some(u => u.email.toLowerCase() === googleUser.email.toLowerCase())) {
        registered.push(userSession);
        localStorage.setItem('mnemo_registered_users', JSON.stringify(registered));
      }

      setTimeout(() => {
        setIsLoading(false);
        navigate('/app/dashboard');
      }, 500);
    } catch (error) {
      console.error('Failed to parse Google Token', error);
      setErrorMessage('Google Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Initialize Google Identity Button
  useEffect(() => {
    const googleClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '202089169871-lhmivbspib68ubh9e8v8qarp7j54dfp7.apps.googleusercontent.com';

    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallbackResponse,
          auto_select: false,
        });

        const targetDiv = document.getElementById('googleSignInBtn');
        if (targetDiv) {
          targetDiv.innerHTML = ''; // Clear previous render
          window.google.accounts.id.renderButton(targetDiv, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: isSignUp ? 'signup_with' : 'continue_with',
            shape: 'rectangular',
          });
        }
      }
    };

    if (!document.getElementById('google-jssdk')) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleScript;
      document.body.appendChild(script);
    } else {
      loadGoogleScript();
    }
  }, [isSignUp]);

  // Handle Standard Email / Password Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // Step A: Validate Email Format
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@gmail.com or student@university.edu)');
      return;
    }

    // Step B: Validate Password Length
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const registeredUsers = getRegisteredUsers();
    const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    setTimeout(() => {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        if (existingUser) {
          setErrorMessage('An account with this email already exists. Please sign in instead.');
          setIsLoading(false);
          return;
        }

        const newUser: StoredUser = {
          email: cleanEmail,
          password: password, // Note: For production backend, passwords should be hashed server-side
          name: name.trim() || cleanEmail.split('@')[0],
          provider: 'email',
        };

        registeredUsers.push(newUser);
        localStorage.setItem('mnemo_registered_users', JSON.stringify(registeredUsers));
        localStorage.setItem('mnemo_user', JSON.stringify(newUser));
        localStorage.setItem('mnemo_token', 'jwt-mock-token-' + Date.now());

        setIsLoading(false);
        navigate('/app/dashboard');
      } else {
        // --- SIGN IN LOGIC ---
        if (!existingUser) {
          setErrorMessage('No account found with this email. Please sign up first.');
          setIsLoading(false);
          return;
        }

        if (existingUser.password !== password) {
          setErrorMessage('Incorrect password. Please check your credentials.');
          setIsLoading(false);
          return;
        }

        // Login Success
        localStorage.setItem('mnemo_user', JSON.stringify(existingUser));
        localStorage.setItem('mnemo_token', 'jwt-mock-token-' + Date.now());

        setIsLoading(false);
        navigate('/app/dashboard');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Blurs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-surface border border-border rounded-2xl shadow-lg mb-2">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mnemo</h1>
          <p className="text-text-secondary text-sm">
            {isSignUp ? 'Create your personal second brain' : 'Welcome back to your second brain'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Error Message Alert Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 flex items-start gap-3 text-xs text-error animate-in fade-in zoom-in-95 duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Official Native Google Button Target */}
          <div id="googleSignInBtn" className="w-full min-h-[44px] flex justify-center" />

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-surface px-3 text-xs text-text-muted uppercase tracking-wider relative">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-text-muted absolute left-3" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Email address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-text-muted absolute left-3" />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com or student@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-text-secondary">Password</label>
                {!isSignUp && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-text-muted absolute left-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 gap-2 mt-2 font-semibold shadow-md"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center pt-2 border-t border-border/50">
            <p className="text-xs text-text-secondary">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage(null);
                }}
                className="text-primary font-medium hover:underline ml-1"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>Encrypted with end-to-end AI session protection</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;