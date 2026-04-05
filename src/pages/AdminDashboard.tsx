import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockDb, Ticket, ProjectRequest } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Shield, Bug, Lightbulb, Search, Filter, UserPlus, Mail, Users, Briefcase, ChevronRight, Ticket as TicketIcon, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";

export default function AdminDashboard() {
  const { user, adminCreateClient } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Client creation state
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientProject, setNewClientProject] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchAllData = async () => {
      try {
        const [ticketsData, projectsData] = await Promise.all([
          mockDb.getAllTickets(),
          mockDb.getProjectRequests()
        ]);
        setTickets(ticketsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching all data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, navigate]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminCreateClient(newClientEmail, newClientName, newClientProject);
    setIsCreateClientOpen(false);
    setNewClientEmail('');
    setNewClientName('');
    setNewClientProject('');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ticket.projectTitle && ticket.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesTab = !tab || (tab === 'issues' && ticket.type === 'issue') || (tab === 'enhancements' && ticket.type === 'enhancement');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Low</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Medium</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-warning/20 text-warning">High</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'reviewing':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Reviewing</Badge>;
      case 'proposed':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Proposed</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = [
    { 
      label: 'Total Tickets', 
      value: tickets.length, 
      icon: TicketIcon, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      description: 'Open & in-progress'
    },
    { 
      label: 'Project Requests', 
      value: projects.filter(p => p.status === 'pending' || p.status === 'reviewing').length, 
      icon: Briefcase, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      description: 'Awaiting review'
    },
    { 
      label: 'Resolved', 
      value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, 
      icon: CheckCircle2, 
      color: 'text-success', 
      bg: 'bg-success/10',
      description: 'Completed tickets'
    },
    { 
      label: 'Active Clients', 
      value: new Set(tickets.map(t => t.authorEmail)).size, 
      icon: Users, 
      color: 'text-success', 
      bg: 'bg-success/10',
      description: 'Unique users'
    },
    { 
      label: 'Critical Issues', 
      value: tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length, 
      icon: Bug, 
      color: 'text-destructive', 
      bg: 'bg-destructive/10',
      description: 'Needs attention'
    },
    { 
      label: 'Pending Projects', 
      value: projects.filter(p => p.status === 'pending').length, 
      icon: Clock, 
      color: 'text-warning', 
      bg: 'bg-warning/10',
      description: 'Awaiting review'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading admin portal...</p>
      </div>
    );
  }

  const showProjects = tab === 'projects';
  const showTickets = !tab || tab === 'issues' || tab === 'enhancements';

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">
              Admin Access
            </Badge>
          </div>
          <h1 className="text-4xl font-bold font-heading text-foreground tracking-tight flex items-center gap-3">
            {tab === 'issues' ? 'Issues' : tab === 'enhancements' ? 'Enhancements' : tab === 'projects' ? 'Project Requests' : 'Admin Portal'}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl leading-relaxed">
            Manage all client requests, projects, and provide feedback to keep the development process moving forward.
          </p>
        </div>

        <Dialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 h-12 px-6 rounded-xl">
              <UserPlus className="w-5 h-5 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Create Client Login</DialogTitle>
              <DialogDescription>
                Add a new client and link them to a specific project.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Full Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="client-name" 
                    placeholder="e.g. John Smith" 
                    className="pl-10 h-11 rounded-xl"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="client-email" 
                    type="email"
                    placeholder="client@example.com" 
                    className="pl-10 h-11 rounded-xl"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-project">Project Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="client-project" 
                    placeholder="e.g. E-commerce Platform" 
                    className="pl-10 h-11 rounded-xl"
                    value={newClientProject}
                    onChange={(e) => setNewClientProject(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90">Create Client Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden relative group">
            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500", stat.bg)} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-foreground font-heading">{stat.value}</h3>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">{stat.description}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, ID, client, or project..." 
            className="pl-9 h-11 rounded-xl border-border focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-11 rounded-xl border-border">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              {showTickets ? (
                <>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Table */}
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
              <tr>
                {showTickets ? (
                  <>
                    <th className="px-6 py-5 font-bold">Ticket Details</th>
                    <th className="px-6 py-5 font-bold">Client / Project</th>
                    <th className="px-6 py-5 font-bold">Status</th>
                    <th className="px-6 py-5 font-bold">Priority</th>
                    <th className="px-6 py-5 font-bold">Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-5 font-bold">Project Request</th>
                    <th className="px-6 py-5 font-bold">Client Name</th>
                    <th className="px-6 py-5 font-bold">Status</th>
                    <th className="px-6 py-5 font-bold">Date</th>
                  </>
                )}
                <th className="px-6 py-5 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {showTickets ? (
                filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center w-full">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-muted rounded-full">
                          <TicketIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No tickets found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className="hover:bg-muted/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors",
                            ticket.type === 'issue' ? "bg-destructive/10 text-destructive group-hover:bg-destructive/20" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                          )}>
                            {ticket.type === 'issue' ? (
                              <Bug className="h-5 w-5" />
                            ) : (
                              <Lightbulb className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors font-heading text-base">{ticket.title}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: {ticket.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground">{ticket.authorName}</div>
                        <div className="text-xs text-muted-foreground mt-1">{ticket.projectTitle || 'No Project'}</div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-5">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-5 text-muted-foreground whitespace-nowrap text-xs font-medium">
                        {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors inline-flex">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center w-full">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-muted rounded-full">
                          <Briefcase className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No project requests found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="hover:bg-muted/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl shrink-0 bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors font-heading text-base">{project.title}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: {project.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground">{project.clientName}</div>
                      </td>
                      <td className="px-6 py-5">
                        {getProjectStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-5 text-muted-foreground whitespace-nowrap text-xs font-medium">
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors inline-flex">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
