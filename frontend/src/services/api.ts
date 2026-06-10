// En producción (Nginx), las llamadas van al mismo dominio bajo /api
// En desarrollo local, Vite hace proxy de /api -> localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper to generate UUID v4 for the Correlation ID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('bank_token');
  const correlationId = generateUUID();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-correlation-id': correlationId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint.replace(/^\//, '')}`, config);
    
    // Check if the response contains content
    const contentType = response.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMsg = data?.message || `Error del servidor (${response.status})`;
      const error = new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
      (error as any).status = response.status;
      throw error;
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const ApiService = {
  // Authentication & Profile
  auth: {
    login: async (email: string, password: string) => {
      return request<{ access_token: string }>('auth/login', {
        method: 'POST',
        body: { email, password },
      });
    },
    register: async (email: string, password: string) => {
      return request<any>('users/register', {
        method: 'POST',
        body: { email, password },
      });
    },
    getProfile: async () => {
      return request<any>('users/profile', {
        method: 'GET',
      });
    },
  },

  // Accounts
  accounts: {
    getMyAccounts: async () => {
      return request<any[]>('accounts/my-accounts', {
        method: 'GET',
      });
    },
    createAccount: async (accountNumber: string) => {
      return request<any>('accounts', {
        method: 'POST',
        body: { accountNumber },
      });
    },
    searchAccount: async (accountNumber: string) => {
      return request<any>(`accounts/search/${accountNumber}`, {
        method: 'GET',
      });
    },
  },

  // Transactions
  transactions: {
    deposit: async (accountId: string, amount: string) => {
      return request<any>('transactions/deposit', {
        method: 'POST',
        body: { accountId, amount },
      });
    },
    withdraw: async (accountId: string, amount: string) => {
      return request<any>('transactions/withdraw', {
        method: 'POST',
        body: { accountId, amount },
      });
    },
    transfer: async (fromAccountId: string, toAccountId: string, amount: string) => {
      return request<any>('transactions/transfer', {
        method: 'POST',
        body: { fromAccountId, toAccountId, amount },
      });
    },
    getHistory: async (accountId: string) => {
      return request<any[]>(`transactions/history/${accountId}`, {
        method: 'GET',
      });
    },
  },

  // Audit Logs (requires admin role)
  audit: {
    getLogs: async () => {
      return request<any[]>('audit/logs', {
        method: 'GET',
      });
    },
  },
};
