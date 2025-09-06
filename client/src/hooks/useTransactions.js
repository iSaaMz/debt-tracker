import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState({ nanouOwesAmina: 0, aminaOwesNanou: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données initiales
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [transactionsResponse, debtsResponse] = await Promise.all([
        apiClient.getTransactions(),
        apiClient.getDebts()
      ]);
      
      setTransactions(transactionsResponse.data || []);
      setDebts(debtsResponse.data || { nanouOwesAmina: 0, aminaOwesNanou: 0 });
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une nouvelle transaction
  const addTransaction = async (transactionData) => {
    try {
      setError(null);
      const response = await apiClient.createTransaction(transactionData);
      
      // Recharger les données après ajout
      await fetchData();
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Marquer une transaction comme payée
  const markAsPaid = async (id) => {
    try {
      setError(null);
      const response = await apiClient.markTransactionAsPaid(id);
      
      // Recharger les données après modification
      await fetchData();
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Supprimer une transaction
  const deleteTransaction = async (id) => {
    try {
      setError(null);
      await apiClient.deleteTransaction(id);
      
      // Recharger les données après suppression
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    transactions,
    debts,
    loading,
    error,
    addTransaction,
    markAsPaid,
    deleteTransaction,
    refetch: fetchData
  };
}