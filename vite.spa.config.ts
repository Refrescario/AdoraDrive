/**
 * Configuração Vite para build SPA — usado pelo Capacitor (APK Android).
 * Não usa SSR/Nitro. Gera HTML estático em dist-spa/.
 *
 * Build: bun run build:spa
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "src/routes",
      generatedRouteTree: "src/routeTree.spa.gen.ts",
      // Exclui rotas server-only e admin do APK
      routeFileIgnorePattern: "(licencas|api/|scanner-reset)",
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  resolve: {
    alias: {
      // Substitui o root SSR pelo root SPA
      "@/routes/__root": path.resolve(__dirname, "src/routes/__root.spa"),
      // Stub módulos server-only que não devem entrar no bundle cliente
      "@tanstack/react-start/server": path.resolve(__dirname, "src/spa-stubs/react-start-server-stub.ts"),
      "@tanstack/react-start": path.resolve(__dirname, "src/spa-stubs/react-start-stub.ts"),
      "@tanstack/start-server-core": path.resolve(__dirname, "src/spa-stubs/server-stub.ts"),
    },
  },
  build: {
    outDir: "dist-spa",
    target: "es2020",
    rollupOptions: {
      input: "index.spa.html",
    },
    chunkSizeWarningLimit: 2000,
  },
  publicDir: "public",
});
