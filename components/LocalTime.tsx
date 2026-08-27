"use client";

import { useEffect, useState } from "react";

export default function LocalTime() {
  const [label, setLabel] = useState("Bengaluru, India");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setLabel(`Bengaluru · ${fmt.format(new Date()).toLowerCase()} IST`);
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return <span className="local-time">{label}</span>;
}
