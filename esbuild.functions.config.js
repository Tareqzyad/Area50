import { build } from "esbuild";

await build({
  entryPoints: ["./netlify/functions/api.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: "./netlify/functions/api.js",
  external: ["mysql2"],
}).catch(() => process.exit(1));
