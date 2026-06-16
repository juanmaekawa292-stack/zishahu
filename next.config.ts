import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const COS_BASE = "https://zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zishahu-images-1301674224.cos.ap-hongkong.myqcloud.com",
      },
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/products/:path*",
        destination: COS_BASE + "/products/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
