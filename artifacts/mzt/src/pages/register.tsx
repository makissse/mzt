import React from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, getGetMeQueryKey, useGetMe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, "Минимум 3 символа").max(32),
  password: z.string().min(6, "Минимум 6 символов"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const register = useRegister();
  
  const { data: user, isLoading: isAuthLoading } = useGetMe();

  React.useEffect(() => {
    if (user && !isAuthLoading) {
      setLocation('/releases');
    }
  }, [user, isAuthLoading, setLocation]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [apiError, setApiError] = React.useState<string | null>(null);

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    setApiError(null);
    register.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/releases');
      },
      onError: (err) => {
        const message = (err as any)?.data?.error ?? (err as Error)?.message ?? 'Не удалось зарегистрироваться';
        setApiError(message);
      }
    });
  };

  if (isAuthLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-12">
        <div className="flex flex-col items-center justify-center space-y-2">
          <span
            className="font-black italic text-white leading-none select-none"
            style={{ fontSize: '2.8rem', letterSpacing: '-0.04em', fontStyle: 'italic' }}
          >
            mzt
          </span>
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center font-mono text-sm text-muted-foreground uppercase tracking-widest">
            Регистрация
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Придумайте никнейм" 
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
                        placeholder="Придумайте пароль" 
                        className="bg-card border-card-border h-12 text-center font-mono text-lg placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all" 
                        autoComplete="new-password"
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
                disabled={register.isPending}
              >
                {register.isPending ? "Регистрация..." : "Зарегистрироваться"}
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
            <Link href="/" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
