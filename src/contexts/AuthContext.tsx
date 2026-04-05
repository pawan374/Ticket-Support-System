import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'client';
  projectTitle?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  logOut: () => Promise<void>;
  adminCreateClient: (email: string, displayName: string, projectTitle: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isAdminEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === 'awecode.com' || domain === 'awecode.com.np';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('devsupport_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const mockLogin = async (email: string, name: string) => {
    setIsSigningIn(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // simulate network
      
      let role: 'admin' | 'client' = isAdminEmail(email) ? 'admin' : 'client';
      let projectTitle = '';

      if (role === 'client') {
        const clientsData = localStorage.getItem('devsupport_clients');
        const clients = clientsData ? JSON.parse(clientsData) : [];
        const clientInfo = clients.find((c: any) => c.email.toLowerCase() === email.toLowerCase());
        if (clientInfo) {
          projectTitle = clientInfo.projectTitle;
        }
      }

      const mockUser: User = { 
        uid: 'user-' + Math.random().toString(36).substring(2, 9), 
        email, 
        displayName: name,
        role,
        projectTitle
      };
      setUser(mockUser);
      localStorage.setItem('devsupport_user', JSON.stringify(mockUser));
      toast.success("Signed in successfully");
    } finally {
      setIsSigningIn(false);
    }
  };

  const signIn = async () => mockLogin('admin@awecode.com', 'Awecode Admin');
  const signInWithEmail = async (email: string, _password: string) => mockLogin(email, email.split('@')[0]);
  const signUpWithEmail = async (email: string, _password: string, displayName?: string) => mockLogin(email, displayName || email.split('@')[0]);

  const logOut = async () => {
    setUser(null);
    localStorage.removeItem('devsupport_user');
    toast.success("Signed out successfully");
  };

  const adminCreateClient = async (email: string, displayName: string, projectTitle: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const clientsData = localStorage.getItem('devsupport_clients');
    const clients = clientsData ? JSON.parse(clientsData) : [];
    
    if (clients.some((c: any) => c.email.toLowerCase() === email.toLowerCase())) {
      toast.error("Client already exists");
      return;
    }

    const newClient = { email, displayName, projectTitle };
    localStorage.setItem('devsupport_clients', JSON.stringify([...clients, newClient]));
    toast.success(`Client ${displayName} created for project ${projectTitle}`);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSigningIn, signIn, signInWithEmail, signUpWithEmail, logOut, adminCreateClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
