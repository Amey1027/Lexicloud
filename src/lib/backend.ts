// Application-level calls to our own server. Replaces:
//   supabase.from('templates')...
//   supabase.from('document_history')...
//   supabase.functions.invoke('generate-document' | 'compliance-check' | 'suggest-clauses' | 'send-document-email')

import { apiRequest } from "./api";

export interface Template {
  id: string;
  name: string;
  category: string;
  document_type: string;
  description: string;
  content: string;
}

export interface HistoryItem {
  id: string;
  document_type: string;
  content: string;
  created_at: string;
  metadata?: any;
}

export function fetchTemplates() {
  return apiRequest<{ data: Template[] }>("/api/templates");
}

export function fetchHistory() {
  return apiRequest<{ data: HistoryItem[] }>("/api/history");
}

export function addHistory(document_type: string, content: string, metadata?: any) {
  return apiRequest<{ data: HistoryItem }>("/api/history", {
    method: "POST",
    body: JSON.stringify({ document_type, content, metadata }),
  });
}

export function deleteHistory(id: string) {
  return apiRequest<{ success: true }>(`/api/history/${id}`, { method: "DELETE" });
}

export function generateDocument(input: {
  documentType: string;
  parties: string;
  purpose: string;
  additionalDetails?: string;
}) {
  return apiRequest<{ document: string }>("/api/generate-document", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function checkCompliance(input: { document: string; documentType?: string }) {
  return apiRequest<{ analysis: string }>("/api/compliance-check", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function suggestClauses(input: { documentType: string; context?: string }) {
  return apiRequest<{ suggestions: string }>("/api/suggest-clauses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function sendDocumentEmail(input: {
  to: string;
  subject: string;
  documentType: string;
  content: string;
}) {
  return apiRequest("/api/send-document-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
