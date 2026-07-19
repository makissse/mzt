import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar user={null} />
        <div className="flex flex-col flex-1 min-w-0">
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
