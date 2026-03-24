---
title: "手敲Promise，认识Promise"
date: "2026-03-24"
description: "跟着手敲一遍Promise，认识Promise的实现逻辑。"
headerImage: "https://fastly.jsdelivr.net/gh/itmore9527/files@main/img/1774341795903.png"
thumbnail: "https://fastly.jsdelivr.net/gh/itmore9527/files@main/img/1774341795903.png"
---

# 手敲Promise，认识Promise

> 跟着手敲一遍Promise，认识Promise的实现逻辑。

前端技术里面，有什么是好像很容易又好像很难的东西，我第一个会想到是 ***Promise***

那么下面我们将手敲一遍 ***Promise***的实现，让我们一起搞懂这个晦涩的类。

*带着问题写代码，事半功倍*
1. `Promise`是一个类，构建时传入一个`回调函数`，`回调函数`接收两个参数，分别是`resolve`和`reject`。
2. `Promise`有三种状态：`pending`、`fulfilled`、`rejected`。
3. `Promise.then`方法接收两个参数，分别是`onFulfilled`和`onRejected`。并返回新的`Promise对象`。
   1. `onFulfilled`和`onRejected`都是函数，当`Promise`状态变为`fulfilled`或`rejected`时，会调用对应的函数。




