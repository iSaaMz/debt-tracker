import { useState } from 'react';
import { useAuth } from './hooks/useAuth.jsx';
import { useTransactions } from './hooks/useTransactions';
import { AuthForm } from './components/AuthForm';
import { AddTransactionForm } from './components/AddTransactionForm';
import { DebtSummary } from './components/DebtSummary';
import { TransactionHistory } from './components/TransactionHistory';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { AlertCircle, RefreshCw, PiggyBank, LogOut } from 'lucide-react';

function App() {
  const { user, loading: authLoading, login, logout, isAuthenticated } = useAuth();
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

  // Show auth form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onLogin={login} />;
  }

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
      <header className="bg-card border-b border-border transition-colors duration-300 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                  Debt Tracker
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                  Connecté en tant que <span className="font-medium">{user?.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <ThemeSwitcher />
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
                size="sm"
              >
                <span className="hidden sm:inline">
                  {showAddForm ? 'Masquer le formulaire' : 'Nouvelle dépense'}
                </span>
                <span className="sm:hidden">
                  {showAddForm ? 'Masquer' : 'Nouveau'}
                </span>
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
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