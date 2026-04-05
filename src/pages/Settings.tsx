import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/ThemeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Settings as SettingsIcon, User, Mail, Shield, Bell, Moon, Sun, Monitor, Key, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [marketingNotifs, setMarketingNotifs] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-muted p-4 rounded-full mb-6">
          <SettingsIcon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold font-heading text-foreground mb-3">Settings</h2>
        <p className="text-muted-foreground max-w-md text-lg">Please sign in to view your settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Settings</h1>
        <p className="mt-1.5 text-muted-foreground">Manage your account settings and set email preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information associated with this account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-border shadow-sm">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-medium">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">{user.displayName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" /> 
                    {user.role === 'admin' ? 'Administrator' : 'Client Account'}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs h-8">Change Avatar</Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </Label>
                  <Input id="fullName" defaultValue={user.displayName || ''} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress" className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </Label>
                  <Input id="emailAddress" defaultValue={user.email || ''} readOnly className="bg-muted/50" />
                </div>
                {user.projectTitle && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="projectTitle" className="text-muted-foreground flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" /> Associated Project
                    </Label>
                    <Input id="projectTitle" defaultValue={user.projectTitle} readOnly className="bg-muted/50" />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t border-border flex justify-between items-center py-4">
              <p className="text-xs text-muted-foreground">Profile information is managed via your Google Account.</p>
              <Button disabled>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" /> Email Notifications
                  </Label>
                  <span className="text-sm text-muted-foreground">Receive emails about ticket updates and project milestones.</span>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" /> Push Notifications
                  </Label>
                  <span className="text-sm text-muted-foreground">Receive push notifications in your browser.</span>
                </div>
                <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4 text-muted-foreground" /> Marketing Emails
                  </Label>
                  <span className="text-sm text-muted-foreground">Receive emails about new features and updates.</span>
                </div>
                <Switch checked={marketingNotifs} onCheckedChange={setMarketingNotifs} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors",
                    theme === 'light' ? "border-primary bg-muted" : "border-transparent bg-muted/50 text-muted-foreground hover:border-border"
                  )}
                >
                  <Sun className={cn("h-8 w-8 mb-2", theme === 'light' ? "text-foreground" : "")} />
                  <span className="text-sm font-medium">Light</span>
                </div>
                <div 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors",
                    theme === 'dark' ? "border-primary bg-muted" : "border-transparent bg-muted/50 text-muted-foreground hover:border-border"
                  )}
                >
                  <Moon className={cn("h-8 w-8 mb-2", theme === 'dark' ? "text-foreground" : "")} />
                  <span className="text-sm font-medium">Dark</span>
                </div>
                <div 
                  onClick={() => setTheme('system')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors",
                    theme === 'system' ? "border-primary bg-muted" : "border-transparent bg-muted/50 text-muted-foreground hover:border-border"
                  )}
                >
                  <Monitor className={cn("h-8 w-8 mb-2", theme === 'system' ? "text-foreground" : "")} />
                  <span className="text-sm font-medium">System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" /> Password
                    </h4>
                    <p className="text-sm text-muted-foreground">Change your password or reset it if you forgot it.</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" /> Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" /> Active Sessions
                    </h4>
                    <p className="text-sm text-muted-foreground">Manage devices currently logged into your account.</p>
                  </div>
                  <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">Sign out all devices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
