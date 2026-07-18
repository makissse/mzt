import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { useGetMe } from "@workspace/api-client-react";
import { Redirect } from "wouter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse w-8 h-8 rounded-full bg-primary/50"></div>
    </div>;
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          {/* Mobile top bar — only visible on small screens */}
          <header className="flex md:hidden items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
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
