import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb, Ticket, ProjectRequest } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Shield, Bug, Lightbulb, Search, Filter, UserPlus, Mail, Users, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="secondary" className="bg-zinc-100 text-zinc-700">Low</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Medium</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">High</Badge>;
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
    return matchesSearch;
  });

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'reviewing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reviewing</Badge>;
      case 'proposed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Proposed</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading admin portal...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-zinc-900 tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Portal
          </h1>
          <p className="mt-1.5 text-zinc-500">Manage all client requests, projects, and provide feedback.</p>
        </div>

        <Dialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="client-name" 
                    placeholder="e.g. John Smith" 
                    className="pl-10"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="client-email" 
                    type="email"
                    placeholder="client@example.com" 
                    className="pl-10"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-project">Project Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="client-project" 
                    placeholder="e.g. E-commerce Platform" 
                    className="pl-10"
                    value={newClientProject}
                    onChange={(e) => setNewClientProject(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Create Client Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search by title, ID, client, or project..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="projects">Project Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Ticket</th>
                    <th className="px-6 py-4 font-medium">Client / Project</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                        No tickets found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="hover:bg-zinc-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg shrink-0",
                              ticket.type === 'issue' ? "bg-red-50" : "bg-blue-50"
                            )}>
                              {ticket.type === 'issue' ? (
                                <Bug className="h-4 w-4 text-red-600" />
                              ) : (
                                <Lightbulb className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-zinc-900 group-hover:text-primary transition-colors">{ticket.title}</div>
                              <div className="text-xs text-zinc-500 mt-0.5">ID: {ticket.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{ticket.authorName}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{ticket.projectTitle || 'No Project'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="px-6 py-4">
                          {getPriorityBadge(ticket.priority)}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                          {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-primary transition-colors" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Project Request</th>
                    <th className="px-6 py-4 font-medium">Client</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No project requests found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr 
                        key={project.id} 
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="hover:bg-zinc-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg shrink-0 bg-purple-50">
                              <Briefcase className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-zinc-900 group-hover:text-primary transition-colors">{project.title}</div>
                              <div className="text-xs text-zinc-500 mt-0.5">ID: {project.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{project.clientName}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getProjectStatusBadge(project.status)}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                          {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-primary transition-colors" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
