'use client';

import { useEffect, useRef } from 'react';

interface PostContentProps {
  html: string;
}

export default function PostContent({ html }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const preBlocks = contentRef.current.querySelectorAll('pre');
    
    preBlocks.forEach((pre) => {
      // Avoid duplicate wrappers if useEffect runs multiple times
      if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper relative group my-8';
      
      // Insert wrapper before pre
      pre.parentNode?.insertBefore(wrapper, pre);
      // Move pre into wrapper
      wrapper.appendChild(pre);

      // Create button
      const button = document.createElement('button');
      button.className = 'copy-button absolute top-3 right-3 p-2 rounded-lg bg-stone-800/50 text-stone-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-stone-700 hover:text-white border border-stone-700/50 backdrop-blur-sm z-10';
      button.setAttribute('aria-label', 'Copy code');
      button.title = 'Copy code';
      
      const copyIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      `;
      const checkIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon hidden text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
      `;
      
      button.innerHTML = `${copyIcon}${checkIcon}`;
      
      button.onclick = async () => {
        // Get text from code tag if it exists, otherwise from pre
        const codeElement = pre.querySelector('code');
        const textToCopy = codeElement ? codeElement.innerText : pre.innerText;
        
        try {
          await navigator.clipboard.writeText(textToCopy);
          
          const cIcon = button.querySelector('.copy-icon');
          const chIcon = button.querySelector('.check-icon');
          
          cIcon?.classList.add('hidden');
          chIcon?.classList.remove('hidden');
          button.classList.add('border-emerald-500/50', 'bg-emerald-500/10');
          
          setTimeout(() => {
            cIcon?.classList.remove('hidden');
            chIcon?.classList.add('hidden');
            button.classList.remove('border-emerald-500/50', 'bg-emerald-500/10');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      };

      wrapper.appendChild(button);
    });
  }, [html]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-stone dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-600 dark:prose-a:text-emerald-500 prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
