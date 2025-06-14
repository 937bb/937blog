---
title: JavaScript 系列教程 | 第 9 章：事件机制与事件委托全解析
description: "\U0001F9E0 本章将以白话文、图解、故事和实战方式，带你深入理解 JavaScript 的事件机制，包括事件流、事件绑定、委托、冒泡、捕获等关键概念，全面掌握 DOM 编程核心能力。"
keywords: 'JavaScript, 事件机制, 事件委托, 事件绑定, DOM事件, JavaScript教程'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - JavaScript
date: '2025-06-14 14:23'
abbrlink: 14441
---

## 一、开场小故事：DOM 世界的快递系统

在 JavaScript 的世界里，DOM 节点就像一棵大树，而事件就像一份快递。你点击按钮（button）就好像是点击树上的一片叶子。

但奇怪的是，这份快递不是直接送给那片叶子的，而是从树根开始一路往下递，再从最底层往上传！这个过程叫做 **事件流（Event Flow）**。

---

明白了！你希望使用**纯 Markdown 文本排版**的方式（不依赖 Mermaid 或插件），我已为你整理如下版本：

---

## 二、事件流全貌：捕获 → 目标 → 冒泡

```text
事件传播流程如下：

事件捕获阶段（从外向内）：

Document
   ↓
<html>
   ↓
<body>
   ↓
<div class="wrapper">
   ↓
<button id="target">点击按钮</button>  ← 【事件目标阶段】
   ↑
<div class="wrapper">
   ↑
<body>
   ↑
<html>
   ↑
Document

事件冒泡阶段（从内向外）
```

> 📌 **说明**：
>
> * 事件从 `Document` 开始向下传播，直到目标元素（`target`）；
> * 然后再从 `target` 开始向上传播，直到 `Document`；
> * 捕获阶段是“从外到内”，冒泡阶段是“从内到外”；
> * “目标阶段”是捕获和冒泡的“交汇点”。

---

## 三、addEventListener 的第三个参数的秘密

```js
element.addEventListener('click', handler, true); // 第三个参数为 true 表示捕获
```

| 参数值   | 含义        |
| ----- | --------- |
| true  | 在捕获阶段触发   |
| false | 默认，冒泡阶段触发 |

大多数事件默认都在**冒泡阶段被处理**。

---

## 四、事件冒泡的常见应用场景

### 🌟 示例：点击关闭卡片

```html
<ul id="card-list">
  <li class="card">卡片1 <button class="close">×</button></li>
  <li class="card">卡片2 <button class="close">×</button></li>
  <li class="card">卡片3 <button class="close">×</button></li>
</ul>
```

```js
document.getElementById('card-list').addEventListener('click', function(e) {
  if (e.target.classList.contains('close')) {
    e.target.parentNode.remove();  // 删除整个卡片
  }
});
```

🧠 **解释**：我们并没有给每个 `button` 绑定点击事件，而是让它们的共同父节点 `ul` 来统一监听，判断是谁触发了事件。

---

## 五、事件委托：为何它如此重要？

### 📦 概念简述

事件委托就是利用事件冒泡，把事件绑定到父级，代替每个子元素单独绑定。

### 🎯 适用场景

* **列表内容动态生成**
* **节省内存、提高性能**
* **统一管理事件**

### 📌 示例场景：增删列表项

```js
const list = document.getElementById('todo-list');

list.addEventListener('click', function(e) {
  if (e.target.tagName === 'LI') {
    e.target.classList.toggle('done'); // 切换完成状态
  }
});
```

🎉 即使我们动态插入新的 `<li>`，这个事件也仍然能生效！

---

## 六、阻止冒泡与默认行为

### 🚫 阻止事件冒泡：

```js
e.stopPropagation();
```

### 🚫 阻止默认行为：

```js
e.preventDefault();
```

### 示例：点击链接但不跳转

```html
<a href="https://example.com" id="link">点击我</a>
```

```js
document.getElementById('link').addEventListener('click', function(e) {
  e.preventDefault();  // 阻止跳转
  alert('链接被点击，但不会跳转');
});
```

---

## 七、实战演练：事件委托实现 todo 应用

```html
<ul id="todo">
  <li>吃饭</li>
  <li>睡觉</li>
  <li>打代码</li>
</ul>
```

```js
const todo = document.getElementById('todo');

todo.addEventListener('click', function(e) {
  if (e.target.tagName === 'LI') {
    e.target.style.textDecoration = 'line-through';
  }
});
```

💡 优势：

* 不需要为每个 `<li>` 添加监听器；
* 动态插入的新任务也自动支持点击打勾！

---

## 八、事件对象详解

```js
element.addEventListener('click', function(e) {
  console.log(e.type);       // click
  console.log(e.target);     // 事件的触发源
  console.log(e.currentTarget); // 当前绑定事件的对象
});
```

| 属性                | 含义                |
| ----------------- | ----------------- |
| `e.type`          | 事件类型，如 click      |
| `e.target`        | 实际触发事件的元素         |
| `e.currentTarget` | 当前绑定监听器的元素（常用于委托） |

---

## 九、事件代理的性能对比小实验

### 原始绑定方式（为1000个按钮绑定事件）：

```js
for (let i = 0; i < 1000; i++) {
  document.getElementById('btn-' + i).addEventListener('click', handler);
}
```

### 事件委托方式：

```js
document.getElementById('container').addEventListener('click', function(e) {
  if (e.target.tagName === 'BUTTON') {
    handler(e);
  }
});
```

👀 **效果对比**：

* 原始方式注册了1000次事件
* 委托方式只注册1次，内存占用更低，渲染更快！

---

## 十、总结

| 技术点             | 说明                    |
| --------------- | --------------------- |
| 事件流             | 捕获 → 目标 → 冒泡          |
| 事件委托            | 父级元素统一处理子元素事件         |
| stopPropagation | 阻止事件冒泡                |
| preventDefault  | 阻止默认行为（如跳转）           |
| 性能优势            | 委托绑定少、性能优、适合动态 DOM 操作 |

💡 掌握事件委托 = 高效 DOM 编程的入门门槛！

---

## 十一、推荐阅读 & 参考资料（可在大陆访问）

* 📘 [阮一峰 - 事件机制详解](https://www.ruanyifeng.com/blog/2010/09/the_design_of_javascript_events.html)
* 📘 [菜鸟教程 - JavaScript 事件](https://www.runoob.com/js/js-events.html)
* 📘 [MDN - Event bubbling and capturing](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Building_blocks/Events)
* 📗 [掘金 - 事件委托详解](https://juejin.cn/post/6844903481044987912)
* 📗 [思否 - JavaScript 事件机制图解](https://segmentfault.com/a/1190000012806636)

---