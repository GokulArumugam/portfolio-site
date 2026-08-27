import { nowPlaying } from "@/lib/personal";

export default function OffTheClock() {
  return (
    <section className="section" aria-labelledby="off-the-clock">
      <div className="section-heading">
        <div className="section-title-row">
          <h2 id="off-the-clock" className="section-title">off the clock</h2>
          <span className="section-index">(05)</span>
        </div>
      </div>
      <div className="offclock-grid">
        <div className="offclock-card offclock-card-compact now-playing-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="offclock-photo" src="/images/now-playing.jpg" alt="Headphones" loading="lazy" />
          <div className="offclock-body-compact">
            <div className="offclock-label-row">
              <svg className="spotify-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.36.18.42.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.42C15.24 8.34 8.82 8.1 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
              </svg>
              <span className="offclock-mini-label">On repeat</span>
            </div>
            <p className="offclock-track">
              {nowPlaying.title ? nowPlaying.title : "—"}
            </p>
            {nowPlaying.artist && <p className="offclock-artist">{nowPlaying.artist}</p>}
          </div>
        </div>

        <div className="offclock-card offclock-card-compact f1-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="offclock-photo" src="/images/f1.jpg" alt="Formula 1" loading="lazy" />
          <div className="offclock-body-compact">
            <p className="offclock-mini-label" style={{ color: "var(--f1-label)" }}>F1</p>
            <p className="offclock-copy">race sundays are sacred.</p>
          </div>
        </div>

        <div className="offclock-card offclock-card-compact nba-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="offclock-photo" src="/images/nba.jpg" alt="NBA" loading="lazy" />
          <div className="offclock-body-compact">
            <p className="offclock-mini-label" style={{ color: "var(--nba-label)" }}>NBA</p>
            <p className="offclock-copy">6 AM tip-offs in IST.</p>
          </div>
        </div>

        <div className="offclock-card offclock-card-compact adventure-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="offclock-photo" src="/images/blr-auto.jpg" alt="Auto ride across Bengaluru" loading="lazy" />
          <div className="offclock-body-compact">
            <p className="offclock-mini-label">Adventure</p>
            <p className="offclock-copy">auto across blr, no destination.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
