---
title: JavaScript 系列教程 | 第 5 章：对象、函数与引用类型的本质
description: "\U0001F680 本章从白话角度剖析 JavaScript 中对象、函数与引用类型的底层逻辑，帮助你构建更扎实的 JS 理解体系。"
keywords: 'JavaScript 对象, 引用类型, 函数本质, JS 内存机制, 深拷贝与浅拷贝'
top_img: /images/post/js/JavaScript.avif
cover: /images/post/js/JavaScript.avif
categories:
  - JavaScript
tags:
  - 教程
  - ECMAScript
  - JavaScript
date: '2025-06-13 10:17'
abbrlink: 54490
---



## 一、开篇小故事：老张的“快递纸条”困局

老张有个习惯：每次寄快递都写一张纸条说明内容。他把纸条交给快递员A，也给快递员B复印了一份。但当纸条内容改了之后，只有快递员A送的快递里是最新的，B的还是旧的。为什么？

这就像 JavaScript 中的对象：你传的是“地址”，而不是复制了一份“内容”。所以，**当你修改原始对象，引用这个对象的变量也会感受到变化**。

---

## 二、JavaScript 中的数据类型回顾

我们在第 3 章讲过 JS 的类型系统。再回顾一下：

| 类型分类 | 类型                                                       | 是否可变  |
| ---- | -------------------------------------------------------- | ----- |
| 原始类型 | Number, String, Boolean, null, undefined, Symbol, BigInt | ❌ 不可变 |
| 引用类型 | Object, Array, Function, Date, RegExp 等                  | ✅ 可变  |

👉 所谓**引用类型**，说白了就是“数据保存在堆内存中，变量保存的是地址引用”。

---

## 三、对象和数组是怎么存储的？

```js
const user = {
  name: "小明",
  age: 18
};

const otherUser = user;
otherUser.age = 20;

console.log(user.age); // 输出 20
```

### 🔍 解读：

* `user` 创建了一个对象，JS 在堆内存中开辟了一块空间来保存 `{name, age}`。
* `otherUser = user` 并不是复制数据，而是复制地址（引用）。
* 所以 `otherUser.age = 20` 实际上修改的是堆中的原始数据。

---

## 四、函数也是对象，是“一等公民”

函数在 JavaScript 中也是引用类型，它不仅可以执行，还能像对象一样加属性！

```js
function greet() {
  console.log("你好！");
}
greet.language = "中文";

console.log(greet.language); // 中文
```

👉 `greet` 是一个对象，JS 允许你给函数加属性。这也是“函数是一等公民”的体现。

---

## 五、深拷贝 vs 浅拷贝

很多 JS 面试爱问这两个概念：

### ✅ 浅拷贝（复制第一层地址）

```js
const user = { name: "张三", info: { age: 20 } };
const copy = { ...user };

copy.info.age = 30;

console.log(user.info.age); // 30，浅拷贝只复制了第一层
```

### ✅ 深拷贝（递归复制所有层）

```js
const user = { name: "张三", info: { age: 20 } };

const deepCopy = JSON.parse(JSON.stringify(user));
deepCopy.info.age = 30;

console.log(user.info.age); // 20，深拷贝有效
```

⚠️ `JSON` 的方式有缺陷：不能复制 `function`、`undefined`、`Symbol` 等。

---

## 六、数组其实也是对象！

数组是特殊的对象，它的键是数字：

```js
const arr = ["苹果", "香蕉"];
arr.color = "红色";

console.log(arr.color); // 红色
console.log(Object.keys(arr)); // ["0", "1", "color"]
```

👉 数组可以加属性，只不过大多数人只用它的下标属性。

---

## 七、函数参数是如何传递的？

### 原始值是“值传递”：

```js
let x = 10;
function change(val) {
  val = 20;
}
change(x);
console.log(x); // 10
```

### 引用值是“地址传递”：

```js
let obj = { name: "小红" };
function change(o) {
  o.name = "小兰";
}
change(obj);
console.log(obj.name); // 小兰
```

✅ 对象改变了，因为传的是地址！

---

## 八、图解：引用类型与内存模型

![引用类型图解](/images/post/js/stack_heap.png)

> 图片来源于网络；上图说明：基本类型存在栈里，引用类型的值在堆里，栈中保存地址。

---

## 九、多语言示例（对比 Java、Python）

### Java 示例（对象复制的是值）：

```java
Person p1 = new Person("张三");
Person p2 = p1;

p2.name = "李四";
System.out.println(p1.name); // 输出：李四
```

### Python 示例（也是引用）：

```python
user = {"name": "小明"}
copy = user
copy["name"] = "小李"
print(user["name"])  # 小李
```

结论：大多数动态语言对象都是引用传递。

---

## 十、小结与延伸

| 概念    | 说明               |
| ----- | ---------------- |
| 对象存储  | 值存在堆内存，变量存地址     |
| 函数是对象 | 可赋值、可添加属性        |
| 拷贝机制  | 浅拷贝只复制第一层，深拷贝递归  |
| 参数传递  | 基本类型是值传递，对象是地址传递 |

👉 下章将讲解**原型与原型链**，了解对象背后的继承机制。

---

## 📚 推荐阅读 & 参考资料

* [菜鸟教程：JS 对象](https://www.runoob.com/js/js-objects.html) ✅
* [掘金：JS 深浅拷贝总结](https://juejin.cn/post/6844903929705136141) ✅
* [MDN 官方：JavaScript 对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects) ✅
* [ES规范中文版](https://es5.github.io/) ✅

---