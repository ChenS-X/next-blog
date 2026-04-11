// src/components/RagChatInterface.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Trash2, Send, X } from "lucide-react";

interface RagChatInterfaceProps {
  onClose?: () => void; // 用于侧边栏关闭
  isSidebar?: boolean; // 标识是否在侧边栏模式中
}

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: string[];
}

const STORAGE_KEY = "rag_chat_messages";

export default function RagChatInterface({
  onClose,
  isSidebar = false,
}: RagChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好！我是博客智能助手，可以问我关于文章的任何问题。",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fullAnswerRef = useRef(""); // 用于存储累积的完整回答

  // 加载本地存储消息
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (error) {}
    } else {
      setMessages([
        {
          role: "assistant",
          content: "你好！我是博客智能助手，可以问我关于文章的任何问题。",
        },
      ]);
    }
  }, []);

  // 保存消息到本地存储
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // 自动滚动到底部
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    // 关闭 之前的WebSocket链接
    if (wsRef.current) {
      wsRef.current.close();
    }

    // 建立新的WebSocket链接（后端需要提供 wss 服务）
    const ws = new WebSocket("wss://blog-rag.csx.life/chat");
    wsRef.current = ws;

    ws.onopen = () => {
      // 发送最近10条消息作为上下文（包含刚才添加的用户消息）
      const contextMessages = messages.slice(-10).concat(userMessage);
      ws.send(JSON.stringify({ messages: contextMessages, topK: 3 }));
    };

    let fullAnswer = "";
    ws.onmessage = (event) => {
      const raw = event.data;
      let data;
      try {
        data = JSON.parse(raw);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", raw);
        return;
      }

      if (data.type === "chunk") {
        fullAnswer += data.content;
        fullAnswerRef.current = fullAnswer; // 同步到 ref
        setStreamingContent(fullAnswer);
      } else if (data.type === "end") {
        // 流式结束，保存完整回答
        const assistantMessage: Message = {
          role: "assistant",
          content: fullAnswer,
          source: data.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");
        setLoading(false);
        ws.close();
      } else if (data.type === "error") {
        // 错误处理
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `错误：${data.content}` },
        ]);
        setLoading(false);
        ws.close();
      }
    };

    ws.onerror = () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "连接失败，请稍后重试。" },
      ]);
      setLoading(false);
    };

    // try {
    //   const response = await fetch("https://blog-rag.csx.life/query", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ question: input, topK: 3 }),
    //   });

    //   const data = await response.json();
    //   const assistantMessage: Message = {
    //     role: "assistant",
    //     content: data.context || "抱歉，没有找到相关内容。",
    //     source: data.source || [],
    //   };
    //   setMessages((prev) => [...prev, assistantMessage]);
    // } catch (error) {
    //   console.error("问答请求失败:", error);
    //   setMessages((prev) => [
    //     ...prev,
    //     { role: "assistant", content: "抱歉，没有找到相关内容。" },
    //   ]);
    // } finally {
    //   setLoading(false);
    // }
  };

  // 一键删除上下文缓存
  const onDeleteLocalCache = () => {
    // console.log(messages);
    localStorage.removeItem(STORAGE_KEY);
    const fristAssistantMessage: Message = messages.filter(
      (m) => m.role === "assistant",
    )[0];
    // console.log(fristAssistantMessage)
    setMessages((prev) => [fristAssistantMessage]);
    // setMessages([
    //   {
    //     role: "assistant",
    //     content: "已删除本地缓存，请重新开始会话。",
    //   },
    // ]);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-stone-900 ${isSidebar ? "w-full" : ""}`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-lg font-semibold">RAG 智能问答</h2>
        <div>
          <button
            title="一键删除上下文缓存"
            onClick={onDeleteLocalCache}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
          >
            <Trash2 size={20} />
          </button>
          {isSidebar && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              }`}
            >
              <div className="whitespace-pre-wrap wrap-break-word">
                {msg.content}
              </div>
              {msg.source && msg.source.length > 0 && (
                <div className="text-xs mt-1 opacity-70">
                  来源: {msg.source.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && streamingContent && (
          <div className="flex justify-start">
            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-2 text-stone-900 dark:text-stone-100">
              {streamingContent}
              <span className="animate-pulse">▊</span>
            </div>
          </div>
        )}
        {loading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-2 text-stone-900 dark:text-stone-100">
              正在思考...
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="输入问题..."
            className="flex-1 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          {loading && streamingContent ? (
            // 正在接收流式回复 -> 停止按钮
            <button
              onClick={() => {
                if (wsRef.current) {
                  wsRef.current.close();
                }
                setLoading(false);
                setStreamingContent("");
                const partialAnswer = fullAnswerRef.current;
                if (partialAnswer) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: partialAnswer + "（已中断）",
                    },
                  ]);
                } else {
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "已停止生成。" },
                  ]);
                }
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="停止生成"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            </button>
          ) : (
            // 普通状态或等待响应（按钮禁用）
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          )}
          {/* <button
            disabled={loading}
            onClick={handleSend}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={20} />
          </button> */}
        </div>
      </div>
    </div>
  );
}
