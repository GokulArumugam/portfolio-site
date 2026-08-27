import {
  siPython, siScala, siOpenjdk,
  siApachespark, siApachekafka, siApacheairflow, siApachehive, siDelta,
  siApacheparquet, siApacheavro, siApachehadoop,
  siPostgresql, siRedis, siRabbitmq, siDatabricks, siTrino,
  siDocker, siKubernetes, siGitlab, siSnowflake, siMariadb, siJson,
} from "simple-icons";

type Tool = { title: string; path: string; hex: string; stroke?: boolean };

const brand = (t: { title: string; path: string; hex: string }): Tool => ({ ...t });
// generic stroke glyph for tools without an official logo
const glyph = (title: string, path: string): Tool => ({ title, path, hex: "", stroke: true });

const GLYPHS = {
  database: "M12 3c-3.9 0-7 1.2-7 2.8S8.1 8.5 12 8.5s7-1.2 7-2.7S15.9 3 12 3zM5 5.8v12.4C5 19.8 8.1 21 12 21s7-1.2 7-2.8V5.8M5 12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8",
  cloud: "M7 18.5h9.5a4 4 0 0 0 .9-7.9A6 6 0 0 0 5.9 9.2 4.5 4.5 0 0 0 7 18.5z",
  diamond: "M12 3l7.5 9-7.5 9-7.5-9L12 3z",
  mountain: "M4 19l5-9.5 3 5 2.5-6L20 19H4zM3 21.5h18",
  grid: "M4 5h16v14H4V5zM4 10h16M10 5v14M4 15h16",
  layers: "M12 3l8 4.5-8 4.5-8-4.5L12 3zM4 12.5l8 4.5 8-4.5M4 17l8 4.5 8-4.5",
  swap: "M6.5 8.5h11l-3-3M17.5 15.5h-11l3 3",
  cycle: "M19.5 12a7.5 7.5 0 1 1-2.2-5.3M17.5 3.5v3.6h-3.6",
};

const icons = {
  python: brand(siPython),
  scala: brand(siScala),
  java: brand(siOpenjdk),
  spark: brand(siApachespark),
  kafka: brand(siApachekafka),
  airflow: brand(siApacheairflow),
  hive: brand(siApachehive),
  delta: brand(siDelta),
  parquet: brand(siApacheparquet),
  avro: brand(siApacheavro),
  hadoop: brand(siApachehadoop),
  postgres: brand(siPostgresql),
  redis: brand(siRedis),
  rabbitmq: brand(siRabbitmq),
  databricks: brand(siDatabricks),
  trino: brand(siTrino),
  docker: brand(siDocker),
  kubernetes: brand(siKubernetes),
  gitlab: brand(siGitlab),
  snowflake: brand(siSnowflake),
  mariadb: brand(siMariadb),
  json: brand(siJson),
  sql: glyph("SQL", GLYPHS.database),
  tsql: glyph("T-SQL", GLYPHS.database),
  pyspark: glyph("PySpark", siApachespark.path),
  sparkstreaming: glyph("Spark Streaming", siApachespark.path),
  debezium: glyph("Debezium", GLYPHS.swap),
  iceberg: glyph("Iceberg", GLYPHS.mountain),
  dbt: glyph("dbt", GLYPHS.cycle),
  azure: glyph("Azure", GLYPHS.diamond),
  aws: glyph("AWS", GLYPHS.cloud),
  csv: glyph("CSV", GLYPHS.grid),
  orc: glyph("ORC", GLYPHS.layers),
};

const groups: { label: string; items: Tool[] }[] = [
  {
    label: "Languages",
    items: [icons.python, icons.scala, icons.java, icons.sql, icons.tsql],
  },
  {
    label: "Processing",
    items: [icons.spark, icons.pyspark, icons.sparkstreaming],
  },
  {
    label: "Streaming & CDC",
    items: [icons.kafka, icons.debezium, icons.rabbitmq],
  },
  {
    label: "Orchestration",
    items: [icons.airflow],
  },
  {
    label: "Storage & Query",
    items: [icons.hive, icons.delta, icons.mariadb, icons.postgres, icons.redis, icons.iceberg, icons.trino, icons.dbt],
  },
  {
    label: "Platform",
    items: [icons.hadoop, icons.docker, icons.kubernetes, icons.gitlab, icons.azure],
  },
  {
    label: "Cloud",
    items: [icons.aws, icons.snowflake, icons.databricks],
  },
  {
    label: "File Formats",
    items: [icons.json, icons.csv, icons.parquet, icons.avro, icons.orc, icons.delta],
  },
];

function Icon({ icon }: { icon: Tool }) {
  if (icon.stroke) {
    return (
      <span className="tool-badge" title={icon.title}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={icon.path} />
        </svg>
        <span>{icon.title}</span>
      </span>
    );
  }
  return (
    <span className="tool-badge" title={icon.title}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ color: `#${icon.hex}` }}>
        <path d={icon.path} />
      </svg>
      <span>{icon.title}</span>
    </span>
  );
}

export default function Toolbox() {
  return (
    <section className="section" aria-labelledby="toolbox">
      <div className="section-heading">
        <div className="section-title-row">
          <h2 id="toolbox" className="section-title">toolbox</h2>
          <span className="section-index">(01)</span>
        </div>
      </div>
      <div className="toolbox-groups">
        {groups.map((g) => (
          <div key={g.label} className="toolbox-group">
            <p className="toolbox-label">{g.label}</p>
            <div className="toolbox-items">
              {g.items.map((icon) => (
                <Icon key={icon.title} icon={icon} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
