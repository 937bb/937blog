---
title: JavaScript 系列教程 | 第 8 章：异步编程基础 —— 回调、Promise 与 async/await
description: "\U0001F680 本章将用最通俗易懂的语言，结合大量示例和流程图，深入讲解 JavaScript 异步编程的核心知识点，包括回调函数、Promise 以及 async/await，帮助你彻底理解异步的原理与实战。"
keywords: 'JavaScript, 异步编程, 回调, Promise, async/await, 事件循环'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories: 
  - JavaScript
tags: 
  - 教程 
  - JavaScript
date: '2025-06-13 16:52'
abbrlink: 39211
---

## 一、开场白话：为什么要学异步？

想象一下，你去餐厅点餐。你不会在点完菜后一直站着等厨师做完菜才干别的事，而是先去找朋友聊天，或者玩手机，等菜好了，服务员再叫你取餐。
这就是异步编程的本质——**不会因为某个任务没完成而阻塞后续操作**。

JavaScript 是单线程语言，也就是说，它一次只能干一件事。如果遇到耗时操作（如网络请求、读文件等）阻塞，就会让页面卡死，体验非常差。
为了解决这个问题，JavaScript 发明了“异步编程”机制，让耗时任务在后台跑，完成后再通知主线程继续处理。

---

## 二、异步的三种经典实现方式

* 回调函数（Callback）
* Promise 对象
* async/await 语法糖

下面我们一个一个来聊。

---

## 三、回调函数（Callback）

### 1. 什么是回调？

简单来说，回调函数就是把一个函数当作参数，传递给另一个函数，让它“完成任务后再帮你调用”。

### 2. 小故事：打包快递回调

假如你寄快递，给快递员一个电话，让他送达后打电话告诉你“快递已送达”，你把电话给了快递员，这个电话就是回调函数。

### 3. 示例代码：

```js
function fetchData(callback) {
  setTimeout(() => {
    const data = { name: '小明', age: 18 };
    callback(data);  // 任务完成后调用回调函数
  }, 2000);  // 模拟网络请求耗时2秒
}

console.log('开始请求数据...');
fetchData(function(result) {
  console.log('收到数据:', result);
});
console.log('请求发出，继续执行后续代码');
```

🧠 **流程解释**：

* `fetchData` 模拟了一个异步操作，2秒后返回数据。
* 在这2秒里，主线程继续执行后面的代码。
* 2秒后，`callback` 被调用，输出收到的数据。

### 4. 回调的缺点

* 如果多层嵌套，代码会变得很难看，俗称“回调地狱”。
* 错误处理复杂，容易漏掉异常。

---

## 四、Promise —— 异步的新希望

### 1. Promise 是什么？

Promise 就像是一张“任务承诺卡”，代表一个异步操作最终完成（成功或失败）的结果。

### 2. Promise 三种状态

* **Pending（进行中）**：刚开始，异步任务还没完成。
* **Fulfilled（已成功）**：任务成功完成。
* **Rejected（已失败）**：任务失败。

### 3. 小故事：订餐承诺卡

你给餐厅订了餐，他们给你一张“承诺卡”，告诉你“我会在30分钟内送达或者告诉你出错了”。这张卡就是 Promise。

### 4. Promise 基本用法示例

```js
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;  // 模拟请求成功或失败
      if (success) {
        resolve({ name: '小明', age: 18 });  // 成功时调用 resolve
      } else {
        reject('请求失败');  // 失败时调用 reject
      }
    }, 2000);
  });
}

console.log('开始请求数据...');
fetchData()
  .then(result => {
    console.log('请求成功:', result);
  })
  .catch(error => {
    console.error('请求失败:', error);
  });
console.log('请求发出，继续执行后续代码');
```

🧠 **执行流程**：

* `fetchData` 返回一个 Promise，表示异步任务。
* 任务完成时调用 `resolve` 或 `reject`，通知结果。
* 通过 `.then()` 绑定成功回调，`.catch()` 绑定失败回调。
* 主线程继续执行，不被阻塞。

