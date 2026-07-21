import { useLocation } from 'wouter';

/**
 * Returns true when the user is on the putzermann-core blog page.
 * This triggers a cinematic noir theme on that page: deep blacks, silver whites,
 * elegant serif typography, film grain, and venetian-blind shadows.
 */
export function useIsPutzermannNoirTheme() {
  const [pathname] = useLocation();
  return pathname === '/blogs/putzermann-core';
}
