import { build } from "esbuild";

await build({
  entryPoints: ["./server/_core/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  packages: "external",
  outfile: "./dist/index.js",
}).catch(() => process.exit(1));
