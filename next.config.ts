import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  // Turbopack requires serializable loader options: plugin as string, not import
  options: { remarkPlugins: ["remark-gfm"] },
});

export default withMDX(nextConfig);
