import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockDb } from '../lib/mockDb';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Briefcase, Loader2 } from 'lucide-react';
import { RichTextEditor } from '../components/ui/RichTextEditor';

export default function RequestProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    targetDeadline: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await mockDb.createProjectRequest({
        clientId: user.id,
        clientName: user.displayName || user.email,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        budget: formData.budget,
        targetDeadline: formData.targetDeadline
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit project request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleRequirementsChange = (value: string) => {
    setFormData(prev => ({ ...prev, requirements: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-primary" />
          Request New Project
        </h1>
        <p className="text-muted-foreground mt-2">
          Tell us about the new system, app, or website you need. We'll review your requirements and provide a detailed proposal including timeline and pricing.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/50 border-b border-border pb-6">
          <CardTitle className="text-xl">Project Details</CardTitle>
          <CardDescription>Please provide as much detail as possible to help us understand your needs.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">Project Title <span className="text-destructive">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="e.g., E-commerce Website Redesign"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">High-Level Description <span className="text-destructive">*</span></label>
              <RichTextEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Briefly describe what this project is about and its main goals."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium text-foreground">Detailed Requirements <span className="text-destructive">*</span></label>
              <RichTextEditor
                value={formData.requirements}
                onChange={handleRequirementsChange}
                placeholder="List the specific features, functionalities, and any technical requirements."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-medium text-foreground">Estimated Budget Range</label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="e.g., $5k - $10k"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="targetDeadline" className="text-sm font-medium text-foreground">Target Deadline</label>
                <input
                  type="text"
                  id="targetDeadline"
                  name="targetDeadline"
                  value={formData.targetDeadline}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="e.g., Q3 2026 or Specific Date"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
