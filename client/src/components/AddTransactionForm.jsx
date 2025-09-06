import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PlusCircle } from 'lucide-react';

export function AddTransactionForm({ onAddTransaction, loading }) {
  const [formData, setFormData] = useState({
    payer: '',
    amount: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.payer || !formData.amount || !formData.description) {
      alert('Tous les champs sont requis');
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert('Le montant doit être un nombre positif');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Réinitialiser le formulaire après succès
      setFormData({
        payer: '',
        amount: '',
        description: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">Ajouter une nouvelle dépense</span>
          <span className="xs:hidden">Nouvelle dépense</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payer" className="text-sm font-medium">Qui a payé ?</Label>
              <Select
                value={formData.payer}
                onValueChange={(value) => handleInputChange('payer', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amina">Amina</SelectItem>
                  <SelectItem value="Nanou">Nanou</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                min="0"
                className="h-11 text-base"
                inputMode="decimal"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la dépense..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="text-base resize-none"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || loading}
            className="w-full h-11 text-base font-medium"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter la dépense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}