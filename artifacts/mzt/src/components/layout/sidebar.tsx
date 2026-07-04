import React, { useRef } from 'react';
import { useLocation } from 'wouter';
import { useGetMe, useLogout, getGetMeQueryKey } from '@workspace/api-client-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';
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
        <span
          className="font-black italic text-white leading-none select-none cursor-pointer"
          style={{ fontSize: '1.6rem', letterSpacing: '-0.04em', fontStyle: 'italic' }}
          onClick={() => setLocation('/releases')}
        >
          mzt
        </span>
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
                Мясо 30
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
              Выйти
            </SidebarMenuButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
