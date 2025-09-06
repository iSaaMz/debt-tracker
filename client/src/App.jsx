import { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { AddTransactionForm } from './components/AddTransactionForm';
import { DebtSummary } from './components/DebtSummary';
import { TransactionHistory } from './components/TransactionHistory';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { AlertCircle, RefreshCw, PiggyBank } from 'lucide-react';

function App() {
  const {
    transactions,
    debts,
    loading,
    error,
    addTransaction,
    markAsPaid,
    deleteTransaction,
    refetch
  } = useTransactions();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTransaction = async (transactionData) => {
    await addTransaction(transactionData);
    setShowAddForm(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              Erreur de connexion: {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card border-b border-border transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PiggyBank className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Debt Tracker
                </h1>
                <p className="text-muted-foreground">
                  Suivi des dettes entre Amina et Nanou
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {showAddForm ? 'Masquer le formulaire' : 'Nouvelle dépense'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Résumé des dettes */}
          <section>
            <DebtSummary debts={debts} loading={loading} />
          </section>

          <Separator />

          {/* Formulaire d'ajout (conditionnel) */}
          {showAddForm && (
            <section>
              <AddTransactionForm
                onAddTransaction={handleAddTransaction}
                loading={loading}
              />
            </section>
          )}

          {showAddForm && <Separator />}

          {/* Historique des transactions */}
          <section>
            <TransactionHistory
              transactions={transactions}
              loading={loading}
              onMarkAsPaid={markAsPaid}
              onDeleteTransaction={deleteTransaction}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground text-sm">
            <p>Debt Tracker - Application de suivi des dettes</p>
            <p className="mt-1">
              Développé par Sami Assiakh
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;