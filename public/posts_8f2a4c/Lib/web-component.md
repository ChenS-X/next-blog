---
title: "Web Components：“摆脱”框架的终极方案？"
date: "2026-03-24"
description: "聊聊WebComponent的简单使用和未来方向🤖"
headerImage: "https://pic1.imgdb.cn/item/69c9e2830ba4e83bd178df14.gif"
thumbnail: "https://pic1.imgdb.cn/item/69c9e2830ba4e83bd178df14.gif"
---

## Web Component

概念：`Web Components` 是一组浏览器**原生 API**，允许开发者创建可复用的自定义元素。

注意**原生 API**被加深了。是的，`Web Components` 是浏览器原生支持的，不依赖类似 `Vue` 、`React` 等框架即可运行，理论上一次编写，可在任何框架或无框架的项目中复用。

> 苦于前端无尽的框架学习？苦于日益复杂的构建工具链和频繁的框架迁移？那么，可以了解一下`Web Components`。


1. 自定义组件

下面，我们将试着创建一个简单的`Web Component`，来了解一下`Web Component`的基础。直接上代码：⬇️

```js
// mybutton.js

// 定义一个类，继承至 HTMLElement
class MyButton extends HTMLElement {
    constructor() {
        super();
    }

    // 生命周期函数 connectedCallback，当元素被挂载到 DOM 中时，会执行这个函数
    connectedCallback() {
        // this 表示当前元素
        this.innerHTML = `<button>Click me</button>`;
    }
}

// 注册元素，customElements是window的一个属性，用于注册自定义元素
// ‘my-button’就是元素的名称，在html中标签使用<my-button>
customElements.define('my-button', MyButton);
```
```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- 自定义元素 -->
    <my-button></my-button>
    <!-- 引入自定义元素-->
    <script src="./mybutton.js"></script>
</body>
</html>
```
运行结果：⬇️
![简单的Web Component](https://pic1.imgdb.cn/item/69c9e4d50ba4e83bd178efad.png "简单的Web Component")

就这样，咱就创建了一个简单的`Web Component`了。

这也没什么啊？我好好的直接写一个`<button>`标签就完事的东西，还得这么大动干戈吗？

不着急~，咱再给他来点东西。

```html
<my-button default-click="false"></my-button>
```
```js
class MyButton extends HTMLElement {
    static observedAttributes = ['default-click'] // 声明需要被监听的属性
    state = {
        click: false
    }
    constructor() {
        super();
    }

    // 生命周期函数 connectedCallback，当元素被挂载到 DOM 中时，会执行这个函数
    connectedCallback() {
        // this 表示当前元素
        this.innerHTML = `<button>Click me</button>`;
    }

    // 监听属性的变化，必须得在静态属性 observedAttributes 中声明的属性，才会被监听到
    attributeChangedCallback(name, oldValue, newValue) {
        /**
         * name: 属性名
         * oldValue: 属性旧值
         * newValue: 属性新值
        */
        console.log('name:', name, '== oldValue:',oldValue, '== newValue:', newValue);

        if (name === 'default-click') {

            this.state.click = newValue === 'true';

            const button = this.querySelector("button");

            if (button) {
                // 得判断这里的button是否为null，因为这个callback会在一开始，connectedCallback的之前调用，彼时的dom上找不到button
                button.style.background = `${this.state.click ? "#0f0" : "orange"}`;
            }
        }
    }
}
```
控制台打印：⬇️
![打印](https://pic1.imgdb.cn/item/69c9e3c30ba4e83bd178e8aa.png "打印")
运行结果：⬇️
![结果对比](https://pic1.imgdb.cn/item/69c9e3c00ba4e83bd178e889.png "结果对比")

啊？？？？不是哥，你闹呢？不就是个按钮颜色改变吗？你整这么一大堆代码？
<div align="start">
    <img src="https://pic1.imgdb.cn/item/69c9e3c00ba4e83bd178e88d.gif" alt="疑惑">
</div>

额~，不如咱聊聊今天的天气🌦️😅！咳咳，不对，总结一下目前的知识点：
+ `static observedAttributes`： 声明需要被监听的属性
+ `connectedCallback`： 生命周期函数，当元素被挂载到 DOM 中时，会执行这个函数
+ `attributeChangedCallback`： 生命周期函数，监听属性的变化，属性必须在`observedAttributes`中声明，才会被监听到。初次挂载元素时会执行一次，后续属性改变时会执行一次。
  
看着有没有和`Vue2`组件 很相像？缺了点什么呢？是不是缺了`template`模板和响应式呢？

2. `Template`模板

那么接下来，看看`Web Component`的`template`模板的使用：⬇️

```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <my-button></my-button>
    <!-- id很重要，在自定义组件内部需要通过这个id获取template -->
    <template id="my-button-template">
        <style>
            .btn {
                padding: 5px 10px;
                border: 2px solid red;
            }
        </style>
        <button class="btn">Click me！！</button>
    </template>
    <script src="./mybutton.js"></script>
</body>
</html>
```
```js
class MyButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const template = document.getElementById('my-button-template'); // 根据ID获取template
        const framgement = template.content.cloneNode(true); // 复制一份，然后赋值给this.innerHTML;
        this.appendChild(framgement); // 加入到当前元素下 
    }
}
```
![template初识](https://pic1.imgdb.cn/item/69c9e3c00ba4e83bd178e88b.png "template初识")

还没完，现在这个自定义组件`my-button`和外面是没有隔离的，外部样式会影响内部。

如：⬇️
```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 外部样式表 */
        .btn {
            color: orange;
            text-shadow: 0 0 1px black;
            border-style: dashed !important;
        }
    </style>
</head>
<body>
    <my-button></my-button>
    <!-- id很重要，在自定义组件内部需要通过这个id获取template -->
    <template id="my-button-template">
        <style>
            .btn {
                padding: 5px 10px;
                border: 2px solid red;
            }
        </style>
        <button class="btn">Click me！！</button>
    </template>
    <script src="./mybutton.js"></script>
</body>
</html>
```
运行结果：⬇️
![样式不隔离](https://pic1.imgdb.cn/item/69c9e3c00ba4e83bd178e88a.png "样式不隔离")

字体样式和`boder-style`被外部样式表影响了。

如果确实需要隔离样式，那么就需要使用`shadow-dom`了。

3. `Shadow DOM`

以下是[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_shadow_DOM)对影子DOM的一些描述：
> 影子 DOM 允许将隐藏的 DOM 树附加到常规 DOM 树中的元素上——这个影子 DOM 始于一个影子根，在其之下你可以用与普通 DOM 相同的方式附加任何元素。

![shadow-dom](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM/shadowdom.svg "shadow-dom")

讲多无谓，直接贴代码看对比：⬇️
*html沿用上面的代码（不是我偷懒哈~ 好吧，是我偷懒🤪）*
```js
class MyButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // const template = document.getElementById('my-button-template'); // 根据ID获取template
        // const framgement = template.content.cloneNode(true); // 复制一份，然后赋值给this.innerHTML;
        // this.appendChild(framgement); // 加入到当前元素下 
        
        // 根据ID获取template
        const template = document.getElementById('my-button-template');
        // 复制一份，然后赋值给this.innerHTML;
        const framgement = template.content.cloneNode(true);
        // 创建shadowRoot
        const shadowRoot = this.attachShadow({ mode: "open" });
        // 添加template内容到shadowRoot
        shadowRoot.appendChild(framgement);
    }
}

```
运行结果：⬇️
![样式隔离](https://pic1.imgdb.cn/item/69c9e3c00ba4e83bd178e88f.png "样式隔离")

**一些解释：**
+ **影子宿主（`Shadow host`）:** 影子 DOM 附加到的常规 DOM 节点。在这里就是`my-buttom`元素，也就是代码中的`this`。
+ **影子根（`Shadow root`）:** 影子树的根节点。
+ **影子树（`Shadow tree`）:** 影子 DOM 树。在本例中就是 `template`内的DOM树。
+ **`mode: open`：** 允许外部访问影子 DOM。如果是`false`，则影子 DOM 是隐藏的，不可被外部访问。一般默认使用`open`。
  
事实上，`Shadow DOM`并非和`Web Component`强绑定，而是和`Web Component`一样，是浏览器原生支持的功能。多用于`微前端`等领域。`Web Component`是借用了`Shadow DOM`隔离机制，以达到更好的效果。

仅此而已吗？不是的，我们再来给`Web Component`附点魔 👹

4. 插槽`<slot>`
```html
<body>
    <my-button>
        <span slot="before">具名插槽1</span>
        默认插槽🤖
        <span slot="after">具名插槽2</span>
    </my-button>
    <!-- id很重要，在自定义组件内部需要通过这个id获取template -->
    <template id="my-button-template">
        <style>
            .btn {
                padding: 5px 10px;
                border: 2px solid red;
            }
        </style>
        <div>
            <!-- 具名插槽 -->
            <slot name="before"></slot>
            <button class="btn">
                <!-- 默认插槽 -->
                <slot></slot>
            </button>
            <!-- 具名插槽 -->
            <slot name="after"></slot>
        </div>
    </template>
    <script src="./mybutton.js"></script>
</body>
```
运行结果：⬇️
![插槽](https://pic1.imgdb.cn/item/69c9e3b10ba4e83bd178e81a.png "插槽")

怎么样，这样看起来是不是就和`Vue`有点相似了~

至此，咱们通过自定义元素（`Custom Element`）、模板（`Template`）、影子 DOM（`Shadow DOM`）讲述了一个`Web Component`的基本使用了。

---

是不是还差点东西，**响应式**。很遗憾，`Web Component`本身不支持响应式数据，但是我们可以通过`Vue3`的[`@vue/reactivity`](https://chens-x.github.io/next-blog/posts/Vue/VUE-reactivity)来实现。另外附加`lit-html`辅助。构建一个可用的，开发体验更好的且带有响应式功能的`Web Component`。

> 关于`lit`的说明，请点击链接[Lit](https://www.npmjs.com/package/lit)

完整流程：⬇️
```shell
# 创建一个基于vite的项目
npm create vite@latest
```

选择`Vanilla`，纯JS项目，不适用`React`或者`Vue`框架
![Vanilla](https://pic1.imgdb.cn/item/69c9e3b10ba4e83bd178e817.png "Vanilla")

```shell
# 安装依赖lit和@vue/reactivity
npm install lit-html @vue/reactivity
```
创建一个包装类`MyComponent`
```js
// MyComponent.js
import { html, render } from "lit-html";
import { reactive, isReactive, effect } from "@vue/reactivity";
export default class MyCompoment extends HTMLElement {
  html = html; // 挂载html方法，方便子类使用
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    if (!isReactive(this.state)) {
      // 创建响应式数据
      this.state = reactive(this.state || {});
    }

    // effect副作用函数，收集依赖，当state改变时，会重新执行effect函数，再次渲染
    effect(() => {
      const content = this.render();
      render(content, this.shadowRoot);
    });
  }
}

```
创建`my-button.js`文件，并写入自定义元素代码：
```js
import MyCompoment from "./MyCompoment";
export default class MyButton extends MyCompoment {
  static observedAttributes = ["default-click"];
  state = {
    click: false,
  };

  handleClick() {
    console.log("点击了按钮");
    this.state.click = !this.state.click;
    // 抛出事件
    const e = new CustomEvent('change', {
        detail: {
            click: this.state.click
        }
    })
    this.dispatchEvent(e);
  }
  render() {
    // 从MyCompoment继承过来的html方法，在以类似模板字符串的方式写html，可以绑定事件
    return this.html`
            <style>

                .btn.clicked{
                    background:orange;
                    color: #fff;
                }
            </style>
            <!--  插槽的使用 -->
            <!-- 注意：插槽引入的元素不是在shadow dom中的，是外面的元素，样式受外部影响 -->
            <span>
                <slot></slot>
            </span>
            <button class="btn ${this.state.click ? "clicked" : ""}" @click="${this.handleClick.bind(this)}">点击我</button>
            <slot name="right"></slot>
        `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, newValue);

    if (name === "default-click") {
      this.state.click = !this.state.click;
    }
  }
}
```
最后，在`main.js`中注册`my-button`，并在`index.html`中引用使用。
```js
import MyButton from "./mybutton";
customElements.define('my-button', MyButton)
```
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webcomponentdemo01</title>
    <style>
      .btn {
        border-color: #f00;
        border-width: 10px;
      }
      span {
        color: blue;
      }
    </style>
    <script type="module" crossorigin src="/assets/index-B3Oy4DAn.js"></script>
  </head>
  <body>
    <my-button default-click="false">
      按钮1
      <span slot="right">具名插槽</span>
    </my-button>
    <script>
      const myButton = document.querySelector('my-button');
      // 自定义事件
      myButton.addEventListener('change', (e) => {
        console.log(e.detail.click)
      })
    </script>
  </body>
</html>
```
运行结果：⬇️
![响应式](https://pic1.imgdb.cn/item/69c9e3b10ba4e83bd178e819.png "响应式")

**一些解释：**
+ **`MyComponent`类：** 一个抽象类，用于创建响应式数据和触发依赖收集和渲染。所有自定义组件都可以继承它。简单理解，就是放在那不动就行了。
+ **`MyButton`类：** 一个具体的类，继承自`MyComponent`，用于创建自定义元素。类似`React`类组件。
+ **`lit-html`& `@vue/reactivity`：** 借用这两个库，让`Web Component`拥有响应式功能，让`Web Component`以一种更类似`React`类组件的形式进行开发。
  
---
以上就是`Web Component`的基本了解以及可用的开发方案。

但是肯定会有说“这什么鬼，一点点功能要写一大堆代码，绕来绕去的，还麻烦。还不如使用`Vue`或者`React`呢！”

目前来看，是的，这确实绕。

但它最大的好处是原生支持。

还是刚才的项目，我们尝试将它打包，运行`npm run build`

生成打包产物：⬇️
![打包产物](https://pic1.imgdb.cn/item/69c9e3b10ba4e83bd178e818.png "打包产物")

使用：⬇️
![使用](https://pic1.imgdb.cn/item/69c9e3b20ba4e83bd178e81b.png "使用")

是的，就目前来看，`Web Component`确实比成熟的框架（如`Vue`、`React`）相比，开发起来要麻烦很多。而且没有很好的工具链支持。但是原生支持且轻量，且借助 `Shadow DOM` 实现样式和 `DOM` 结构的强隔离。让它在诸如构建稳定的第三方嵌入组件（如聊天插件、广告组件）以及**微前端**领域都非常友好。

回到本问标题：**Web Components：到底是不是“摆脱”框架的终极方案？**

其实并不是“摆脱”，而是相辅相成的。二者擅长的领域各不相同。未来的前端开发可能会是一种 **“混合模式”**：用 `Web Components` 构建基石（设计系统），用框架搭建上层应用（复杂交互和业务逻辑）

---
**参考资料：**
+ [Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)
+ [lit-html](https://lit.dev/)

