import {
  AuthResponse,
  User,
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  AddCommentRequest,
  TicketComment,
  KnowledgeDocument,
  DocumentChunk,
  AiChatResponse,
  AnalyticsSummary,
  SystemHealth
} from './types';

// Read API URL from environment variable, fallback to relative /api/v1 (proxied by Vite)
const ENV_URL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = ENV_URL ? (ENV_URL.endsWith('/') ? ENV_URL.slice(0, -1) : ENV_URL) : '/api/v1';

class ApiClient {
  private tokenKey = 'resolveai_token';
  private userKey = 'resolveai_user';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or invalid
        this.logout();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
          // Notify listeners or handle gracefully
        }
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && (errData.message || errData.error)) {
            errorMessage = errData.message || errData.error;
          }
        } catch {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses like 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error: any) {
      // Re-throw genuine errors with context
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Failed to connect to backend at ${API_BASE_URL}. Ensure Spring Boot backend is running on port 8080.`);
      }
      throw error;
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    this.setCurrentUser(data.user);
    return data;
  }

  async register(name: string, email: string, password: string, role: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    this.setToken(data.token);
    this.setCurrentUser(data.user);
    return data;
  }

  async getMe(): Promise<User> {
    const user = await this.request<User>('/auth/me');
    this.setCurrentUser(user);
    return user;
  }

  // --- Tickets Endpoints ---
  async getTickets(params?: { status?: string; priority?: string; search?: string }): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Ticket[]>(`/tickets${qs}`);
  }

  async getTicketById(id: string): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`);
  }

  async createTicket(payload: CreateTicketRequest): Promise<Ticket> {
    return this.request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTicket(id: string, payload: UpdateTicketRequest): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async addTicketComment(ticketId: string, payload: AddCommentRequest): Promise<TicketComment> {
    return this.request<TicketComment>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Knowledge Base Endpoints ---
  async getDocuments(): Promise<KnowledgeDocument[]> {
    return this.request<KnowledgeDocument[]>('/documents');
  }

  async uploadDocument(file: File, title: string): Promise<KnowledgeDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    return this.request<KnowledgeDocument>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getDocumentChunks(id: string): Promise<DocumentChunk[]> {
    return this.request<DocumentChunk[]>(`/documents/${id}/chunks`);
  }

  // --- AI Assistant / RAG Chat Endpoints ---
  async sendChatMessage(message: string): Promise<AiChatResponse> {
    return this.request<AiChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // --- Analytics Endpoints ---
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>('/analytics/summary');
  }

  // --- System Health Endpoints ---
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/health');
  }

  // --- Team Management ---
  async getTeamMembers(): Promise<User[]> {
    return this.request<User[]>('/team');
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    return this.request<User>(`/team/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}

export const api = new ApiClient();
