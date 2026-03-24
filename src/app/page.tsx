import { getSortedPostsData, getCategories } from "@/src/lib/posts";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pin } from "lucide-react";

export default function Home() {
  const currentPage = 1;
  const postsPerPage = 5;
  
  const allPostsData = getSortedPostsData();
  const categories = getCategories();
  const totalPages = Math.ceil(allPostsData.length / postsPerPage);
  
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = allPostsData.slice(startIndex, endIndex);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <header className="mb-24">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-stone-900 dark:text-stone-100">
          Writing & Thoughts.
        </h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed mb-12">
          Exploring technology, design, and the art of building software. 
          A collection of notes and deep dives into the tools I use every day.
        </p>
        
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/categories/${category.toLowerCase()}`}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-stone-100 dark:border-stone-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300"
            >
              {category}
            </Link>
          ))}
        </div>
      </header>

      <div className="space-y-16">
        {paginatedPosts.map(({ slug, date, title, description, category, sticky }) => (
          <Link
            key={slug}
            href={`/posts/${slug}`}
            className="group block"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 mb-4">
              <time className="text-sm font-medium text-stone-400 dark:text-stone-600 tabular-nums shrink-0">
                {format(parseISO(date), 'MMM d, yyyy')}
              </time>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                  {category}
                </span>
                {sticky && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                    <Pin className="w-3 h-3" />
                    Sticky
                  </span>
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-3 group-hover:opacity-60 transition-opacity">
              {title}
            </h2>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
              {description}
            </p>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-20 pt-12 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between">
          <div className="text-sm font-bold opacity-20 cursor-not-allowed">
            &larr; Previous
          </div>
          <div className="text-xs font-mono text-stone-400">
            Page {currentPage} of {totalPages}
          </div>
          <Link
            href={`/page/2`}
            className="text-sm font-bold hover:opacity-50 transition-opacity"
          >
            Next &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
