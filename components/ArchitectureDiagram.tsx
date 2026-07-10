"use client";

import { useEffect, useRef, useState } from "react";

export interface ArchitectureDiagramProps {
  ariaLabel?: string;
}

type NodeId = "sse" | "ingest" | "redpanda" | "spark" | "iceberg" | "grafana" | "dlq" | "prometheus" | "catalog";

type DiagramNode = {
  id: NodeId;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  side?: boolean;
  what: string;
  why: string;
  failure: string;
  adr: string;
};

const adrBase = "https://github.com/GokulArumugam/wiki-stream-pipeline/blob/main/docs/adr/";

const nodes: DiagramNode[] = [
  { id: "sse", title: "Wikimedia SSE", subtitle: "recentchange", x: 78, y: 208, what: "The public EventStreams source delivers live recent-change events over Server-Sent Events.", why: "The source is resumable with Last-Event-ID, which makes reconnect behavior explicit.", failure: "A disconnect can replay an overlap; downstream deduplication, not wishful thinking, absorbs it.", adr: "0005-delivery-semantics.md" },
  { id: "ingest", title: "Ingest", subtitle: "resume + stamp", x: 225, y: 208, what: "A small service records ingested_at and produces raw events keyed by wiki.", why: "A thin boundary preserves the original payload and owns SSE recovery plus producer acknowledgements.", failure: "An ingest restart can produce duplicates across sessions, so it must be safe to replay.", adr: "0005-delivery-semantics.md" },
  { id: "redpanda", title: "Redpanda", subtitle: "Kafka API", x: 372, y: 208, what: "The durable transport is a Kafka-compatible topic: wiki.recentchange.", why: "Redpanda keeps the local stack light while retaining the Kafka API used by Spark and a future MSK path.", failure: "When the broker is unavailable, ingest retries and holds its source position rather than dropping events.", adr: "0002-redpanda-over-kafka.md" },
  { id: "spark", title: "Spark Structured", subtitle: "streaming + DQ", x: 519, y: 208, what: "Spark validates, deduplicates, windows, and writes bronze plus gold Iceberg tables in micro-batches.", why: "A 10–30 second micro-batch is comfortably inside the two-minute freshness SLO and has the strongest Iceberg integration.", failure: "A killed batch is replayed from its checkpoint; no partial Iceberg output becomes visible.", adr: "0003-spark-structured-streaming-over-flink.md" },
  { id: "iceberg", title: "Iceberg on MinIO", subtitle: "bronze + gold", x: 676, y: 208, what: "Iceberg tables on MinIO retain every bronze event and serve compacted analytical tables.", why: "The engine-neutral table format, schema evolution, and S3-compatible storage carry to cloud without a rewrite.", failure: "Small streaming files are expected; scheduled compaction and snapshot expiry are operating requirements.", adr: "0004-iceberg-on-minio.md" },
  { id: "grafana", title: "Grafana", subtitle: "freshness SLO", x: 823, y: 208, what: "Grafana exposes edits, late arrivals, and freshness against a 120-second SLO.", why: "A local-first Compose stack makes the whole demonstration reproducible without a standing cloud bill.", failure: "Stale dashboards are an alerting signal; the underlying raw stream remains replayable in bronze.", adr: "0001-local-first-docker-compose.md" },
  { id: "dlq", title: "DLQ", subtitle: "bad records", x: 518, y: 420, side: true, what: "Malformed required fields are routed to a dedicated Kafka topic with a rejection reason.", why: "The data-quality gate blocks bad records instead of quietly contaminating aggregates.", failure: "The DLQ writer is deliberately at-least-once, so investigation tools must tolerate duplicates.", adr: "0005-delivery-semantics.md" },
  { id: "prometheus", title: "Prometheus", subtitle: "metrics", x: 323, y: 52, side: true, what: "Prometheus scrapes ingest and Spark metrics, including the freshness signal.", why: "The laptop stack needs the same observability feedback loop as a production system.", failure: "Missing scrape data is itself observable; Grafana should not turn a broken metric into a healthy-looking chart.", adr: "0001-local-first-docker-compose.md" },
  { id: "catalog", title: "Iceberg REST catalog", subtitle: "table metadata", x: 676, y: 420, side: true, what: "The REST catalog coordinates Iceberg table metadata independently from MinIO object storage.", why: "It makes the local catalog portable to a managed cloud catalog later.", failure: "If the catalog is unavailable, a Spark batch fails before its checkpoint advances and can safely retry.", adr: "0004-iceberg-on-minio.md" },
];

const byId = Object.fromEntries(nodes.map((node) => [node.id, node])) as Record<NodeId, DiagramNode>;
const mainStops = [byId.sse, byId.ingest, byId.redpanda, byId.spark, byId.iceberg, byId.grafana];

function pointOnReplayPath(progress: number) {
  const clamped = Math.max(0, Math.min(progress, 1));
  const segment = clamped * (mainStops.length - 1);
  const index = Math.min(Math.floor(segment), mainStops.length - 2);
  const remainder = segment - index;
  const from = mainStops[index];
  const to = mainStops[index + 1];
  return { x: from.x + (to.x - from.x) * remainder, y: from.y + (to.y - from.y) * remainder };
}

