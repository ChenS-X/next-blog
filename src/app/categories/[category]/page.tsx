import { getPostsByCategory, getCategories } from "@/src/lib/posts";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pin } from "lucide-react";

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    category: category.toLowerCase(),
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const posts = getPostsByCategory(category);

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="mb-16">
        <Link href="/categories" className="text-sm font-medium text-stone-400 dark:text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-12 inline-block">
          &larr; Back to all categories
        </Link>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-8 capitalize">
          Category: {category}
        </h1>
        <p className="text-xl text-stone-500 dark:text-stone-400 leading-relaxed">
          Showing all {posts.length} {posts.length === 1 ? 'post' : 'posts'} in the {category} category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block"
          >
            <div className="aspect-video relative rounded-2xl overflow-hidden mb-6 bg-stone-100 dark:bg-stone-900">
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                {post.category}
              </span>
              {post.sticky && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                  <Pin className="w-3 h-3" />
                  Sticky
                </span>
              )}
              <time className="text-sm font-medium text-stone-400 dark:text-stone-600 tabular-nums">
                {format(parseISO(post.date), 'MMMM d, yyyy')}
              </time>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors mb-4 leading-tight">
              {post.title}
            </h2>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
