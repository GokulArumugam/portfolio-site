import Link from "next/link";
import { getProjects } from "@/lib/content";

export default function HomePage() {
  const projects = getProjects();

  return (
    <>
      <section className="hero">
        <div className="eyebrow">Data engineer</div>
        <h1>Gokul Arumugam</h1>
        <p>I build dependable data systems that turn high-volume events into decisions people can trust.</p>
      </section>

      <section className="section" aria-labelledby="selected-work">
        <div className="section-heading">
          <h2 id="selected-work">Selected work</h2>
          <Link className="subtle-link" href="/projects">All projects →</Link>
        </div>
        <div className="card-grid">
          {projects.map((project) => (
            <Link className="content-card" href={`/projects/${project.slug}`} key={project.slug}>
              <p className="card-label">Project</p>
              <h3>{project.slug === "real-time-wikipedia-edits-pipeline" ? "Sub-minute freshness on a live stream, sustained — $0/month" : project.slug === "payments-reconciliation-engine" ? "1M transaction pairs reconciled in <5s — 100% defect recall, zero false positives" : project.metadata.title}</h3>
              <p>{project.metadata.description}</p>
              <div className="metric">{project.metadata.metric}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Writing</h2>
          <Link className="subtle-link" href="/blog">Read the blog →</Link>
        </div>
        <p style={{ color: "var(--muted)" }}>Notes on query engines, batch systems, and the unglamorous parts of keeping pipelines honest.</p>
      </section>
    </>
  );
}
