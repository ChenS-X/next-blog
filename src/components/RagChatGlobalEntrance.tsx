"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import DraggableChatTrigger from "./DraggableChatTrigger";
// import RagChatInterface from './RagChatInterface';

export default function RagChatGlobalEntrance() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sideByRight, setSideByRight] = useState(true);

  // 用于跟踪组件是否已挂载，避免服务端渲染 hydration  mismatch 或初始动画问题
  const [mounted, setMounted] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 监听侧边栏开关状态，控制 body 滚动
  useEffect(() => {
    if (!mounted) return;

    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      // 记录当前滚动位置，以便恢复（可选，简单场景下 position:fixed 通常足够，但可能导致跳回顶部）
      // 更复杂的方案需要记录 scrollY 并在关闭时恢复
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isSidebarOpen, mounted]);

  useEffect(() => {
    // 切换的瞬间，禁用 动画
    if(!mounted) return;
    chatRef.current?.style.setProperty("transition", "none");
    setTimeout(() => {
      chatRef.current?.style.setProperty(
        "--sidebar-transform",
        sideByRight ? "translate-x-full" : "-translate-x-full",
      );
      chatRef.current?.style.setProperty("transition", "all .3s ease-in-out");
    }, 50);
  }, [sideByRight]);

  // 移动端：只在 Navbar 里显示链接即可，这里不需要渲染悬浮球
  if (isMobile) {
    return null;
  }

  // 计算侧边栏的变换类名
  // 如果未挂载，隐藏以避免 SSR 闪烁
  // 如果打开，translate-0
  // 如果关闭且在右边，translate-x-full (移出右边界)
  // 如果关闭且在左边，-translate-x-full (移出左边界)
  const sidebarTransformClass = !mounted
    ? "hidden"
    : isSidebarOpen
      ? "translate-x-0"
      : sideByRight
        ? "translate-x-full"
        : "-translate-x-full";

  const overlayClass = !mounted
    ? "hidden"
    : isSidebarOpen
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none";

  // PC 端：渲染可拖动触发器和侧边栏
  return (
    <>
      <DraggableChatTrigger
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onSwitchSide={(isRight: boolean) => setSideByRight(isRight)}
      />

      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${overlayClass}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* 侧边栏 */}
      <div
        ref={chatRef}
        className={`fixed top-0 ${sideByRight ? "right-0" : "left-0"} h-full w-[450px] max-w-full bg-white dark:bg-stone-900 shadow-2xl z-50 border-l border-stone-200 dark:border-stone-800 transform transition-transform duration-300 ease-in-out ${sidebarTransformClass}`}
      >
        {/* 头部：标题和关闭按钮 */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            RAG Chat
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-stone-600 dark:text-stone-400"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="h-[calc(100%-60px)] overflow-y-auto p-4">
          {/* 这里可以放入实际的 RagChatInterface 组件 */}
          {/* <RagChatInterface isSidebar={true} /> */}

          {/* 临时占位内容 */}
          <div className="text-stone-600 dark:text-stone-400">
            Chat interface content goes here...
          </div>
        </div>
      </div>
    </>
  );
}
