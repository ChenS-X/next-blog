import { getAllPostSlugs, getPostData } from "@/src/lib/posts";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.slug,
  }));
}

export default async function Post({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  return (
    <article className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-16">
        <Link href="/" className="text-sm font-medium text-stone-400 dark:text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-12 inline-block">
          &larr; Back to home
        </Link>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
            {postData.category}
          </span>
          <time className="text-sm font-medium text-stone-400 dark:text-stone-600 tabular-nums">
            {format(parseISO(postData.date), 'MMMM d, yyyy')}
          </time>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-8 leading-tight">
          {postData.title}
        </h1>
        
        <p className="text-xl text-stone-500 dark:text-stone-400 leading-relaxed">
          {postData.description}
        </p>
      </div>

      {postData.headerImage && (
        <div className="aspect-video relative rounded-2xl overflow-hidden mb-16">
          <img
            src={postData.headerImage}
            alt={postData.title}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="prose prose-stone dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-600 dark:prose-a:text-emerald-500 prose-img:rounded-xl">
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} />
      </div>

      <div className="mt-32 pt-12 border-t border-stone-100 dark:border-stone-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <Link href="/" className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:opacity-70 transition-opacity">
            &larr; Back to home
          </Link>
          
          <div className="flex gap-8 text-sm text-stone-400 dark:text-stone-600">
            <button className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Share on Twitter</button>
            <button className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Copy Link</button>
          </div>
        </div>
      </div>
    </article>
  );
}
