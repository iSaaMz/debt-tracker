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
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Historique des transactions</span>
            <span className="xs:hidden">Historique</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 sm:p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
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
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Historique des transactions</span>
            <span className="xs:hidden">Historique</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8">
            <History className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">Aucune transaction pour le moment</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg flex-wrap">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Historique des transactions</span>
            <span className="xs:hidden">Historique</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className={`p-3 sm:p-4 border rounded-lg ${
                  transaction.status === 'paid' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  {/* First row: Payer, Amount, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        {transaction.payer}
                      </span>
                      <Euro className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-semibold text-base sm:text-lg truncate">
                        {formatAmount(transaction.amount)}
                      </span>
                    </div>
                    <Badge 
                      variant={transaction.status === 'paid' ? 'default' : 'outline'}
                      className={`text-xs flex-shrink-0 ${
                        transaction.status === 'paid' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'border-orange-200 text-orange-600'
                      }`}
                    >
                      {transaction.status === 'paid' ? (
                        <>
                          <Check className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          <span className="hidden xs:inline">Remboursé</span>
                          <span className="xs:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          <span className="hidden xs:inline">En attente</span>
                          <span className="xs:hidden">⏳</span>
                        </>
                      )}
                    </Badge>
                  </div>
                    
                  {/* Second row: Description */}
                  <div>
                    <p className="text-gray-700 text-sm sm:text-base line-clamp-2">
                      {transaction.description}
                    </p>
                  </div>
                    
                  {/* Third row: Dates */}
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="hidden sm:inline">Créé le </span>
                      <span className="truncate">{formatDate(transaction.createdAt)}</span>
                    </div>
                    {transaction.status === 'paid' && transaction.paidAt && (
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3 flex-shrink-0" />
                        <span className="hidden sm:inline">Payé le </span>
                        <span className="truncate">{formatDate(transaction.paidAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Fourth row: Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {transaction.status === 'unpaid' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(transaction.id)}
                        disabled={processingId === transaction.id}
                        className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none"
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">
                          {processingId === transaction.id ? 'En cours...' : 'Marquer comme payé'}
                        </span>
                        <span className="sm:hidden">
                          {processingId === transaction.id ? 'En cours...' : 'Payé'}
                        </span>
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(transaction)}
                      disabled={processingId === transaction.id}
                      className="border-red-200 text-red-600 hover:bg-red-50 h-8 sm:h-9 px-2 sm:px-3"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline ml-1">Supprimer</span>
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