import { useLocation } from 'wouter';

/**
 * Returns true when the user is on the medic-de-familie blog page.
 * This triggers a Binding of Isaac dungeon theme: dark stone, aged parchment,
 * blood-red accents, and pixel-art typography.
 */
export function useIsMedicTheme() {
  const [pathname] = useLocation();
  return pathname === '/blogs/medic-de-familie';
}