### 5. Promise 优势

* 链式调用避免回调地狱
* 错误统一捕获更方便

---

## 五、async/await —— 写异步就像写同步

### 1. async/await 是什么？

它是基于 Promise 的语法糖，让你用同步代码的方式写异步，代码更简洁易读。

### 2. 小故事：请假办事流程

你写了一封请假条（async 函数），交给领导审批（await 等待结果），审批通过后再去做下一步事。整个流程看起来像是同步进行，但其实领导审批是异步的。

### 3. 代码示例

```js
function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ name: '小明', age: 18 });
    }, 2000);
  });
}

async function getData() {
  console.log('开始请求数据...');
  const result = await fetchData();  // 等待 Promise 完成
  console.log('收到数据:', result);
  console.log('数据处理完成');
}

getData();
console.log('请求发出，继续执行后续代码');
```

🧠 **执行流程**：

* `getData` 是异步函数，遇到 `await` 语句暂停执行，等待 `fetchData` 返回结果。
* 这期间主线程继续执行后面的同步代码。
* Promise 完成后，`getData` 恢复执行。

---

## 六、事件循环（Event Loop）浅析 —— 异步背后的秘密

![事件循环流程图](https://cdn.jsdelivr.net/gh/wanghaoze/images/img/2022/03/event-loop.jpg)

> 事件循环就像厨师的记事本，记录任务顺序，确保异步任务按规则依次完成。

### 1. 任务队列的两大分类

* **宏任务（Macro Task）**：如主代码、`setTimeout`、`setInterval`
* **微任务（Micro Task）**：如 Promise 的 `.then()`、`process.nextTick`（Node.js）

### 2. 执行流程简述

* 执行主线程代码（宏任务）
* 执行完毕后，检查微任务队列，执行所有微任务
* 渲染页面
* 进入下一个宏任务循环

这解释了为什么 Promise 的 `.then()` 会比 `setTimeout` 先执行。

---

## 七、异步编程综合示例：请求数据并处理

```js
function getUser() {
  return new Promise(resolve => {
    setTimeout(() => resolve({ id: 1, name: '小明' }), 1000);
  });
}

function getPosts(userId) {
  return new Promise(resolve => {
    setTimeout(() => resolve([{ id: 101, content: '第一篇文章' }]), 1000);
  });
}

async function showUserPosts() {
  try {
    const user = await getUser();  // 等待用户信息
    console.log('用户:', user);
    const posts = await getPosts(user.id);  // 等待用户帖子
    console.log('帖子列表:', posts);
  } catch (error) {
    console.error('请求出错:', error);
  }
}

showUserPosts();
```

🧠 **数据流程**：

| 时间 | 操作                    | 数据样子                                 |
| ---- | ----------------------- | ---------------------------------------- |
| 0s   | 调用 `showUserPosts`    | —                                        |
| 1s   | `getUser` 返回用户数据  | `{ id: 1, name: '小明' }`                |
| 2s   | `getPosts` 返回帖子列表 | `[ { id: 101, content: '第一篇文章' } ]` |

---

## 八、总结

* 异步编程是 JavaScript 开发中不可绕过的重要课题。
* 回调是最原始的异步实现，但容易造成“回调地狱”。
* Promise 带来链式调用和更好的错误处理机制。
* async/await 让异步代码像同步一样写，提升可读性。
* 理解事件循环能帮助你更好理解异步执行顺序。

---

## 九、推荐阅读 & 参考资料

* 📘 [阮一峰的网络日志 - JavaScript 异步编程](https://www.ruanyifeng.com/blog/2015/05/async.html)
* 📗 [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* 📗 [MDN - async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
* 📘 [极客时间《JavaScript异步编程实战》专栏](https://time.geekbang.org/column/intro/100042501)
* 📘 [菜鸟教程 - JavaScript 异步](https://www.runoob.com/js/js-async.html)

---

如果你需要我帮你写第9章或者补充流程图动画，也随时告诉我！
