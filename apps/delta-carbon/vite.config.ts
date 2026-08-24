import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [react()],
  // FINDING: @carbon/styles emits webpack-style "~@ibm/plex/..." font URLs that Vite
  // cannot resolve. Without this alias the build logs dozens of unresolved-asset
  // warnings and the shipped bundle carries broken @font-face references.
  resolve: { alias: [{ find: /^~(.*)$/, replacement: "$1" }] },
  css: { preprocessorOptions: { scss: { quietDeps: true, silenceDeprecations: ["mixed-decls", "global-builtin", "import", "legacy-js-api"] } } },
  build: { sourcemap: false, reportCompressedSize: true, chunkSizeWarningLimit: 3000 },
});
