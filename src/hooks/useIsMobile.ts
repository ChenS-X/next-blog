// src/hooks/useIsMobile.ts
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  // 初始值设为 undefined，表示“尚未确定”
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // 初始化检查
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 立即执行一次
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);

    // 清理监听器
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}