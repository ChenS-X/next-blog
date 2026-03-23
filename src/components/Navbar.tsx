'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "About Me", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="hidden sm:flex gap-8 text-sm font-medium">
      {navItems.map((item) => {
        const isActive = item.href === '/' 
          ? (pathname === '/' || pathname.startsWith('/page/'))
          : (pathname === item.href || pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors relative py-1",
              isActive 
                ? "text-stone-900 dark:text-stone-100" 
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
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
  );
}
