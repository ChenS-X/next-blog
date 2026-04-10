// src/components/RagChatInterface.tsx
'use client';

import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

interface RagChatInterfaceProps {
  onClose?: () => void; // 用于侧边栏关闭
  isSidebar?: boolean;  // 标识是否在侧边栏模式中
}

export default function RagChatInterface({ onClose, isSidebar = false }: RagChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: '你好！我是你的 AI 助手，有什么可以帮你的吗？' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    // 模拟 AI 回复
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: `收到: ${input}` }]);
    }, 500);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-stone-900 ${isSidebar ? 'w-full' : ''}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-lg font-semibold">RAG 智能问答</h2>
        {isSidebar && onClose && (
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full">
            <X size={20} />
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入问题..."
            className="flex-1 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSend}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}