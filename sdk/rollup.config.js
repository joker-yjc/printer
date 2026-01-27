import typescript from "@rollup/plugin-typescript"

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
    },
  ],
  // 标记外部依赖，不打包到 SDK 中
  external: ["qrcode", "jsbarcode"],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
}
