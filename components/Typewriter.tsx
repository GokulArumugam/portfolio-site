"use client";

import { useEffect, useState } from "react";

export default function Typewriter({ lines }: { lines: string[] }) {
  const [text, setText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(lines[0]);
      return;
    }
    const line = lines[lineIndex % lines.length];
    const delay = phase === "typing" ? 55 : phase === "deleting" ? 26 : 1700;
    const timer = setTimeout(() => {
      if (phase === "typing") {
        const next = line.slice(0, text.length + 1);
        setText(next);
        if (next === line) setPhase("pausing");
      } else if (phase === "pausing") {
        setPhase("deleting");
      } else {
        const next = line.slice(0, text.length - 1);
        setText(next);
        if (next.length === 0) {
          setLineIndex((i) => (i + 1) % lines.length);
          setPhase("typing");
        }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, phase, lineIndex, lines]);

  return (
    <span className="typewriter">
      {text}
      <span className="typewriter-caret" aria-hidden="true" />
    </span>
  );
}
