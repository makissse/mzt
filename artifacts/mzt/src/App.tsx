import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Login from '@/pages/login';
import Register from '@/pages/register';
import ReleasesDashboard from '@/pages/releases/index';
import NewRelease from '@/pages/releases/new';
import ReleaseDetail from '@/pages/releases/[id]';
import { AppLayout } from '@/components/layout/app-layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/releases">
        {() => <AppLayout><ReleasesDashboard /></AppLayout>}
      </Route>
      <Route path="/releases/new">
        {() => <AppLayout><NewRelease /></AppLayout>}
      </Route>
      <Route path="/releases/:id">
        {() => <AppLayout><ReleaseDetail /></AppLayout>}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
