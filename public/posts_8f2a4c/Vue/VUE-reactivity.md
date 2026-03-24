---
title: "Vue 响应式原理底层"
date: "2026-03-24"
description: "上手Vue响应式原理底层细节"
headerImage: "https://fastly.jsdelivr.net/gh/itmore9527/files@main/img/1774353400556.png"
thumbnail: "https://fastly.jsdelivr.net/gh/itmore9527/files@main/img/1774353400556.png"
---

## 一、Vue2/3响应式差异的“元凶” ➡️ `Object.defineProperty`&`Proxy`
```js
// Vue2采用的Object.defineProperty（简易代码）

function defineReactive(obj, key, val) {
  // 递归处理嵌套对象
  observe(val);
  const dep = new Dep(); // 依赖管理器
  Object.defineProperty(obj, key, {
    get() {
      // 此处收集依赖...

      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal;

        // 此处触发更新...
      }
    }
  });
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]));
}
```

```js
// Vue3采用的Proxy（简易代码）

const targetMap = new WeakMap(); // 存储依赖关系

function reactive(target) {
  if (typeof target !== 'object' || target === null) return target;
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 此处依赖收集...

      const res = Reflect.get(target, key, receiver);
      // 懒代理：只有访问到嵌套对象时才递归
      if (typeof res === 'object' && res !== null) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const oldVal = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldVal !== value) {
        // 触发更新...
      }
      return result;
    },
  });
  return proxy;
}
```

**区别**

| 对比维度      | Vue2（`Object.defineProperty`）                                       | Vue3（`Proxy`）                                              |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| 拦截粒度      | 属性级别（需要预先知道所有 key）                                      | 对象级别（代理整个对象）                                     |
| 新增/删除属性 | 无法侦测，需使用 `$set` / `$delete`                                   | 可以侦测，直接 `obj.newProp = val` 即可                      |
| 数组监听      | 通过重写数组方法实现（7个变异方法），索引赋值和 `length` 修改无法侦测 | 完全支持，`arr[0] = newVal` 和 `arr.length = 0` 均可触发更新 |
| 嵌套对象      | 初始化时递归遍历所有嵌套属性，性能开销大                              | 懒代理：访问到嵌套对象时才递归，性能更好                     |
| 拦截能力      | 仅能拦截 `get` / `set`，无法拦截 `deleteProperty`、`has` 等操作       | 可拦截 13 种操作，功能更强大                                 |
| 内存占用      | 递归遍历可能导致大量 `getter/setter` 闭包                             | 代理对象本身轻量，嵌套对象延迟代理                           |

---
## 二、一个神奇的函数`Effect`

先来看看`effect`函数是怎么使用
```js
// 定义响应式对象
const state = reactive({ count: 0 });

effect(() => {
    // 访问state对象属性
    console.log(state.count);
})
```

看着上面写的代码，是不是感觉很陌生？是的，这个`effect`函数其实更多是给`Vue3`底层使用的，很少直接用来写业务代码。但之所以说它是**神奇**，是因为你能用到的`Vue3`的所有副作用`API`（如`watch`、`watchEffect`、`computed`...）的底层实现都建立在这个`effect`函数之上。

既然如此，那么接下来我们就来敲一下这个`effect`的实现吧。
```js
let activeEffect;

function effect(fn) {
  // 包装一层，方便管理
  const effectFn = () => {
    try {
      // 1. 将自身设置为当前激活的副作用
      activeEffect = effectFn;
      // 2. 执行用户函数，会触发响应式数据的 get 拦截
      //    在 get 拦截中会调用 track 函数，将 activeEffect 收集起来
      return fn();
    } finally {
      // 3. 执行完毕后，清空当前激活的副作用
      //    避免其他地方的收集错误
      activeEffect = null;
    }
  };
  
  // 立即执行一次，完成首次依赖收集
  effectFn();
  
  // 返回包装后的函数，方便手动调用或停止
  return effectFn;
}


// 存储依赖的数据结构：targetMap -> depsMap -> dep
const targetMap = new WeakMap();

function track(target, key) {
  // 如果没有正在执行的副作用，直接返回
  if (!activeEffect) return;
  
  // 获取 target 对应的依赖映射
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  
  // 获取 key 对应的依赖集合
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  
  // 将当前副作用添加到集合中
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    // 遍历所有依赖，执行它们
    dep.forEach(effectFn => effectFn());
  }
}

// 与响应式数据结合
function reactive(target) {
  if (typeof target !== 'object' || target === null) return target;
  
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      
      const res = Reflect.get(target, key, receiver);
      // 懒代理：如果值是对象，递归转换为响应式
      if (typeof res === 'object' && res !== null) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      return result;
    }
  });
  
  return proxy;
}
```
应用⬇️
```js
// 定义响应式对象
const state = reactive({ count: 0 });

// 创建一个副作用
effect(() => {
  console.log(`count 变成了：${state.count}`);
});

// 修改数据，会自动打印
state.count++; // 输出：count 变成了：1
state.count = 10; // 输出：count 变成了：10
```

