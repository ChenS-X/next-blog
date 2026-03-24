import { getCategories, getSortedPostsData } from "@/src/lib/posts";
import Link from "next/link";

export default function CategoriesPage() {
  const categories = getCategories();
  const posts = getSortedPostsData();

  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = posts.filter(post => post.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-12">
        Categories
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/categories/${category.toLowerCase()}`}
            className="group block p-8 rounded-2xl border border-stone-100 dark:border-stone-900 bg-white dark:bg-stone-950 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                {categoryCounts[category]} {categoryCounts[category] === 1 ? 'Post' : 'Posts'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
              {category}
            </h2>
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Explore all posts in the {category} category.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
