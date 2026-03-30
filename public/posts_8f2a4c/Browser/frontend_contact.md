---
title: "前端“跨域”对话指南：iframe通信、微前端状态共享与多标签页消息传递"
date: "2026-03-28"
description: "聊聊前端通信的那些事☎️"
headerImage: "https://pic1.imgdb.cn/item/69c9e0cb0ba4e83bd178d29a.gif"
thumbnail: "https://pic1.imgdb.cn/item/69c9e0cb0ba4e83bd178d29a.gif"
---

## 前言
> 本文将详细介绍前端通信的实现方式，包括iframe通信、微前端状态共享与多标签页消息传递。


## 一、iframe通信
iframe 通信的核心难点在于跨域限制（同源策略）。根据父页面与 iframe 是否同源，方案选择完全不同。

1. **同源iframe之间的通信**

如果主页面和 iframe 属于同一域名（如 a.example.com 与 a.example.com/sub），浏览器允许直接相互访问。

**核心方法：**
+ **父访问子：** 通过 `iframe.contentWindow` 获取子窗口的 `window` 对象，进而访问其变量或函数。
+ **子访问父：** 通过 `window.parent` 或 `window.top` 获取父级窗口对象。

**适用场景：** 企业内部系统、无需跨域的同项目嵌入。

代码示例：⬇️
```html
<!-- 父页面 parent.html -->
<iframe id="childFrame" src="child.html"></iframe>
<script>
  const iframeWin = document.getElementById('childFrame').contentWindow;
  // 调用子页面的全局函数
  iframeWin.sayHello('来自父页面');
  // 读取子页面的变量
  console.log(iframeWin.childData);
</script>
```
```js
// 子页面 child.html
window.childData = { from: 'child' };
function sayHello(msg) {
  console.log('子页面收到：', msg);
}
// 也可以访问父页面
console.log(window.parent.location.href);
```

2. **跨域iframe之间的通信（主流方案）**

当主页面与 `iframe` 域名不同时（如主站 `a.com` 嵌入第三方 `b.com` 页面），受同源策略限制，无法直接操作对方 `DOM`。此时必须使用 `postMessage API`。

+ **核心原理：** HTML5 提供的 `postMessage` 允许不同源的窗口互相发送消息，通过监听 `message` 事件接收。
+ **实例代码：**
```js
// 父页面
<!-- 父页面 https://parent.com -->
<iframe id="crossIframe" src="https://child.com/page.html"></iframe>
<script>
  const iframe = document.getElementById('crossIframe');
  iframe.onload = () => {
    // 向子页面发送消息，第二个参数为目标 origin（可写 '*' 但不安全）
    iframe.contentWindow.postMessage('Hello from parent', 'https://child.com');
  };

  // 监听子页面的回复
  window.addEventListener('message', (event) => {
    // 必须验证来源！
    if (event.origin !== 'https://child.com') return;
    console.log('收到子页面回复：', event.data);
  });
</script>
```
```js
// 子页面接收并回复
// 子页面 https://child.com/page.html
window.addEventListener('message', (event) => {
  // 验证父页面来源
  if (event.origin !== 'https://parent.com') return;

  console.log('收到父页面消息：', event.data);

  // 回复消息给父页面
  event.source.postMessage('Hello back from child', event.origin);
});
```
> ⚠️ 安全提醒：始终验证 `event.origin`，避免被恶意网站利用。

