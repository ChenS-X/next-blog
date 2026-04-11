"use client";

import React, { useState, useEffect, useRef } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import Image from "next/image";
import { useTheme } from "next-themes";

interface DraggableChatTriggerProps {
  onClick: () => void;
  onSwitchSide: (isRight: boolean) => void;
}

export default function DraggableChatTrigger({
  onClick,
  onSwitchSide,
}: DraggableChatTriggerProps) {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  const { resolvedTheme } = useTheme();

  const positionRef = useRef({ x: 0, y: 0 });

  // 记录当前按钮是靠左还是靠右，用于 resize 时重新吸附
  // true = 右侧, false = 左侧
  const sideRef = useRef(true);

  const buttonSize = 56; // 按钮大小

  // 跟踪组件是否已挂载，已解决服务端渲染 hydration  mismatch 或初始动画问题
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 初识位置：右下角
  const [position, setPosition] = useState({
    x: 1000000,
    y: 1000000,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 用于区分时点击还是拖动
  const hasMoved = useRef(false);

  // 记录按下时的初始坐标，用于计算移动距离
  const startPos = useRef({ x: 0, y: 0 });

  // 2. 在客户端挂载后，立即设置初始位置到右下角
  // 这样可以确保 SSR 生成的 HTML 和客户端首次渲染后的 DOM 结构一致（或者通过 suppressHydrationWarning 处理轻微差异，但最好逻辑一致）
  useEffect(() => {
    const initialPos = {
      x: window.innerWidth - buttonSize - 26,
      y: window.innerHeight - buttonSize - 26,
    };
    positionRef.current = initialPos;
    setPosition(initialPos);
  }, []);

  // 监听窗口大小变化，根据当前吸附侧重新计算位置
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // 获取当前的 Y 坐标
      let currentY = positionRef.current.y;

      // 1. 处理 Y 轴：确保不超出底部，也不超出顶部
      const maxY = currentHeight - buttonSize - 16; // 底部留 16px
      const minY = 16; // 顶部留 16px

      // 如果当前 Y 超出了新的高度范围，进行修正
      if (currentY > maxY) {
        currentY = maxY;
      } else if (currentY < minY) {
        currentY = minY;
      }

      // 2. 处理 X 轴：根据 sideRef 重新吸附到左侧或右侧
      let newX = positionRef.current.x;
      const margin = 16; // 边距

      if (sideRef.current) {
        // 如果之前在右侧，重新计算右侧位置
        newX = currentWidth - buttonSize - margin - 10;
      } else {
        // 如果之前在左侧，重新计算左侧位置
        newX = margin;
      }

      const newPos = { x: newX, y: currentY };

      // 只有当位置确实发生变化时才更新 state
      if (
        newPos.x !== positionRef.current.x ||
        newPos.y !== positionRef.current.y
      ) {
        positionRef.current = newPos;
        setPosition(newPos);
      }
    };

    // 添加防抖
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // 处理鼠标/触摸开始
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    hasMoved.current = false;

    // 记录起始位置
    startPos.current = { x: clientX, y: clientY };

    // 计算鼠标点击相对于元素左上角的偏移
    setDragOffset({
      x: clientX - positionRef.current.x,
      y: clientY - positionRef.current.y,
    });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleStart(e.clientX, e.clientY);
  };
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  // 处理移动
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    // hasMoved.current = true;
    if (!hasMoved.current) {
      const dx = clientX - startPos.current.x;
      const dy = clientY - startPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        // 阈值为5px
        hasMoved.current = true;
      } else {
        return;
      }
    }

    let newX = clientX - dragOffset.x;
    let newY = clientY - dragOffset.y;

    // console.log(newX, newY)

    // const buttonSize = 56; // w-14 h-14 的大小
    const maxX = window.innerWidth - buttonSize;
    const maxY = window.innerHeight - buttonSize;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    const newPos = { x: newX, y: newY };
    positionRef.current = newPos;

    setPosition(newPos);
  };

  const onMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };
  const onTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  // 处理结束
  const handleEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const currentX = positionRef.current.x;
    const currentY = positionRef.current.y;

    // 自动吸附，判断靠近哪个边
    // const buttonSize = 56; // w-14 h-14 的大小
    const threshold = window.innerWidth / 2;

    let finalX = currentX;

    if (currentX + buttonSize / 2 < threshold) {
      // 靠近左边
      finalX = 16; // 距离左边16px
    } else {
      // 靠近右边
      finalX = window.innerWidth - buttonSize - 26; // 距离右边16px
    }

    // Y轴保持当前位置，但也要确保不超出屏幕
    const maxY = window.innerHeight - buttonSize; // 距离底部16px
    const finalY = Math.max(16, Math.min(currentY, maxY)); // 距离顶部16px

    const finalPos = { x: finalX, y: finalY };

    positionRef.current = finalPos;

    setPosition(finalPos);

    const isRight = currentX + buttonSize / 2 > threshold;
    sideRef.current = isRight;

    onSwitchSide(isRight);
  };

  const onMouseUp = () => {
    handleEnd();
  };
  const onTouchEnd = () => {
    handleEnd();
  };

  // 全局事件监听
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    // 如果在拖动过程中发生点击事件，则不触发 onClick
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // 判断当前触发按钮的位置，判断在左边还是右边
    onClick();
  };

  // 【修复】根据 mounted 状态和 resolvedTheme 动态确定图片路径
  // 如果未挂载，使用一个默认路径或空，避免 SSR/Client 不匹配
  // 注意：这里假设你有一个默认的主题图片，或者在 mounted 之前隐藏图片
  const themeSuffix = mounted
    ? resolvedTheme === "dark"
      ? "dark"
      : "light"
    : "light";
  const imageSrc = `/next-blog/images/chatbot_${themeSuffix}.svg`;

  return (
    <>
      {/* 【关键】定义自定义摇摆动画 */}
      <style jsx global>{`
        @keyframes wobble-horizontal {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          15% {
            transform: translateX(-4px) rotate(-5deg);
          }
          30% {
            transform: translateX(3px) rotate(3deg);
          }
          45% {
            transform: translateX(-3px) rotate(-3deg);
          }
          60% {
            transform: translateX(2px) rotate(2deg);
          }
          75% {
            transform: translateX(-1px) rotate(-1deg);
          }
        }
        /* 只有当父级不是 dragging 状态时，hover 才触发 */
        .group:not(.is-dragging):hover .wobble-icon {
          animation: wobble-horizontal 1s ease-in-out infinite;
        }
      `}</style>
      <div
        className={`fixed z-50 cursor-grab active:cursor-grabbing touch-none select-none group ${isDragging ? "is-dragging" : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          transition: isDragging ? "none" : "all 0.2s ease-in-out",
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <button
          onClick={handleClick}
          className={`w-14 h-14 bg-white dark:bg-stone-950 shadow-[0px_0px_10px_2px_rgba(0,0,0,0.25)] dark:shadow-[0_0_10px_2px_rgba(255,255,255,0.6)] rounded-full transition-all flex items-center justify-center ${isDragging ? "scale-70 shadow-xl" : ""}`}
          aria-label="Open Chat"
        >
          {" "}
          <div className="wobble-icon relative">
            <div className="w-1 h-1 rounded-full bg-red-500 absolute top-[2px] right-[2px]"></div>
            <Image
              key={imageSrc} // 当 src 变化时，React 会替换整个节点，避免属性不匹配警告
              src={imageSrc}
              alt="Chat"
              width={28}
              height={28}
              className="select-none pointer-events-none"
            />
          </div>
        </button>
      </div>
    </>
  );
}
