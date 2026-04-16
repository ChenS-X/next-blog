---
title: "【Subscribe👆】一个让小巧的Zustand“变大”的能力"
date: "2026-04-12"
description: "订阅 —— Zustand Subscribe"
headerImage: "https://pic1.imgdb.cn/item/69df0b10f0cf5d89b0ed2f2c.png"
thumbnail: "https://pic1.imgdb.cn/item/69df0b10f0cf5d89b0ed2f2c.png"
---

## 聊聊Zustand的订阅能力

Zustand提供了强大的订阅功能，可以监听状态变化并执行回调，这是其核心特性之一。

#### 一、基础订阅
##### 1.订阅整个Store
```js
import { create } from 'zustand'

const useStore = create((set) => ({
    count: 0,
    name: 'zustand',
    increment: () => set((state) => ({ count: state.count + 1 })),
}))


// 获取 store 实例
const store = useStore;

// 订阅整个 store 状态变化
const unsubscribe = store.subscribe((statem preState) => {
    console.log('状态从', preState, '变为', state);
})


// 触发变化
store.getttate().increment();

// 取消订阅
unsubscribe();
```

##### 2.订阅部分状态（使用选择器）
```js
// 只订阅 count 变化
const unsubscribe = store.subscribe(
    (state) => state.count, // 选择器：选择要监听的状态
    (count, prevCount) => {
        console.log('count 从', prevCount, '变为', count);
    }
)

// 只订阅 name 的变化
const unsubscribe = store.subscribe(
    (state) => state.name,
    (name, prevName) => {
        console.log('name 从', prevName, '变为', name);
    }
)
```


#### 二、在 React 组件中使用订阅
##### 1. 使用useEffect 订阅

```jsx
import { useEffect } from 'react'
import useStore from './store'

function Counter() {
    const count = useStore(state => state.count);

    useEffect(() => {
        // 订阅状态变化
        const unsubscribe = useStore.subscribe(
            (state) => state.count,
            (count, prevCount) => {
                console.log('count 从', prevCount, '变为', count);

                // 可以执行副作用
                if(count === 10) {
                    alert('恭喜达到10次！');
                } 
            }
        )

        return () => {
            // 注销时取消订阅
            unsubscribe()
        }
    }, []);


    return ( 
        <div>Count: {count}</div>
    )
}
```

##### 2.自定义 Hook 封装订阅
```jsx
// hook/useStoreSubscription.js
import { useEffect, useRef } from 'react'
import useStore from './store';


function useStoreSubscription(selector, callback) {
    const callbackRef = useRef(callback); // 初始化
    callbackRef.current = callback; // 每次都更新最新的 callback

    useEffect(() => {
        const unsubscribe = useStore.subscribe(
            selector,
            (newState, prevState) => {
                callbackRef.current(newState, prevState);
            }
        )

        return unsubscribe;
    }, [selector])
}


// 使用
function Component() {
    useStoreSubscription(
        (state) => state.count,
        (newCount, prevCount) => {
            console.log(`Count changed from ${prevCount} to ${newCount}`);
        }
    )

    return <div>Component</div>
}
```


#### 三、高级订阅模式
##### 1.防抖订阅
```js
import { debounce } from 'lodash';

// 防抖订阅，避免频繁触发
const debounceSubscribe = debounce((state, prevState) => {
    console.log('状态变化（防抖后）：', state);

    // 保存到 localStorage
    localStorage.setItem('app-state', JSON.stringify(state));
}, 1000);

const unSubscribe = useStore.subscribe(debounceSubscribe);
```

##### 2.条件订阅
```js
// 只在满足条件时执行回调
const usSubscribe = useStore.subscribe(
    state => state.count,
    (count, prevCount) => {
        if(count > 10 && prevCount <= 10) {
            console.log('Count 超过 10 了');

            // 触发某个动作
            useStore.getState().reset();
        }
    }
)
```

