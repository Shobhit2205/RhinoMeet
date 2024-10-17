import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./context/SocketProvider.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import Layout from "./components/Layout.tsx";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Layout>
          <BrowserRouter>
            <SocketProvider>
              <App />
            </SocketProvider>
          </BrowserRouter>
        </Layout>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
