export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'agreement';
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'issue' | 'enhancement';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  authorName: string;
  projectTitle?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  attachments?: Attachment[];
  images?: string[];
  videoLinks?: string[];
  
  // Issue specific
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: string;

  // Enhancement specific
  businessValue?: string;
  targetAudience?: string;
}

export interface ProjectRequest {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  requirements: string;
  budget?: string;
  targetDeadline?: string;
  status: 'pending' | 'reviewing' | 'proposed' | 'accepted' | 'rejected';
  proposal?: {
    timeline: string;
    pricing: string;
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'devsupport_tickets';
const PROJECTS_STORAGE_KEY = 'devsupport_projects';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDb = {
  async getTickets(userId: string): Promise<Ticket[]> {
    await delay(500);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTickets: Ticket[] = data ? JSON.parse(data) : [];
    return allTickets.filter(t => t.userId === userId);
  },

  async getAllTickets(): Promise<Ticket[]> {
    await delay(500);
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  async getTicket(id: string): Promise<Ticket | null> {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTickets: Ticket[] = data ? JSON.parse(data) : [];
    return allTickets.find(t => t.id === id) || null;
  },

  async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Ticket> {
    await delay(500);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTickets: Ticket[] = data ? JSON.parse(data) : [];
    const newTicket: Ticket = {
      ...ticket,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [],
      images: ticket.images || [],
      videoLinks: ticket.videoLinks || []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newTicket, ...allTickets]));
    return newTicket;
  },

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<void> {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTickets: Ticket[] = data ? JSON.parse(data) : [];
    const index = allTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      allTickets[index] = { ...allTickets[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTickets));
    }
  },

  async addComment(ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<void> {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTickets: Ticket[] = data ? JSON.parse(data) : [];
    const index = allTickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      const newComment: Comment = {
        ...comment,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      allTickets[index].comments = [...(allTickets[index].comments || []), newComment];
      allTickets[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTickets));
    }
  },

  async addAttachment(ticketId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>): Promise<void> {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTickets: Ticket[] = data ? JSON.parse(data) : [];
    const index = allTickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      const newAttachment: Attachment = {
        ...attachment,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      allTickets[index].attachments = [...(allTickets[index].attachments || []), newAttachment];
      allTickets[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTickets));
    }
  },

  async getProjectRequests(userId?: string): Promise<ProjectRequest[]> {
    await delay(500);
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const allProjects: ProjectRequest[] = data ? JSON.parse(data) : [];
    if (userId) {
      return allProjects.filter(p => p.clientId === userId);
    }
    return allProjects;
  },

  async getProjectRequest(id: string): Promise<ProjectRequest | null> {
    await delay(300);
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const allProjects: ProjectRequest[] = data ? JSON.parse(data) : [];
    return allProjects.find(p => p.id === id) || null;
  },

  async createProjectRequest(project: Omit<ProjectRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ProjectRequest> {
    await delay(500);
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const allProjects: ProjectRequest[] = data ? JSON.parse(data) : [];
    const newProject: ProjectRequest = {
      ...project,
      id: Math.random().toString(36).substring(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([newProject, ...allProjects]));
    return newProject;
  },

  async updateProjectRequest(id: string, updates: Partial<ProjectRequest>): Promise<void> {
    await delay(300);
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const allProjects: ProjectRequest[] = data ? JSON.parse(data) : [];
    const index = allProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      allProjects[index] = { ...allProjects[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(allProjects));
    }
  }
};
