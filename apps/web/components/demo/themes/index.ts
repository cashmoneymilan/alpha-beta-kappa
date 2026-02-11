import { cyberpunk } from './cyberpunk';
import { minimal } from './minimal';
import { bloomberg } from './bloomberg';
import { glassmorphism } from './glassmorphism';
import { midnight } from './midnight';
import { sunset } from './sunset';
import { arctic } from './arctic';
import { retro } from './retro';

export type ThemeColors = {
  [key: `--demo-${string}`]: string;
};

export type ThemeEffects = {
  glow?: boolean;
  blur?: boolean;
  scanlines?: boolean;
  borderRadius: string;
  fontFamily: string;
  glowColor?: string;
  glowColorAlt?: string;
  shadow?: string;
  dense?: boolean;
  glassOpacity?: number;
  blurAmount?: string;
  gradient?: string;
  crisp?: boolean;
  crt?: boolean;
  pixelated?: boolean;
};

export type Theme = {
  name: string;
  label: string;
  description: string;
  colors: ThemeColors;
  effects: ThemeEffects;
};

export const themes: Record<string, Theme> = {
  cyberpunk,
  minimal,
  bloomberg,
  glassmorphism,
  midnight,
  sunset,
  arctic,
  retro,
};

export const themeList = Object.values(themes);

// Helper function to get theme styles with fallback
export function getThemeStyles(themeName: string) {
  const theme = themes[themeName];
  return {
    colors: theme?.colors || themes.bloomberg!.colors,
    effects: theme?.effects || themes.bloomberg!.effects,
  };
}

export {
  cyberpunk,
  minimal,
  bloomberg,
  glassmorphism,
  midnight,
  sunset,
  arctic,
  retro,
};
