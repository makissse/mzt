import { SidebarProvider } from "@/components/ui/sidebar";
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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
