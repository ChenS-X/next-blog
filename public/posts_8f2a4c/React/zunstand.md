---
title: "Zustand不完全指南🧭"
date: "2026-04-11"
description: "写起来爽但生态【单薄】的网红？一些关于Zustand的浅见"
headerImage: "https://pic1.imgdb.cn/item/69ddb27a1395de9438ab73df.jpg"
thumbnail: "https://pic1.imgdb.cn/item/69ddb27a1395de9438ab73df.jpg"
---
## 一、Zustand的核心特点
+ **极简的API**
  - 代码量极少，学习成本几乎为零
  - 没有Provider包裹，直接使用
+ **轻量化高效**
  - 体积小
  - 性能优秀，自动优化重新渲染
+ **灵活的状态管理**
  + 支持全局状态和局部状态
  + 不依赖 React Context，可脱离 React 使用
+ **TypeScript友好**
  - 完整的类型推断，无需额外配置
+ **中间件生态**
  - 支持持久化、日志、异步等中间件
+ **不限制 UI 框架**
  - 可在 React、Vue、原生JS 中使用

## 二、安装
```bash
npm install zunstand
# 或
yarn add zunstand
```

## 三、基础使用
### 1. 创建 store
```js
// store/counterStore.js
import { create } from 'zunstand'

// 创建store
const useCounterStore = create((set, get) => ({
    // 状态
    count: 0,
    name: 'zunstand',

    // 同步 action
    increment: () => set(state => ({ count: state.count + 1 })),
    decrement: () => set(state => ({ count: state.count - 1 })),

    // 带参数的 action
    incrementBy: (n) => set(state => ({ count: state.count + n })),

    // 异步 action
    incrementAsync: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        set(state => ({ count: state.count + 1 }));
    }


    // 使用 get 获取当前状态
    reset: () => {
        const currentName = get().name;
        console.log(`重置 ${currentName} 的计数器`);
        set({ count: 0 });
    }
}))

export default useCounterStore;
```

### 2.在组件中使用
```jsx
// components/Counter.jsx
import useCounterStore from './store/counterStore';

function Counter() { 
    // 方式1：获取整个 store （不推荐，会导致任意状态变化都会重新渲染）
    // const store = useCounterStore();


    // 方式2：只获取需要的状态和 action （推荐）
    const count = useCounterStore(state => state.count);
    const increment = useCounterStore(state => state.increment);
    const decrement = useCounterStore(state => state.decrement);
    const incrementBy = useCounterStore(state => state.incrementBy);
    const incrementAsync = useCounterStore(state => state.incrementAsync);


    return (
        <div>
            <h1>Count: {count}</h1>
            <button onClick={increment}>+1</button>
            <button onClick={decrement}>-1</button>
            <button onClick={() => incrementBy(2)}>+2</button>
            <button onClick={incrementAsync}>异步+1</button>
        </div>
    )
}

export default Counter;
```

## 四、高级用法
### 1.获取多个状态（避免多次调用）
```jsx
// ❌ 不好：会订阅两次
const count = useCounterStore(state => state.counter)
const name = useCounterStore(state => state.name)


// ✅ 好：使用解构（需要 shallow 对比）
import {shallow} from 'zustand/shallow'
const {count, name, increment} = useCounterStore(state => ({
    count: state.count,
    name: state.name,
    increment: state.increment
}), shallow);

// ✅ 更好：使用useShallow
import {useShallow} from 'zustand/react/shallow'
const {count, name, increment} = useCounterStore(useShallow(state => ({
    count: state.count,
    name: state.name,
    increment: state.increment
})))
```

### 2.拆分 Store（模块化）
```js
// store/userStore.js
import create from 'zustand'
export const useUserStore = create(set => ({
    user: null,
    setUser: user => set(() => ({user}))
    logout: () => set(() => ({user: null}))
}))

// store/todoStore.js
import create from 'zustand'
export const useTodoStore = create(set => ({
    todos: [],
    addTodo: todo => set(state => ({todos: [...state.todos, todo]})),
    removeTodo: id => set(state => ({todos: state.todos.filter(todo => todo.id !== id)})),
}))


// 组件中使用多个store
function App() { 
    const user = useUserStore(state => state.user)
    const todos = useTodoStore(state => state.todos)
    const addTodo = useTodoStore(state => state.addTodo)

    return (
        <div>
            <div>用户：{user?.name}</div>
            <button onClick={() => addTodo({id: Date.now(), name: '新任务'})}>添加任务</button>
        </div>
    )
}
```

