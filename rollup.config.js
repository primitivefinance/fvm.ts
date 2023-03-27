import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json" assert { type: 'json' };

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "umd",
      name: "FVM.ts",
      sourcemap: true,
    }
  ],
  external: [
    // Add any external dependencies here
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
    terser() // Minify the output for smaller bundle size
  ]
};