export default function ArchitectureDiagram({ ariaLabel = "Interactive Wikipedia event-stream pipeline" }: ArchitectureDiagramProps) {
  const [selected, setSelected] = useState<NodeId>("spark");
  const [isReplaying, setIsReplaying] = useState(false);
  const [dots, setDots] = useState<Array<{ id: number; progress: number }>>([]);
  const [wikiCounts, setWikiCounts] = useState<Record<string, number>>({});
  const frameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const replay = async () => {
    if (isReplaying) return;
    try {
      const response = await fetch("/data/sample_events.jsonl");
      if (!response.ok) throw new Error("The sample replay is unavailable.");
      const events = (await response.text())
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line) as { wiki?: string });
      const counts: Record<string, number> = {};
      const startedAt = performance.now();
      let lastEvent = -1;
      setIsReplaying(true);
      setWikiCounts({});

      const tick = (now: number) => {
        const target = Math.min(events.length, Math.floor(((now - startedAt) / 1000) * 72));
        if (target > lastEvent) {
          for (let index = lastEvent + 1; index < target; index += 1) {
            const wiki = events[index]?.wiki ?? "unknown";
            counts[wiki] = (counts[wiki] ?? 0) + 1;
          }
          lastEvent = target - 1;
          setWikiCounts({ ...counts });
        }
        const dotsForFrame = Array.from({ length: Math.min(12, target) }, (_, offset) => {
          const eventIndex = target - 1 - offset;
          const launchedAt = startedAt + (eventIndex / 72) * 1000;
          return { id: eventIndex, progress: (now - launchedAt) / 900 };
        }).filter((dot) => dot.progress <= 1);
        setDots(dotsForFrame);

        if (target < events.length) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setIsReplaying(false);
          setDots([]);
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setIsReplaying(false);
    }
  };

  const selectedNode = byId[selected];
  const topWikis = Object.entries(wikiCounts).sort(([, left], [, right]) => right - left).slice(0, 4);

  return (
    <section className="architecture" aria-label={ariaLabel}>
      <div className="architecture-toolbar">
        <div><span className="eyebrow">Interactive system map</span><p>Click a component to inspect its trade-offs, then replay a captured event slice.</p></div>
        <button type="button" className="replay-button" onClick={() => void replay()} disabled={isReplaying}>
          {isReplaying ? "Replaying…" : "Replay 1,200 events"}
        </button>
      </div>
      <div className="architecture-layout">
        <div className="architecture-map" role="img" aria-label="Wikimedia SSE flows through ingest, Redpanda, Spark and Iceberg to Grafana, with a DLQ, Prometheus and Iceberg REST catalog alongside it.">
          <svg className="architecture-lines" viewBox="0 0 900 500" aria-hidden="true" preserveAspectRatio="none">
            {mainStops.slice(0, -1).map((node, index) => <line key={node.id} x1={node.x + 54} y1={node.y} x2={mainStops[index + 1].x - 54} y2={mainStops[index + 1].y} />)}
            <line x1="519" y1="252" x2="519" y2="376" className="side-line" />
            <line x1="323" y1="98" x2="323" y2="164" className="side-line" />
            <line x1="676" y1="252" x2="676" y2="376" className="side-line" />
            <line x1="377" y1="52" x2="770" y2="52" className="side-line" />
            {dots.map((dot) => {
              const point = pointOnReplayPath(dot.progress);
              return <circle key={dot.id} cx={point.x} cy={point.y} r="6" className="replay-dot" />;
            })}
          </svg>
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`architecture-node${node.side ? " side-node" : ""}${selected === node.id ? " selected" : ""}`}
              style={{ left: `${(node.x / 900) * 100}%`, top: `${(node.y / 500) * 100}%` }}
              onClick={() => setSelected(node.id)}
              aria-pressed={selected === node.id}
            >
              <strong>{node.title}</strong><span>{node.subtitle}</span>
            </button>
          ))}
        </div>
        <aside className="architecture-panel" aria-live="polite">
          <span className="eyebrow">{selectedNode.title}</span>
          <h3>{selectedNode.subtitle}</h3>
          <dl>
            <div><dt>What</dt><dd>{selectedNode.what}</dd></div>
            <div><dt>Why</dt><dd>{selectedNode.why}</dd></div>
            <div><dt>Failure mode</dt><dd>{selectedNode.failure}</dd></div>
          </dl>
          <a href={`${adrBase}${selectedNode.adr}`} target="_blank" rel="noreferrer">Read the ADR on GitHub ↗</a>
          <div className="replay-counts">
            <span>Replay counters</span>
            {topWikis.length ? topWikis.map(([wiki, count]) => <small key={wiki}>{wiki} <b>{count}</b></small>) : <small>Start the replay to count edits by wiki.</small>}
          </div>
        </aside>
      </div>
    </section>
  );
}
