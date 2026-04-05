import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockDb, ProjectRequest } from '../lib/mockDb';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ArrowLeft, Briefcase, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Proposal Form State
  const [proposalData, setProposalData] = useState({
    timeline: '',
    pricing: '',
    notes: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        const data = await mockDb.getProjectRequest(id);
        setProject(data);
        if (data?.proposal) {
          setProposalData(data.proposal);
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleStatusChange = async (newStatus: ProjectRequest['status']) => {
    if (!project) return;
    setIsSubmitting(true);
    try {
      await mockDb.updateProjectRequest(project.id, { status: newStatus });
      setProject(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsSubmitting(true);
    try {
      await mockDb.updateProjectRequest(project.id, {
        proposal: proposalData,
        status: 'proposed'
      });
      setProject(prev => prev ? { ...prev, proposal: proposalData, status: 'proposed' } : null);
    } catch (error) {
      console.error('Failed to submit proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-zinc-900">Project not found</h2>
        <Button variant="link" onClick={() => navigate(-1)} className="mt-4">Go back</Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
    proposed: 'bg-purple-100 text-purple-800 border-purple-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-heading text-zinc-900">{project.title}</h1>
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", statusColors[project.status])}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
          <p className="text-zinc-500">Requested by {project.clientName} on {new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
        
        {isAdmin && project.status === 'pending' && (
          <Button onClick={() => handleStatusChange('reviewing')} disabled={isSubmitting}>
            Mark as Reviewing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-400" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-900 mb-1">Description</h3>
                <p className="text-zinc-700 whitespace-pre-wrap">{project.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-900 mb-1">Requirements</h3>
                <p className="text-zinc-700 whitespace-pre-wrap">{project.requirements}</p>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Section */}
          {(project.proposal || isAdmin) && (
            <Card className={cn("border-2", project.status === 'proposed' ? 'border-primary/50' : 'border-zinc-200')}>
              <CardHeader className="bg-zinc-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Awecode Proposal
                </CardTitle>
                {project.status === 'proposed' && !isAdmin && (
                  <CardDescription>Please review the proposal and accept or reject it.</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {isAdmin && (project.status === 'pending' || project.status === 'reviewing' || project.status === 'proposed') ? (
                  <form onSubmit={handleProposalSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-900">Estimated Timeline</label>
                      <input
                        type="text"
                        required
                        value={proposalData.timeline}
                        onChange={e => setProposalData({...proposalData, timeline: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        placeholder="e.g., 4-6 weeks"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-900">Pricing / Budget</label>
                      <input
                        type="text"
                        required
                        value={proposalData.pricing}
                        onChange={e => setProposalData({...proposalData, pricing: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        placeholder="e.g., $8,500 total"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-900">Additional Notes / Terms</label>
                      <textarea
                        required
                        rows={4}
                        value={proposalData.notes}
                        onChange={e => setProposalData({...proposalData, notes: e.target.value})}
                        className="flex w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        placeholder="Include any assumptions, phases, or terms here."
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {project.status === 'proposed' ? 'Update Proposal' : 'Submit Proposal to Client'}
                    </Button>
                  </form>
                ) : project.proposal ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mb-1">
                          <Clock className="w-4 h-4" /> Timeline
                        </div>
                        <p className="font-medium text-zinc-900">{project.proposal.timeline}</p>
                      </div>
                      <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mb-1">
                          <DollarSign className="w-4 h-4" /> Pricing
                        </div>
                        <p className="font-medium text-zinc-900">{project.proposal.pricing}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 mb-2">Notes & Terms</h3>
                      <p className="text-zinc-700 whitespace-pre-wrap bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        {project.proposal.notes}
                      </p>
                    </div>

                    {!isAdmin && project.status === 'proposed' && (
                      <div className="flex gap-3 pt-4 border-t border-zinc-100">
                        <Button 
                          onClick={() => handleStatusChange('accepted')} 
                          disabled={isSubmitting}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Accept Proposal
                        </Button>
                        <Button 
                          onClick={() => handleStatusChange('rejected')} 
                          disabled={isSubmitting}
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-zinc-500 italic">Awaiting proposal from Awecode.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Expectations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mb-1">
                  <DollarSign className="w-4 h-4" /> Budget Range
                </div>
                <p className="text-zinc-900">{project.budget || 'Not specified'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mb-1">
                  <Calendar className="w-4 h-4" /> Target Deadline
                </div>
                <p className="text-zinc-900">{project.targetDeadline || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
