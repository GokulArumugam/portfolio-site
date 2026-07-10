"use client";

import { useEffect, useRef, useState } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";

export default function ChaosDemo() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let player: { dispose: () => void } | undefined;
    let cancelled = false;

    const mount = async () => {
      try {
        const response = await fetch("/chaos-demo.cast", { method: "HEAD" });
        if (!response.ok || !hostRef.current || cancelled) {
          if (!cancelled) setAvailable(false);
          return;
        }
        const { create } = await import("asciinema-player");
        if (cancelled || !hostRef.current) return;
        player = create("/chaos-demo.cast", hostRef.current, {
          fit: "width",
          controls: true,
          idleTimeLimit: 2,
          terminalFontSize: "small",
        });
        setAvailable(true);
      } catch {
        if (!cancelled) setAvailable(false);
      }
    };

    void mount();
    return () => {
      cancelled = true;
      player?.dispose();
    };
  }, []);

  return (
    <div className="chaos-demo" aria-label="Spark failure recovery terminal recording">
      <div ref={hostRef} />
      {available === false && <p>The optional terminal recording is served from <code>/chaos-demo.cast</code> when included with the site.</p>}
    </div>
  );
}
