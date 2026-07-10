import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: `${post.metadata.title} — Gokul Arumugam`, description: post.metadata.description } : {};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { Content } = post;

  return (
    <article className="prose">
      <div className="eyebrow">Blog · {post.metadata.date}</div>
      <Content />
    </article>
  );
}