### 3.嵌套对象更新
```js
const userStore = create({
    user: {
        name: '张三',
        address: {
            city: '上海',
            street: '上海路'
        }
    },

    // 更新嵌套对象
    updateCity: (city) => set(state => ({
        user: {
            ...state.user,
            address: {
                ...state.user.address,
                city: city
            }
        }
    }))
})


// 使用 immer 中间件简化（推荐）
import {immer} from 'zustand/middleware/immer'
const userStore = create(immer(
    (set) => ({
        user: {
            name: '张三',
            address: {
                city: '上海',
                street: '上海路'
            }
        },
        updateCity: (city) => set((state) => {
            state.user.address.city = city; // 直接修改
        })
    })
))
```

**Immer**：底层是利用**Proxy**实现数据代理，数据修改时，会自动生成新的数据对象，不会改变原数据对象。
+ 写式复制
+ 懒代理


## 五、中间件使用
### 1.持久化中间件（localStorage）
```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(persist(
    (set, get) => ({
        user: null,
        token: '',
        setUser: (user) => set(() => ({ user })),
        setToken: (token) => set(() => ({ token })),
    }),
    {
        name: 'auth-storage', // localStore key，唯一值，不然缓存会被覆盖
        getStorage: () => localStorage, // 默认 localStorage
        partialize: (state) => ({ token: state.token }), // 只持久化部分状态
    }
))
```

### 2.日志中间件
```js
import { create } from 'zustand'
import { logger, devtools } from 'zustand/middleware'

// 和devtools一起使用时，devtools必须放在最外层
const useStore = create(
    devtools(
        logger( 
            (set) => ({
                count: 0,
                increment: () => set((state) => ({ count: state.count + 1 })),
            })
        ),{
            name: 'CounterStore', // devtools 中显示的名称
        }
    )
)
```


## 六、异步操作和请求状态管理
```js
// store/userStore.js
import { create } from 'zustand'

const useUserStore = create((set, get) => ({
    user: [],
    loading: false,
    error: null,

    // 异步获取用户
    fetchUser: async () => {
        set(() => ({ loading: true, error: null }));

        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const data = await response.json();
            set(() => ({ user: data, loading: false }));
        } catch(error) {
            set(() => ({ error, loading: false }));
        }
    },

    // 带重试的异步请求
    fetchUserWithRetry: async (retries = 3) => {
        set({loading: true});

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch('https://api.github.com/users/octocat');
                const data = await response.json();
                set(() => ({ user: data, loading: false }));
                return;
            } catch(error) {
                if(i === retries - 1) {
                    set(() => ({ error, loading: false }));
                }
            }
        }
    }
}))

// 组件中使用
function UserList() {
    const { loading, error, user, fetchUsers } = useUserStore();

    useEffect(() => {
        fetchUsers();
    }, [])

    if(loading) return <p>Loading...</p>
    if(error) return <p>Error: {error.message}</p>

    return (
        <ul>
            {user.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    )
}
```

## 七、性能优化技巧
### 1.使用选择器避免不必要的重渲染
```jsx
// ❌ 会导致任何状态变化都重渲染
function Component() {
  const store = useStore(); // 整个 store
  return <div>{store.count}</div>;
}

// ✅ 只有 count 变化才重渲染
function Component() {
  const count = useStore(state => state.count);
  return <div>{count}</div>;
}
```

### 2.使用 useRef 存储不需要触发重渲染的值
```js
const useStore = create(set => ({
  // 会触发重渲染的状态
  count: 0,
  
  // 不会触发重渲染的值（使用 ref）
  // 注意：zustand 不直接支持，需要配合 useRef
}));

function Component() {
  const count = useStore(state => state.count);
  const countRef = useRef(count);
  
  // 更新 ref 但不触发重渲染
  const updateCountRef = () => {
    countRef.current++;
  };
}
```


### 3. 使用 shallow 对比优化对象选择器
```js
import { shallow } from 'zustand/shallow';

function Component() {
  // 不使用 shallow：每次都会创建新对象，导致重渲染
  const { count, name } = useStore(state => ({
    count: state.count,
    name: state.name
  }));
  
  // 使用 shallow：浅比较，只有属性变化才重渲染
  const { count, name } = useStore(
    state => ({ count: state.count, name: state.name }),
    shallow
  );
}
```

## 八、在非 React 环境中使用
```js
// store.js
import { createStore } from 'zustand/vanilla';

const store = createStore((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));

// 原生 JS 中使用
store.subscribe(state => {
  console.log('状态变化:', state);
});

store.getState().increment();
console.log(store.getState().count); // 1
```

## 九、实战示例：购物车
```js
// store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'shopping-cart',
    }
  )
);

export default useCartStore;
```

Zustand 以其极简的 API 和优秀的性能，成为中小型项目的理想选择，也是从 Redux 迁移的绝佳替代方案！


## End~