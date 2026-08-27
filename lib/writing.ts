export const mediumProfile = "https://medium.com/@gokulguugu";

export type Post = {
  title: string;
  url: string;
  date: string;
  source: "Medium" | "Blog";
  external: boolean;
};

export const posts: Post[] = [
  {
    title: "Techniques in Data Engineering with Databricks and Apache Spark",
    url: "https://medium.com/@gokulguugu/cost-saving-techniques-in-data-engineering-with-databricks-and-apache-spark-4ae7123fc78f",
    date: "Oct 2023",
    source: "Medium",
    external: true,
  },
  {
    title: "Cost-Saving Methods in Azure Data Factory",
    url: "https://medium.com/@gokulguugu/cost-saving-methods-in-azure-data-factory-for-highly-qualified-azure-data-engineers-fb820e1a8772",
    date: "Oct 2023",
    source: "Medium",
    external: true,
  },
  {
    title: "Distributed Systems for Data Engineers explained!",
    url: "https://blog.devgenius.io/distributed-systems-for-data-engineers-explained-949b19eb1880",
    date: "Apr 2023",
    source: "Medium",
    external: true,
  },
  {
    title: "The Future of Data Engineering",
    url: "https://medium.com/@gokulguugu/the-future-of-data-engineering-2dd39f2e53cb",
    date: "Apr 2023",
    source: "Medium",
    external: true,
  },
  {
    title: "A real-time lakehouse on a laptop: streaming Wikipedia edits end to end",
    url: "/blog/building-wiki-stream-pipeline",
    date: "Jul 2026",
    source: "Blog",
    external: false,
  },
  {
    title: "The fixed tax: DuckDB vs Polars vs Spark, measured honestly at MB scale",
    url: "/blog/duckdb-spark-polars-benchmark",
    date: "Jul 2026",
    source: "Blog",
    external: false,
  },
];
