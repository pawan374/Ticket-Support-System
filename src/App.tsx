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
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

