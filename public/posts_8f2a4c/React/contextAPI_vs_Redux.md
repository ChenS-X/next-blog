---
title: "状态管理Context API 🆚 Redux"
date: "2026-04-13"
description: "context api vs redux，一些简单的示例对比✍️"
headerImage: "https://pic1.imgdb.cn/item/69ddb2591395de9438ab73ba.png"
thumbnail: "https://pic1.imgdb.cn/item/69ddb2591395de9438ab73ba.png"
---

## 一、先来对比
### 1.设计理念
+ **Context**：React 内置的依赖注入机制，解决props drilling
+ **Redux**：独立的状态管理库，基于Flux架构，强调可预测性
  
### 2.主要区别对比
|特性|Context|Redux|
|:---:|:---:|:---:|
|适合场景|简单状态共享（主题、语言、用户信息）|复杂状态管理（大量交互、频繁更新）|
|性能优化|需要手动使用`React.memo`，任意变化都会重新渲染所有消费者|自动优化，只重新渲染依依赖变化数据的组件|
|调试工具|无专用调试工具|Redux DevTools（时间旅行、状态追踪）|
|中间件|不支持|支持（异步、日志、持久化等）|
|状态组织|分散在多个 Provider|单一Store + Reducers|
|代码体积|0KB（内置）|~2KB（核心库）|


## 二、轻量但“低能”的 Context
还是老规矩，上代码

### 1.基础API
```jsx
// 1.创建 Context
import { createContext } from 'react';
const MyContext = createContext();(defaultValue)

// 2. Provider（提供值）
<MyContext.provider value={传递的值}>
    {/* 子组件 */}
</MyContext.provider>

// 3. Consumer（消费值）
// 子组件
import { useContext } from 'react';
import MyContext from './MyContext';
function  Child() {
    const contextValue = useContext(MyContext);
    return <div>{contextValue}</div>
}
```

### 2.完整实战示例
```jsx
import React, {createContext, useContext, useState, useEffect} from 'react';

// 1.创建Context
const UserContext = createContext();
const ThemeContext = createContext();

// 2.Provider组件（封装逻辑）
function AppProvider({children}) {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 模拟异步获取用户信息
        fetchUser().then(data => {
            setUser(data);
            setLoading(false);
        })
    }, []);


    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');


    return (
        <UserContext.Provider value={{user, login, logout, loading}}>
            <ThemeContext.Provider value={{theme, setTheme}}>
                { children }
            </ThemeContext.Provider>
        </UserContext.Provider>
    )
}


// 3.自定义Hook简化使用
function useUser() {
    const context = useContext(UserContext);
    if(!context) throw new Error('useUser must be used within AppProvider');

    return context;
}

function useTheme() {
    const context = useContext(ThemeContext);
    if(!context) throw new Error('useTheme must be used within AppProvider');

    return context;
}


// 4. 使用context的组件
function UserProfile() {
    const {user, loading, logout} = useUser();
    const {theme} = useTheme();

    if(loading) return <div>Loading...</div>


    return (
        <div className={`profile ${theme}`}>
            <h3>{user?.name}</h3>
            <button onClick={logout}>Logout</button>
        </div>
    )
}


function ThemeToggle() {
    const {theme, toggleTheme} = useTheme();
    return (
        <button onClick={toggleTheme}>
            Current: {theme}
        </button>
    )
}

// 5.应用入口
function App() {
    return (
        <AppProvider>
            <div>
                <ThemeToggle />
                <UserProfile />
            </div>
        </AppProvider>
    )
}
```


## 三、厉害但难搞的“正宫” — Redux

主要是学习RTK（Redux Toolkit）

### 1.先了解以下传统Redux（了解即可）
```js
// 1.定义Action Types
const INCREMENT = 'INCREMENt';
const DECREMENT = 'DECREMENT';

// 2. Action Creators
const increment = (payload) => ({type: INCREMENT, payload})
const decrement = (payload) => ({type: DECREMENT, payload})

3. reducer
const initialState = {
    value: 0
}
const counterReducer = (state = initialState, action) => {
    switch(action.type) {
        case INCREMENT:
            return {...state, value: state.value + 1};
        case DECREMENT:
            return {...state, value: state.value - 1};
        default:
            return state;
    }
}

// 4.Store
import {createStore} from 'redux';
const store = createStore(counterReducer);

// 5.使用
store.dispatch(increment(2));
console.log(store.getState());

```

**核心概念**

Redux 有三个核心原则：
+ **单一数据源**：整个应用的状态存在一个对象树中（Store）
+ **State 是只读的**：只能通过触发 Action 来改变状态
+ **使用纯函数修改状态**：Reducer 接收旧状态和 Action，返回新状态

### 2.具体了解 RTK 的使用

