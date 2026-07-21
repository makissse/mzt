import React from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, getGetMeQueryKey, useGetMe, storeAuthToken } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  username: z.string().min(3, "Минимум 3 символа").max(32),
  password: z.string().min(6, "Минимум 6 символов"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();
  const [apiError, setApiError] = React.useState<string | null>(null);
  
  const { data: user, isLoading: isAuthLoading } = useGetMe();

  React.useEffect(() => {
    if (user && !isAuthLoading) {
      setLocation('/releases');
    }
  }, [user, isAuthLoading, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    setApiError(null);
    login.mutate({ data }, {
      onSuccess: (userData) => {
        // Store the server-issued token so customFetch can send it as
        // X-Auth-Token on every subsequent request (fallback for browsers
        // that block third-party cookies in the Replit iframe preview).
        const token = (userData as any).authToken;
        if (token) storeAuthToken(token);

        // Seed the cache directly so the user is instantly "logged in"
        // without waiting for a /api/auth/me round-trip.
        queryClient.setQueryData(getGetMeQueryKey(), userData);
        setLocation('/releases');
      },
      onError: (err) => {
        const message = (err as any)?.data?.error ?? (err as Error)?.message ?? 'Не удалось войти';
        setApiError(message);
      },
    });
  };

  if (isAuthLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-12">
        <div className="flex flex-col items-center justify-center">
          <img src="/logo.png" alt="МЗТ" className="h-40 w-auto select-none" draggable={false} />
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Никнейм" 
                        className="bg-card border-card-border h-12 text-center font-mono text-lg placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all" 
                        autoComplete="username"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-center font-mono text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Пароль" 
                        className="bg-card border-card-border h-12 text-center font-mono text-lg placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all" 
                        autoComplete="current-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-center font-mono text-xs" />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-lg transition-all"
                disabled={login.isPending}
              >
                {login.isPending ? "Вхожу..." : "Войти"}
              </Button>
            </form>
          </Form>

          {apiError && (
            <div className="flex items-center justify-center gap-2 font-mono text-xs text-destructive text-center bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}
          
          <div className="text-center">
            <Link href="/register" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              Нет аккаунта? Регистрация
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
