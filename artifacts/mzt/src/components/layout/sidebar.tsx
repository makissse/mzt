import React, { useRef } from 'react';
import { useLocation } from 'wouter';
import { useGetMe, useLogout, getGetMeQueryKey } from '@workspace/api-client-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Disc, LogOut, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function AppSidebar() {
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const logoutFnRef = useRef(logout.mutate);
  logoutFnRef.current = logout.mutate;

  const handleLogout = () => {
    logoutFnRef.current(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/');
      }
    });
  };

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 font-mono font-bold text-2xl tracking-tighter text-primary">
          <Disc className="h-6 w-6" />
          <span>mzt</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setLocation('/releases')} 
                isActive={location.pathname.startsWith('/releases')}
                className="font-mono text-sm tracking-tight hover:text-primary transition-colors"
              >
                Music Reviews
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {user && (
          <div className="flex flex-col gap-4">
            <div className="text-xs font-mono text-muted-foreground">
              {user.username}
            </div>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors font-mono text-xs w-full flex justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </SidebarMenuButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
