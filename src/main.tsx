import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  MantineProvider,
  createTheme,
} from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";

import "./index.css";
import App from "./App.tsx";

// =====================================================
// WORLD MONITOR THEME
// =====================================================

const theme = createTheme({
  primaryColor: "cyan",

  defaultRadius: "md",

  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",

  headings: {
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",

    fontWeight: "700",
  },
});

// =====================================================
// APP
// =====================================================

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
    >
      <App />
    </MantineProvider>
  </StrictMode>
);