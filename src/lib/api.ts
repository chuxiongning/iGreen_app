import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Ticket } from './data';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-41554e89`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  return response.json();
}

export const api = {
  getTickets: async (offset = 0, limit = 50): Promise<Ticket[]> => {
    return fetchWithAuth(`/tickets?offset=${offset}&limit=${limit}`);
  },

  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    return fetchWithAuth(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  seedTickets: async () => {
    return fetchWithAuth('/seed', {
      method: 'POST',
    });
  }
};
