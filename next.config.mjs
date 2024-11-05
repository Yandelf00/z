/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude '@node-rs/argon2' from client-side bundling
      config.externals.push('@node-rs/argon2');
    }

    // Optional: Add a loader for `.node` files (last resort)
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    return config;
  },
};
