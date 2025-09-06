import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from './ui/alert-dialog';
import { 
  Check, 
  Clock, 
  Trash2, 
  History, 
  Euro,
  Calendar,
  User
} from 'lucide-react';

export function TransactionHistory({ transactions, loading, onMarkAsPaid, onDeleteTransaction }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleMarkAsPaid = async (id) => {
    try {
      setProcessingId(id);
      await onMarkAsPaid(id);
    } catch (error) {
      console.error('Erreur lors du marquage comme payé:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      try {
        setProcessingId(transactionToDelete.id);
        await onDeleteTransaction(transactionToDelete.id);
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setProcessingId(null);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune transaction pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">
              Ajoutez votre première dépense pour commencer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des transactions
            <Badge variant="secondary" className="ml-auto">
              {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className={`p-4 border rounded-lg ${
                  transaction.status === 'paid' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {transaction.payer}
                      </span>
                      <Euro className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-lg">
                        {formatAmount(transaction.amount)}
                      </span>
                      <Badge 
                        variant={transaction.status === 'paid' ? 'default' : 'outline'}
                        className={
                          transaction.status === 'paid' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'border-orange-200 text-orange-600'
                        }
                      >
                        {transaction.status === 'paid' ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Remboursé
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            En attente
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{transaction.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Créé le {formatDate(transaction.createdAt)}
                      </div>
                      {transaction.status === 'paid' && transaction.paidAt && (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Payé le {formatDate(transaction.paidAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {transaction.status === 'unpaid' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(transaction.id)}
                        disabled={processingId === transaction.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {processingId === transaction.id ? 'En cours...' : 'Marquer comme payé'}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(transaction)}
                      disabled={processingId === transaction.id}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette transaction ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La transaction sera définitivement supprimée.
              {transactionToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p><strong>Payeur:</strong> {transactionToDelete.payer}</p>
                  <p><strong>Montant:</strong> {formatAmount(transactionToDelete.amount)}</p>
                  <p><strong>Description:</strong> {transactionToDelete.description}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}