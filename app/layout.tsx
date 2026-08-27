import type { Metadata } from "next";
import Link from "next/link";
import { socials } from "@/lib/personal";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gokul Arumugam — Data Engineer",
  description: "Self-taught data engineer at PhonePe. Projects, notes, and the unglamorous parts of data at scale.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t='light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&family=Ubuntu+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="wordmark" href="/">Gokul Arumugam</Link>
            <nav aria-label="Primary navigation">
              <Link href="/projects">Projects</Link>
              <Link href="/blog">Blog</Link>
              <ThemeToggle />
            </nav>
          </header>
          <main>{children}</main>
          <footer>
            <span>Built with curiosity, data, and an unreasonable number of SQL queries.</span>
            <span className="footer-links">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
