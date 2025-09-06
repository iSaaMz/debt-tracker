const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
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