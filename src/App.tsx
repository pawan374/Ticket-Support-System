/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubmitIssue from './pages/SubmitIssue';
import SubmitEnhancement from './pages/SubmitEnhancement';
import TicketDetails from './pages/TicketDetails';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import RequestProject from './pages/RequestProject';
import ProjectDetails from './pages/ProjectDetails';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

import AdminDashboard from './pages/AdminDashboard';

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Initializing Awecode Support...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/:tab" element={<AdminDashboard />} />
        <Route path="submit-issue" element={<SubmitIssue />} />
        <Route path="submit-enhancement" element={<SubmitEnhancement />} />
        <Route path="request-project" element={<RequestProject />} />
        <Route path="ticket/:id" element={<TicketDetails />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="awecode-theme">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

