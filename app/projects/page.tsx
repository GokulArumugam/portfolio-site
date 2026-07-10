import Link from "next/link";
import { getProjects } from "@/lib/content";

export const metadata = { title: "Projects — Gokul Arumugam" };

export default function ProjectsPage() {
  return (
    <section>
      <div className="eyebrow">Selected systems</div>
      <h1 className="page-title">Projects</h1>
      <div className="listing">
        {getProjects().map((project) => (
          <Link className="listing-item" href={`/projects/${project.slug}`} key={project.slug}>
            <span className="listing-meta">{project.metadata.metric}</span>
            <span>
              <strong>{project.metadata.title}</strong>
              <p>{project.metadata.description}</p>
            </span>
            <span className="arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
