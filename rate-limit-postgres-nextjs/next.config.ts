import type { NextConfig } from "next";
import CopyPlugin from 'copy-webpack-plugin';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: 'node_modules/postgres-migrations/dist/migrations',
              to: 'vendor-chunks/migrations'
            },
            {
              from: 'node_modules/@acpr/rate-limit-postgresql/dist/migrations',
              to: 'vendor-chunks/migrations'
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
