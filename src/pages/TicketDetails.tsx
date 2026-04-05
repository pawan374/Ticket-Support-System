import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDb, Ticket as TicketType } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Bug, Lightbulb, ArrowLeft, Send, User as UserIcon, Clock, Paperclip, FileText, FileSignature, Plus, Image as ImageIcon, Video, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const fetchTicket = async () => {
      try {
        const data = await mockDb.getTicket(id);
        
        if (data) {
          if (data.userId !== user.uid && user.role !== 'admin') {
            navigate('/dashboard'); // Not authorized
            return;
          }
          setTicket(data);
        } else {
          navigate('/dashboard'); // Not found
        }
      } catch (error) {
        console.error("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, user, navigate]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !id || !ticket) return;

    setSubmittingComment(true);
    try {
      const commentData = {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Unknown User',
      };
      await mockDb.addComment(id, commentData);
      
      // Refresh ticket to get new comment
      const updatedTicket = await mockDb.getTicket(id);
      if (updatedTicket) {
        setTicket(updatedTicket);
      }
      
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCloseTicket = async () => {
    if (!ticket || !id) return;
    
    try {
      await mockDb.updateTicket(id, { status: 'closed' });
      toast.success('Ticket closed successfully');
      setTicket({ ...ticket, status: 'closed' });
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error('Failed to close ticket');
    }
  };

  const handleReopenTicket = async () => {
    if (!ticket || !id) return;
    
    try {
      await mockDb.updateTicket(id, { status: 'open' });
      toast.success('Ticket reopened successfully');
      setTicket({ ...ticket, status: 'open' });
    } catch (error) {
      console.error("Error reopening ticket:", error);
      toast.error('Failed to reopen ticket');
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket || !id) return;
    
    if (window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      try {
        // Mock DB doesn't have delete yet, but we can simulate it by removing from localStorage
        const data = localStorage.getItem('devsupport_tickets');
        if (data) {
          const allTickets = JSON.parse(data);
          const filtered = allTickets.filter((t: any) => t.id !== id);
          localStorage.setItem('devsupport_tickets', JSON.stringify(filtered));
        }
        toast.success('Ticket deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error("Error deleting ticket:", error);
        toast.error('Failed to delete ticket');
      }
    }
  };

  const handleAddAttachment = async (type: 'document' | 'agreement') => {
    if (!id || !ticket) return;
    
    const fileName = window.prompt(`Enter a name for the new ${type}:`);
    if (!fileName) return;

    try {
      await mockDb.addAttachment(id, {
        name: fileName,
        url: '#', // Mock URL
        type
      });
      
      const updatedTicket = await mockDb.getTicket(id);
      if (updatedTicket) {
        setTicket(updatedTicket);
      }
      toast.success(`${type === 'document' ? 'Document' : 'Agreement'} added successfully`);
    } catch (error) {
      console.error("Error adding attachment:", error);
      toast.error('Failed to add attachment');
    }
  };

  if (!ticket) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
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

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Dashboard
      </button>

      <Card className="mb-8 border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              ticket.type === 'issue' ? "bg-red-50 border border-red-100" : "bg-blue-50 border border-blue-100"
            )}>
              {ticket.type === 'issue' ? (
                <Bug className="h-5 w-5 text-red-600" />
              ) : (
                <Lightbulb className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-zinc-900 tracking-tight">
                {ticket.title}
              </h1>
              <div className="flex items-center text-sm text-zinc-500 mt-1">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Submitted on {ticket.createdAt ? format(new Date(ticket.createdAt), 'PPP') : 'Recently'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
            {ticket.status !== 'closed' ? (
              <Button variant="outline" size="sm" onClick={handleCloseTicket} className="ml-2 border-zinc-200 hover:bg-zinc-100">
                Close Ticket
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleReopenTicket} className="ml-2 border-zinc-200 hover:bg-zinc-100">
                Reopen Ticket
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleDeleteTicket} className="ml-2 bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <dl className="divide-y divide-zinc-100">
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-zinc-500">Description</dt>
              <dd className="text-sm text-zinc-900 md:col-span-2 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </dd>
            </div>
            
            {ticket.type === 'issue' && (
              <>
                {ticket.stepsToReproduce && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50/30">
                    <dt className="text-sm font-medium text-zinc-500">Steps to Reproduce</dt>
                    <dd className="text-sm text-zinc-900 md:col-span-2 whitespace-pre-wrap font-mono bg-zinc-100/50 p-3 rounded-md border border-zinc-200/50">
                      {ticket.stepsToReproduce}
                    </dd>
                  </div>
                )}
                {ticket.expectedBehavior && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-zinc-500">Expected Behavior</dt>
                    <dd className="text-sm text-zinc-900 md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.expectedBehavior}
                    </dd>
                  </div>
                )}
                {ticket.actualBehavior && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50/30">
                    <dt className="text-sm font-medium text-zinc-500">Actual Behavior</dt>
                    <dd className="text-sm text-zinc-900 md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.actualBehavior}
                    </dd>
                  </div>
                )}
                {ticket.environment && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-zinc-500">Environment</dt>
                    <dd className="text-sm text-zinc-900 md:col-span-2">
                      {ticket.environment}
                    </dd>
                  </div>
                )}
              </>
            )}

            {ticket.type === 'enhancement' && (
              <>
                {ticket.useCase && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50/30">
                    <dt className="text-sm font-medium text-zinc-500">Use Case</dt>
                    <dd className="text-sm text-zinc-900 md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.useCase}
                    </dd>
                  </div>
                )}
                {ticket.proposedSolution && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-zinc-500">Proposed Solution</dt>
                    <dd className="text-sm text-zinc-900 md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.proposedSolution}
                    </dd>
                  </div>
                )}
              </>
            )}

            {/* Media Attachments */}
            {(ticket.images && ticket.images.length > 0) || (ticket.videoLinks && ticket.videoLinks.length > 0) ? (
              <div className="px-6 py-5 border-t border-zinc-100 space-y-6">
                {ticket.images && ticket.images.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-zinc-400" />
                      Images
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {ticket.images.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="relative group rounded-lg overflow-hidden border border-zinc-200 aspect-video bg-zinc-50 hover:border-primary transition-colors"
                        >
                          <img src={url} alt={`Attachment ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.videoLinks && ticket.videoLinks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                      <Video className="w-4 h-4 text-zinc-400" />
                      Video Links
                    </h3>
                    <div className="space-y-2">
                      {ticket.videoLinks.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-secondary hover:border-primary transition-all group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <Video className="h-4 w-4 text-zinc-400 group-hover:text-primary" />
                            <span className="text-sm text-zinc-600 truncate group-hover:text-primary">{url}</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-zinc-300 group-hover:text-primary" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      {/* Attachments Section */}
      {(ticket.attachments && ticket.attachments.length > 0 || user?.role === 'admin') && (
        <Card className="mb-8 border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-zinc-500" />
                Documents & Agreements
              </CardTitle>
              <CardDescription>Files attached to this request.</CardDescription>
            </div>
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddAttachment('document')}>
                  <Plus className="h-4 w-4 mr-1" /> Document
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddAttachment('agreement')}>
                  <Plus className="h-4 w-4 mr-1" /> Agreement
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {!ticket.attachments || ticket.attachments.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-sm">
                No documents or agreements have been attached yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ticket.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-start p-3 rounded-lg border border-zinc-200 hover:border-primary hover:bg-secondary/50 transition-colors cursor-pointer group">
                    <div className={cn(
                      "p-2 rounded-md mr-3 shrink-0",
                      attachment.type === 'agreement' ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-700"
                    )}>
                      {attachment.type === 'agreement' ? <FileSignature className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-primary transition-colors">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Added {format(new Date(attachment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
          <CardTitle className="text-lg">Communication History</CardTitle>
          <CardDescription>Updates and discussions regarding this ticket.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-8">
            {!ticket.comments || ticket.comments.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p>No comments yet. Be the first to reply!</p>
              </div>
            ) : (
              ticket.comments.map((comment, index) => (
                <div key={comment.id} className="relative">
                  {index !== ticket.comments.length - 1 && (
                    <div className="absolute top-10 left-5 -ml-px h-full w-0.5 bg-zinc-200" aria-hidden="true" />
                  )}
                  <div className="relative flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border border-zinc-200 shadow-sm">
                      <AvatarFallback className="bg-zinc-100 text-zinc-600">
                        <UserIcon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-zinc-900">
                          {comment.authorName}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {comment.createdAt ? format(new Date(comment.createdAt), 'PPp') : 'Just now'}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>

        {ticket.status !== 'closed' && (
          <CardFooter className="bg-zinc-50/80 px-6 py-5 border-t border-zinc-100">
            <div className="flex space-x-4 w-full">
              <Avatar className="h-10 w-10 border border-zinc-200 shadow-sm hidden sm:block">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} referrerPolicy="no-referrer" />
                ) : null}
                <AvatarFallback className="bg-secondary text-primary font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <form onSubmit={handleAddComment}>
                  <Textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    className="resize-none bg-white border-zinc-200 focus-visible:ring-primary"
                    placeholder="Add a comment or provide more info..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <div className="mt-3 flex items-center justify-end">
                    <Button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submittingComment ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