+ **进阶工具：** 对于复杂场景，可以使用 [`Postmate`](https://www.npmjs.com/package/postmate) 这类封装库，它基于 `Promise` 提供了更优雅的父子通信 `API`。
+ **替代方案：** 将父页面和 `iframe` 的 `document.domain` 设置为相同的父级域名（仅限子域名跨域），如 `a.example.com` 和 `b.example.com` 都设为 `example.com`。


## 二、微前端状态共享
微前端架构（如 qiankun、无界）通常包含一个“主应用”和多个独立运行的“子应用”。通信不仅涉及 iframe 场景，更侧重 JS 沙箱环境下的状态共享。

1. **主应用与子应用通信**

这是微前端最核心的通信方式，主流框架均提供官方 API 实现**全局状态管理**
+ **qiankun 方案：** 使用 `initGlobalState` 定义全局状态。
+ **无界 (Wujie) 方案：** 提供基于 Proxy 的跨应用消息总线，可以直接通过 window.$wujie 获取父应用数据或触发全局事件。

2. **子应用之间的通信**

在微前端中，子应用间应避免直接通信，以降低耦合度

**推荐模式：**
+ **状态提升：** 子应用 A 修改主应用的全局状态.
+ **状态下发：** 主应用将变化后的状态广播给所有需要感知的子应用（包括子应用 B）
+ **事件总线：** 利用全局事件中心（`Event Bus`）进行消息转发，但需要注意在子应用卸载时及时销毁事件监听，防止内存泄漏。

代码示例：⬇️（qiankun方案）

主应用初始化全局状态
```js
// 主应用 main.js
import { initGlobalState, registerMicroApps, start } from 'qiankun';

// 定义全局状态
const initialState = { user: 'Alice', theme: 'light' };
const actions = initGlobalState(initialState);

// 监听全局状态变化（可选）
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用：状态变更', prev, '->', state);
});

// 注册子应用时，将 actions 通过 props 传递
registerMicroApps([
  {
    name: 'subApp1',
    entry: '//localhost:3001',
    container: '#sub1',
    activeRule: '/app1',
    props: { actions }   // 关键：传递通信对象
  },
  // 其他子应用同理
]);

start();
```

子应用中接收和使用全局状态
```js
// 子应用入口（如 main.js 或 mount 生命周期）
export async function mount(props) {
  // 监听全局状态变化
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用收到新状态：', state);
    // 更新本地 UI，例如重新渲染用户信息
    updateUser(state.user);
  }, true);  // 第二个参数 true 表示立即执行一次，拿到当前状态

  // 子应用也可以修改全局状态
  const updateTheme = (newTheme) => {
    props.setGlobalState({ theme: newTheme });
  };

  // 假设有一个按钮调用 updateTheme
  document.getElementById('themeBtn').onclick = () => updateTheme('dark');
}
```

## 三、多标签页消息传递
多标签页通信特指同一浏览器下，***同源***（`origin`）的不同页面之间的数据同步。

1. **标签页通信方案对比**

|方案|核心原理|优点|缺点|适用场景|
|-|-|-|-|-|
|**Broadcast Channel**|创建专属频道，一对多广播|设计纯粹，专为通信而生，API 简洁优雅|不兼容 IE，需同源|**首选：** 多标签页状态同步（如登录、购物车）|
|**localStorage + storage事件**|一个标签页修改 `localStorage`，其他标签页监听 `storage` 事件|兼容性极好，数据持久化存储|	事件仅在非当前页触发，数据大小受限（5-10MB，但仅通信而言基本足够了）|兼容旧浏览器，或需要数据落地的简单场景|
|**SharedWorker**|独立后台线程，多页面共享|不与 DOM 交互，性能较好|设计较复杂，调试相对困难|高频、复杂的数据共享场景|

2. **代码示例与选型建议**
+ **推荐使用** Broadcast Channel（现代浏览器）：
```js
// 标签页 A：发送消息
const channel = new BroadcastChannel('app_channel');
channel.postMessage({ type: 'LOGOUT', userId: 123 });

// 标签页 B：接收消息
const channel = new BroadcastChannel('app_channel');
channel.onmessage = (event) => {
  console.log('收到跨标签页消息：', event.data);
  if (event.data.type === 'LOGOUT') {
    alert('账号已在其他标签页登出');
  }
};
```
+ **兼容方案** localStorage：
```js
// 标签页 A：发送消息（写入 localStorage）
const message = { type: 'UPDATE_CART', count: 5 };
localStorage.setItem('cross_tab_msg', JSON.stringify(message));
// 发送后立即清除占位，避免下次误触发
localStorage.removeItem('cross_tab_msg');

// 标签页 B：监听 storage 事件
window.addEventListener('storage', (event) => {
  if (event.key === 'cross_tab_msg' && event.newValue) {
    const data = JSON.parse(event.newValue);
    console.log('收到消息：', data);
    // 更新购物车数量等操作
  }
});
```
> 注意：`storage` 事件只在其他标签页修改 `localStorage` 时触发，当前页修改不会触发自身的事件。
+ **兜底方案：** 如果上述前端方案无法满足需求（如跨域或关闭页面的唤醒），可以通过 `WebSocket` 或服务器轮询（`Service Worker`）作为后端中转
```js
// worker.js
const ports = [];
onconnect = (e) => {
  const port = e.ports[0];
  ports.push(port);
  port.onmessage = (event) => {
    // 广播给所有其他页面
    ports.forEach(p => {
      if (p !== port) p.postMessage(event.data);
    });
  };
};

// 页面中使用
const worker = new SharedWorker('worker.js');
worker.port.start();
worker.port.postMessage('hello');
worker.port.onmessage = (e) => console.log('收到:', e.data);
```
