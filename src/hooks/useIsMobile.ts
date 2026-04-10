// src/hooks/useIsMobile.ts
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

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