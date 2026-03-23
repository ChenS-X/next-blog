---
title: "Next.js Static Site Generation Guide"
date: "2026-03-24"
description: "A deep dive into how Next.js handles static site generation for blogs."
headerImage: "https://picsum.photos/seed/blog2/1200/600"
thumbnail: "https://picsum.photos/seed/blog2/400/300"
---

# Next.js SSG Guide

Static Site Generation (SSG) is a pre-rendering method that generates HTML at build time.

## How it works

When you run `next build`, Next.js pre-renders each page into a static HTML file.

```javascript
export async function generateStaticParams() {
  // Get all post slugs
  return [{ slug: 'post-1' }, { slug: 'post-2' }];
}
```

## Benefits

1. **Performance**: HTML is served from a CDN.
2. **Security**: No database or server-side code to exploit.
3. **Cost**: Hosting static files is often free.

Stay tuned for more!
