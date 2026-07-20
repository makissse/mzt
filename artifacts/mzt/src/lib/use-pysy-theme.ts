import { useLocation } from 'wouter';

/**
 * Returns true when the user is on the pysy-exe blog page.
 * This triggers a muted webcore/retro-Windows site-wide theme.
 */
export function useIsPysyTheme() {
  const [pathname] = useLocation();
  return pathname === '/blogs/pysy-exe';
}
