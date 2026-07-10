declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const metadata: {
    title: string;
    description: string;
    date?: string;
    metric?: string;
    kind?: "project" | "post";
  };

  const MDXContent: ComponentType;
  export default MDXContent;
}
