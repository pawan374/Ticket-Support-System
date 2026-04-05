import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CheckCircle2, ArrowRight, Mail, Lock } from 'lucide-react';

export default function Landing() {
  const { user, signIn, signInWithEmail, isSigningIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    await signInWithEmail(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-background">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-background blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-background blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <img 
            src="https://awecode.com/images/brand/logo_horizontal_inverted.png" 
            alt="Awecode Logo" 
            className="h-10 mb-12"
            referrerPolicy="no-referrer"
          />
          
          <h1 className="text-5xl font-bold font-heading leading-tight tracking-tight mb-6">
            Building software that <br />
            <span className="text-secondary">empowers your business.</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/80 max-w-lg leading-relaxed mb-12">
            Welcome to the Awecode Support Portal. Track your projects, report issues, and request enhancements with ease.
          </p>

          <div className="space-y-6">
            {[
              "Real-time ticket tracking",
              "Direct communication with our team",
              "Project-specific documentation",
              "Feature enhancement requests"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-secondary/20 p-1 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-lg font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Awecode. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 relative bg-background">
        <div className="lg:hidden absolute top-6 left-6">
          <img 
            src="https://awecode.com/images/brand/logo_horizontal.png" 
            alt="Awecode Logo" 
            className="h-8"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="mx-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 h-11 text-lg font-medium"
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-border h-11 font-medium hover:bg-muted"
              onClick={signIn}
              disabled={isSigningIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need help? <a href="mailto:support@awecode.com" className="text-primary font-medium hover:underline">Contact Awecode Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
