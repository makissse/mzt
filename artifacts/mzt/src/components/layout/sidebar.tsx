import React, { useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useGetMe, useLogout, getGetMeQueryKey, clearAuthToken, useGetSecretPhoto } from '@workspace/api-client-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Disc3, Sparkles, LogOut, User, Clock3, Image } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function MztLogo() {
  return (
    <img src="/logo.png" alt="МЗТ" className="h-14 w-auto select-none" draggable={false} />
  );
}

const navItems = [
  {
    label: 'Мясо 30',
    path: '/releases',
    icon: Disc3,
    description: 'Оценки релизов',
  },
  {
    label: 'Рекомендации',
    path: '/recommendations',
    icon: Sparkles,
    description: 'Музыка и кино',
  },
  {
    label: 'Таймлайн',
    path: '/timeline',
    icon: Clock3,
    description: 'История чата',
  },
];

function SecretNavItem() {
  const [, setLocation] = useLocation();
  const { data: secretData } = useGetSecretPhoto();
  const btnRef = useRef<HTMLButtonElement>(null);
  const unlocked = !!secretData?.unlocked;

  const vanish = useCallback(() => {
    if (!btnRef.current) return;
    btnRef.current.style.opacity = '0';
    btnRef.current.style.pointerEvents = 'none';
    btnRef.current.style.transform = 'translateX(-12px)';
  }, []);

  const restore = useCallback(() => {
    if (!btnRef.current) return;
    btnRef.current.style.opacity = '1';
    btnRef.current.style.pointerEvents = 'auto';
    btnRef.current.style.transform = 'translateX(0)';
  }, []);

  if (unlocked) {
    return (
      <SidebarMenuItem>
        <button
          onClick={() => setLocation('/secret-photo')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-muted-foreground hover:bg-card hover:border-border hover:text-foreground border border-transparent transition-all duration-150"
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 bg-card text-muted-foreground">
            <Image className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-sm font-semibold leading-tight truncate">
              Секретное фото
            </span>
          </div>
        </button>
      </SidebarMenuItem>
    );
  }

  return (
    <div onMouseLeave={restore}>
      <SidebarMenuItem>
        <button
          ref={btnRef}
          onMouseEnter={vanish}
          onMouseMove={vanish}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-muted-foreground transition-all duration-75"
          style={{ opacity: 1, pointerEvents: 'auto', transform: 'translateX(0)' }}
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 bg-card text-muted-foreground">
            <Image className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-sm font-semibold leading-tight truncate">
              Секретное фото
            </span>
          </div>
        </button>
      </SidebarMenuItem>
    </div>
  );
}

export function AppSidebar() {
  const [, setLocation] = useLocation();
  const [pathname] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearAuthToken();
        queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/');
      }
    });
  };

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-20 flex items-center px-4 border-b border-border">
        <div
          className="cursor-pointer select-none"
          onClick={() => setLocation('/releases')}
        >
          <MztLogo />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {navItems.map(({ label, path, icon: Icon, description }) => {
              const active = pathname.startsWith(path);
              return (
                <SidebarMenuItem key={path}>
                  <button
                    onClick={() => setLocation(path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left group
                      ${active
                        ? 'bg-primary/10 border border-primary/20 text-primary'
                        : 'border border-transparent text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 transition-colors
                      ${active ? 'bg-primary/15 text-primary' : 'bg-card text-muted-foreground group-hover:text-foreground group-hover:bg-card/80'}
                    `}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-sm font-semibold leading-tight truncate">
                        {label}
                      </span>
                    </div>
                    {active && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                </SidebarMenuItem>
              );
            })}
            <SecretNavItem />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {user && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs font-mono text-muted-foreground truncate">
                {user.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
