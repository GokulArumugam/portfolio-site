import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/content";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: `${project.metadata.title} — Gokul Arumugam`, description: project.metadata.description } : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const { Content } = project;

  return (
    <article className="prose">
      <div className="eyebrow">Project · {project.metadata.metric}</div>
      <Content />
    </article>
  );
}
