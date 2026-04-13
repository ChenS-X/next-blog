---
title: "深入理解useState"
date: "2026-04-12"
description: "🧠无废话版本，深入理解React核心Hook ➡️ useState"
headerImage: "https://pic1.imgdb.cn/item/69dbba69e972b74d784773b1.png"
thumbnail: "https://pic1.imgdb.cn/item/69dbba69e972b74d784773b1.png"
---

不废话，直接上代码+注释描述

## 1.miniReact的实现
```js
// 当前正在工作的Fiber节点
let wipFiber = null;
// 当前 hook 的索引（数组方案用）
let hookIndex = 0;



function updateFunctionComponent(fiber) { 
    // 函数组件是在此处被调用的，也就是Cunter这个函数在这里被调用了
    // 那么hook - useState也是在这里被执行的
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];

    // fiber.type ===> function Counter(props) {return (<div>{count}</div>)}
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}


function useState(initial) {
   // 获取旧的hook
    const oldHook =
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex];

    // 创建新的hook，第一次的时候，oldHook为null，所以state为initial
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [],
    };


    // 获取所有的更新，并执行更新（setState）
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
        // 执行更新
        // 这里默认了setState是使用函数更新的 => setCount(prev => prev + 1)
        hook.state = action(hook.state);
    });

    const setState = (action) => {
        // 这里解释了setState被调用的时候，并不会立即更新hook的state值的，
        // 而是将这个更新的操作缓存起来
        hook.queue.push(action);
        // 构建Fiber
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        };
        // 将下一个执行任务单元赋值为顶部root，这样整个组件就会在下一次的循环中被重新渲染
        nextUnitOfWork = wipRoot;
        deletions = [];
    };

    wipFiber.hooks.push(hook);
    // 根据hookIndex顺序获取hook，所以hook得调用必须稳定，不能在if-else中调用
    hookIndex++;

    // 使用 let [count, setCount] = useState(0)
    return [hook.state, setState];
}
```



## 2.useState的实现原理（改进版本）
1. 使用链表：上一个实现是用数组存储hooks，在React官方实现中是使用**链表**保证Hooks调用顺序一致性的。
2. 浅比较：上面的代码每次`setState`都会触发重新渲染，没有做浅比较。
3. 更新队列处理时机：上面的代码在每次render时都会执行所有的actions，这会导致性能问题。
```js
let wipFiber = null; // 当前正在工作的fiber节点
let hookIndex = 0; // 当前hook的索引（数组方案用）
let currentRoot = null; // 上一次渲染的根fiber
let wipRoot = null; // 正在构建的根fiber
let nextUnitOfWork = null; // 下一个执行任务单元
let deletions = []; // 待删除的节点


function useState(initial) {
    // 1. 获取旧的hook（从上次渲染的fiber节点中获取）
    const oldHook = wipFiber.alternate &&   wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];

    // 2. 创建新的hook
    // [改进1]使用链表结构存储多个Hook，而不是只依赖数组缩影
    // 但在书中实现中，我们通过hookIndex来维护顺序
    const hook = {
        state: oldHook ? oldHook.state : initial, // 当前状态
        queue: [], // 存放更新队列
        next: null, // 下一个hook
    }


    // 3. [关键改进]处理队列
    // React中，更新是在render阶段批量执行的，而不是每次setState时执行的
    if(oldHook && oldHook.queue.length > 0) {
        // 执行所有排队的更新（使用函数式更新）
        let newState = oldHook.state;
        for(const action of oldHook.queue) {
            // action 可以是函数或普通值
            if(typeof action === 'function') {
                newState = action(newState); // 函数式更新
            } else {
                newState = action; // 直接赋值
            }
        }

        hook.state = newState;

        // 清空队列
        hook.queue = [];
    }


    // 4. 【React 核心机制】浅比较优化
    // 当调用setState时，会先比较新旧状态时候相同
    const setState = (action) => { 
        // 处理action可以时函数或普通值的情况
        const newValue = typeof action === 'function' ? action(hook.state) : action;

        // 【浅比较】使用Object.is比较新旧值
        // 对于对象/数组，比较的是引用，而不是内容
        const isEqual = Object.is(newValue, hook.state);
        if(isEqual) {
            // 状态相同，则不更新
            console.log('状态相同，不更新');
            return;
        }

        // 状态变化，将action加入队列
        // 注意：这里不直接更新 hook.state，而是缓存起来
        hook.queue.push(typeof action === 'function' ? action : () => action);
    }

    // 6.将hook存储到当前Fiber的hooks数组中
    // 【改进2】维护链表关系
    if(wipFiber.hooks.length === hookIndex) {
        // 第一次添加
        wipFiber.hooks.push(hook);
    } else {
        // 更新已有的hook（复用）
        wipFiber.hooks[hookIndex] = hook;
    }

    // 【链表关键】建立链表关系
    if(hookIndex > 0) {
        wipFiber.hooks[hookIndex - 1].next = hook;
    }

    hookIndex++;

    return [hook.state, setState];
}

/**
 * 【改进3】重置Hook索引，每次渲染前调用
*/
function resetHookIndex() {
    hookIndex = 0;
}


/**
 * 【改进4】批量更新
 * React内部通过调度器Scheduler实现批量更新
*/
function batchUpdates(callback) {
    // 简化版本：标记为批量更新模式
    const isBatching = true;
    callback();

    // 批量更新结束后同一渲染
    if(!isBatching) {
        // 触发实际渲染
    }
}

function renderComponent(fiber) { 
    resetHookIndex(); // 重置Hook索引，确保顺序正确

    const component = fiber.type; // 函数组件
    const props = fiber.props;

    // 函数组件调用。内部会调用useState
    const children = component(props);

    // 处理children...
}
```


