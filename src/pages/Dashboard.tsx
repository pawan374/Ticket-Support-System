import React, { useEffect, useState } from 'react';
import { mockDb, Ticket as TicketType, ProjectRequest } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bug, Lightbulb, Clock, CheckCircle2, AlertCircle, PlayCircle, Plus, Ticket, Search, Filter, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [ticketsData, projectsData] = await Promise.all([
          mockDb.getTickets(user.uid),
          mockDb.getProjectRequests(user.uid)
        ]);
        setTickets(ticketsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <PlayCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      case 'closed': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-transparent',
      'in-progress': 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-transparent',
      'resolved': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-transparent',
      'closed': 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent',
    };
    return (
      <Badge variant="outline" className={cn("capitalize gap-1", styles[status] || styles['open'])}>
        {getStatusIcon(status)}
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      'low': 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent',
      'medium': 'bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-transparent',
      'high': 'bg-orange-100 text-orange-800 hover:bg-orange-100/80 border-transparent',
      'critical': 'bg-red-100 text-red-800 hover:bg-red-100/80 border-transparent',
    };
    return (
      <Badge variant="outline" className={cn("capitalize", styles[priority] || styles['low'])}>
        {priority}
      </Badge>
    );
  };

  const getProjectStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-transparent',
      'reviewing': 'bg-blue-100 text-blue-800 border-transparent',
      'proposed': 'bg-purple-100 text-purple-800 border-transparent',
      'accepted': 'bg-green-100 text-green-800 border-transparent',
      'rejected': 'bg-red-100 text-red-800 border-transparent',
    };
    return (
      <Badge variant="outline" className={cn("capitalize", styles[status] || styles['pending'])}>
        {status}
      </Badge>
    );
  };

  const processedTickets = tickets
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') {
        const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      return 0;
    });

  const issues = processedTickets.filter(t => t.type === 'issue');
  const enhancements = processedTickets.filter(t => t.type === 'enhancement');

  const TicketList = ({ items }: { items: any[] }) => {
    if (loading) {
      return (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3 w-full">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border mt-4 w-full">
          <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center bg-muted rounded-full mb-4">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No tickets found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 mt-2">
        {items.map((ticket) => (
          <Link key={ticket.id} to={`/ticket/${ticket.id}`} className="block group">
            <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-none hover:-translate-y-1 border-border bg-card overflow-hidden">
              <div className="p-0 flex flex-col sm:flex-row">
                <div className={cn(
                  "w-1.5 sm:w-2 shrink-0",
                  ticket.type === 'issue' ? "bg-destructive" : "bg-primary"
                )} />
                <div className="p-5 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl mt-0.5 transition-colors",
                        ticket.type === 'issue' 
                          ? "bg-destructive/10 text-destructive group-hover:bg-destructive/20" 
                          : "bg-primary/10 text-primary group-hover:bg-primary/20"
                      )}>
                        {ticket.type === 'issue' ? <Bug className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {ticket.id.slice(0, 8)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {ticket.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 font-heading">
                          {ticket.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : 'Just now'}
                          </span>
                          {ticket.comments && ticket.comments.length > 0 && (
                            <span className="flex items-center gap-1.5">
                              <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
                              {ticket.comments.length} updates
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-14 sm:pl-0">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  const ProjectList = ({ items }: { items: ProjectRequest[] }) => {
    const processedProjects = items.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {[1, 2].map(i => (
            <Card key={i} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3 w-full">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      );
    }

    if (processedProjects.length === 0) {
      return (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border mt-2 w-full">
          <div className="mx-auto h-16 w-16 text-muted-foreground flex items-center justify-center bg-muted rounded-full mb-4">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground font-heading">No projects yet</h3>
          <p className="mt-2 text-muted-foreground max-w-xs mx-auto">Request a new project to start collaborating with our team.</p>
          <Button className="mt-6 bg-primary" onClick={() => navigate('/request-project')}>Request a Project</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
        {processedProjects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-none hover:-translate-y-1 border-border bg-card overflow-hidden flex flex-col">
              <div className="h-2 bg-primary" />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  {getProjectStatusBadge(project.status)}
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 font-heading line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {project.description.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {project.createdAt ? format(new Date(project.createdAt), 'MMM d, yyyy') : 'Just now'}
                  </span>
                  <span className="text-xs font-bold text-primary group-hover:underline">View Details</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">
              Client Portal
            </Badge>
          </div>
          <h1 className="text-4xl font-bold font-heading text-foreground tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Welcome back, <span className="text-primary font-bold">{user.displayName || user.email}</span>. 
            Track your project progress and manage support requests.
          </p>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 p-6 border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Project</p>
            <h3 className="text-2xl font-bold text-foreground font-heading truncate">
              {user?.projectTitle || 'No active project'}
            </h3>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
              <span className="text-xs text-muted-foreground font-medium">Ongoing development</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Open Tickets</p>
            <h3 className="text-3xl font-bold text-foreground font-heading">
              {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length}
            </h3>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              Needs attention
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Projects</p>
            <h3 className="text-3xl font-bold text-foreground font-heading">
              {projects.length}
            </h3>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
              <Briefcase className="w-3 h-3" />
              Total requests
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search requests..." 
                className="pl-9 h-11 rounded-xl border-border focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList className="bg-muted p-1 rounded-xl border border-border w-full lg:w-auto">
                  <TabsTrigger value="all" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest flex-1 lg:flex-none">All</TabsTrigger>
                  <TabsTrigger value="issues" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest flex-1 lg:flex-none">Issues</TabsTrigger>
                  <TabsTrigger value="enhancements" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest flex-1 lg:flex-none">Features</TabsTrigger>
                  <TabsTrigger value="projects" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest flex-1 lg:flex-none">Projects</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[160px] h-11 rounded-xl border-border">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {activeTab === 'projects' ? (
                    <>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="proposed">Proposed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {activeTab === 'all' ? processedTickets.length :
                 activeTab === 'issues' ? issues.length :
                 activeTab === 'enhancements' ? enhancements.length :
                 projects.length} Items Found
              </div>
            </div>
            
            <div className="outline-none w-full">
              <TabsContent value="all" className="m-0 focus-visible:outline-none w-full">
                <TicketList items={processedTickets} />
              </TabsContent>
              <TabsContent value="issues" className="m-0 focus-visible:outline-none w-full">
                <TicketList items={issues} />
              </TabsContent>
              <TabsContent value="enhancements" className="m-0 focus-visible:outline-none w-full">
                <TicketList items={enhancements} />
              </TabsContent>
              <TabsContent value="projects" className="m-0 focus-visible:outline-none w-full">
                <ProjectList items={projects} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Sidebar Actions */}
        <div className="w-full lg:w-80 space-y-6">
          {user.role === 'admin' && (
            <Card className="p-6 border-border bg-card rounded-2xl shadow-sm overflow-hidden relative group">
              <h3 className="text-xl font-bold font-heading mb-6 relative z-10 text-foreground">Quick Actions</h3>
              <div className="space-y-3 relative z-10">
                <Button 
                  onClick={() => navigate('/submit-issue')}
                  variant="outline"
                  className="w-full justify-start h-12 border-border hover:bg-muted rounded-xl text-foreground font-bold transition-all active:scale-95"
                >
                  <Bug className="w-4 h-4 mr-3 text-red-500" />
                  Report an Issue
                </Button>
                <Button 
                  onClick={() => navigate('/submit-enhancement')}
                  variant="outline"
                  className="w-full justify-start h-12 border-border hover:bg-muted rounded-xl text-foreground font-bold transition-all active:scale-95"
                >
                  <Lightbulb className="w-4 h-4 mr-3 text-blue-500" />
                  Request Feature
                </Button>
                <Button 
                  onClick={() => navigate('/request-project')}
                  variant="outline"
                  className="w-full justify-start h-12 border-border hover:bg-muted rounded-xl text-foreground font-bold transition-all active:scale-95"
                >
                  <Briefcase className="w-4 h-4 mr-3 text-purple-500" />
                  New Project
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-6 border-border bg-card rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Need Help?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Our support team is available Monday to Friday, 9 AM - 6 PM NPT for any urgent queries.
            </p>
            <Button variant="outline" className="w-full rounded-xl border-border text-foreground font-bold text-xs h-10 hover:bg-muted">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
