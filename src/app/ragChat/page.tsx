"use client";
import RagChatInterface from "@/src/components/RagChatInterface";
import { useFooter } from "@/src/contexts/FooterContext";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

type Props = {};

const page = (props: Props) => {
  const router = useRouter();
  // 进入这个页面后隐藏 Footer
  const { setShowFooter } = useFooter();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 组件挂载时，设置footer为隐藏
    setShowFooter(false);

    // 重要，清理函数，当用户离开这个页面时，确保footer重新显示
    // 否则用户离开这个页面后，footer将一直隐藏，影响其他页面的正常显示
    return () => {
      // 组件卸载时，设置footer为显示
      setShowFooter(true);
    };
  }, [setShowFooter]);


  useEffect(() => {
    if(isMobile === false) {
      router.replace('/')
    }
  }, [isMobile, router])

  // 如果还在初始化，可以返回 null 或 loading，避免闪烁
  if (isMobile === undefined) return null; 
  if (!isMobile) return null; // 或者显示 Loading


  return (
    <div className="h-[calc(100vh-81px)] w-full overflow-hidden">
      <RagChatInterface isSidebar={false} />
    </div>
  )
};

export default page;
