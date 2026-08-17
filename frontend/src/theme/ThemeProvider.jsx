import { createContext, useEffect, useMemo, useState } from 'react';
import { THEMES, UI_MODES, FONT_FAMILIES, FONT_SIZES, getThemeTokens, themeOrder } from './themes';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'decisionhub_theme_preferences';

export const DEFAULT_PREFERENCES = {
  theme: THEMES.default,
  uiMode: UI_MODES.royal,
  fontFamily: 'inter',
  fontSize: 'default',
};

function loadGoogleFont(fontKey) {
  if (typeof document === 'undefined') return;
  const fontConfig = FONT_FAMILIES[fontKey];
  if (!fontConfig || !fontConfig.googleFontUrl) return;

  const linkId = `google-font-${fontKey}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = fontConfig.googleFontUrl;
    document.head.appendChild(link);
  }
}

function getStoredPreferences() {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(item);

    // Validate stored values against actual THEMES, UI_MODES, FONT_FAMILIES, FONT_SIZES
    const validThemes = Object.values(THEMES);
    const validModes = Object.values(UI_MODES);
    const validFontFamilies = Object.keys(FONT_FAMILIES);
    const validFontSizes = Object.keys(FONT_SIZES);

    return {
      theme: validThemes.includes(parsed.theme) ? parsed.theme : DEFAULT_PREFERENCES.theme,
      uiMode: validModes.includes(parsed.uiMode) ? parsed.uiMode : DEFAULT_PREFERENCES.uiMode,
      fontFamily: validFontFamilies.includes(parsed.fontFamily) ? parsed.fontFamily : DEFAULT_PREFERENCES.fontFamily,
      fontSize: validFontSizes.includes(parsed.fontSize) ? parsed.fontSize : DEFAULT_PREFERENCES.fontSize,
    };
  } catch (error) {
    console.warn('Failed to read theme preferences from localStorage:', error);
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save theme preferences to localStorage:', error);
  }
}

export function ThemeProvider({ children }) {
  // Initialize with validated stored preferences immediately
  const [preferences, setPreferencesState] = useState(() => {
    return getStoredPreferences();
  });

  // Load initial preferences
  useEffect(() => {
    setPreferencesState(getStoredPreferences());
  }, []);

  // Apply theme & typography to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove old theme classes (for backward compatibility during migration)
    root.classList.remove('theme-default', 'theme-light', 'theme-dark', 'theme-midnight', 'theme-sunrise', 'theme-forest');
    
    // Add current theme and mode
    root.classList.add(`theme-${preferences.theme}`);
    root.dataset.uiMode = preferences.uiMode;
    root.dataset.theme = preferences.theme;
    root.dataset.fontFamily = preferences.fontFamily;
    root.dataset.fontSize = preferences.fontSize;
    
    // Dynamic Font setup
    const activeFont = FONT_FAMILIES[preferences.fontFamily] || FONT_FAMILIES.inter;
    const activeSize = FONT_SIZES[preferences.fontSize] || FONT_SIZES.default;

    loadGoogleFont(preferences.fontFamily);

    root.style.setProperty('--app-font-family', activeFont.value);
    root.style.setProperty('--font-size-scale', activeSize.scale);
    root.style.setProperty('--app-font-size', `calc(16px * ${activeSize.scale})`);

    // Get and apply CSS variables
    const themeTokens = getThemeTokens(preferences.theme, preferences.uiMode);
    Object.entries(themeTokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    savePreferences(preferences);
  }, [preferences]);

  const setPreferences = (next) => {
    setPreferencesState((prev) => ({ ...prev, ...next }));
  };

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(preferences.theme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    setPreferences({ theme: nextTheme });
  };

  const resetTypography = () => {
    setPreferences({
      fontFamily: DEFAULT_PREFERENCES.fontFamily,
      fontSize: DEFAULT_PREFERENCES.fontSize,
    });
  };

  const resetAllPreferences = () => {
    setPreferencesState(DEFAULT_PREFERENCES);
  };

  const value = useMemo(() => ({
    theme: preferences.theme,
    uiMode: preferences.uiMode,
    fontFamily: preferences.fontFamily,
    fontSize: preferences.fontSize,
    setTheme: (theme) => setPreferences({ theme }),
    setUiMode: (uiMode) => setPreferences({ uiMode }),
    setFontFamily: (fontFamily) => setPreferences({ fontFamily }),
    setFontSize: (fontSize) => setPreferences({ fontSize }),
    cycleTheme,
    resetTypography,
    resetAllPreferences,
  }), [preferences]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
