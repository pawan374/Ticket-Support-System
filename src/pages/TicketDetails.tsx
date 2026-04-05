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
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>;
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
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Medium</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">High</Badge>;
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
        className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Dashboard
      </button>

      <Card className="mb-8 border-border shadow-sm overflow-hidden">
        <div className="bg-muted/50 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              ticket.type === 'issue' ? "bg-destructive/10 border border-destructive/20" : "bg-primary/10 border border-primary/20"
            )}>
              {ticket.type === 'issue' ? (
                <Bug className="h-5 w-5 text-destructive" />
              ) : (
                <Lightbulb className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-foreground tracking-tight">
                {ticket.title}
              </h1>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Submitted on {ticket.createdAt ? format(new Date(ticket.createdAt), 'PPP') : 'Recently'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
            {ticket.status !== 'closed' ? (
              <Button variant="outline" size="sm" onClick={handleCloseTicket} className="ml-2 border-border hover:bg-muted">
                Close Ticket
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleReopenTicket} className="ml-2 border-border hover:bg-muted">
                Reopen Ticket
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleDeleteTicket} className="ml-2">
              Delete
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <dl className="divide-y divide-border">
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd 
                className="text-sm text-foreground md:col-span-2 leading-relaxed prose prose-sm max-w-none quill-content"
                dangerouslySetInnerHTML={{ __html: ticket.description }}
              />
            </div>
            
            {ticket.type === 'issue' && (
              <>
                {ticket.stepsToReproduce && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30">
                    <dt className="text-sm font-medium text-muted-foreground">Steps to Reproduce</dt>
                    <dd className="text-sm text-foreground md:col-span-2 whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-md border border-border/50">
                      {ticket.stepsToReproduce}
                    </dd>
                  </div>
                )}
                {ticket.expectedBehavior && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Expected Behavior</dt>
                    <dd className="text-sm text-foreground md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.expectedBehavior}
                    </dd>
                  </div>
                )}
                {ticket.actualBehavior && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30">
                    <dt className="text-sm font-medium text-muted-foreground">Actual Behavior</dt>
                    <dd className="text-sm text-foreground md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.actualBehavior}
                    </dd>
                  </div>
                )}
                {ticket.environment && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Environment</dt>
                    <dd className="text-sm text-foreground md:col-span-2">
                      {ticket.environment}
                    </dd>
                  </div>
                )}
              </>
            )}

            {ticket.type === 'enhancement' && (
              <>
                {ticket.useCase && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30">
                    <dt className="text-sm font-medium text-muted-foreground">Use Case</dt>
                    <dd className="text-sm text-foreground md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.useCase}
                    </dd>
                  </div>
                )}
                {ticket.proposedSolution && (
                  <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Proposed Solution</dt>
                    <dd className="text-sm text-foreground md:col-span-2 whitespace-pre-wrap leading-relaxed">
                      {ticket.proposedSolution}
                    </dd>
                  </div>
                )}
              </>
            )}

            {/* Media Attachments */}
            {(ticket.images && ticket.images.length > 0) || (ticket.videoLinks && ticket.videoLinks.length > 0) ? (
              <div className="px-6 py-5 border-t border-border space-y-6">
                {ticket.images && ticket.images.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      Images
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {ticket.images.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-muted hover:border-primary transition-colors"
                        >
                          <img src={url} alt={`Attachment ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-primary-foreground" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.videoLinks && ticket.videoLinks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      Video Links
                    </h3>
                    <div className="space-y-2">
                      {ticket.videoLinks.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:bg-secondary hover:border-primary transition-all group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <Video className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            <span className="text-sm text-muted-foreground truncate group-hover:text-primary">{url}</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
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
        <Card className="mb-8 border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
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
              <div className="text-center py-6 text-muted-foreground text-sm">
                No documents or agreements have been attached yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ticket.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-start p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-colors cursor-pointer group">
                    <div className={cn(
                      "p-2 rounded-md mr-3 shrink-0",
                      attachment.type === 'agreement' ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                    )}>
                      {attachment.type === 'agreement' ? <FileSignature className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border pb-4">
          <CardTitle className="text-lg">Communication History</CardTitle>
          <CardDescription>Updates and discussions regarding this ticket.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-8">
            {!ticket.comments || ticket.comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No comments yet. Be the first to reply!</p>
              </div>
            ) : (
              ticket.comments.map((comment, index) => (
                <div key={comment.id} className="relative">
                  {index !== ticket.comments.length - 1 && (
                    <div className="absolute top-10 left-5 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                  )}
                  <div className="relative flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <UserIcon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {comment.authorName}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {comment.createdAt ? format(new Date(comment.createdAt), 'PPp') : 'Just now'}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-foreground whitespace-pre-wrap bg-muted rounded-lg p-3 border border-border">
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
          <CardFooter className="bg-muted/50 px-6 py-5 border-t border-border">
            <div className="flex space-x-4 w-full">
              <Avatar className="h-10 w-10 border border-border shadow-sm hidden sm:block">
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
                    className="resize-none bg-background border-border focus-visible:ring-primary"
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
