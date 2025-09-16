// theme.ts
import { createTheme } from "@mui/material/styles";
import  create  from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";

export const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      light: "#c7d2fe", // --color-brand-200
      main: "#6366f1", // --color-brand-500
      dark: "#4338ca", // --color-brand-700
      contrastText: "#fff",
    },
    secondary: {
      light: "#e0e7ff", // --color-indigo-100
      main: "#3730a3", // --color-brand-800
      dark: "#312e81", // --color-brand-900
      contrastText: "#fff",
    },
    error: {
      light: "#f8b1b1ff", // --color-red-100
      main: "#b91c1c", // --color-red-700
      dark: "#991b1b", // --color-red-800
      contrastText: "#fff",
    },
    warning: {
      light: "#fef9c3", // --color-yellow-100
      main: "#a16207", // --color-yellow-700
      contrastText: "#000",
    },
    info: {
      light: "#e0f2fe", // --color-blue-100
      main: "#0369a1", // --color-blue-700
      contrastText: "#fff",
    },
    success: {
      light: "#dcfce7", // --color-green-100
      main: "#15803d", // --color-green-700
      contrastText: "#fff",
    },
    grey: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    background: {
      default: "#fff",
      paper: "#f9fafb",
    },
    text: {
      primary: "#374151", // --color-grey-700
      secondary: "#6b7280", // --color-grey-500
    },
  },
  typography: {
    fontFamily: '"Cairo", sans-serif',
    fontSize: 16, // 1.6rem from GlobalStyles
    h1: { fontSize: "4rem" }, // --font-size-large-4
    h2: { fontSize: "3rem" }, // --font-size-large-3
    h3: { fontSize: "2.3rem" }, // --font-size-large-2
    body1: { fontSize: "1.6rem" },
    body2: { fontSize: "1.4rem" }, // --font-size-small
  },
  shape: {
    borderRadius: 7, // --border-radius-md
  },
  shadows: [
    "none",
    "0 1px 2px rgba(0, 0, 0, 0.04)", // --shadow-sm
    "0px 0.6rem 2.4rem rgba(0, 0, 0, 0.06)", // --shadow-md
    "0 2.4rem 3.2rem rgba(0, 0, 0, 0.12)", // --shadow-lg
    // fill out remaining indexes if needed
  ] as any,
  breakpoints: {
    values: {
      xs: 0,
      sm: 480, // 30em --bP-smallest
      md: 700, // 43.75em --bP-smaller
      lg: 1000, // 62.5em --bP-big
      xl: 1200, // 75em --bP-bigest
    },
  },
  // add your palette, typography, etc.
});

// Emotion cache for RTL
export const rtlCache = create({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
