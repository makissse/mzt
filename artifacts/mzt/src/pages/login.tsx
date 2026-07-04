import React from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, getGetMeQueryKey, useGetMe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
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
    login.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/releases');
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
