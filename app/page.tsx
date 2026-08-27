import Link from "next/link";
import { getProjects } from "@/lib/content";
import { socials, typewriterLines } from "@/lib/personal";
import Typewriter from "@/components/Typewriter";
import LocalTime from "@/components/LocalTime";
import OffTheClock from "@/components/OffTheClock";
import Toolbox from "@/components/Toolbox";
import { posts, mediumProfile } from "@/lib/writing";

export default function HomePage() {
  const projects = getProjects();

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <div className="eyebrow">
            <LocalTime />
          </div>
          <h1>Hi, I&rsquo;m Gokul.</h1>
          <p className="hero-type">
            <Typewriter lines={typewriterLines} />
          </p>
          <p className="hero-sub">
            I&rsquo;m a self-taught data engineer who&rsquo;s spent the last 5+ years building data pipelines that
            don&rsquo;t flinch under pressure. Currently at PhonePe, where we process more than half of India&rsquo;s
            daily UPI payments — roughly 400 million transactions a day. I work across both on-prem and cloud,
            designing distributed systems, real-time streaming pipelines, and data platforms with Hadoop, Spark,
            Kafka, Airflow, dbt, Snowflake, Databricks, and Trino… the kind that (mostly) don&rsquo;t page me at
            3 AM.
          </p>
          <div className="hero-links">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={s.icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-photo" src="/images/adventure-river.jpg" alt="Gokul in the mountains, by a river" />
      </section>

      <Toolbox />

      <section className="section" aria-labelledby="gh-activity">
        <div className="section-heading">
          <div className="section-title-row">
            <h2 id="gh-activity" className="section-title">github activity</h2>
            <span className="section-index">(02)</span>
          </div>
          <a className="subtle-link" href="https://github.com/GokulArumugam" target="_blank" rel="noopener noreferrer">@GokulArumugam →</a>
        </div>
        <a className="gh-card" href="https://github.com/GokulArumugam" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gh-chart" src="https://ghchart.rshah.org/0f7a5c/GokulArumugam" alt="GitHub contribution calendar for GokulArumugam" loading="lazy" width="828" height="128" />
        </a>
      </section>

      <section className="section" aria-labelledby="selected-work">
        <div className="section-heading">
          <div className="section-title-row">
            <h2 id="selected-work" className="section-title">selected work</h2>
            <span className="section-index">(03)</span>
          </div>
          <Link className="subtle-link" href="/projects">All projects →</Link>
        </div>
        <div className="card-grid">
          {projects.map((project) => (
            <Link className="content-card" href={`/projects/${project.slug}`} key={project.slug}>
              <p className="card-label">Project</p>
              <h3>{project.slug === "atlas" ? "Ask your warehouse questions — vendor never sees a single row" : project.slug === "real-time-wikipedia-edits-pipeline" ? "Sub-minute freshness on a live stream, sustained — $0/month" : project.slug === "payments-reconciliation-engine" ? "1M transaction pairs reconciled in <5s — 100% defect recall, zero false positives" : project.metadata.title}</h3>
              <p>{project.metadata.description}</p>
              <div className="metric">{project.metadata.metric}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="writing">
        <div className="section-heading">
          <div className="section-title-row">
            <h2 id="writing" className="section-title">writing</h2>
            <span className="section-index">(04)</span>
          </div>
          <a className="subtle-link" href={mediumProfile} target="_blank" rel="noopener noreferrer">read on medium →</a>
        </div>
        <div className="medium-list">
          {posts.map((post) => (
            <a
              className="medium-post"
              href={post.url}
              key={post.url}
              {...(post.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <h3>{post.title}</h3>
              <span className="medium-meta">{post.date} · {post.source}</span>
            </a>
          ))}
        </div>
      </section>

      <OffTheClock />
    </>
  );
}
