import React, { useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useLogout, getGetMeQueryKey, clearAuthToken, useGetSecretPhoto, type User } from '@workspace/api-client-react';
import { useIsPysyTheme } from '@/lib/use-pysy-theme';
import { useIsPutzermannNoirTheme } from '@/lib/use-putzermann-noir-theme';

import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Disc3, Sparkles, LogOut, User as UserIcon, Clock3, Image } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function MztLogo() {
  return (
    <img src="/logo.png" alt="МЗТ" className="h-14 w-auto select-none" draggable={false} />
  );
}

type NavItem = {
  label: string;
  path: string;
  icon?: React.ElementType;
  description: string;
  exact?: boolean;
  accentColor?: string;
};

const navItems: NavItem[] = [
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

const blogItems: NavItem[] = [
  {
    label: 'pysy.exe',
    path: '/blogs/pysy-exe',
    description: 'Блог pysy',
    exact: true,
    accentColor: '#000080',
  },
  {
    label: 'putzermann core',
    path: '/blogs/putzermann-core',
    description: 'Блог host9315',
    exact: true,
    accentColor: '#ff6b00',
  },
];

function NavButton({ item, pathname, onClick, isPysyTheme, isPutzermannNoir }: { item: NavItem; pathname: string; onClick: () => void; isPysyTheme?: boolean; isPutzermannNoir?: boolean }) {
  const active = item.exact ? pathname === item.path : pathname.startsWith(item.path);
  const accent = isPutzermannNoir ? undefined : item.accentColor;

  if (isPutzermannNoir) {
    return (
      <SidebarMenuItem>
        <button
          onClick={onClick}
          className={`
            w-full flex items-center gap-3 px-2 py-3 text-left group
            transition-all duration-150 ease-out
            ${active ? 'noir-raised text-white' : 'hover:noir-raised hover:text-white'}
          `}
        >
          {item.icon && (
            <div className="flex items-center justify-center h-6 w-6 flex-shrink-0">
              <item.icon className="h-4 w-4 noir-icon transition-all duration-150 group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="noir-text text-base leading-tight truncate">
              {item.label}
            </span>
          </div>
          {active && (
            <div className="ml-auto h-2 w-2 flex-shrink-0 bg-[#c0c0c0]" />
          )}
        </button>
      </SidebarMenuItem>
    );
  }

  if (isPysyTheme) {
    return (
      <SidebarMenuItem>
        <button
          onClick={onClick}
          className={`
            w-full flex items-center gap-3 px-3 py-3 text-left group
            ${active ? 'win95-sunken' : 'win95-button'}
          `}
        >
          {item.icon && (
            <div className="flex items-center justify-center h-7 w-7 flex-shrink-0 win95-text">
              <item.icon className="h-4 w-4" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="win95-text font-semibold leading-tight truncate">
              {item.label}
            </span>
          </div>
          {active && accent && (
            <div
              className="ml-auto h-2 w-2 flex-shrink-0"
              style={{ backgroundColor: accent, boxShadow: '1px 1px 0 #404040' }}
            />
          )}
        </button>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <button
        onClick={onClick}
        style={active && accent ? { color: accent, borderColor: `${accent}33`, backgroundColor: `${accent}14` } : undefined}
        className={`
          w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left group
          ${active && !accent
            ? 'bg-primary/10 border border-primary/20 text-primary'
            : !active
              ? 'border border-transparent text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
              : 'border'
          }
        `}
      >
        {item.icon && (
          <div
            style={active && accent ? { color: accent, backgroundColor: `${accent}20` } : undefined}
            className={`
              flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 transition-colors
              ${active && !accent ? 'bg-primary/15 text-primary' : 'bg-card text-muted-foreground group-hover:text-foreground group-hover:bg-card/80'}
            `}
          >
            <item.icon className="h-4 w-4" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-sm font-semibold leading-tight truncate">
            {item.label}
          </span>
        </div>
        {active && (
          <div
            className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: accent ?? 'hsl(var(--primary))' }}
          />
        )}
      </button>
    </SidebarMenuItem>
  );
}

function SecretNavItem({ user, isPysyTheme, isPutzermannNoir }: { user?: User | null; isPysyTheme?: boolean; isPutzermannNoir?: boolean }) {
  const [, setLocation] = useLocation();
  const [pathname] = useLocation();
  const { data: secretData } = useGetSecretPhoto({ query: { enabled: !!user, queryKey: ["secretPhoto"] } });
  const wrapRef = useRef<HTMLDivElement>(null);
  const unlocked = !!secretData?.unlocked;

  const item: NavItem = { label: 'Секретное фото', path: '/secret-photo', icon: Image, description: 'Секретное фото', exact: true };

  if (unlocked) {
    return <NavButton item={item} pathname={pathname} onClick={() => setLocation('/secret-photo')} isPysyTheme={isPysyTheme} isPutzermannNoir={isPutzermannNoir} />;
  }

  return (
    <div ref={wrapRef} className="group/secret">
      <div
        className="opacity-100 transition-all duration-150 ease-out group-hover/secret:opacity-0 group-hover/secret:pointer-events-none group-hover/secret:-translate-x-3"
        style={{ willChange: 'opacity, transform' }}
      >
        <NavButton item={item} pathname={pathname} onClick={() => {}} isPysyTheme={isPysyTheme} isPutzermannNoir={isPutzermannNoir} />
      </div>
    </div>
  );
}

export function AppSidebar({ user }: { user?: User | null }) {
  const [, setLocation] = useLocation();
  const [pathname] = useLocation();
  const isPysyTheme = useIsPysyTheme();
  const isPutzermannNoir = useIsPutzermannNoirTheme();
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
    <Sidebar className={`${isPysyTheme ? 'win95-panel rounded-none border-0' : isPutzermannNoir ? 'noir-sidebar border-r border-white/20' : 'border-r border-border bg-sidebar'}`}>
      <SidebarHeader className={`hidden md:flex h-20 items-center px-4 ${isPysyTheme ? 'border-b-2 border-b-[#808080]' : isPutzermannNoir ? 'border-b border-white/20' : 'border-b border-border'}`}>
        <div
          className="cursor-pointer select-none"
          onClick={() => setLocation('/releases')}
        >
          <MztLogo />
        </div>
      </SidebarHeader>

      <SidebarContent className={isPysyTheme ? 'px-2 py-3' : isPutzermannNoir ? 'px-3 py-4' : 'px-3 py-4'}>
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => (
              <NavButton
                key={item.path}
                item={item}
                pathname={pathname}
                onClick={() => setLocation(item.path)}
                isPysyTheme={isPysyTheme}
                isPutzermannNoir={isPutzermannNoir}
              />
            ))}
            <SecretNavItem user={user} isPysyTheme={isPysyTheme} isPutzermannNoir={isPutzermannNoir} />
          </SidebarMenu>
        </SidebarGroup>

        {/* Blog channels */}
        <SidebarGroup className="mt-4">
          <p className={`px-3 mb-2 text-[10px] uppercase tracking-widest text-muted-foreground/50 ${isPysyTheme ? 'win95-text' : isPutzermannNoir ? 'noir-label' : 'font-mono'}`}>
            Блоги
          </p>
          <SidebarMenu className="space-y-1">
            {blogItems.map((item) => (
              <NavButton
                key={item.path}
                item={item}
                pathname={pathname}
                onClick={() => setLocation(item.path)}
                isPysyTheme={isPysyTheme}
                isPutzermannNoir={isPutzermannNoir}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`${isPysyTheme ? 'border-t-2 border-t-[#808080] p-3' : isPutzermannNoir ? 'border-t border-white/20 p-3' : 'border-t border-border p-4'}`}>
        {user && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-6 w-6 flex items-center justify-center flex-shrink-0 ${isPysyTheme ? 'win95-sunken' : isPutzermannNoir ? 'noir-sunken' : 'rounded-full bg-card border border-border'}`}>
                <UserIcon className={`h-3.5 w-3.5 ${isPysyTheme ? 'win95-text' : isPutzermannNoir ? 'noir-text' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-xs truncate ${isPysyTheme ? 'win95-text' : isPutzermannNoir ? 'noir-text' : 'font-mono text-muted-foreground'}`}>
                {user.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className={isPysyTheme ? 'win95-button p-1' : isPutzermannNoir ? 'noir-button p-1' : 'flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10'}
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
