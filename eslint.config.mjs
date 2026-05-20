import nextConfig from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**", "graphify-out/**"],
  },
];

export default config;
