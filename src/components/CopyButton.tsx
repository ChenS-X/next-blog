"use client";

import { toast } from "sonner";
export default function CopyButton({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const copyHandler = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("复制成功~");
    } catch (error) {
      toast.error("复制失败。请手动复制~");
    }
  };

  return (
    <button onClick={copyHandler} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
      {children}
    </button>
  );
}
