import Link from "next/link";

export default function OpenSource() {
  return (
    <section className="section" aria-labelledby="opensource">
      <div className="section-heading">
        <div className="section-title-row">
          <h2 id="opensource" className="section-title">opensource projects</h2>
          <span className="section-index">(02)</span>
        </div>
        <a
          className="subtle-link"
          href="https://github.com/GokulArumugam/atlas"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/GokulArumugam/atlas →
        </a>
      </div>

      <article className="oss-card">
        <div className="oss-head">
          <h3>Atlas — governed AI data analyst</h3>
          <a
            className="oss-try"
            href="https://atlas-analyst.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Opens the live demo in a new tab"
          >
            Try it out for yourself — atlas-analyst.onrender.com ↗
          </a>
        </div>

        <p className="oss-tagline">
          An AI agent that sits on top of your database: ask questions in plain English and get
          real insights out of your data — available to everyone on the team, not just analysts,
          with a firewall that decides who&apos;s allowed to see what.
        </p>

        <div className="oss-video-wrap">
          <video
            className="oss-video"
            controls
            preload="metadata"
            poster="/videos/atlas-demo-poster.jpg"
          >
            <source src="/videos/atlas-demo.mp4" type="video/mp4" />
            Your browser doesn&apos;t support embedded video — watch it here instead:{" "}
            <a href="https://atlas-analyst.onrender.com">try Atlas live</a>.
          </video>
        </div>

        <p className="oss-note">
          <b>What you just watched:</b> asking the warehouse questions in plain English, the
          same HR question being allowed for HR and refused for engineering, phone numbers
          coming back masked, the per-user data map, and every decision landing in a
          tamper-evident audit trail — all against a Postgres warehouse running in a Podman
          container. The raw data never leaves the network it belongs to.
        </p>

        <div className="oss-foot">
          <Link className="oss-more" href="/projects/atlas">Learn more about it →</Link>
          <span className="metric">fail-closed governance · 116 tests green</span>
        </div>
      </article>
    </section>
  );
}
