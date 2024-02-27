import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'eg-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  const handleThemeChange = useCallback((theme: Theme) => {
    const root = window.document.documentElement;

    // first remove every theme class
    root.classList.remove('light', 'dark');

    // if option 'system' is selected, then check for system preference
    if (theme === 'system') {
      // select class based on system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      // add class to the html tag
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, []);

  useEffect(() => {
    handleThemeChange(theme);
  }, [theme]);

  useEffect(() => {
    function themeChangeListener(e: MediaQueryListEvent) {
      handleThemeChange(e.matches ? 'dark' : 'light');
    }

    // required to automatically change theme if system theme is changed
    // no refresh needed!!
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', themeChangeListener);

    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', themeChangeListener);
    };
  }, []);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
