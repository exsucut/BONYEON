import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: [
    "@bonyeon/shared",
    "@bonyeon/engine-manseryeok",
    "@bonyeon/engine-ziweidoushu",
    "@bonyeon/engine-goldschneider",
    "@bonyeon/engine-mbti",
    "@bonyeon/engine-enneagram",
    "@bonyeon/interpretation",
  ],
  // NodeNext-style imports (import "./x.js" resolving to ./x.ts) are used in our
  // engine packages. webpack needs an extensionAlias to resolve them during bundling.
  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default config;
