import React from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, getGetMeQueryKey, useGetMe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(32),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
        <div className="flex flex-col items-center justify-center space-y-4">
          <Disc className="h-16 w-16 text-primary" />
          <h1 className="font-mono text-3xl font-bold tracking-tighter text-primary">mzt</h1>
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
                        placeholder="Username" 
                        className="bg-card border-card-border h-12 text-center font-mono text-lg placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all rounded-none" 
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
                        placeholder="Password" 
                        className="bg-card border-card-border h-12 text-center font-mono text-lg placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all rounded-none" 
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
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-lg rounded-none transition-all"
                disabled={login.isPending}
              >
                {login.isPending ? "Authenticating..." : "Enter"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center">
            <Link href="/register" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              Request access (Register)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
