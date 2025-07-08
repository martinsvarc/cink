'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2, Shield, User, Mail, Lock } from 'lucide-react';

export default function AuthPage() {
  const { login, register, authenticated, usersExist, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (authenticated) {
      router.push('/dashboard');
    }
  }, [authenticated, router]);

  // Set initial tab based on whether users exist
  useEffect(() => {
    if (!loading && !usersExist) {
      setActiveTab('register');
    }
  }, [loading, usersExist]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const result = await login(loginData.username, loginData.password);
      
      if (result.success) {
        setSuccess(result.message || 'Login successful!');
        
        // Immediate redirect with window.location.replace
        window.location.replace('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const result = await register(registerData);
      
      if (result.success) {
        setSuccess(result.message || 'Registration successful!');
        
        // Immediate redirect with window.location.replace
        window.location.replace('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--obsidian))] via-[rgb(var(--charcoal))] to-[rgb(var(--obsidian))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--neon-orchid))] mx-auto mb-4" />
          <p className="text-[rgb(var(--muted-foreground))]">Loading PINK™ Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--obsidian))] via-[rgb(var(--charcoal))] to-[rgb(var(--obsidian))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-[rgb(var(--neon-orchid))] mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--electric-cyan))] bg-clip-text text-transparent">
              PINK™
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))] text-lg">
            Seductive Empire Intelligence Suite
          </p>
          <p className="text-[rgb(var(--muted-foreground))] text-sm mt-2">
            Elite chat monetization command center
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-[rgb(var(--electric-cyan))] bg-[rgb(var(--obsidian))]/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[rgb(var(--electric-cyan))] text-center">
              {!usersExist ? 'Initialize Admin Account' : 'Access Command Center'}
            </CardTitle>
            <CardDescription className="text-center">
              {!usersExist 
                ? 'Create the first administrator account to get started' 
                : 'Sign in to your operator account'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Show error/success messages */}
            {error && (
              <Alert className="mb-4 border-red-500 bg-red-500/10">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-500 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Show tabs if users exist, otherwise just show register form */}
            {usersExist ? (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username" className="text-[rgb(var(--electric-cyan))]">
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                        <Input
                          id="login-username"
                          type="text"
                          value={loginData.username}
                          onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                          className="pl-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                          placeholder="Enter your username"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-[rgb(var(--electric-cyan))]">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="pl-10 pr-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                          placeholder="Enter your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                          ) : (
                            <Eye className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--electric-cyan))] hover:from-[rgb(var(--neon-orchid))]/80 hover:to-[rgb(var(--electric-cyan))]/80 text-white font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-[rgb(var(--electric-cyan))]">
                        Username *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                        <Input
                          id="register-username"
                          type="text"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          className="pl-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                          placeholder="Choose a username"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-[rgb(var(--electric-cyan))]">
                        Full Name
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-[rgb(var(--electric-cyan))]">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                        <Input
                          id="register-email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="pl-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-[rgb(var(--electric-cyan))]">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="pl-10 pr-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                          placeholder="Choose a secure password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                          ) : (
                            <Eye className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--electric-cyan))] hover:from-[rgb(var(--neon-orchid))]/80 hover:to-[rgb(var(--electric-cyan))]/80 text-white font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              // First time setup - only show register form
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-username" className="text-[rgb(var(--electric-cyan))]">
                    Admin Username *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                    <Input
                      id="setup-username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className="pl-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                      placeholder="Choose admin username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-name" className="text-[rgb(var(--electric-cyan))]">
                    Full Name
                  </Label>
                  <Input
                    id="setup-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-email" className="text-[rgb(var(--electric-cyan))]">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                    <Input
                      id="setup-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-password" className="text-[rgb(var(--electric-cyan))]">
                    Admin Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted-foreground))] w-4 h-4" />
                    <Input
                      id="setup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="pl-10 pr-10 bg-[rgb(var(--charcoal))] border-[rgb(var(--electric-cyan))] focus:border-[rgb(var(--neon-orchid))] text-white"
                      placeholder="Choose a secure password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-[rgb(var(--neon-orchid))]/10 border border-[rgb(var(--neon-orchid))]/30 rounded-lg p-3 text-sm">
                  <p className="text-[rgb(var(--neon-orchid))] font-medium mb-1">Admin Account Features:</p>
                  <ul className="text-[rgb(var(--muted-foreground))] space-y-1 text-xs">
                    <li>• Full access to all features and data</li>
                    <li>• Can create and manage other operator accounts</li>
                    <li>• Can submit payments and perform all actions</li>
                    <li>• System administration capabilities</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--electric-cyan))] hover:from-[rgb(var(--neon-orchid))]/80 hover:to-[rgb(var(--electric-cyan))]/80 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    'Initialize Admin Account'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-[rgb(var(--muted-foreground))] text-xs">
          <p>© 2024 PINK™ - Elite Chat Monetization Platform</p>
        </div>
      </div>
    </div>
  );
} 