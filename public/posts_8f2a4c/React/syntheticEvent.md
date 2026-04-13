---
title: "简单理解React合成事件（写代码版本）"
date: "2026-04-13"
description: "用代码过一遍React 合成事件的机制，分为17以前和17+"
headerImage: "https://pic1.imgdb.cn/item/69dc98941395de9438aaa287.gif"
thumbnail: "https://pic1.imgdb.cn/item/69dc98941395de9438aaa287.gif"
---

跟着代码实现一篇，应该就理解合成事件的机制了，不是很难理解的那种。

### React17以前
```js
// 以click为例
// 为document添加click事件，注意，是冒泡事件

function dispatchEvent(event) {
    // 获取事件类型
    const eventType = event.type;
    // 获取事件目标
    const target = event.target;
    // 获取事件源
    const currentTarget = event.currentTarget;
    // 获取事件对象
    const eventObj = event;

    // 创建合成事件
    const syntheticEvent = {
        type: eventType,
        target,
        currentTarget,
        eventObj,
    }


    // 记录事件传递路径
    const paths = [];
    let current = target;

    // 收集事件路径 paths = [button, div, body, html, document]
    while(current) {
        paths.push(current)
        current = current.parentNode;
    }

    // 请注意，当函数执行到这一步的时候，表示所有的原生事件（除了用户在代码中为document添加的原生事件以外）都已经执行完毕了
    // 此时，就可以开始执行合成事件了


    // 模拟捕获
    for(let i = paths.length - 1; i >= 0; i --) {
        const current = paths[i];
        // click事件捕获 -> onClickCapture = xxx
        const eventName = `on${eventType.slice(0, 1).toUpperCase()}${eventType.slice(1)}Capture`;
        if(current[eventName] && typeof current[eventName] === 'function') {
            // 执行合成事件，传入合成事件对象
            current[eventName](syntheticEvent);
        }
    }


    // 模拟冒泡，从paths数据的头部开始
    for(let i = o; i < paths.length; i ++) {
        const current = paths[i];
        const eventName = `on${eventType.slice(0, 1).toUpperCase()}${eventType.slice(1)}`;
        if(current[eventName] && typeof current[eventName] === 'function') {
            // 执行合成事件，传入合成事件对象
            current[eventName](syntheticEvent);
        }
    }
}

document.addEventListener('click', dispatchEvent); // 这是冒泡阶段执行回调

// 以上步骤都在是 React reconciliation 时内部处理的，是要早于用户自己在写代码中添加事件的。
```

```html
// 模拟使用
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>模拟React17之前的合成事件</title>
</head>
<body>
    <div id="root">
        <div id="parent">
            <button id="child">点击按钮</button>
        </div>
    </div>
    <script>
        // 获取DOM元素
        const parent = document.getElementById('parent')
        const child = document.getElementById('child')
        document.addEventListener('click', () => {
            console.log('document原生捕获事件');
        }, true);
        document.addEventListener('click', () => {
            console.log('document原生冒泡事件');
        });
        parent.addEventListener('click', () => {
            console.log('父组件原生捕获事件');
        }, true);
        parent.addEventListener('click', () => {
            console.log('父组件原生冒泡事件');
        });
        child.addEventListener('click', () => {
            console.log('子组件原生捕获事件');
        }, true);
        child.addEventListener('click', () => {
            console.log('子组件原生冒泡事件');
        });

        // 模拟React组件添加合成事件
        // 约定好的规矩，原生事件的onclick -> 合成事件的onClick，捕获事件的onclickCapture -> 合成事件的onClickCapture
        parent.onClickCapture = function (event) {
            console.log('父组件合成捕获事件');
        }
        parent.onClick = function (event) {
            console.log('父组件合成冒泡事件');
        }
        child.onClickCapture = function (event) {
            console.log('子组件合成捕获事件');
        }
        child.onClick = function (event) {
            console.log('子组件合成冒泡事件');
        }


        // 最终输出如下
        // document原生捕获事件
        // 父组件原生捕获事件
        // 子组件原生捕获事件
        // 子组件原生冒泡事件
        // 父组件原生冒泡事件
        // 父组件合成捕获事件
        // 子组件合成捕获事件
        // 子组件合成冒泡事件
        // 父组件合成冒泡事件
        // document原生冒泡事件
    </script>
</body>
</head>
</html>
```
**关键点**：
1. `dispatchEvent`是在`document`元素的绑定的冒泡事件，也就是当`dispatchEvent`回调触发时，原生事件从捕获➡️冒泡的阶段已经完成了，最后才来执行这个`dispatchEvent`函数，才调用的合成事件（模拟捕获&模拟冒泡）。所以最终的打印结果，是先把原生事件的**捕获**&**冒泡**都打印，才再打印的**合成事件**的**捕获**和**冒泡**。
2. 合成事件捕获和冒泡事件名称是按照约定俗成的方式定义事件名称的 `onclick` ➡️ `onClick` 、`onclickCapture` ➡️ `onClickCapture`。




