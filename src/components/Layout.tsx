import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Bug, Lightbulb, LogOut, LogIn, Menu, X, Ticket, Settings as SettingsIcon, Shield, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from './ui/dropdown-menu';

export default function Layout() {
  const { user, signIn, logOut, isSigningIn } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const clientNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Issue', path: '/submit-issue', icon: Bug },
    { name: 'Request Feature', path: '/submit-enhancement', icon: Lightbulb },
    { name: 'Request Project', path: '/request-project', icon: Briefcase },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: Shield },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : clientNavItems;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="https://awecode.com/images/brand/icon.png" 
              alt="Awecode Icon" 
              className="h-8 w-8"
              referrerPolicy="no-referrer"
            />
            <span className="text-xl font-bold font-heading tracking-tight text-primary">Support</span>
          </Link>
          <button 
            className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-zinc-600 hover:bg-secondary hover:text-primary"
                  )}
                >
                  <Icon className={cn("mr-3 flex-shrink-0 h-4 w-4", isActive ? "text-primary-foreground" : "text-zinc-400")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile Section at Bottom of Sidebar */}
        <div className="p-4 border-t border-zinc-100">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-zinc-100 transition-colors text-left outline-none">
                <Avatar className="h-9 w-9 border border-zinc-200">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-secondary text-primary font-medium">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{user.displayName}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.role === 'admin' ? 'Awecode Admin' : (user.projectTitle || 'Client')}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logOut} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="px-2">
              <p className="text-xs text-zinc-500 mb-3 text-center">Sign in to manage tickets</p>
              <Button 
                onClick={signIn} 
                disabled={isSigningIn}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSigningIn ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Sign In
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img 
            src="https://awecode.com/images/brand/icon.png" 
            alt="Awecode Icon" 
            className="h-8 w-8"
            referrerPolicy="no-referrer"
          />
          <span className="text-lg font-bold font-heading text-primary">Support</span>
        </div>
        <button 
          className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-md"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
