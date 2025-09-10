import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

const registerSchema = z.object({
  name: z.enum(['Amina', 'Nanou'], {
    errorMap: () => ({ message: 'Le nom doit être "Amina" ou "Nanou"' })
  }),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe est trop long')
});

export function AuthForm({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableNames, setAvailableNames] = useState([]);
  const [takenNames, setTakenNames] = useState([]);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  // Fetch available names on component mount
  useEffect(() => {
    const fetchAvailableNames = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/available-names`);
        const data = await response.json();
        
        if (data.success) {
          setAvailableNames(data.availableNames);
          setTakenNames(data.takenNames);
        }
      } catch (err) {
        console.error('Error fetching available names:', err);
      }
    };

    fetchAvailableNames();
  }, []);

  const onLoginSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la connexion');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', result.token);
      
      setSuccess(result.message);
      
      // Call parent callback with user data
      if (onLogin) {
        onLogin(result.user, result.token);
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'inscription');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', result.token);
      
      setSuccess(result.message);
      
      // Call parent callback with user data
      if (onLogin) {
        onLogin(result.user, result.token);
      }

    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setError('');
    setSuccess('');
    resetLogin();
    resetRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/assets/papier.mp4" type="video/mp4" />
      </video>
      
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-10 opacity-30"
        style={{ backgroundImage: 'url(/assets/vie.jpg)' }}
      />
      
      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/40 z-20" />
      
      <Card className="w-full max-w-md relative z-30 bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-gray-900">Debt Tracker</CardTitle>
          <CardDescription className="text-center text-gray-700">
            Suivi des dettes entre Amina et Nanou
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4 border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-600">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    {...registerLogin('email')}
                    className={loginErrors.email ? 'border-destructive' : ''}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      {...registerLogin('password')}
                      className={loginErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              {availableNames.length === 0 && takenNames.length > 0 && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-amber-600">
                    Tous les comptes sont déjà créés. L'inscription est limitée à Amina et Nanou uniquement.
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nom</Label>
                  <select
                    id="register-name"
                    {...registerRegister('name')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {availableNames.length > 0 ? 'Sélectionnez votre nom' : 'Aucun compte disponible'}
                    </option>
                    {availableNames.map(name => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    {takenNames.map(name => (
                      <option key={name} value={name} disabled className="text-muted-foreground">
                        {name} (déjà pris)
                      </option>
                    ))}
                  </select>
                  {registerErrors.name && (
                    <p className="text-sm text-destructive">{registerErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    {...registerRegister('email')}
                    className={registerErrors.email ? 'border-destructive' : ''}
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-destructive">{registerErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Au moins 6 caractères"
                      {...registerRegister('password')}
                      className={registerErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-sm text-destructive">{registerErrors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || availableNames.length === 0}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {availableNames.length === 0 ? 'Inscription indisponible' : 'S\'inscrire'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        {/* Sponsorship Message */}
        <div className="pb-6 px-6">
          <div className="text-center">
            <p className="text-lg font-bold text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text animate-pulse">
              Sponsorisé par Emi ❤️
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}