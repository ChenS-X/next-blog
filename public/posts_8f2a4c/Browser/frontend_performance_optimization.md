---
title: "前端性能优化二三事（复习版）💊"
date: "2026-04-10"
description: "聊聊前端性能优化吧，顺带复习一遍了~"
headerImage: "https://pic1.imgdb.cn/item/6a02f4e8b202e0f05b2971bb.gif"
thumbnail: "https://pic1.imgdb.cn/item/6a02f4e8b202e0f05b2971bb.gif"
---

## 前言
> 前端性能优化是一个永恒的话题，本文将从几个核心方面来复习和总结前端性能优化的关键点。

本指南涵盖构建时、加载时、运行时、缓存和监控四个维度，所有代码示例均附有详尽的注释，帮助你理解“为什么这么做”以及“如何落地”。

当然，如果本文有叙述不清晰或错误的地方，还请联系我`chensxyouxiang@163.com`📧


## 一、构建时优化（让打包产物更小、更合理）
### 1.路由懒加载 & 组件懒加载
**为什么需要懒加载**

如果不懒加载，整个应用的所有页面代码都会被打包进一个JS文件中，首屏加载会非常慢。懒加载把不同路由的代码拆成独立文件（chunk）,用户访问哪个路由才下载哪个文件。

**Vue3 路由懒加载**
```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 使用 () => import() 语法实现路由懒加载
// webpackChunkName 注释可以指定 chunk 名称，方便调试和分析
const Home = () => import(/* webpackChunkName: "home" */ '@/views/Home.vue');
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/about', component: About, name: 'About' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

**React 路由懒加载**
```jsx
// App.jsx
import {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

// 使用 React.lazy 实现组件懒加载
const Home = lazy(() => import('./views/Home'));
const About = lazy(() => import('./views/About'));

function App() {
  return (
    <Router>
      {/* Suspense 用于处理懒加载过程中的 fallback 内容（加载提示） */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

**组件懒加载（适用于弹框、抽屉等非首屏组件）**
```html
<!-- Home.vue -->
<template>
  <div>
    <button @click="showDialog = true">打开弹窗</button>
    <DialogInfo v-if="showDialog" @close="showDialog = false"></DialogInfo>
  </div>
</template>
<script>
// 不使用懒加载：import DialogInfo from '@/components/DialogInfo.vue'  ← 会把弹框代码打包进当前页面
// 使用懒加载：只有点击按钮才会加载 DialogInfo 组件的代码
const DialogInfo = () => import(/* webpackChunkName: "dialog-info" */'@/components/DialogInfo.vue');
export default {
  components: { DialogInfo },
  data() {
    return { showDialog: false }
  }
}
</script>
```
**什么时候适合组件懒加载？**
+ 页面 JS 体积过大，首屏不需要的组件可分离。
+ 需要用户交互（点击，滚动）后才出现的组件。
+ 被多个页面复用的重量级组件（如图标库、富文本编辑器）。

<hr>

### 2. 代码分割（Code Splitting）
即使做了路由懒加载，node_modules里的公共库（如 Vue、ElementPlus）可能仍会重复打包。使用`splitChunks`可以把这些公共依赖抽离成单独的文件，多个页面共享同一份库文件，减少总下载量。

**Webpack5 配置**（vue.config.js）
```js
module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all', // 对所有类型的 chunk 进行分割（初始、异步、所有）
        cacheGroups: {
          // 把 node_modules 里的第三方库打包成一个单独的 vendors 文件
          vendors: {
            test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 目录
            name: 'vendors',                // 生成的文件名 vendors.js
            priority: 10,                   // 优先级，数值越大优先抽离，优先级高于默认分组
            reuseExistingChunk: true,       // 如果模块已被打包了，则复用它而不是新建一个 chunk
          },
          // 抽离公共代码（多个页面都用到的代码）
          common: {
            name: 'common',
            minChunks: 2, // 至少被两个 chunk 引用才抽离
            priority: 5,  
            reuseExistingChunk: true, // 如果已经存在一个满足条件的 chunk，则复用它而不是新建一个
          },
        },
      },
    }
  }
}
```

**Vite 配置**（vite.config.js）
```js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 手动将 vue 全家桶打包成一个 chunk
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将 UI 库单独打包
          'ui-lib': ['element-plus'],
        }
      }
    }
  }
}
```

<hr>

### 3.Tree Shaking（摇树优化）
Tree Shaking 是一种通过静态分析代码，去除未使用的部分来减小打包体积的技术。它依赖于 ES6 模块化（import/export）语法，因为 ES6 模块是静态结构，编译器可以在构建时分析哪些模块被使用了。

+ 确保`package.json`里有`sideEffects: false`，告诉构建工具没有副作用，可以安全地摇树。或明确列出有副作用的文件：
```json
{
  "sideEffects": [
    "*.css",         // CSS 文件有副作用（因为它会注入样式）
    "*.scss",
    "@/polyfills.js" // 这个文件执行了全局填充，不能被摇掉
  ]
}
```
+ Webpack 生产模式自动启用 Tree Shaking。开发模式需要手动开启：
```js
// webpack.config.js
module.exports = {
  mode: 'development', // 开发模式默认不开启 Tree Shaking
  optimization: {
    usedExports: true, // 标记未使用的导出，便于 Terser 删除
  },
};
```
**错误示范：默认导出整个对象**
```js
// utils.js
export default {
  add(a, b) { return a + b },
  sub(a, b) { return a - b },
}
// 外部只用了 add，但 sub 也会被保留，因为无法静态分析对象属性的使用情况
```

**正确示范：具名导出**
```js
// utils.js
export function add(a, b) { return a + b }
export function sub(a, b) { return a - b }

// 外部 import { add } from './utils'，sub 会被摇掉
```

<hr>

### 4.代码压缩（JS/CSS）
生产环境必须压缩代码，删除空格、注释、缩短变量名。

JavaScript 压缩（Terser）

**Webpack 5 默认使用 Terser，可自定义配置：**
```js
// vue.config.js 或者 webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
  optimization: {
    minimize: true, // 启用压缩
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,   // 移除所有 console.* 语句（生产环境推荐）
            drop_debugger: true,  // 移除 debugger 语句
          },
          format: {
            comments: false, // 删除注释
          },
        },
        extractComments: false, // 不生成 LICENSE.txt 文件
      }),
    ],
  }
}
```

**CSS 压缩**（CssMinimizerPlugin）
```js
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      // 其他 minimizer（如 TerserPlugin）...
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }, // 删除所有注释
            },
          ],
        },
      }),
    ],
  }
}
```

**删除未使用的 CSS**（PurgeCSS）

很多CSS框架（如Tailwind、ElementUI）包含大量你未用到的样式，需要清理
```js
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html', './src/**/*.vue', './src/**/*.jsx'], // 扫描这些文件，找出用到的类名
      safelist: ['html', 'body'], // 保护这些类名不被删除
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [] // 提取类名的正则，提取 CSS 选择器的正则（匹配类名、id）
    })
  ]
}
```

<hr>

### 5.图片优化（压缩、格式、懒加载）
**自动压缩图片**（ImageMinimizerPlugin）
```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.sharpMinify, // 使用 sharp 进行图片压缩，速度更快
        options: {
          encodeOptions: {
            jpeg: { quality: 80 },   // JPEG 质量 80%
            png: { compressionLevel: 9 }, // PNG 最大压缩
            webp: { quality: 75 },    // 输出 WebP 质量 75%
            avif: { quality: 60 },    // 输出 AVIF 质量 60%
          },
        }
      }
    }),
  ],
}
```
**小图片转 Base64（减少 HTTP 请求）**
```js
// webpack配置
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于 10KB 的图片转为 Base64 内联
          }
        }
      }
    ]
  }
}
```

**图片懒加载（原生 + 降级）**
```html
<!-- 现代浏览器原生支持 loading="lazy"，但是旧浏览器需 polyfill -->
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy" class="lazy" />
```
```js
// 使用 IntersectionObserver 监听图片进入窗口
const lazyImages = document.querySelectorAll('img.lazy');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // data-src 替换为 src
      observer.unobserve(img); // 加载后停止观察
    }
  })
});
lazyImages.forEach(img => observer.observe(img));
```

**使用现代图片格式（WebP/AVIF）配合 \<picture\>**
```html
<picture>
  <!-- 支持 AVIF 的浏览器加载 .avif -->
  <source srcset="image.avif" type="image/avif">
  <!-- 支持 WebP 的浏览器加载 .webp -->
  <source srcset="image.webp" type="image/webp">
  <!-- 降级方案：原图 -->
  <img src="image.jpg" alt="示例图片">
</picture>
```

<hr>

# 二、加载时优化（让资源更快到达用户）
### 1.资源预加载提示

**preload - 提前加载当前页面关键资源（字体、首屏图片、关键JS）**
```html
<!-- 预加载字体，crossorigin必须，因为字体来自烤鱼资源 -->
<link rel="preload" href="https://static.kuaiyuyun.com/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>

<!-- 预加载关键css（通常内联关键 CSS，非关键 CSS 可预加载） -->
<link rel="preload" href="/css/critical.css" as="style">
```

**prefetch – 空闲时加载下一个页面可能用到的资源**
```html
<!-- 访问首页时，提前加载 /about 页面的chunk，这样跳转时几乎秒开 -->
<link rel="prefetch" href="/js/about.chunk.js" as="script">
```

**preconnect & dns-prefetch – 提前建立连接**
```html
<!-- 提前解析第三方域名的 DNS （开销小，建议对所有第三方域名使用） -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预先建立链接（DNS + TCP + TLS），适用于关键资源域名 -->
<link rel="preconnect" href="https://api.example.com"> 
```

**Webpack 自动生成 preload/prefetch：使用魔法注释**
```js
// 告诉 Webpack 这个 chunk 是关键资源，需要被 preload
import(/* webpackPreload: true */ './critical.js');

// 这个 chunk 可以被 prefetch
import(/* webpackPrefetch: true */ './next-page.js');
```
<hr>

### 2.async/defer - 避免阻塞 DOM 解析
| 属性       | 下载时机                   | 执行时机                         | 顺序                     | 适用场景                                           |
| ---------- | -------------------------- | -------------------------------- | ------------------------ | -------------------------------------------------- |
| 无（普通） | 立即下载，阻塞 HTML 解析   | 下载后立即执行，阻塞解析         | 按文档顺序               | 不推荐，除非内联小脚本                             |
| `async`    | 异步下载，不阻塞 HTML 解析 | 下载完成立即执行（可能阻塞解析） | 乱序（谁先下载完执行谁） | 独立第三方脚本，不依赖其他模块的脚本（统计、广告） |
| `defer`    | 异步下载，不阻塞 HTML 解析 | 等待 HTML 解析完成后，按顺序执行 | 按文档顺序               | 依赖 DOM 或控制执行顺序的脚本（框架、UI库）        |
```html
<!-- 统计脚本不依赖 DOM，用 async -->
<script src="https://www.google-analytics.com/analytics.js" async></script>

<!-- Vue 和 Element UI 必须按顺序执行，用 defer -->
<script src="vue.js" defer></script>
<script src="element-ui.js" defer></script>
```

<hr>

### 3.启用 GZip / Brotli 压缩
**构建时预生成.gz 或 .br 文件**（推荐，可以减轻服务器实时压缩压力）。
```js
//vue.config.js
const CompressionPlugin = require('compression-webpack-plugin');
module.exports = {
  configureWebpack: {
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html)$/, // 只压缩这些类型的文件
        threshold: 10240, // 只有大于10KB的文件才压缩
        minRatio: 0.8, // 压缩率小于0.8才生成压缩文件（避免压缩后文件反而变大）
      }),
      // 可选：同时生成 Brotli 压缩文件，Brotli 通常比 GZip 更高效，但兼容性稍差
      new CompressionPlugin({
        algorithm: 'brotliCompress',
        filename: '[path][base].br',
        test: /\.(js|css|html)$/,
        threshold: 10240,
      }),
    ]
  }
}
```

**Nginx 配置优先返回预压缩文件：**
```shell
server {
  # 开启 gzip 动态压缩（作为 fallback）
  gzip on;
  gzip_types text/plain text/css application/javascript image/svg+xml;

  # 优先查找 .gz 静态文件（有 webpack 生成）
  gzip staic on;
  # 如果支持 Brotil 且有 .br 文件，则优先返回 .br
  brotli_static on;

  localtion ~* \.(js|css|html)$ {
    # 尝试请求文件。如果存在.gz/.br 则直接返回，否则返回原文件，由 gzip 动态压缩
    try_files $uri $uri.gz $uri.br =404;
  }
}
```
<hr>

# 三、运行时优化（让页面交互更流畅）
### 1.虚拟滚动（长列表优化）
**问题**：渲染 10000 条 DOM 元素会导致页面卡死。
**解法**：只渲染可视区域内的元素，滚动时动态替换。

**Vue 3 示例（使用`vue-virtual-scroller`）**
```bash
npm install vue-virtual-scroller
```
```html
<template>
  <RecycleScroller 
    :items="items" // 数据源
    :items-size="50" // 每个列项的高度（px）
    key-field="id" // 唯一键
    class="scroller"
  >
    <template #default="{item}">
      <div class="item">{{item.name}}</div>
    </template>
  </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default {
  components: {
    RecycleScroller,
  },
  data() {
    return {
      items: Array(10000).fill().map((_, i) => ({id: i, name: `Item ${i}`}))
    }
  }
}
</script>
<style>
  .scroller {
    height: 500px;
    overflow-y: auto;
  }
  .item {
    height: 50px;
    border-bottom: 1px solid #ccc;
  }
</style>
```

**React 示例（使用`react-window`）**
```jsx
import { FixedSizeList as List} from 'react-window';

const Row = ({index, style}) => (
  <div style={style}>Item {index}</div>
)

const MyList = () => {
  <List height={500} itemCount={10000} itemSize={50} width="100%">
    {Row}
  </List>
}
```
<hr>

### 2.Web Worker - 分离耗时任务
**原理**：Worker 在后台线程运行，不阻塞UI。
**何时用**：纯计算任务（数据加密、图像处理、大量数组运算）耗时 > 50ms且不依赖 DOM。

**主线程代码**：
```js
// main.js
// 创建 Worker，指向 worker.js 文件
const worker = new Worker(new URL('./worker.js', import.meta.url));

// 发送数据
worker.postMessage({numbers: [1,2,3,4,5]});

// 接收 Worker 返回结果
worker.onmessage = e => {
  console.log('计算结果：',e.data);
}

// 可选：错误处理
worker.onerror = err => console.error('Worker 错误', err);
```

**Worker 线程代码**
```js
// worker.js
// 监听主线程的消息
self.onmessage = (e) => {
  const { numbers } = e.data;
  // 模拟耗时计算：求和
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  // 把结果发回主线程
  self.postMessage(sum);
};
```
**注意**：Web Worker 无法访问 DOM，也不能使用 `window` 的大部分属性。

<hr>

### 3.动画平滑 - requestAnimationFrame + transform
`requestAnimationFrame`会在浏览器下一次重绘之前执行回调，频率越60fps（每16.6ms一次），非常适合制作流畅动画

**错误写法（setTimeout导致掉帧）**
```js
let left = 0;
setInterval(() => {
  div.style.left = (left += 2) + 'px'; // 修改left会引发重排
}， 16);
```

**正确写法（使用 transform + requestAnimationFrame）**：
```js
let translateX = 0;
function animate() {
  translateX += 2;
  // 只修改 transform，不引发重排，GPU 加速
  div.style.transform = `translateX(${translateX}px)`;
  requestAnimationFrame(animate); // 下一帧继续执行动画
}
requestAnimationFrame(animate);
```
**优势**：当页面隐藏时，`requestAnimationFrame` 会自动暂停调用，节省资源；使用 `transform` 不会触发重排，性能更好。

<hr>

### 4.避免强制同步布局 & 减少重排
**反面例子（在循环中读写布局属性）**：
```js
const divs = document.querySelectorAll('.box');
for (let i = 0; i < divs.length; i++) {
  // 读取 offsetTop 会强制浏览器重新计算布局（重排）
  const top = divs[i].offsetTop;
  // 再设置样式，又会触发重排
  divs[i].style.top = top + 10 + 'px';
}
```

**正确做法：先读取所有值，再统一写入。**
```js
const divs = document.querySelectorAll('.box');
const tops = [];
for (let i = 0; i < divs.length; i++) {
  tops.push(divs[i].offsetTop);
}
for (let i = 0; i < divs.length; i++) {
  divs[i].style.top = tops[i] + 10 + 'px';
}
```

**或使用 `requestAnimationFrame` 批量修改，或将元素设为 `display: none` 后再操作。**

<hr>

# 四、缓存与监控（强缓存+协商缓存）
**最佳实践**
+ 给静态资源文件名加入hash（如：app.abc123.js），然后设置长期强缓存（一年）。
+ HTML 文件不缓存或短时缓存，确保更新能立即获取最新版本。

**Webpack 自动生成 hash**：
```js
// vue.config.js
module.exports = {
  configureWebpack: {
    output: {
      filename: 'js/[name].[contenthash:8].js', // 入口文件
      chunkFilename: 'js/[name].[contenthash:8].js', // 非入口文件（如路由懒加载）
    }
  }
}
```

**Nginx 配置响应头：**
```shell
location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
  expires 1y; # 强缓存一年
  add_header Cache-Control "public, max-age=31536000, immutable"; # immutable 表示文件内容不变，浏览器可直接使用缓存
}

location = /index.html {
  expires -1; # 不缓存 HTML
  add_header Cache-Control "no-cache, no-store, must-revalidate"; # 协商缓存，确保每次请求都验证最新版本
}
```

<hr>

### 2.Service Worker + Workbox 离线缓存
Service Worker 是浏览器后台脚本，可以拦截网络请求并返回缓存内容，实现离线访问和二次访问秒开。

**使用 Workbox（Webpack 插件）**：
```bash
npm install workbox-webpack-plugin --save-dev
```
```js
// vue.config.js
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  configureWebpack: {
    plugins: [
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,      // 让新 SW 立即接管页面
        skipWaiting: true,       // 跳过等待，直接激活
        runtimeCaching: [        // 运行时缓存策略
          {
            urlPattern: /^https:\/\/api\.example\.com\//,  // 匹配 API 请求
            handler: 'NetworkFirst',    // 优先网络，网络失败则用缓存
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\.(js|css)$/,
            handler: 'StaleWhileRevalidate', // 先返回缓存，后台更新
          },
        ],
      }),
    ],
  },
};
```
**注册 Service Worker（一般在入口文件 main.js）**：
```js
if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => {
      console.log('SW registered:', reg);
    }).catch(err => {
      console.error('SW registration failed:', err);
    });
  })
}
```

<hr>

### 3.性能监控
性能监控的目的是量化用户体验，发现瓶颈，验证优化效果。核心指标是Web Vitals（LCP、FID、CLS），以及补充指标TTI、FCP、INP等。
#### 3.1核心指标详解
|指标|全称|含义|优化目标|影响因素|
|-|-|-|-|-|
|**LCP**|Largest Contentful Paint|页面主要内容（文字、图片、视频）加载完成的实践|<2.5s|服务器响应慢、资源阻塞、图片未优化|
|**FID**|First Input Delay|用户首次交互（点击、按键）到浏览器实际响应的时间|<100ms|主线程执行长任务、JS解析时间过长|
|**CLS**|Cumulative Layout Shift|页面视觉稳定性（意外位移的累计分数）|<0.1|图片无尺寸、动态插入内容、字体切换|
|**FCP**|First Contentful Paint|第一个文本或图片的绘制时间|<1.8s|同LCP|
|**TTI**|Time to Interactive|页面可流畅交互的时间|<3.8s|JS执行时间长、网络慢|
|**INP**|Interaction to Next Paint|所有交互的响应延迟（即将替代FID）|<200ms|长任务、事件处理效率|

#### 3.2如何获取 Web Vitals 数据？
使用官方库`web-vitaks`，可在任何前端项目中集成
```bash
npm install web-vitals
```
```js
// 在main.js或App入口文件中
import { onLCP, onFID, onCLS, onINP, onFID, onTTFB } from 'web-vitals';

// 上报函数（可以把数据发送到自己的监控平台或 Geogle Analytics）
function sendToAnalytics({name, value, rating, id}) {
  console.log(`[Web Vitals] ${name}：${value} (${rating})`);
  // 示例：发送到自己后端接口
  navigator.sendBeacon('/api/pref/log', JSON.stringify({name, value, rating, id}));
}

// 注册各个指标
onLCP(sendToAnalytics); // 最大内容绘制
onFID(sendToAnalytics); // 首次输入延迟
onCLS(sendToAnalytics); // 累积布局偏移
onINP(sendToAnalytics); // 交互延迟（较新）
onFCP(sendToAnalytics); // 首次内容绘制
onTTFB(sendToAnalytics); // 首字节时间
```

#### 3.3开发环境模拟与测试
+ **Chrome DevTools - Lighthouse**：一键生成性能报告，给出优化建议。
+ **Chrome DevTools - Performance**：录制页面加载和交互，分析长任务、重排次数。
+ **WebPageTest（在线）**：设置不同网络、设备地区、查看详细加载瀑布图。
+ **PageSpeed Insights**：谷歌官方工具，模拟移动端数据。


#### 3.4解读指标并采取行动
**LCP差（> 2.5s）可能原因**：
+ 服务器响应慢 -> 优化后端，使用CDN，添加缓存
+ 渲染阻塞资源 -> 内联关键CSS、延迟加载非必要JS。
+ 大图未优化 -> 转换未WebP、压缩、懒加载。

**FID差（> 100ms）可能原因**：
+ 主线程被长任务阻塞 -> 拆分任务（setTimeout、requestIdleCallback）、使用WebWorker
+ 加载了大量 JS -> 代码分割、移除未使用代码。

**CLS差（> 0.1）可能原因**：
+ 图片/视频无宽高 -> 在HTML中添加 `width`和`height`属性，或预留占位空间。
+ 动态插入内容（如广告、弹窗）-> 使用固定尺寸容器，避免布局偏移。
+ 自定义字体加载导致文本重排 -> 使用`font-display: optional`或 `swap`，配合`size-adjust`预留空间。

#### 3.5搭建简单的性能上报服务（示例）
**后端（Node.js Express）接收并存储**：
```js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/perf/log', (req, res) => {
  const data = req.body;
  console.log(`Perf: ${data.name}=${data.value}`);
  // 可存入数据库或日志系统
  res.sendStatus(200);
});
app.listen(3000);
```

**前端使用 `navigator.sendBeacon` 确保页面关闭时也能发送：**
```js
function sendToAnalytics(metric) {
  const data = JSON.stringify(metric);
  navigator.sendBeacon('/api/perf/log', data);
}
```

#### 3.6 设定性能预算（Performance Budget）
在项目初期定义硬性指标，避免优化后退。

示例预算（适用于普通 Web 应用）：
+ 首次加载 JS 总体积 < 200KB（gzip 后）
+ 首次加载 CSS 总体积 < 50KB（gzip 后）
+ LCP < 2.5s（3G 网络）
+ TTI < 3.5s

**在 CI 中集成 Lighthouse CI：**
```bash
npm install -g @lhci/cli
lhci autorun --config=.lighthouserc.json
```

**配置 `.lighthouserc.json`：**
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

<hr>

# 五、性能优化检查清单（日常自检）
|分类|检查项|说明|
|-|-|-|
|构建|✅ 路由、组件懒加载|`import()` 语法已使用|
||✅ 公共模块已提取|`splitChunks` 或 `manualChunks` 配置|
||✅ Tree Shaking 生效|使用 ES Module，`sideEffects` 正确|
||✅ 图片已压缩 & 转为 WebP|使用 `image-minimizer` 或 CDN 转换|
||✅ 生产环境压缩 JS/CSS|启用 Terser、CssMinimizer|
|加载|✅ 关键资源 preload|字体、首屏大图、关键 CSS|
||✅ 异步脚本使用 defer/async|非必要脚本不阻塞解析|
||✅ Gzip/Brotli 已开启	|服务器或构建产物有 .gz 文件|
||✅ 使用 CDN 加速静态资源|`publicPath` 指向 CDN|
|运行时|✅ 长列表采用虚拟滚动|数据量大时使用|
||✅ 耗时计算放入 Web Worker|检查 Performance 的长任务|
||✅ 动画使用 transform/opacity + rAF|避免 left/top 动画|
||✅ 避免强制同步布局	|读写分离，批量 DOM 操作|
|缓存|✅ 静态资源带 contenthash|文件名唯一|
||✅ 设置强缓存	|Cache-Control max-age 一年|
||✅ Service Worker 缓存静态资源|二次加载秒开|
|监控|✅ Web Vitals 已接入|LCP/FID/CLS 上报|
||✅ 定期运行 Lighthouse 分析|每周或每次发版前|
||✅ 设置性能预算 & CI 卡控|避免回归|

<hr>

# 结语
前端性能优化不是一次性的工作，而是一个持续迭代的过程。建议按以下步骤推荐：
1. **先测量**：接入 Web Vitals 监控，拿到当前页面性能数据。
2. **找瓶颈**：使用Lighthouse、Performance 面板分析出最差指标和原因。
3. **做优化**：针对瓶颈应用本指南中的对应方案（例如 LCP 差就优化图片和服务器）。
4. **验证效果**：再次测量，确认指标改善。
5. **持续回归**：在 CI 中加入性能测试，防止新代码拖慢性能。

希望这份性能优化指南能够帮助你系统地掌握前端性能优化，并能轻松应用到实际项目中。bye~