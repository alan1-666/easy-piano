import { Palette } from '../theme';

// Deterministically assigns a soft hue pair (background + readable ink)
// to a song based on its id. Reuses the palette's accent colors so new
// songs stay on-brand without per-song metadata.
const HUES: Array<{ hue: string; ink: string }> = [
  { hue: Palette.mint, ink: Palette.mintInk },
  { hue: Palette.sun, ink: Palette.sunInk },
  { hue: Palette.coral, ink: Palette.coralInk },
  { hue: Palette.lilac, ink: Palette.lilacInk },
  { hue: Palette.sky, ink: Palette.skyInk },
  { hue: Palette.primarySoft, ink: Palette.primaryDeep },
];

export function songHue(id: number) {
  return HUES[(id - 1) % HUES.length];
}
