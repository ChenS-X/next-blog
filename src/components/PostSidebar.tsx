'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, List, X } from 'lucide-react';
import { PostData } from '@/src/lib/posts';

interface PostSidebarProps {
  posts: PostData[];
  currentSlug: string;
}

export default function PostSidebar({ posts, currentSlug }: PostSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Expand the category of the current post by default
    const currentPost = posts.find(p => p.slug === currentSlug);
    return currentPost ? { [currentPost.category]: true } : {};
  });

  // Group posts by category
  const groupedPosts = posts.reduce((acc, post) => {
    if (!acc[post.category]) {
      acc[post.category] = [];
    }
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, PostData[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <>
      {/* Toggle Button - Only visible on Desktop */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl hover:scale-110 transition-transform hidden md:flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-500"
        title="Open Navigation"
      >
        <List className="w-6 h-6" />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 hidden md:block"
            />
            
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 z-[60] shadow-2xl hidden md:flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 dark:border-stone-900 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Navigation</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-2">
                  {Object.entries(groupedPosts).map(([category, categoryPosts]) => (
                    <div key={category} className="space-y-1">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors text-left group"
                      >
                        {expandedCategories[category] ? (
                          <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-emerald-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-500" />
                        )}
                        <span className="text-sm font-bold text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100">
                          {category}
                        </span>
                        <span className="ml-auto text-[10px] font-mono text-stone-300 dark:text-stone-700">
                          {categoryPosts.length}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {expandedCategories[category] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-4 border-l border-stone-100 dark:border-stone-900"
                          >
                            <div className="py-1 pl-4 space-y-1">
                              {categoryPosts.map((post) => (
                                <Link
                                  key={post.slug}
                                  href={`/posts/${post.slug}`}
                                  className={`block p-2 rounded-lg text-sm transition-all ${
                                    currentSlug === post.slug
                                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                                      : 'text-stone-500 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900/50'
                                  }`}
                                >
                                  {post.title}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 dark:border-stone-900">
                <Link 
                  href="/"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Back to Home
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
        }
      `}</style>
    </>
  );
}