### React17+

代码实现
```js
/**
 * 绑定到跟容器的事件回调
 * @param{Event} event 事件对象
 * @param{Boolean} useCapture 区分是捕获还是冒泡阶段
*/
function dispatchEvent(event, useCapture) {
    // 获取事件类型
    const eventType = event.type;
    // 获取事件目标
    const target = event.target;
    // 获取事件源
    const currentTarget = event.currentTarget;
    // 获取事件对象
    const eventObj = event;

    // 创建合成事件
    const syntheticEvent = {
        type: eventType,
        target,
        currentTarget,
        eventObj,
    }

    const paths = [];
    let current = target;
    // 收集事件路径 paths = [button, div, root]
    while(current) {
        paths.push(current);
        current = current.parentNode;
    }

    // 此时根据传入的useCapture参数，来决定是模拟捕获还是冒泡，就不会像在React17以前，要等到冒泡到最后一步才来执行所有的合成事件
    if(useCapture) {
        // 会在事件捕获阶段进入这段，执行下面的代码
        // 模拟捕获，从paths数组尾部开始
        for(let i = paths.length - 1; i >= 0; i --) {
            const current = paths[i];
            const eventName = `on${eventType
              .slice(0, 1)
              .toUpperCase()}${eventType.slice(1)}Capture`;
            if (
              current[eventName] &&
              typeof current[eventName] === "function"
            ) {
              // 执行合成事件，传入合成事件对象
              current[eventName](syntheticEvent);
            }
        }
    }


    if (!useCapture) {
        // 会在事件冒泡阶段进入这段，执行下面的代码
        // 模拟冒泡，从paths数组的头部开始
        for (let i = 0; i < paths.length; i++) {
          const current = paths[i];
          const eventName = `on${eventType
            .slice(0, 1)
            .toUpperCase()}${eventType.slice(1)}`;
          if (
            current[eventName] &&
            typeof current[eventName] === "function"
          ) {
            // 执行合成事件，传入合成事件对象
            current[eventName](syntheticEvent);
          }
        }
    }


    const root = document.getElementById("root");
    // 为根容器注册点击事件，分别是捕获和冒泡
    root.addEventListener(
      "click",
      (event) => dispatchEvent(event, true),
      true
    );
    root.addEventListener("click", (event) => dispatchEvent(event, false));
}

```

```html
// 模拟使用
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>模拟React17之前的合成事件</title>
</head>
<body>
    <div id="root">
        <div id="parent">
            <button id="child">点击按钮</button>
        </div>
    </div>
    <script>
     // 获取DOM元素
      const parent = document.getElementById("parent");
      const child = document.getElementById("child");
      document.addEventListener(
        "click",
        () => {
          console.log("document原生捕获事件");
        },
        true
      );
      document.addEventListener("click", () => {
        console.log("document原生冒泡事件");
      });
      parent.addEventListener(
        "click",
        () => {
          console.log("父组件原生捕获事件");
        },
        true
      );
      parent.addEventListener("click", () => {
        console.log("父组件原生冒泡事件");
      });
      child.addEventListener(
        "click",
        () => {
          console.log("子组件原生捕获事件");
        },
        true
      );
      child.addEventListener("click", () => {
        console.log("子组件原生冒泡事件");
      });

      // 模拟React组件添加合成事件
      // 约定好的规矩，原生事件的onclick -> 合成事件的onClick，捕获事件的onclickCapture -> 合成事件的onClickCapture
      parent.onClickCapture = function (event) {
        console.log("父组件合成捕获事件");
      };
      parent.onClick = function (event) {
        console.log("父组件合成冒泡事件");
      };
      child.onClickCapture = function (event) {
        console.log("子组件合成捕获事件");
      };
      child.onClick = function (event) {
        console.log("子组件合成冒泡事件");
      };


      //   最终的输出顺序如下，事件输出对称，且都在对应的捕获和冒泡阶段执行
      //   document原生捕获事件
      //   父组件合成捕获事件
      //   子组件合成捕获事件
      //   父组件原生捕获事件
      //   子组件原生捕获事件
      //   子组件原生冒泡事件
      //   父组件原生冒泡事件
      //   子组件合成冒泡事件
      //   父组件合成冒泡事件
      //   document原生冒泡事件

    </script>
<body>
<head>
</html>
```

**优化**：
1. 为根容器绑定代理事件，而不是`document`，兼容微前端
2. 为根容器分别绑定**捕获**和**冒泡**阶段的事件，这样就不会在最后**冒泡**回到跟容器的时候才开始模拟**合成事件**



不知道这样实现一遍有没有帮你理解到React合成事件的机制呢~ 🫰

### End~