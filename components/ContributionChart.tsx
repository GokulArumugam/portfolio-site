import contributions from "@/lib/contributions.json";

type Day = { date: string; count: number };

function level(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 4) return Math.min(count, 4);
  if (count >= Math.ceil(max * 0.75)) return 4;
  if (count >= Math.ceil(max * 0.5)) return 3;
  if (count >= Math.ceil(max * 0.25)) return 2;
  return 1;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ContributionChart() {
  const days: Day[] = contributions.days;
  const max: number = contributions.max;

  // Columns = weeks (7 rows each). The first day of the dataset is a Sunday
  // (GitHub weeks start on Sunday), so weeks chunk cleanly.
  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const cell = 11;
  const gap = 3;
  const labelH = 18;
  const width = weeks.length * (cell + gap) + 4;
  const height = 7 * (cell + gap) + labelH + 4;

  // Month labels: first week in which a new month starts (min 3 columns apart)
  const monthLabels: { x: number; label: string }[] = [];
  let lastMonth = -1;
  let lastLabelX = -99;
  weeks.forEach((week, wi) => {
    const month = new Date(week[0].date).getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      if (wi < weeks.length - 1 && wi - lastLabelX > 2) {
        monthLabels.push({ x: wi * (cell + gap), label: MONTHS[month] });
        lastLabelX = wi;
      }
    }
  });

  return (
    <div className="gh-card-wrap">
      <svg
        className="gh-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        width="828"
        height="128"
        role="img"
        aria-label={`GitHub contribution calendar for ${contributions.users.join(" and ")}: ${contributions.total} contributions in the last year`}
      >
        {monthLabels.map((m) => (
          <text key={m.label + m.x} x={m.x} y={12} className="gh-chart-month">
            {m.label}
          </text>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const count = day.count;
            const lvl = level(count, max);
            return (
              <rect
                key={day.date}
                className={`gh-day gh-day-${lvl}`}
                x={wi * (cell + gap)}
                y={labelH + di * (cell + gap)}
                width={cell}
                height={cell}
                rx={2.5}
              >
                <title>{`${day.date}: ${count} contribution${count === 1 ? "" : "s"}`}</title>
              </rect>
            );
          }),
        )}
      </svg>
      <p className="gh-chart-meta">
        {contributions.total} contributions in the last year · both accounts combined ·
        synced {new Date(contributions.generatedAt).toISOString().slice(0, 10)}
      </p>
    </div>
  );
}
