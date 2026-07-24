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
  AlertCircle,
  Sparkles,
  Zap,
  Search,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    google?: any;
  }
}

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

  // 1. Strict Email Format Validator
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

      localStorage.setItem('mnemo_user', JSON.stringify(userSession));
      localStorage.setItem('mnemo_token', response.credential);

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

  // Initialize Native Dark Google Identity Button
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
          targetDiv.innerHTML = ''; 
          window.google.accounts.id.renderButton(targetDiv, {
            theme: 'filled_black', // Uses sleek dark theme from Google
            size: 'large',
            width: '380',
            text: isSignUp ? 'signup_with' : 'continue_with',
            shape: 'pill',
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

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@gmail.com or student@university.edu)');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const registeredUsers = getRegisteredUsers();
    const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    setTimeout(() => {
      if (isSignUp) {
        if (existingUser) {
          setErrorMessage('An account with this email already exists. Please sign in instead.');
          setIsLoading(false);
          return;
        }

        const newUser: StoredUser = {
          email: cleanEmail,
          password: password,
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

        localStorage.setItem('mnemo_user', JSON.stringify(existingUser));
        localStorage.setItem('mnemo_token', 'jwt-mock-token-' + Date.now());

        setIsLoading(false);
        navigate('/app/dashboard');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
      
      {/* LEFT SIDE: Interactive Product Showcase & Glow Effects */}
      <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-between p-12 border-r border-white/10 bg-gradient-to-br from-[#0D121F] via-[#070A0F] to-[#0A0D14] overflow-hidden">
        
        {/* Ambient Gradient Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-md">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Mnemo</span>
        </div>

        {/* Middle Showcase Content */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Knowledge Vault
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Capture everything. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Recall instantly with AI.
            </span>
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Your unified second brain that indexes notes, articles, research, and code snippets into a searchable context engine.
          </p>

          {/* Floating UI Mockup Preview Cards */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-2 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                  <Search className="w-3.5 h-3.5" /> Vector Semantic Query
                </span>
                <span>0.04s</span>
              </div>
              <p className="text-xs text-slate-200 font-mono bg-black/40 p-2 rounded border border-white/5">
                "What were my findings on PostgreSQL HNSW index tradeoffs?"
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>142 Memories indexed into active vector space</span>
              </div>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Bottom Testimonial / Value prop */}
        <div className="relative z-10 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-indigo-400" />
            <span>End-to-End Encrypted Storage</span>
          </div>
          <span>v2.4.0 Engine</span>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">Mnemo</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          
          {/* Header & Segmented Tab Switcher */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                {isSignUp 
                  ? 'Start building your personal knowledge base in seconds' 
                  : 'Enter your credentials to access your context engine'}
              </p>
            </div>

            {/* Segmented Control Switcher */}
            <div className="p-1 bg-white/[0.04] border border-white/10 rounded-xl grid grid-cols-2 gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition-all duration-150 ${
                  !isSignUp 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition-all duration-150 ${
                  isSignUp 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="space-y-5">
            
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-400 animate-in fade-in zoom-in-95 duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dark Mode Native Google Button Container */}
            <div className="space-y-2">
              <div id="googleSignInBtn" className="w-full min-h-[44px] flex justify-center" />
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#070A0F] px-3 text-[10px] text-slate-500 uppercase tracking-widest relative">
                Or email
              </span>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com or student@university.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {!isSignUp && (
                    <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-semibold shadow-lg shadow-indigo-600/20 rounded-xl transition-all duration-200 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-4 border-t border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted Authentication</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;