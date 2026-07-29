import { useLocation } from 'wouter';

/**
 * Returns true when the user is on the medic-de-familie blog page.
 * This triggers the Pixel Heart theme: deep plum background, warm rose
 * pixel accents, Silkscreen font, and heart motifs throughout.
 */
export function useIsMedicTheme() {
  const [pathname] = useLocation();
  return pathname === '/blogs/medic-de-familie';
}
