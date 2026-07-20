import React from 'react';
import { useGetMe } from '@workspace/api-client-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { useIsPysyTheme } from '@/lib/use-pysy-theme';

/**
 * Layout for blog pages — shows the sidebar with user context (if logged in)
 * but does NOT redirect unauthenticated visitors.
 */
export function BlogLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useGetMe();
  const isPysyTheme = useIsPysyTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar user={user ?? null} />
        <div className="flex flex-col flex-1 min-w-0">
          <header className={`flex md:hidden items-center gap-3 px-4 h-14 sticky top-0 z-50 ${isPysyTheme ? 'win95-panel' : 'bg-background border-b border-border'}`}>
            <SidebarTrigger className={isPysyTheme ? 'win95-button' : 'text-muted-foreground hover:text-foreground'} />
            <img src="/logo.png" alt="МЗТ" className="h-8 w-auto select-none" draggable={false} />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
