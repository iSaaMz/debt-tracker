const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('auth_token');
        // Don't reload immediately, let the auth context handle it
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Une erreur est survenue');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Récupérer toutes les transactions
  async getTransactions() {
    return this.request('/transactions');
  }

  // Créer une nouvelle transaction
  async createTransaction(transaction) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Marquer une transaction comme payée
  async markTransactionAsPaid(id) {
    return this.request(`/transactions/${id}/pay`, {
      method: 'PUT',
    });
  }

  // Récupérer les dettes
  async getDebts() {
    return this.request('/transactions/debts');
  }

  // Supprimer une transaction
  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();