**小结：effect 到底做了什么？**
+ 首次执行：`effect` 内部的 `effectFn` 被调用，设置 `activeEffect`，然后执行用户函数，触发 `state.count` 的 `get` 拦截，`track` 将当前 `activeEffect` 收集到对应属性的依赖集合中。

+ 数据修改：当 `state.count` 被修改时，`set` 拦截调用 `trigger`，从 `targetMap` 中取出依赖集合，逐个执行所有收集到的副作用函数（即 `effectFn`），从而实现自动更新。

正是这个 `activeEffect + track + trigger` 的三位一体机制，让 `Vue 3` 的响应式系统能够“自动”感知数据变化并更新相关逻辑。

---

**补充：真实 Vue 3 源码中的增强**

我们这里的实现是教学版，真实源码中还包含：
+ 嵌套 `effect` 的处理（通过栈来保存多层 `activeEffect`）
+ 调度器（`scheduler`）允许用户控制副作用执行时机（如 `watch` 中的 `flush`）
+ 停止 `effect`（返回的 `effectFn` 可以调用 `stop()` 清理依赖）
+ 分支切换时的依赖清理（防止内存泄漏和无效更新）
  
但核心思想与我们上面写的完全一致。理解了这些，你就掌握了 `Vue 3` 响应式系统的基石。

---

## 三、依赖收集和触发更新`Track`&`Triggle`
上面在讲`effect`的时候，已经提到了依赖收集与触发更新。下面将对其中的一些细节进行剖析

1. **先解决依赖收集起来到底是怎么存的**

为了高效地管理依赖，Vue 3 设计了一套三层数据结构：
```js
// 全局存储：targetMap (WeakMap)
//   ├── target1 (对象) → depsMap (Map)
//   │     ├── key1 (属性名) → dep (Set)
//   │     │     └── effectFn1, effectFn2, ...
//   │     └── key2 → dep (Set)
//   └── target2 → depsMap ...
```

+ `targetMap`：以原始对象为键，存储该对象对应的依赖映射（`depsMap`）。使用 `WeakMap` 可以避免内存泄漏，当对象被垃圾回收时，对应的依赖条目也会自动被清除。
+ `depsMap`：以属性名为键，存储该属性对应的依赖集合（`dep`）。
+ `dep`：一个 `Set` 集合，存放所有依赖该属性的副作用函数（`effectFn`）。

这种结构保证了在任意对象、任意属性上都能快速定位到对应的依赖集合。


2. **`track`实现细节** ⬇️
```js
function track(target, key) {
  // 没有正在执行的副作用，无需收集
  if (!activeEffect) return;

  // 获取 target 对应的 depsMap
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 获取 key 对应的 dep
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  // 将当前激活的副作用添加到 dep 中
  dep.add(activeEffect);
}
```
+ `track` 必须在 `getter` 拦截中调用，并且只在 `activeEffect` 存在时才真正收集。
+ 使用 `Set集合` 存储副作用，可以自动去重，避免同一个副作用被重复收集。


3. **`trigger`实现细节** ⬇️
```js
function trigger(target, key) {
  // 获取 target 对应的 depsMap
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  // 获取 key 对应的 dep
  const dep = depsMap.get(key);
  if (dep) {
    // 遍历执行所有副作用
    dep.forEach(effectFn => effectFn());
  }
}
```
+ `trigger` 在 `setter` 或 `deleteProperty` 拦截中调用，只要值真正发生变化就触发。
+ 它只负责找出所有依赖，然后依次执行，不关心执行顺序和异步调度（调度器在更高级的 API 中实现）


