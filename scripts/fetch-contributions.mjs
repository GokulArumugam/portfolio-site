// Fetches the GitHub contribution calendars for both accounts at build time
// and writes a combined dataset consumed by ContributionChart.
//
// Requires GITHUB_TOKEN in the environment (the Pages workflow passes
// secrets.GITHUB_TOKEN). If the token is missing or the fetch fails, we write
// nothing and the site falls back to the third-party chart image.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";

const OUT = "lib/contributions.json";
const USERS = ["GokulArumugam", "gokulguugu"];

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

async function fetchCalendar(user, token) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: QUERY, variables: { login: user } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${user}`);
  const body = await res.json();
  if (body.errors) throw new Error(`GraphQL error for ${user}: ${JSON.stringify(body.errors)}`);
  return body.data.user.contributionsCollection.contributionCalendar;
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.log("contributions: GITHUB_TOKEN not set — keeping previous data / chart fallback");
  process.exit(0);
}

try {
  const calendars = await Promise.all(USERS.map((u) => fetchCalendar(u, token)));

  // Merge by date across accounts
  const byDate = new Map();
  let total = 0;
  for (const cal of calendars) {
    for (const week of cal.weeks) {
      for (const day of week.contributionDays) {
        const prev = byDate.get(day.date) ?? 0;
        byDate.set(day.date, prev + day.contributionCount);
        total += day.contributionCount;
      }
    }
  }

  // Rebuild a continuous week/column structure anchored to the first week
  const dates = [...byDate.keys()].sort();
  if (!dates.length) throw new Error("no contribution data returned");
  const days = dates.map((date) => byDate.get(date));
  const max = Math.max(...days, 1);

  const data = {
    generatedAt: new Date().toISOString(),
    users: USERS,
    total,
    max,
    days: dates.map((date, i) => ({ date, count: days[i] })),
  };

  mkdirSync(OUT.split("/").slice(0, -1).join("/"), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data));
  console.log(`contributions: wrote ${total} contributions across ${dates.length} days (${USERS.join(" + ")})`);
} catch (err) {
  console.log(`contributions: fetch failed (${err.message}) — keeping previous data / chart fallback`);
  if (!existsSync(OUT)) process.exit(0); // no data yet — fallback chart will render
  process.exit(0);
}
