import Link from "next/link";
import { getPosts } from "@/lib/content";

export const metadata = { title: "Blog — Gokul Arumugam" };

export default function BlogPage() {
  return (
    <section>
      <div className="eyebrow">Field notes</div>
      <h1 className="page-title">Blog</h1>
      <div className="listing">
        {getPosts().map((post) => (
          <Link className="listing-item" href={`/blog/${post.slug}`} key={post.slug}>
            <span className="listing-meta">{post.metadata.date}</span>
            <span>
              <strong>{post.metadata.title}</strong>
              <p>{post.metadata.description}</p>
            </span>
            <span className="arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
