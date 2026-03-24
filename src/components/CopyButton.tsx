"use client";
import { toast } from "sonner";
export default function CopyButton({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const onCopyHandler = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("复制成功~");
    } catch (error) {
      toast.error("复制失败，请手动操作！");
    }
  };
  return (
    <button
      onClick={onCopyHandler}
      className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
    >
      {children}
    </button>
  );
}