完整的响应式流程：
![响应式流程图](https://fastly.jsdelivr.net/gh/itmore9527/files@main/img/1774364267138.png "响应式流程图")

---

**Vue 2 和 Vue 3 在依赖收集上的设计区别**

|对比项|Vue 2|Vue 3|
|-----|-----|-----|
|**依赖存储**|每个属性独立一个 `Dep` 实例，挂载在闭包中|全局 `targetMap`，统一存储所有依赖|
|**依赖收集时机**|初始化时递归遍历所有属性，为每个属性定义 `getter/setter`|懒代理，只在访问时才会触发 `getter` 并收集依赖|
|**嵌套对象处理**|初始化时一次性深度代理|访问到嵌套对象时才递归代理|
|**动态属性**|无法收集新增属性的依赖，需手动 `$set`|可以自动收集新增属性（因为 `Proxy` 能拦截到添加操作）|
|**内存占用**|每个属性都会产生闭包和 `Dep` 实例|只有被访问过的属性才会创建 `dep` 集合，更节省内存|

---

## 四、从底层到上层：`Computed` 和 `Watch` 的实现
1. **`computed`：带缓存的副作用**

`computed` 本质上是一个 懒执行的 `effect`，并且会缓存计算结果，只有当依赖发生变化时才重新计算。

**简化实现** ⬇️
```js
/**
 * 这里对着使用的代码来理解：
 * const count = ref(1);
 * const double = computed(() => count.value * 2);
*/
function computed(getter) {
  let dirty = true;      // 标记是否需要重新计算
  let value;             // 缓存的值

  // 创建一个 effect，但配置为懒执行
  const effectFn = effect(getter, {
    lazy: true,          // 不立即执行
    scheduler() {
      // 当依赖发生变化时，不是立即重新计算，而是标记为 dirty
      if (!dirty) {
        dirty = true;
        // 触发依赖该计算属性的副作用（例如模板渲染）
        trigger(computedObj, 'value');
      }
    }
  });

  const computedObj = {
    get value() {
      if (dirty) {
        // 重新计算，并缓存结果
        value = effectFn();
        dirty = false;
      }
      // 收集当前读取 computed 的依赖
      track(computedObj, 'value');
      return value;
    }
  };

  return computedObj;
}
```
**关键点：**
+ 计算属性内部的 `effect` 设置了 `lazy: true`，意味着它不会在初始化时自动执行，而是在用户访问 `.value` 时才执行。
+ `scheduler` 负责在依赖变化时标记 `dirty = true`，但不立即执行计算，实现了 **“懒计算”**。
+ 在 `get value()` 中，我们既执行了必要的计算（如果需要），又调用了 track，使得计算属性本身也可以被其他 `effect` 依赖。

2. **`watch`：通用的副作用观察器**

`watch` 允许我们监听一个或多个响应式数据的变化，并在变化时执行回调。它同样是基于 `effect` 构建的，只是添加了更多控制（如深度监听、立即执行、`flush` 时机等）。

**简化实现（监听一个 `getter` 函数）** ⬇️
```js
/**
 * 结合watch的使用来理解：
 * 
 * 1.传入的是一个响应式数据
 * watch(响应式数据, () => {
 *     // 回调函数
 * })
 * 
 * 2. 传入的是一个getter函数
 * watch(() => 响应式数据, () => {
 *     // 回调函数
 * })
*/
function watch(source, callback, options = {}) {
  let getter;
  // 如果 source 是响应式对象，则转换为 getter 函数
  if (typeof source === 'object' && source !== null) {
    getter = () => traverse(source); // 递归访问所有属性，收集依赖
  } else if (typeof source === 'function') {
    getter = source;
  } else {
    // 其他情况...
    return;
  }

  let oldValue;
  // 定义一个 effect，它执行 getter 并触发依赖收集
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      // 当依赖变化时，执行回调
      const newValue = effectFn();
      callback(newValue, oldValue);
      oldValue = newValue;
    }
  });

  // 如果是 immediate，立即执行一次
  if (options.immediate) {
    oldValue = effectFn();
    callback(oldValue, undefined);
  } else {
    // 否则，先执行一次，获取初始值
    oldValue = effectFn();
  }
}

// 递归遍历对象的所有属性，用于深度监听
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
```

**关键点：**
+ `watch` 内部创建了一个 `effect`，其 `scheduler` 在依赖变化时执行用户回调。
+ `lazy: true` 使得 `effect` 不会自动执行，而是由用户控制（初次执行获取 `oldValue`，后续在 `scheduler` 中执行）。
+ 深度监听通过 `traverse` 递归访问对象的所有属性，确保每个嵌套属性都被收集依赖。

3. **响应式系统的完整层次**

通过以上分析，我们可以将 Vue 3 响应式系统看作三个层次：

|层级|组件|作用|
|---|---|---|
|底层|`reactive` / `ref` + `effect` + `track` / `trigger`|提供核心的依赖收集和更新触发能力|
|中层|`computed` / `watch` |基于底层能力，封装出更实用的观察和派生 `API`|
|上层|组件渲染函数|将响应式数据与视图绑定，实现自动更新|


4. **模块化优势的体现**

这种分层设计让 `Vue 3` 的响应式系统完全独立于渲染引擎。事实上，`@vue/reactivity` 包只包含我们前面实现的那些核心函数（`reactive`、`effect`、`computed` 等），不包含任何 `DOM` 操作。这意味着：

+ **跨平台：** 你可以在 `Node.js` 环境或小程序中使用相同的响应式逻辑。
+ **按需引入：** 如果你的项目只需要响应式能力，可以直接引入 `@vue/reactivity`，无需加载整个 `Vue` 框架。
+ **更好的 `tree shaking`：** 由于模块清晰，打包工具可以轻松移除未使用的代码。

相比之下，Vue 2 的响应式系统与组件系统深度耦合，无法单独剥离。

---
以上实现的皆为简易代码，照着理解原理的方向去的。实际上`Vue3`在很多边界条件、细节处理上有很多**妙处**，感兴趣的朋友，可以直接上[Vue3源码库](https://github.com/vuejs/core)去学习学习。

---

**参考资料：**
+ [vuejs/core](https://github.com/vuejs/core)
+ [Vue官方文档](https://vuejs.org/)