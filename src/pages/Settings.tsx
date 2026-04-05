import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Settings as SettingsIcon, User, Mail, Shield } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-zinc-100 p-4 rounded-full mb-6">
          <SettingsIcon className="w-12 h-12 text-zinc-600" />
        </div>
        <h2 className="text-3xl font-bold font-heading text-zinc-900 mb-3">Settings</h2>
        <p className="text-zinc-500 max-w-md text-lg">Please sign in to view your settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading text-zinc-900 tracking-tight">Settings</h1>
        <p className="mt-1.5 text-zinc-500">Manage your account preferences and profile.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information associated with this account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-zinc-200">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-medium">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-zinc-900">{user.displayName}</h3>
                <p className="text-sm text-zinc-500">Google Account</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </label>
                <p className="text-zinc-900 font-medium">{user.displayName || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </label>
                <p className="text-zinc-900 font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Account Status
                </label>
                <p className="text-emerald-600 font-medium flex items-center gap-1">
                  Verified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">More preferences coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