现在Redux开发强烈推荐使用 Redux Toolkit（RTK），它简化了配置过程

1. 安装依赖
```bash
npm install @reduxjs/toolkit react-redux
```

1. 创建Slice（状态切片）
```js
// store/counterSlice.js

import {createSlice} from '@reduxjs/toolkit'

const counterSlice = createSlice({
    name: 'counter', // slice切片的名称
    initialState: { // 初始化状态
        value: 0
    },
    reducers: { // 定义修改状态的函数
        increment: (state) => {
            state.value += 1; // Redux Toolkit 允许直接修改（内部使用Immer）
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value ++ action.payload
        }
    }
})

// 导出 actions
export const {increment, decrement, incrementAmount} = counterSlice.actions;

// 导出reducer
export default counterSLice.reducer;
```

3. 创建Store
```js
// store/index.js
import {configureStore} from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer, // 注册reducer
        // 可以添加更多的reducer
    }
})
```

4. 在Reaxt应用中使用

提供Store（入口文件）
```js
// index.js 或 main.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import {store} from './store'
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
)
```

在组件中使用
```js
// components/Counter.jsx

import React from 'react';
import {useSeletor, useDispatch} from 'react-redux';
import {increment, decrement, incrementByAmount} from '../store/counterSlice';

function Counter() {
    // 读取状态
    const count = useSelector(stata => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div>
            <h1>Count: {count}</h1>
            <button onClick={() => dispatch(increment())}>+1</button>
            <button onClick={() => dispatch(decrement())}>-1</button>
            <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
       </div>
    ) 
}

export default Counter;
```

**注意：示例中三个“counter”的区别**
+ `slice.name`和store中的key不需要相同，但通常保持一致
+ `useSelector`中的`state.counter`对应的是store中注册的key
+ slice的name主要影响生成的action type字段

```js
// slice name
const counterSlice = createSlice({
    name: 'counter', // 会生成 action type: 'counter/increment'
    reducers: {
        increment: state => state.value += 1;
    }
});

// 实际生成的action type格式：`${name}/${reducerName}`
console.log(counterSlice.actions.increment().type); // 输出：'counter/incrememt'
```


### 3.异步操作
```js
// store/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 创建异步thunk
export const fetchUser = createAsyncThunk('user/fetchUser', async (userId) => {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    return response.json();
});


const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null,
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
    },

    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
    }
});

export default userSlice.reducer;
```

组件中使用异步操作

```js
import { fetchUser } from '../store/userSlice';
function UserProfile({userId}) {
    const dispatch = useDispatch();
    const {data, status, error} = useSelector(state => state.user);

    useEffect(() => {
        dispatch(fetchUser(userId));
    }, [userId, dispatch])

    if (status === 'loading') return <div>Loading...</div>
    if (status === 'failed') return <div>Error: {error}</div>

    return  <div>{data?.name}</div>
}
```

### 4.中间件
**中间件的基本结构**
```js
// 中间件的标准结构（三层柯里化函数）
const middleware = store => next => action => { 
    // 1.处理 action 前的逻辑
    console.log('当前状态：', store.getState());
    console.log('触发的action：', action);

    // 2.调用下一个中间件或者 reducer
    const result = next(action);

    // 3.处理 action 后的逻辑
    console.log('更新后的状态：', store.getState());

    // 4.返回结果
    return result;
}
```

**以常用的日志中间件为示例**
```js
// loggerMiddleware.js
const loggerMiddleware = store => next => action => {
    console.group(`[Action] ${action.type}`);
    console.log(`之前的状态：`, store.getState());
    console.log('Action：', action);
    
    const result = next(action);


    console.log('更新后的状态：', store.getState());
    console.groupEnd();

    return result;
}
```

**使用**
```js
// store/index.js
import {configureStore} from '@reduxjs/toolkit';
import loggerMiddleware from '../middleware/loggerMiddleware';

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware),// 添加日志中间件
    devTools: process.env.NODE_ENV !== 'production',
})
```


### 5.常用模式和最佳实践
1. 选择器（Selector）模式
```js
// 在slice文件或单独的选择器文件中
export const selectCount = (state) => state.counter.value;
export const selectIsEven = (state) => state.counter.value % 2 === 0;


// 组件中使用
const count = useSelector(selectCount);
const isEven = useSelector(selectIsEven);
```

2. 组合Reducer
```js
import {configureStore} from '@reduxjs/toolkit';
import userReducer from './userSlice';
import postsReducer from './postsSlice';
import commentsReducer from './commentsSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        posts: postsReducer,
        comments: commentsReducer
    }
})
```

### 6.适合使用 Redux 的场景
+ 多个组件需要共享同一状态
+ 状态需要在多出被修改
+ 状态逻辑复杂，有大量的异步操作
+ 应用规模大（中大型应用）