##### 3.多个状态监听变化
```js
// 监听多个状态的变化
let prevState = useStore.getState();

const usSubscribe = useStore.subscribe((state) => {
    const changes = {};

    if(state.count !== prevState.count) {
        changes.count = {from: prevState.count, to: state.count}
    }

    if(state.name !== prevState.name) {
        changes.name = {from: prevState.name, to: state.name}
    }

    if(Object.keys(changes).length > 0) {
        console.log('检测到变化：', changes);
    }

    prevState = state;
})
```


#### 四、实际应用场景
##### 1.自动保存到localStorage
```js
// store.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'


// 方式1：使用内置 persist 中间件
const useStore = create(persist(
    (set) => ({
        data: {},
        updateData: (newData) => set({data: newData})
    }),
    {
        name: 'my-store'
    }
))

// 方式2：手动实现订阅保存
const useManualStore = create((set) => ({
    data: {},
    updateData: (newData) => set({data: newData})
}));

// 订阅保存
const useSubscribe = useManualStore.subscribe((state) => {
    localStorage.setItem('my-store', JSON.stringify(state.data));
})

// 初始化加载
const saveData = localStorage.getItem('my-store');
if(saveData) {
    useManualStore.setState({data: JSON.parse(saveData)})
}
```

##### 2.日志记录和调试
```js
// 开发环境日志订阅
if(process.env.NODE_ENV === 'development') {
    const unsubscribe = useStore.subscribe(
        (state, prevState) => {
            console.ground('装填变化');
            console.log('当前状态：', state);
            console.log('上一状态：', prevState);
            console.groundEnd();
        }
    )
}
```

##### 3. WebSocket 同步
```js
// websocketSync.js
import useStore from './store'

let ws = null;

export function initWebSocketSync() { 
    ws = new WebSocket('ws://127.0.0.1:8080/ws');

    ws.onopen = function () { 
        console.log('WebSocket连接成功');

        // 订阅本地状态变化，发送到服务器
        const unsubscribe = useStore.subscribe(state => {
            if(ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'STATA_UPDATE',
                    payload: state
                }))
            }
        });

        // 保存 unsubscribe 以便清理
        window.cleanupWebSocket = unsubscribe;
    }

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if(data.type === 'STATA_UPDATE') {
            // 更新本地状态
            useStore.setState(data.payload);
        }
    };
}

// 清理
export function cleanupWebSocketSync() {
    if(window.cleanupWebSocket) {
        window.cleanupWebSocket();
    }

    if(ws) {
        ws.close();
    }
}
```

##### 4.性能监控
```js
// performanceMonitor.js
import useStore from './store';

const timings = new Map();

const unsubscribe = useStore.subscribe((state, prevState) => {
    const startTime = performance.now();

    // 模拟某些计算
    const heavyComputation = () => {
        // 计算逻辑
    }

    heavyComputation();

    const endTime = performance.now();
    const duration = endTime - startTime;

    if(duration > 16.6) {
        // 超过一帧
        console.warn(`渲染耗时过长：${duration.toFixed(2)}ms`);

        // 上报到监控平台
        fetch('/api/xxx', {
            method: 'POST',
            body: JSON.stringify({
                type: 'render_time_long',
                duration,
                timestamp: Date.now(),
            })
        })
    }
})
```

##### 5.表单自动保存草稿
```js
// formStore.js
import { create } from 'zustand'
import { debounce } from 'lodash'


const useFormStore = create((set, get) => ({
    formData: {
        name: '',
        email: '',
        message: '',
    },
    isDraftSaved: false,

    updateField: (field, value) => set(state => ({
        formData: {...state.formData, [field]: value},
        isDraftSaved: false,
    
    })),

    markDraftSaved: () => set({isDraftSaved: true}),
}))

// 自动保存草稿
const saveDraft = debounce((formData) => {
    localStorage.setItem('form-draft', JSON.stringify(formData));
    useFormStore.getState().markDraftSaved();
    console.log('保存草稿');
}, 1000);

// 当formData改变时，自动保存草稿
const unsubscribe = useFormStore.subscribe(
    state => state.formData,
    (formData) => saveDraft(formData)
)

// 恢复草稿
const savedDraft = localStorage.getItem('form-draft');
if (savedDraft) {
    useFormStore.setState({
        formData: JSON.parse(savedDraft),
        isDraftSaved: true
    })
}
```

