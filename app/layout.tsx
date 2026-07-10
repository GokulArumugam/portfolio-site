import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gokul Arumugam — Data Engineer",
  description: "Data engineering projects, notes, and experiments by Gokul Arumugam.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="wordmark" href="/">Gokul Arumugam</Link>
            <nav aria-label="Primary navigation">
              <Link href="/projects">Projects</Link>
              <Link href="/blog">Blog</Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer>Built with curiosity, data, and an unreasonable number of SQL queries.</footer>
        </div>
      </body>
    </html>
  );
}
