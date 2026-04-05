import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Bug, Lightbulb, LogOut, LogIn, Menu, X, Ticket, Settings as SettingsIcon, Shield, Briefcase, ChevronRight, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from './ui/dropdown-menu';
import { useTheme } from './ThemeProvider';

export default function Layout() {
  const { user, signIn, logOut, isSigningIn } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const clientNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Issue', path: '/submit-issue', icon: Bug },
    { name: 'Request Feature', path: '/submit-enhancement', icon: Lightbulb },
    { name: 'Request Project', path: '/request-project', icon: Briefcase },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const adminNavItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Issues', path: '/admin/issues', icon: Bug },
    { name: 'Enhancements', path: '/admin/enhancements', icon: Lightbulb },
    { name: 'Project Requests', path: '/admin/projects', icon: Briefcase },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : clientNavItems;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={cn(
          "h-16 flex items-center border-b border-border transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="https://awecode.com/images/brand/icon.png" 
              alt="Awecode Icon" 
              className="h-8 w-8 shrink-0"
              referrerPolicy="no-referrer"
            />
            {!isCollapsed && (
              <span className="text-xl font-bold font-heading tracking-tight text-primary animate-in fade-in duration-300">Support</span>
            )}
          </Link>
          {!isCollapsed && (
            <button 
              className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 scrollbar-hide",
          isCollapsed && "items-center"
        )}>
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 animate-in fade-in duration-300">Main Menu</p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-200 group relative",
                    isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className={cn(
                    "flex-shrink-0 transition-colors duration-200",
                    isCollapsed ? "h-6 w-6" : "mr-3 h-4 w-4",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                  )} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground border border-border text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile Section at Bottom of Sidebar */}
        <div className="p-3 border-t border-border space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "flex items-center w-full rounded-xl transition-all duration-200 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed ? "justify-center p-3" : "px-3 py-2.5"
            )}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6" : "mr-3 h-4 w-4")} /> : <Moon className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6" : "mr-3 h-4 w-4")} />}
            {!isCollapsed && <span className="text-sm font-medium">Theme</span>}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "flex items-center w-full gap-3 p-2 rounded-xl hover:bg-muted transition-all text-left outline-none",
                isCollapsed ? "justify-center" : ""
              )}>
                <Avatar className="h-9 w-9 border border-border shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-secondary text-primary font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                    <p className="text-sm font-bold text-foreground truncate">{user.displayName}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      {user.role === 'admin' ? 'Awecode Admin' : (user.projectTitle || 'Client')}
                    </p>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "bottom"} className="w-56">
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
            <div className={isCollapsed ? "flex justify-center" : "px-2"}>
              <Button 
                onClick={signIn} 
                disabled={isSigningIn}
                size={isCollapsed ? "icon" : "default"}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {isSigningIn ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <LogIn className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                )}
                {!isCollapsed && "Sign In"}
              </Button>
            </div>
          )}
        </div>

        {/* Floating Collapse Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 items-center justify-center w-6 h-6 bg-card border border-border rounded-full text-muted-foreground hover:text-primary hover:border-primary shadow-sm transition-all z-50"
        >
          <ChevronRight className={cn("h-3 w-3 transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-40">
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
          className="p-2 text-muted-foreground hover:bg-muted rounded-md"
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
