import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Euro, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function DebtSummary({ debts, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const { nanouOwesAmina = 0, aminaOwesNanou = 0 } = debts;
  const totalDebt = Math.max(nanouOwesAmina, aminaOwesNanou);
  const isBalanced = nanouOwesAmina === 0 && aminaOwesNanou === 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Résumé des dettes</h2>
        {isBalanced ? (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <DollarSign className="h-4 w-4 mr-1" />
            Comptes équilibrés !
          </Badge>
        ) : (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <Euro className="h-4 w-4 mr-1" />
            Dette totale: {formatAmount(totalDebt)}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dette de Nanou envers Amina */}
        <Card className={nanouOwesAmina > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Nanou doit à Amina</span>
              {nanouOwesAmina > 0 ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <div className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <span className={nanouOwesAmina > 0 ? "text-red-600" : "text-green-600"}>
                {formatAmount(nanouOwesAmina)}
              </span>
            </div>
            {nanouOwesAmina === 0 && (
              <p className="text-sm text-green-600 mt-1">Aucune dette</p>
            )}
          </CardContent>
        </Card>

        {/* Dette d'Amina envers Nanou */}
        <Card className={aminaOwesNanou > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Amina doit à Nanou</span>
              {aminaOwesNanou > 0 ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <div className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <span className={aminaOwesNanou > 0 ? "text-red-600" : "text-green-600"}>
                {formatAmount(aminaOwesNanou)}
              </span>
            </div>
            {aminaOwesNanou === 0 && (
              <p className="text-sm text-green-600 mt-1">Aucune dette</p>
            )}
          </CardContent>
        </Card>
      </div>

      {totalDebt > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium">
                💡 Pour équilibrer les comptes:
              </p>
              <p className="text-lg font-semibold text-blue-700">
                {nanouOwesAmina > aminaOwesNanou 
                  ? `Nanou doit rembourser ${formatAmount(nanouOwesAmina)} à Amina`
                  : `Amina doit rembourser ${formatAmount(aminaOwesNanou)} à Nanou`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}