'use client'

import { Mail } from "lucide-react";
import { useFooter } from "../contexts/FooterContext";
export default function ConditionalFooter() {
  const { showFooter } = useFooter();

  if (!showFooter) return null;

  return (
    <footer className="border-t border-stone-100 dark:border-stone-900 py-16">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-start gap-8">
        <p className="text-stone-400 dark:text-stone-600 text-sm">
          &copy; {new Date().getFullYear()} NextBlog.
        </p>
        <div className="flex flex-col gap-4 text-sm text-stone-400 dark:text-stone-600">
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_PAGE || ""}
            target="_blank"
            className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center"
          >
            <Mail className="w-4 h-4" />
            chensxyouxiang@163.com
          </a>
        </div>
      </div>
    </footer>
  );
}
