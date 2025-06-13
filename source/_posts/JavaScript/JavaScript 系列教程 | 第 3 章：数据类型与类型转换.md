---
title: JavaScript ES 系列教程 | 第 3 章：数据类型与类型转换
description: "\U0001F680 本章通过白话文讲解 JavaScript 的基本数据类型及其隐式和显式转换规则，结合真实案例和图解帮助你全面掌握 JS 的类型系统。"
keywords: 'JavaScript, 数据类型, 类型转换, typeof, 类型判断, JS 教程, 原始值, 引用值'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - ECMAScript
  - JavaScript
date: '2025-06-13 09:39'
abbrlink: 40841
---


## 一、阿婷的“存东西”烦恼（开场小故事）

阿婷是前端小白，刚学 JavaScript。某天她问老师：“为啥变量有时候是数字、有时候是字？我记不住哪个是啥类型。”

老师笑着说：

> “JavaScript 里的变量就像是收纳盒，有的盒子装的是数字（number），有的是字（string），还有的是一整套工具（对象 object）。”

为了让阿婷能理解，老师在白板上画了一张图 👇

### ✅ JS 数据类型分类图（中文）

![JS 数据类型图（中文）](/images/post/js/javascript_type.png)

> 图片来源于网络
---

## 二、JS 中有哪些数据类型？

JavaScript 的数据类型分为两大类：

### 📌 原始类型（Primitive Types）

| 类型        | 示例值             | 描述           |
| --------- | --------------- | ------------ |
| number    | `1`, `3.14`     | 数字，整数或小数     |
| string    | `'abc'`, `"hi"` | 字符串          |
| boolean   | `true`, `false` | 布尔值          |
| undefined | `undefined`     | 未定义（声明了但未赋值） |
| null      | `null`          | 空值（刻意设为空）    |
| bigint    | `123n`          | 大整数（ES2020）  |
| symbol    | `Symbol('id')`  | 唯一值（ES6）     |

### 📌 引用类型（Reference Types）

* Object（对象）
* Array（数组）
* Function（函数）
* Date、RegExp、Map、Set...

---

## 三、typeof 操作符详解（配代码+注释）

```javascript
// 原始类型
console.log(typeof 123);           // "number"
console.log(typeof 'hello');       // "string"
console.log(typeof true);          // "boolean"
console.log(typeof undefined);     // "undefined"
console.log(typeof null);          // !!! "object"：这是一个 JS 早期遗留 Bug

// 引用类型
console.log(typeof {});            // "object"
console.log(typeof []);            // "object"
console.log(typeof function(){});  // "function"
```

📌 **注意**：判断 null 时不能用 `typeof`，请改用：

```javascript
console.log(Object.prototype.toString.call(null)); // "[object Null]"
```

---

## 四、为什么要进行“类型转换”？

在 JS 中，很多操作会**自动把值转换成另一个类型**。例如：

```javascript
console.log('1' + 1); // 输出："11"（string）
console.log('5' - 1); // 输出：4（number）
```

这是 JavaScript 的“宽松”风格导致的。

---

## 五、显式类型转换（你主动换）

```javascript
Number('123');    // → 123
String(123);      // → "123"
Boolean(0);       // → false
```

### 示例：手动转布尔值做条件判断

```javascript
const username = 'Tom';
if (Boolean(username)) {
  console.log('用户名不为空');
}
```

---

## 六、隐式类型转换（JS 偷偷换）

JS 在遇到不同类型时会自动转换：

```javascript
console.log('5' + 1); // "51" → 字符串拼接
console.log('5' - 1); // 4   → 自动转数字
console.log(true + 1); // 2 → true → 1
```

📌 JS 会根据操作符自动决定转换逻辑

| 操作符     | 转换方向  | 示例                  |
| ------- | ----- | ------------------- |
| `+`     | 字符串拼接 | `'3' + 4` → `'34'`  |
| `- * /` | 转数字   | `'6' - 2` → `4`     |
| `==`    | 双等判断  | `'5' == 5` → `true` |

---

## 七、== vs === 的坑（重要）

```javascript
'5' == 5    // true （类型转换后再比较）
'5' === 5   // false（不做类型转换）
```

✅ **建议总是用 === 来避免意外转换！**

---

## 八、类型转换流程图（中文）

👇 一图理解 JS 类型转换行为：
![类型转换流程图](/images/post/js/process.png)

> 图片来源于网络
---

## 九、多语言比较（Python vs JS）

| 场景           | JS 表达式          | Python 表达式   |
| ------------ | --------------- | ------------ |
| 字符串转数字       | `Number('123')` | `int('123')` |
| 判断空字符串是否为假   | `Boolean('')`   | `bool('')`   |
| undefined 概念 | `undefined`     | `None`       |
| null 概念      | `null`          | `None`       |

---

## 🔍 十、小结与建议

### ✅ 本章总结：

* JS 中数据类型分两大类：原始 + 引用
* 类型判断可用 `typeof` 和 `Object.prototype.toString`
* 类型转换分为 **显式转换** 和 **隐式转换**
* 遇到 `==` 要小心自动转换，建议优先使用 `===`

---

## 📚 推荐阅读与学习资源

* [菜鸟教程：JS 数据类型](https://www.runoob.com/js/js-datatype.html) ✅
* [MDN JavaScript 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures) ✅
* [JavaScript 教程（慕课网）](https://www.imooc.com/learn/36) ✅
* 《你不知道的 JavaScript（上卷）》第 1 章，数据类型分析

---