##### 6.路由变化监听
```js
// 1. 先创建 store（routerStore.js）
import { create } from 'zustand';

const useRouterStore = create((set) => ({
  currentRoute: '/',
  previousRoute: null,
  routeParams: {},
  setCurrentRoute: (route, params = {}) => set({ 
    currentRoute: route, 
    previousRoute: useRouterStore.getState().currentRoute,
    routeParams: params 
  })
}));

// routerSync.js
import useRouterStore from './store/routerStore'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'


// 在路由组件中
function RouteListener() {
    const location = useLocation()

    useEffect(() => {
        // 路由变化时
        useStore.setState({
            currentRoute: location.pathname
        });

        // 可以记录页面访问
        const unsubscribe = useStore.subscribe(
            state => state.currentRoute,
            (newRoute, oldRoute) => {
                console.log(`路由从 ${oldRoute} 跳转到 ${newRoute}`)

                // 发送页面访问统计
                sendAnalytics('page_view', { page_path: newRoute });
            }
        )

        return unsubscribe;
    }, [location])

    return null;
}

// 使用：在 App.jsx 中使用
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RouterListener from './RouterListener';
import Home from './Home';
import About from './About';


function App() {
    return (
        <Router>
            {/* 放在Routes外面或里面都可以，监听路由变化 */}
            <RouterListener />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </Router>
    )
}

```

#### 五、订阅清理和内存管理
##### 1.自动清理模式
```js
class StoreManager {
    constructor(store) {
        this.store = store;
        this.unsubscribers = [];
    }

    subscribe(selector, callback) {
        const unsubscribe = this.store.subscribe(selector, callback);
        this.unsubscribers.push(unsubscribe);
        return ubsubscribe;
    }

    cleanup() {
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
        this.unsubscribers = [];
    }
}

// 使用
const manager = new SubscriptionManager(useStore);
const unsubscribe = manager.subscribe(
    state => state.count,
    count => console.log(count)
);
// 清理单个订阅
unsubscribe();

// 清理所有订阅
manager.cleanup();
```
##### 2.组件中的订阅清理
```js
function ComponentWithSubscription() {
    useEffect(() => {
        const unsubscribers = [];

        // 订阅1
        const unsub1 = manager.subscribe(
            state => state.count,
            count => console.log(count)
        )

        // 订阅2
        const unsub2 = manager.subscribe(
            state => state.text,
            text => console.log(text)
        )

        unsubscribers.push(unsub1, unsub2);


        // 组件注销时卸载订阅
        return () => {
            unsubscribers.forEach(unsub => unsub());
        }
    })
}
```


#### 六、订阅的注意事项
##### 1.避免内存泄漏
```js
// ❌ 错误：全局订阅未清理
const unsubscribe = useStore.subscribe(callback);
// 忘记调用 unsubscribe()

// ✅ 正确：在组件卸载时清理
useEffect(() => {
    const unsubscribe = useStore.subscribe(callback);
    return unsubscribe;
}, [])
```

##### 2.避免无限循环🌀
```js
// ❌ 错误：订阅回调中更新状态可能导致无限循环
const unsubscribe = useStore.subscribe((state) => {
    if(state.count < 10) {
        useStore.getState().increment(); // 触发新的订阅回调
    }
})

// ✅ 正确：添加条件避免循环
const unsubscribe = useStore.subscribe((state, prevState) => {
    // 只在特定条件下更新
    if(state.count !== prevState.count && state.count < 10) {
        useStore.getState().increment();
    }
})
```

##### 3.性能考虑
```js
// ❌ 避免在订阅中执行重操作
const unsubscribe = useStore.subscribe((state) => {
    heavyOperation(state); // 每次变化都执行重操作
})
// ✅ 正确：防抖或节流
import { throttle } from 'lodash';

const throttledOperation = throttle((state) => {
    heavyOperation(state);
}, 1000);

const unsubscribe = useStore.subscribe(throttledOperation);
```

Zustand 的订阅功能非常灵活强大，适合处理各种副作用和状态同步需求，是构建复杂应用的重要工具！


### 🍻End~
