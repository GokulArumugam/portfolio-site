import PaymentsReconciliationEngine, {
  metadata as paymentsMetadata,
} from "@/content/projects/payments-reconciliation-engine.mdx";
import WikipediaEditsPipeline, {
  metadata as wikipediaMetadata,
} from "@/content/projects/real-time-wikipedia-edits-pipeline.mdx";
import DuckDBBenchmark, {
  metadata as duckdbMetadata,
} from "@/content/posts/duckdb-spark-polars-benchmark.mdx";
import WikiStreamPipeline, {
  metadata as wikiStreamMetadata,
} from "@/content/posts/building-wiki-stream-pipeline.mdx";
import type { ComponentType } from "react";

export interface ContentMetadata {
  title: string;
  description: string;
  date?: string;
  metric?: string;
  kind?: "project" | "post";
}

export interface ContentEntry {
  slug: string;
  metadata: ContentMetadata;
  Content: ComponentType;
}

const projects: ContentEntry[] = [
  {
    slug: "real-time-wikipedia-edits-pipeline",
    metadata: wikipediaMetadata,
    Content: WikipediaEditsPipeline,
  },
  {
    slug: "payments-reconciliation-engine",
    metadata: paymentsMetadata,
    Content: PaymentsReconciliationEngine,
  },
];

const posts: ContentEntry[] = [
  {
    slug: "building-wiki-stream-pipeline",
    metadata: wikiStreamMetadata,
    Content: WikiStreamPipeline,
  },
  {
    slug: "duckdb-spark-polars-benchmark",
    metadata: duckdbMetadata,
    Content: DuckDBBenchmark,
  },
];

export const getProjects = () => projects;
export const getPosts = () => posts;
export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
export const getPost = (slug: string) => posts.find((post) => post.slug === slug);