## 3.实现一个更接近官方的useState
```js
/**
 * React useState 官方实现的核心机制（简化版）
 * 包含：链表结构、浅比较、批量更新、优先级调度
*/


// ======================== 全局变量 =========================

let currentlyRenderingFiber = null; // 当前正在渲染的fiber节点
let workInProgressHook = null; // 当前正在处理的hook（链表遍历用）
let currentHook = null; // 当前对应的旧 Hook （来自 alternate）


let isRendering = false; // 是否正在渲染
let isBatchingUpdates = false; // 是否处于批量更新模式
let pendingUpdateQueue = []; // 待处理的更新队列（批量更新用）

// 调度器相关
let nextUnitOfWork = null; // 下一个执行任务单元
let rootFiber = null; // 根fiber



// ======================== 核心数据结构 =========================

/**
 * Hook 对象（链表节点）
 * 对应React源码中的Hook结构
*/
class Hook {
    constructor() {
        this.memoizedState = null; // 当前状态值（对于useState就是state）
        this.queue = null; // 更新队列
        this.next = null; // 下一个hook
        this.baseState = null; // 基础状态（用于优先级跳过时）
        this.baseQueue = null; // 基础更新队列（未处理的更新）
    }
}


/**
 * 更新对象（Update）
 * 每次嗲用setState都会创建一个 Update
*/
class Update {
    constructor(action, priority) {
        this.action = action; // setState传入的值或函数
        this.priority = priority; // 更新优先级
        this.next = null; // 下一个更新
    }
}


/**
 * 更新队列
 * 挂在 Hook.queue 上
*/
class UpdateQueue { 
    constructor() {
        this.pending = null; // 待处理的更新
        this.dispatch = null; // dispatch函数
        this.lastRenderedReducer = null; // 上一次渲染用的reducer
        this.lastRenderedState = null; // 上一次渲染的状态
    }
}


// ========================= useState 核心实现 =========================

/**
 * 调度更新（setState 被调用时的核心逻辑）
 * @param {Fiber} fiber - 当前组件对应的fiber节点
 * @param {UpdateQueue} queue - 更新队列
 * @param {any} action - 更新动作
*/
function dispatchSetState(fiber, queue, action) { 
    // 1. 创建更新对象
    const update = new Update(action, getCurrentPriority());

    // 2. 将更新对象添加到更新队列中
    const pending = queue.pending;
    if(pending === null) {
        // 第一个更新，执行自己行程环形
        update.next = update;
    } else {
        // 插入到环形链表中
        update.next = pending.next;
        pending.next = update;
    }

    queue.pending = update;


    // 3.浅比较优化
    // 获取当前组件的旧状态
    const currentFiber = fiber.alternate || fiber;
    const currentHook = getCurrentHookFromFiber(currentFiber);

    if(currentHook && !isBatchingUpdates) {
        // 非批量更新模式下，可以立即尝试浅比较优化
        const newState = calculateStateFromQueue(currentHook, queue);
        const oldState = currentHook.memoizedState;

        // 使用Object.is比较新旧值
        if(Object.is(newState, oldState)) {
            // 状态相同，则不更新
            console.log('状态相同，不更新')
            return;
        }
    }


    // 触发更新调度
    scheduleUpdate(fiber, update.priority);
}



/**
 * 从队列中计算最新状态（用于浅比较）
*/
function calculateStateFromQueue(currentHook, queue) { 

    /*
        对应多次setState的情况
        const handleCick = () => {
            setState(state => state + 1);
            setState(state => state + 1);
            setState(state => state + 1);
        }

        会算出3个更新后的状态值
    */
    let newState = currentHook.memoizedState;
    let update = queue.pending;

    if(update !== null) {
        do {
            const action = update.action;
            if(action instanceof Function) {
                newState = action(newState);
            } else {
                newState = action;
            }
            update = update.next;
        } while(update !== queue.pending);
    }

    return newState;
}

/**
 * 获取当前Fiber对应的Hook（用于浅比较）
*/
function getCurrentHookFromFiber(fiber) {
    if(!fiber.memoizedState) return null;

    // 找到对应索引的Hook（简化实习）
    let hook = fiber.memoizedState;
    let index = 0;

    const targetIndex = getCurrentHookIndex();
    while(hook && index < targetIndex) {
        hook = hook.next;
        index++;
    }

    return hook;
}


/**
 * 调用更新
 * @param {Fiber} fiber - 需要更新的Fiber
 * @param {number} priority - 更新优先级
*/
function scheduleUpdate(fiber, priority) {
    // 批量更新模式：将更新加入队列
    if(isBatchingUpdates) {
        console.log('批量更新模式：将更新加入队列')
        pendingUpdateQueue.push({ fiber, priority });
        return;
    }


    // 正常调度：标记需要渲染
    console.log('[React] 调度更新，优先级：', priority);

    // 设置根 Fiber 为工作单元
    rootFiber = getRootFiber(fiber);
    nextUnitOfWork = rootFiber;

    // 请求调度（React使用MessageChannel实现）
    requestIdleCallback(preformWorkLoop);
}

/**
 * 执行工作循环
*/
function preformWorkLoop(deadline) { 
    while(nextUnitOfWork && deadline.timeRemaining() > 1) { 
        // 循环工作单元
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if(nextUnitOfWork) {
        // 如果还有工作单元，但当前帧时间不够了，则继续调度
        requestIdleCallback(preformWorkLoop);
    } else if(rootFiber){
        // 渲染结束，提交根 fiber，进行正真的渲染
        commitRoot(rootFiber);
    }
}


/**
 * 执行单个工作单元（渲染组件）
*/
function performUnitOfWork(fiber) { 
    // 渲染组件（内部会调用函数组件）
    renderFunctionComponent(fiber);
    return fiber.child;
}


/**
 * 渲染函数组件（useState 在这里被调用）
*/
function renderFunctionComponent(fiber) { 
    currentlyRenderingFiber = fiber;
    workInProgressRoot = null;
    currentHook = null;
    isRendering = true;

    // 重置hookIndex
    hookIndex = 0;

    // 执行函数组件
    const component = fiber.type;
    const props = fiber.props;
    const children = component(props);

    isRendering = false;

    // 处理子节点
}



// ========================= useState 主函数 =========================

let hookIndex = 0; // 用于追踪当前Hook索引（实际React通过链表顺序）


/**
 * useState 核心实现（符合React官方机制）
 * @param {any} initialState - 初识状态
 * @returns {[any, Function]} 状态和更新函数
*/
function useState(initialState) {
    // 1.获取当前 Hook (链表结构)
    const hook = mountWorkInProgressHook();

    // 2.获取旧的Hook（用于复用）
    const oldHook = getAlternateHook();


    // 3.初始化或复用状态
    if(oldHook) {
        // 更新阶段：复用旧状态和更新对列
        hook.memoizedState = oldHook.memoizedState;
        hook.queue = oldHook.queue;
        hook.baseState = oldHook.baseState;
        hook.baseQueue = oldHook.baseQueue;

        // 4.【关键】处理更新队列中的更新
        if(hook.queue !== null && hook.queue。pending !== null) {
            // 执行更新队列中的所有更新
            let newState = hook.baseState;
            let update = hook.baseQueue || hook.queue.pending;

            if(update !== null) {
                // 遍历环形链表
                do {
                    const action = update.action;
                    if(typeof action === 'function') {
                        newState = action(newState)
                    } else {
                        newState = action;
                    }
                    update = update.next;
                } while (update !== (hook.baseQueue || hook.queue.pending));
            }
        }

        hook.memoizedState = newState;
        hook.baseState = newState;
        hook.baseQueue = null;
        hook.queue.pending = null;
    } else {
        // 首次渲染：初始化状态
        const initialValue = typeof initialState === 'function'
            ? initialValue()
            : initialValue;

        hook.memoizedState = initialValue;
        hook.queue = new UpdateQueue();
        hook.baseState = initialValue;
        hook.baseQueue = null;
    }

    // 5.创建dispatch函数（setState）
    const dispatch = (action) => {
        if(isRendering) {
            throw new Error('Cannot call setState during rendering');
        }

        // 获取当前fiber
        const fiber = currentlyRenderingFiber;
        const queue = hook.queue;

        // 调用核心调度函数
        dispatchSetState(fiber, queue, action);
    }

    // 6.返回 [state, setState]
    return [hook.memoizedState, dispatch];
}



/**
 * 获取或创建当前 Hook （维护链表）
 * React 官方通过链表循序来保证 Hooks 调用顺序
*/
function mountWorkInProgressHook() {
    const hook = new Hook();

    if(workInProgressHook === null) {
        // 第一个Hook
        currentlyRenderingFiber.memoizedState = hook;
        workInProgressHook = hook;
    } else {
        // 后续hook，添加到链表末尾
        workInProgressHook.next = hook;
        workInProgressHook = hook;
    }


    return hook;
}



/**
 * 获取对应的旧 Hook （从alternate中）
*/
function getAlternateHook() {
    const fiber = currentlyRenderingFiber;
    const alternate = fiber.alternate;

    if(!alternate || !alternate.memoizedState) {
        return null;
    }

    // 通过遍历链表找到对应索引的Hook
    let oldHook = alternate.memoizedState;
    let index = 0;


    while(oldHook && index < hookIndex) {
        oldHook = oldHook.next;
        index ++;
    }

    hookIndex++;
    return oldHook;
}






// =========================== 批量更新机制 ============================


/**
 * 批量更新包装器（类似 React 中的 unstable_batchedUpdates）
 * @param {Function} fn - 需要批量执行的函数
*/
function batchedUpdates(fn) {
    const prevIsBatchingUpdates = isBatchingUpdates;
    isBatchingUpdates = true;


    try {
        fn();
    } finally {
        isBatchingUpdates = prevIsBatchingUpdates;

        // 批量更新结束后，执行所有排队更新
        if(!isBatchingUpdates && pendingUpdateQueue.length > 0) {
            console.log('[React] 批量更新结束，执行', pendingUpdateQueue.length, '个更新');

            // 获取根Fiber
            const root = getRootFiber(pendingUpdateQueue[0].fiber);

            // 执行所有更新
            for(const update of pendingUpdateQueue) {
                scheduleUpdate(update.fiber, update.priority);
            }
            pendingUpdateQueue = [];
        }
    }
}



// ========================= 辅助函数 ============================

let currentPriority = 0;

function getCurrentPriority() {
    // React 有NormalPriority、UserBlockingPriority等优先级
    return currentPriority;
}

function getRootFiber(fiber) {
    // 向上查找根Fiber
    let node = fiber;
    while(node.return) {
        node = node.return;
    }

    return node;
}


function requestIdleCallback(callback) {
    // React 实际使用 MessageChannel + requestAnimationFrame
    // 这里简化为 setTimeout
    setTimeout(() => {
        callback({timeRemaining: () => 50})
    }, 0)
}

function commitRoot(root) {
    console.log('[React] 提交到渲染DOM');
    // 实际会递归处理Fiber树，更新DOM
    rootFiber = null;
}





// ============================= 使用示例 ===============================


// 模拟组件
function Counter() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState('React');

    console.log(`渲染：count=${count}，name=${name}`);


    return {
        render: () => {
            console.log(`显示: ${name} - Count: ${count}`);
        },
        increment: () => {
            // 批量更新测试
            batchedUpdate(() => {
                setCount(c => c + 1);
                setCount(c => c + 1);
                setCount(c => c + 1);
            });
        },
        changeName: (newName) => {
            setName(newName);
        },
        testShallowCompare: () => {
            // 测试浅比较：对象引用不变
            const obj = {a: 1};
            setCount(obj); // 第一次
            setCount(obj); // 第二次相同引用，不会重新渲染
        }
    }
}

// 测试
const counter = Counter();
counter.render();  // 首次渲染
counter.increment(); // 批量更新，只渲染一次
counter.changeName('React 18'); // 触发重新渲染
```