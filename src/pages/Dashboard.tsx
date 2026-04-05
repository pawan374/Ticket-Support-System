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
      'closed': 'bg-zinc-100 text-zinc-800 hover:bg-zinc-100/80 border-transparent',
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
      'low': 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100/80 border-transparent',
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
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-zinc-300 mt-4">
          <div className="mx-auto h-12 w-12 text-zinc-400 flex items-center justify-center bg-zinc-50 rounded-full mb-4">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">No tickets found</h3>
          <p className="mt-1 text-sm text-zinc-500">Try adjusting your filters or search query.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-4">
        {items.map((ticket) => (
          <Link key={ticket.id} to={`/ticket/${ticket.id}`} className="block group">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg mt-0.5",
                      ticket.type === 'issue' ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                    )}>
                      {ticket.type === 'issue' ? <Bug className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 group-hover:text-primary transition-colors line-clamp-1">
                        {ticket.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : 'Just now'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                        <span className="capitalize">{ticket.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-12 sm:pl-0">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
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
    if (loading) {
      return (
        <div className="space-y-4 mt-4">
          {[1, 2].map(i => (
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
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-zinc-300 mt-4">
          <div className="mx-auto h-12 w-12 text-zinc-400 flex items-center justify-center bg-zinc-50 rounded-full mb-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">No project requests found</h3>
          <p className="mt-1 text-sm text-zinc-500">You haven't requested any new projects yet.</p>
          <Button className="mt-4" onClick={() => navigate('/request-project')}>Request a Project</Button>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-4">
        {items.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="block group">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg mt-0.5 bg-purple-50 text-purple-600 border border-purple-100">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 group-hover:text-primary transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {project.createdAt ? format(new Date(project.createdAt), 'MMM d, yyyy') : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-12 sm:pl-0">
                    {getProjectStatusBadge(project.status)}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-zinc-900 tracking-tight">My Dashboard</h1>
          <p className="mt-1.5 text-zinc-500">Track your ticket status and manage your requests.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="border-zinc-200 whitespace-nowrap hover:bg-zinc-50" onClick={() => navigate('/submit-enhancement')}>
            <Lightbulb className="mr-2 h-4 w-4 text-blue-500" />
            Request Feature
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap" onClick={() => navigate('/submit-issue')}>
            <Bug className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Total Tickets</CardDescription>
            <CardTitle className="text-3xl font-heading">{loading ? '-' : tickets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Open Issues</CardDescription>
            <CardTitle className="text-3xl font-heading text-red-600">
              {loading ? '-' : tickets.filter(t => t.type === 'issue' && (t.status === 'open' || t.status === 'in-progress')).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Pending Enhancements</CardDescription>
            <CardTitle className="text-3xl font-heading text-blue-600">
              {loading ? '-' : tickets.filter(t => t.type === 'enhancement' && (t.status === 'open' || t.status === 'in-progress')).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search tickets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="priority">Highest Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="enhancements">Features</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <TicketList items={processedTickets} />
        </TabsContent>
        <TabsContent value="issues">
          <TicketList items={issues} />
        </TabsContent>
        <TabsContent value="enhancements">
          <TicketList items={enhancements} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectList items={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
