import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb, ProjectRequest } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, AlertCircle, ArrowLeft, Image as ImageIcon, Video, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { RichTextEditor } from '../components/ui/RichTextEditor';

export default function SubmitEnhancement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<ProjectRequest[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    useCase: '',
    proposedSolution: '',
    priority: 'low' as 'low' | 'medium' | 'high' | 'critical',
    projectTitle: user?.projectTitle || '',
  });

  useEffect(() => {
    if (user) {
      mockDb.getProjectRequests(user.uid).then(data => {
        setProjects(data);
        if (data.length > 0 && !formData.projectTitle) {
          setFormData(prev => ({ ...prev, projectTitle: data[0].title }));
        }
      });
    }
  }, [user]);

  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLinks, setVideoLinks] = useState<string[]>([]);

  const addImage = () => {
    if (imageUrl && !images.includes(imageUrl)) {
      setImages([...images, imageUrl]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addVideo = () => {
    if (videoUrl && !videoLinks.includes(videoUrl)) {
      setVideoLinks([...videoLinks, videoUrl]);
      setVideoUrl('');
    }
  };

  const removeVideo = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, priority: value as any });
  };

  const handleProjectChange = (value: string) => {
    setFormData({ ...formData, projectTitle: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await mockDb.createTicket({
        ...formData,
        type: 'enhancement',
        status: 'open',
        userId: user.uid,
        authorName: user.displayName || user.email || 'Unknown User',
        images,
        videoLinks
      });
      toast.success('Enhancement requested successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting enhancement:', err);
      setError('Failed to submit enhancement request. Please try again.');
      toast.error('Failed to submit enhancement request');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Please sign in to request an enhancement.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground flex items-center tracking-tight">
          <div className="bg-primary/10 p-2 rounded-lg mr-3 border border-primary/20">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          Request an Enhancement
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Have an idea to make our product better? Let us know how we can improve.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-muted/50 border-b border-border">
            <CardTitle className="font-heading">Feature Details</CardTitle>
            <CardDescription>Fields marked with an asterisk (*) are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Feature Title <span className="text-destructive">*</span></Label>
              <Input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Add dark mode support"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project <span className="text-destructive">*</span></Label>
                <Select value={formData.projectTitle} onValueChange={handleProjectChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.title}>{project.title}</SelectItem>
                    ))}
                    {projects.length === 0 && user?.projectTitle && (
                      <SelectItem value={user.projectTitle}>{user.projectTitle}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Business Value / Priority</Label>
                <Select value={formData.priority} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nice to have</SelectItem>
                    <SelectItem value="medium">Important for our workflow</SelectItem>
                    <SelectItem value="high">Critical for our business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <RichTextEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Describe the feature you'd like to see..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">Use Case / Problem it solves</Label>
              <Textarea
                id="useCase"
                name="useCase"
                rows={4}
                value={formData.useCase}
                onChange={handleChange}
                placeholder="Why do you need this feature? What problem does it solve for you?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedSolution">Proposed Solution (Optional)</Label>
              <Textarea
                id="proposedSolution"
                name="proposedSolution"
                rows={3}
                value={formData.proposedSolution}
                onChange={handleChange}
                placeholder="How do you envision this working?"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="bg-muted/50 border-b border-border">
            <CardTitle className="font-heading">Media & Links</CardTitle>
            <CardDescription>Attach mockups, screenshots or video links to help us understand the request.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Label>Images (URLs)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Paste image URL here..." 
                    className="pl-10"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={addImage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                      <img src={url} alt={`Attachment ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Video Links</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Paste Loom, YouTube, or Drive link..." 
                    className="pl-10"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={addVideo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {videoLinks.length > 0 && (
                <div className="space-y-2 mt-4">
                  {videoLinks.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-2 truncate">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">{url}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-muted-foreground hover:text-red-600 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border pt-6 bg-muted/50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
