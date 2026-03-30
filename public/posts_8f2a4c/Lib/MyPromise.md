---
title: "手敲Promise，认识Promise"
date: "2026-03-24"
description: "跟着手敲一遍Promise，认识Promise的实现逻辑。"
headerImage: "https://pic1.imgdb.cn/item/69c9e2820ba4e83bd178df0f.webp"
thumbnail: "https://pic1.imgdb.cn/item/69c9e2820ba4e83bd178df0f.webp"
---

# 手敲Promise，认识Promise

> 跟着手敲一遍Promise，认识Promise的实现逻辑。

前端技术里面，有什么是在工作中经常用到，好像很容易，又好像很难的东西，我第一个会想到是 ***Promise***

那么下面我们将拆开 ***Promise***类，让我们一起搞懂这个晦涩的类（完整代码在[最后](#whole-promise)）。

*MDN `Promise`状态转移参考图* ⬇️
![Promise状态转移](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/promises.png "Promise状态转移")



直接上代码🫡
```js
// 状态常量，对应Promise的三种状态值
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';



class MyPromise {
    state = PENDING; // 默认是“等待 Pending”

    // exectector 回调函数，是在new MyPromise时立即执行的，传入的两个参数，分别对应resolve和reject
    constructor(executor) {
    
        const resolve = (value) => {}
        const reject = (reason) => {}

        try{
            executor(resolve, reject);
        } catch(error) {
            // 捕获错误执行executor回调函数时的错误
            reject(error);
        }
    }
}

// 使用
const p = new MyPromise((resolve, reject) => {
    // 执行回调函数...
})
```

上面的代码，我们基本搭建了一个 ***Promise*** 类大体框架。

```js
// 增加一个changeState方法，接收回调函数executor中调用resolve或reject的处理

class MyPromise {
    state = PENDING;
    contructor(executor) {
        const resolve = (value) => {
            // 改变状态为成功，传入数据value
            this.changeState(FULFILLED, value);
        }
        const reject = (reason) => {
            // 改变状态为失败，传入失败reason
            this.changeState(REJECTED, reason);
        }
        // ...
    }

    /**
     * 改变状态的方法
    */
    changeState(state, data) {
        if (this.state !== PENDING) return; // 表明该Promise对象状态已经更改确认了（可能时FULFILLED或REJECTED），则不执行后续操作

        this.state = state; // 改变状态
        this.result = data; // 保存数据

        this.run(); // 此函数后面再说
    }

    run() {
        // ...
    }
}

// 使用场景
const p = new MyPromise((resolve, reject) => {
    // 模拟异步操作，只需要关心在这里调用了resolve还是reject
    settimeout(() => {
        resolve('成功'); // 这句代码执行，则执行了changeState方法，并改变了状态为成功，并保存数据为成功
        // reject('失败'); // 反之亦然
    }, 1000);
})
```

接下来就是比较晦涩的`then`方法了。抓紧了，要加速罗~🚗

**`then`方法要点:**
1. `then`方法接收两个参数，第一个参数为`FULFILLED`状态的回调函数，第二个参数为`REJECTED`状态的回调函数
2. `then`方法返回一个新的`Promise`
3. `then`传入的`onFullfilled`和`onRejected`什么时候执行？
4. `then`调用后返回的`Promise`对象的`resolve`和`reject`什么时候被调用？

```js

class MyPromise {
    state = PENDING;

    // 存放then方法传入的回调函数
    handlers = [];

    constructor(executor) {}

    changeState(state, data) { }

    then(onFullfilled, onRejected) {
        // 创建一个返回的Promise对象
        return new MyPromise((resolve, reject) => {
            /**
             * 解答一个问题：then方法传入的onFullfilled和onRejected，以及返回的Promise对象的resolve和reject，都不是一执行
             * then方就立马执行的。也就是说这些个方法，都是在别处执行的。所以，类中需要有一个属性handlers存放这些方法，
             * 待到合适的时机，再取出来执行。
             * 
             * 那么，为什么是handlers呢？
             * 
             * 且看如下的情况：
             * const p = new MyPromise((resolve, reject) => {});
             * p.then(res => {})
             * p.then(res => {})
             * p.then(res => {})
             * 
             * Promise对象可以多次调用then方法，所以就得是handlers了。
            */

            this.handlers.push({
                onFullfilled,
                onRejected,
                resolve,
                reject,
            });

            // 执行run，是不是很熟悉，刚才changeState方法，也调用了这个run方法了。接下来，就看run方法的处理了
            this.run();
        })
    }

    run() {
        // 还是先判断Promise当前的状态，如果状态以确定，则无需操作
        if (this.state === PENDING) return;


        // 遍历handlers数组，取出其中的方法
        while(this.handlers.length) {
            const { onFullfilled, onRejected, resolve, reject } = this.handlers.shift();

            // 根据state状态，传入onFullfilled或者onRejected方法
            if (this.state === FULFILLED) {
              this.runOne(onFulfilled, resolve, reject);
            } else {
              this.runOne(onRejected, resolve, reject);
            }
        }
    }

    runOne(callback, resolve, reject) {
        // 暂时先不用管这个runMiscrotask函数，只需要在意当前runOne函数做了什么。就当runMiscrotask(() => {})这行代码不在这里
        this.runMiscrotask(() => {
            const selted = this.state === FULFILLED ? resolve : reject;

            // 状态穿透，对应的是p.then('123')的情况，then方法传入的回调函数不是函数，则此状态穿透至下一个then方法传入的回调
            /**
             * const p = new MyPromise((resolve, reject) => {})
             * 
             * p.then('123').then(res => {
             *  // 穿透到这里了
             * })
            */
            if (typeof callback !== "function") {
                selted(this.result);
            } else {
                try {
                    // 执行回调函数，得到一个结果
                    const res = callback(this.result);
                    // 判断这个res是不是Promiseable对象（不懂Promiseable对象是什么？且看isPromiseLike函数的实现）
                    if (isPromiseLike(res)) {
                      res.then(resolve, reject);
                    } else {
                      resolve(res);
                    }
                } catch (error) {
                    // 执行then传入的回调函数时，可能抛出错误，捕获
                    reject(error);
                }
            }
        })
    }
}

// 只要是对象，且对象内存在then方法，则认为这个对象是Promiseable对象
function isPromiseLike(obj) {
    if (
      value != null &&
      typeof value === "object" &&
      typeof value.then === "function"
    ) {
      return true;
    }
    return false;
}

/**
 * 解法问题：
 * 1. then方法传入的回调函数，是什么时候执行？
 * 答：是在Promise状态改变时执行的，不管是改变成FULFILLED抑或是REJECTED。看代码run方法开头的判断。
 * 
 * 2，then方法返回的新的Promise对象的resolve和reject，什么时候被调用？
 * 答：在执行then方法传入的onFullfilled或者onRejected方法时，根据执行结果，选择执行resolve还是reject。
 * 特殊情况是存在状态穿透的时候。看代码runOne方法。
*/
```


最后，把上面遗留的`runMiscrotask`方法实现一下。（`runMiscrotask`方法，就是把then方法传入的回调函数，放到微任务队列中执行。`）

```js
class MyPromise {
    // ...
    runMiscrotask(func) {
        // 将传入方法func放入微任务队列中执行
        if (typeof process === "object" && typeof process.nextTick === "function") {
          // node环境
          process.nextTick(func); // 此操作会将fn这个函数放到微队列中
        } else {
          // 浏览器
          if (MutationObserver && window.MutationObserver) {
            // 这个MutationObserver创建一个监听器，监听dom元素的变化，当dom元素变化后，其回调函数会被放入到微队列中
            const observer = new MutationObserver(func);

            const textNode = document.createTextNode("0");
            observer.observe(textNode, { characterData: true });

            // 手动更改这个dom元素，触发监听
            textNode.data = 1;
          } else if (setImmediate) {
            // ie10+
            setImmediate(func);
          } else {
            setTimeout(func, 0);
          }
        }

    }
}
```

把剩下的`Promise.prototype.catch`和`Promise.prototype.finally`方法实现一下`
```js
// catch
MyPromise.prototype.catch = function (callback) {
    // catch方法就是调用then方法
    return this.then(null, fn);
};

// finally
MyPromise.prototype.finally = function (callback) {
    // 不管是then还是catch还是finally方法，执行后都会返回新的promise，所以要注意值和错误的往下传递
    return this.then(
      (data) => {
        callback();
        return data;
      },
      (err) => {
        callback();
        throw err;
      },
    );
};
```


<a id="whole-promise"></a>
**~完整代码**⚡⚡⚡

```js
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class MyPromise {
    state = PENDING;
    handlers = [];
    constructor(excator) {
      const resolve = (data) => {
        this.changeState(data, FULFILLED);
      };
      const reject = (reason) => {
        this.changeState(reason, REJECTED);
      };

      try {
        excator(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }

    changeState(result, state) {
      if (this.state !== PENDING) return;
      this.state = state;
      this.result = result;
      this.run();
    }

    then(onFulfilled, onRejected) {
      return new MyPromise((resolve, reject) => {
        this.handlers.push({
          onFulfilled,
          onRejected,
          resolve,
          reject,
        });
        this.run();
      });
    }

    run() {
      if (this.state === PENDING) {
        return;
      }
      while (this.handlers.length) {
        const { onFulfilled, onRejected, resolve, reject } =
          this.handlers.shift();
        if (this.state === FULFILLED) {
          this.runOne(onFulfilled, resolve, reject);
        } else {
          this.runOne(onRejected, resolve, reject);
        }
      }
    }

    runOne(callback, resolve, reject) {
      this.runMiscrotask(() => {
        const selted = this.state === FULFILLED ? resolve : reject;
        if (typeof callback !== "function") {
          selted(this.result);
        } else {
          try {
            const data = callback(this.result);
            if (isPromiseLike(data)) {
              data.then(resolve, reject);
            } else {
              resolve(data);
            }
          } catch (error) {
            reject(error);
          }
        }
      });
    }

    runMiscrotask(fn) {
      if (typeof process === "object" && typeof process.nextTick === "function") {
        process.nextTick(fn);
      } else {
        if (MutationObserver && window.MutationObserver) {
          const observer = new MutationObserver(fn);

          const textNode = document.createTextNode("0");
          observer.observe(textNode, { characterData: true });
          textNode.data = 1;
        } else if (setImmediate) {
          // ie10+
          setImmediate(fn);
        } else {
          setTimeout(fn, 0);
        }
      }
    }
}

MyPromise.prototype.catch = function (fn) {
    return this.then(null, fn);
};

MyPromise.prototype.finally = function (callback) {
    return this.then(
      (data) => {
        callback();
        return data;
      },
      (err) => {
        callback();
        throw err;
      },
    );
};

// 判断符合 PromiseA+规范
const isPromiseLike = (value) => {
  if (
    value != null &&
    typeof value === "object" &&
    typeof value.then === "function"
  ) {
    return true;
  }
  return false;
};
```

**参考资料：**

[PromiseA+](https://promisesaplus.com/)

[MDN Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)



