// Support & Feedback API
import { apiGet, apiPost, ApiResponse, PaginatedResponse } from './config';

// Types
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: 'general' | 'technical' | 'billing' | 'results' | 'centers' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  assignedAdminId?: string;
  assignedAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'admin' | 'system';
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  message: string;
  attachmentUrls?: string[];
  createdAt: string;
}

export interface TicketWithMessages extends SupportTicket {
  messages: SupportMessage[];
}

export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'compliment' | 'other';
  message: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'implemented' | 'declined';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  category: 'general' | 'technical' | 'billing' | 'results' | 'centers' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ReplyTicketRequest {
  message: string;
}

export interface CreateFeedbackRequest {
  type: 'bug' | 'feature' | 'improvement' | 'compliment' | 'other';
  message: string;
  rating?: number;
}

// API Functions
export async function getMyTickets(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<SupportTicket>>> {
  return apiGet('/api/support/tickets', { page, size });
}

export async function getTicketWithMessages(id: string): Promise<ApiResponse<TicketWithMessages>> {
  return apiGet<TicketWithMessages>(`/api/support/tickets/${id}`);
}

export async function createTicket(data: CreateTicketRequest): Promise<ApiResponse<SupportTicket>> {
  return apiPost<SupportTicket>('/api/support/tickets', data);
}

export async function replyToTicket(ticketId: string, data: ReplyTicketRequest): Promise<ApiResponse<SupportMessage>> {
  return apiPost<SupportMessage>(`/api/support/tickets/${ticketId}/reply`, data);
}

export async function getMyFeedback(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<Feedback>>> {
  return apiGet('/api/support/feedback', { page, size });
}

export async function createFeedback(data: CreateFeedbackRequest): Promise<ApiResponse<Feedback>> {
  return apiPost<Feedback>('/api/support/feedback', data);
}
