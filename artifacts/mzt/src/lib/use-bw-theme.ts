import { useLocation } from 'wouter';

/**
 * Returns true when the user is on the putzermann-core blog page.
 * This triggers the black-white-gray site-wide theme.
 */
export function useIsBwTheme() {
  const [pathname] = useLocation();
  return pathname === '/blogs/putzermann-core';
}
