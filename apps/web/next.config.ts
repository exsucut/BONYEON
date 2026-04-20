import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: [
    "@bonyeon/shared",
    "@bonyeon/engine-manseryeok",
    "@bonyeon/engine-ziweidoushu",
    "@bonyeon/engine-goldschneider",
    "@bonyeon/engine-mbti",
    "@bonyeon/engine-enneagram",
    "@bonyeon/interpretation",
  ],
};

export default config;
