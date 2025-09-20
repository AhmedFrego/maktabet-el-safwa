import { createTheme, ThemeOptions } from '@mui/material/styles';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

// =========================
// ⚡ Emotion Cache (RTL)
// =========================
export const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// =========================
// 🎨 Base Theme Tokens
// =========================
const baseTheme = createTheme();

const commonTokens: ThemeOptions = {
  direction: 'rtl',
  typography: {
    ...baseTheme.typography,
    fontFamily: 'Cairo, sans-serif',
    fontSize: 10,
    h1: { fontSize: '4rem', fontWeight: 700 },
    h2: { fontSize: '3rem', fontWeight: 600 },
    h3: { fontSize: '2rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 500 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '.9rem' },
    caption: { fontSize: '.8rem' },
  },
  shape: {
    borderRadius: 4,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 700,
      lg: 1000,
      xl: 1200,
    },
  },
  // @ts-expect-error nnnsdf
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.04)',
    '0 0.5rem 1.5rem rgba(0,0,0,0.06)',
    '0 1rem 2rem rgba(0,0,0,0.1)',
    '0 1.5rem 3rem rgba(0,0,0,0.3)',
    ...Array(20).fill('none'),
  ],
};

// =========================
// 🌞 Light Palette
// =========================
const lightPalette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: {
    light: '#7986cb',
    main: '#3f51b5',
    dark: '#303f9f',
    contrastText: '#fff',
  },
  secondary: {
    light: '#ff4081',
    main: '#f50057',
    dark: '#c51162',
    contrastText: '#fff',
  },
  error: {
    light: '#e57373',
    main: '#f44336',
    dark: '#d32f2f',
    contrastText: '#fff',
  },
  warning: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
    contrastText: '#000',
  },
  info: {
    light: '#64b5f6',
    main: '#2196f3',
    dark: '#1976d2',
    contrastText: '#fff',
  },
  success: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
    contrastText: '#fff',
  },
  grey: {
    50: '#fafafa',
    100: '#e6e6e6ff',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: '#212121',
    secondary: '#424242',
    disabled: '#9e9e9e',
  },
  divider: '#e0e0e0',
};

// =========================
// 🌚 Dark Palette
// =========================
const darkPalette: ThemeOptions['palette'] = {
  mode: 'dark',
  primary: {
    light: '#7986cb',
    main: '#3f51b5',
    dark: '#303f9f',
    contrastText: '#fff',
  },
  secondary: {
    light: '#ff4081',
    main: '#f50057',
    dark: '#c51162',
    contrastText: '#fff',
  },
  error: {
    light: '#ef9a9a',
    main: '#e57373',
    dark: '#d32f2f',
    contrastText: '#fff',
  },
  warning: {
    light: '#ffcc80',
    main: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000',
  },
  info: {
    light: '#64b5f6',
    main: '#2196f3',
    dark: '#1976d2',
    contrastText: '#fff',
  },
  success: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
    contrastText: '#fff',
  },
  grey: {
    50: '#212121',
    100: '#424242',
    200: '#616161',
    300: '#757575',
    400: '#9e9e9e',
    500: '#bdbdbd',
    600: '#e0e0e0',
    700: '#eeeeee',
    800: '#f5f5f5',
    900: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#bdbdbd',
    disabled: '#757575',
  },
  divider: '#424242',
};

// =========================
// 🎭 Final Themes
// =========================
export const lightTheme = createTheme({
  ...commonTokens,
  palette: lightPalette,
});

export const darkTheme = createTheme({
  ...commonTokens,
  palette: darkPalette,
});
