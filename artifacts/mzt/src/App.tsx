import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Login from '@/pages/login';
import Register from '@/pages/register';
import ReleasesDashboard from '@/pages/releases/index';
import NewRelease from '@/pages/releases/new';
import ReleaseDetail from '@/pages/releases/[id]';
import RecommendationsDashboard from '@/pages/recommendations/index';
import NewRecommendation from '@/pages/recommendations/new';
import RecommendationMusicDetail from '@/pages/recommendations/music/[id]';
import TimelinePage from '@/pages/timeline/index';
import SecretPhotoPage from '@/pages/secret-photo/index';
import BlogPage from '@/pages/blogs/[username]';
import { AppLayout } from '@/components/layout/app-layout';
import { BlogLayout } from '@/components/layout/blog-layout';

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
      <Route path="/recommendations">
        {() => <AppLayout><RecommendationsDashboard /></AppLayout>}
      </Route>
      <Route path="/recommendations/new">
        {() => <AppLayout><NewRecommendation /></AppLayout>}
      </Route>
      <Route path="/recommendations/music/:id">
        {() => <AppLayout><RecommendationMusicDetail /></AppLayout>}
      </Route>
      <Route path="/timeline">
        {() => <AppLayout><TimelinePage /></AppLayout>}
      </Route>
      <Route path="/secret-photo">
        {() => <AppLayout><SecretPhotoPage /></AppLayout>}
      </Route>

      {/* Blog routes — accessible without login, but show user context when logged in */}
      <Route path="/blogs/:username">
        {() => <BlogLayout><BlogPage /></BlogLayout>}
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
        <Sonner theme="dark" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
