import { config } from '@/config';

// Helper function to make API requests with authentication
export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${config.apiUrl}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong');

    error.status = res.status;
    error.errors = data.errors || null;

    throw error;
  }

  return data;
}
