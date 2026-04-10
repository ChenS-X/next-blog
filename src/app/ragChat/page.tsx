"use client";
import RagChatInterface from "@/src/components/RagChatInterface";
import { useFooter } from "@/src/contexts/FooterContext";
import React, { useEffect } from "react";

type Props = {};

const page = (props: Props) => {
  // 进入这个页面后隐藏 Footer
  const { setShowFooter } = useFooter();

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

  return (
    <div>
      <RagChatInterface isSidebar={false} />
    </div>
  )
};

export default page;
