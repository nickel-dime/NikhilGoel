import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next/**", "node_modules/**", ".sanity/**"] },
  ...coreWebVitals,
];

export default config;
