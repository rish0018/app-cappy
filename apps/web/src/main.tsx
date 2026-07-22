import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureSupabaseCredentials } from "@cappy/api";
import App from "./App";
import "./index.css";

// @cappy/api can't read import.meta.env itself (Metro, which also bundles
// this package for apps/mobile, can't parse `import.meta` at all) so each
// app reads its own env vars and hands them over explicitly.
const viteUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const viteAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
if (viteUrl && viteAnonKey) {
  configureSupabaseCredentials(viteUrl, viteAnonKey);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
