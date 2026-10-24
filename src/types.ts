export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
  commentsCount?: number;
  comments?: TicketComment[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string | null;
  category?: string;
}

export interface AddCommentRequest {
  content: string;
  isInternal?: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  status: 'PENDING' | 'INDEXED' | 'FAILED';
  chunkCount: number;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
}

export interface RagCitation {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  snippet: string;
  relevanceScore: number;
}

export interface AiChatResponse {
  answer: string;
  citations: RagCitation[];
  confidence: number;
  isFallback: boolean;
  modelUsed: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: RagCitation[];
  confidence?: number;
  isFallback?: boolean;
  modelUsed?: string;
}

export interface AnalyticsSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgResolutionTimeHours: number;
  urgentTickets: number;
  statusBreakdown: Record<TicketStatus, number>;
  priorityBreakdown: Record<TicketPriority, number>;
  ticketsByDay: { date: string; count: number }[];
  csatScore: number;
  aiDeflectionRate: number;
}

export interface SystemHealth {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  database: 'CONNECTED' | 'DISCONNECTED';
  vectorStore: 'AVAILABLE' | 'FALLBACK';
  aiProvider: 'CONFIGURED' | 'UNCONFIGURED';
  aiProviderName: string;
  version: string;
  uptimeSeconds: number;
}
