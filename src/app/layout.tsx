import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/src/index.css";
import "highlight.js/styles/github-dark.css";
import { ThemeProvider } from "@/src/components/ThemeProvider";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { Navbar } from "@/src/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "sonner";
import { FooterProvider } from "../contexts/FooterContext";
import ConditionalFooter from "../components/ConditionalFooter";
import RagChatGlobalEntrance from "../components/RagChatGlobalEntrance";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Blog",
  description: "A clean, minimalist blog built with Next.js and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen flex flex-col transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FooterProvider>
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-stone-950/70 backdrop-blur-lg border-b border-stone-100 dark:border-stone-900">
              <nav className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
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
                <div className="flex items-center gap-4 sm:gap-8">
                  <Navbar />
                  <ThemeToggle />
                </div>
              </nav>
            </header>

            <main className="flex-grow">{children}</main>

            {/* 3. 这里需要是一个客户端组件才能使用 useContext，或者我们将 Footer 提取为客户端组件 */}
            <ConditionalFooter />

            {/* 添加全局聊天入口 */}
            <RagChatGlobalEntrance />

            <Toaster position="top-center" />
          </FooterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
