"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "About Me", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden sm:flex gap-8 text-sm font-medium">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/page/")
              : pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors relative py-1",
                isActive
                  ? "text-stone-900 dark:text-stone-100"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100",
              )}
            >
              {item.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile Menu Button */}
      <button
        id="mobile-menu-button"
        className="sm:hidden p-2 -mr-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-md sm:hidden"
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 z-[70] bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 p-8 pt-24 sm:hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              <button
                id="close-dropdown-button"
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 dark:text-stone-500 dark:hover:text-stone-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>

              <nav className="flex flex-col gap-6 items-center text-center">
                {navItems.map((item, index) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/" || pathname.startsWith("/page/")
                      : pathname === item.href ||
                        pathname.startsWith(item.href);

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="w-full"
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "text-3xl font-bold transition-all inline-flex items-center gap-4 group",
                          isActive
                            ? "text-stone-900 dark:text-stone-100"
                            : "text-stone-400 dark:text-stone-600 hover:text-stone-900 dark:hover:text-stone-100",
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-dot-mobile"
                            className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          />
                        )}
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-16 pt-8 border-t border-stone-100 dark:border-stone-900 flex flex-col items-center">
                <div className="flex gap-12">
                  <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight hover:opacity-70 transition-opacity flex items-center gap-1.5"
                  >
                    <Image
                      src="/next-blog/images/pangxie02.png"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="h-8 w-auto"
                    />
                    NextBlog.
                  </Link>
                  <a
                    href="https://github.com/ChenS-X"
                    className="text-lg font-semibold tracking-tight hover:opacity-70 transition-opacity flex items-center gap-1.5"
                  >
                    <Image
                      src="/next-blog/images/github.svg"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="h-8 w-auto"
                    />
                    GitHub
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
