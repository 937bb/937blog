---
title: Redis 系列教程 | 第 11 章：Redis 在不同场景中的实战案例精选
description: "\U0001F680 本章精选多个 Redis 在真实业务中的实战应用场景，如限流、验证码缓存、消息通知、实时排行榜等，帮助你全面掌握 Redis 的项目落地能力。"
keywords: 'Redis 实战, Redis 场景应用, Redis 限流, Redis 验证码, Redis 排行榜, Redis 消息通知, Redis 教程'
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-11 18:34'
abbrlink: 14653
---

# Redis 系列教程 | 第 11 章：Redis 在不同场景中的实战案例精选

---

## 一、前言：Redis 不只是缓存

你可能听说 Redis 常用来做缓存，但其实在真实项目中，它几乎无所不能：

- 限流
- 防重复提交
- 实时排行榜
- 登录验证码
- 发布订阅系统
- 微服务异步通知
- 数据统计 / UV PV 计数

> 本章将通过一系列真实案例，结合前面章节的知识点，用「讲故事 + 实战代码」的方式，帮你掌握这些技巧。

---

## 二、案例一：登录验证码存储与校验

### 🧠 背景

用户登录时，我们通常会要求输入验证码。验证码需要**短时间有效**，**一人一份**，不能无限使用。

### 🔧 Redis 方案

使用 `SETEX`（或 `SET` + EX 参数）存储验证码，设置 5 分钟过期。

### 💻 实现代码（Python 示例）

```python
import redis

r = redis.Redis()

# 保存验证码（5分钟有效）
r.setex('verify_code:login:13888888888', 300, '4728')

# 验证验证码是否正确
input_code = '4728'
real_code = r.get('verify_code:login:13888888888')

if real_code and input_code == real_code.decode():
    print("✅ 验证成功")
else:
    print("❌ 验证失败或已过期")
```

---

## 三、案例二：API 接口限流

### 🧠 背景

我们希望限制某个用户在 60 秒内最多访问 10 次某个接口，防止恶意刷接口。

### 🔧 Redis 方案

使用 `INCR` + `EXPIRE` 实现计数器限流。

### 💻 实现代码（Node.js 示例）

```javascript
const redis = require('redis');
const client = redis.createClient();

const ip = '127.0.0.1';
const key = `api_limit:${ip}`;
const limit = 10;

client.incr(key, (err, count) => {
  if (count === 1) {
    client.expire(key, 60); // 设置 60 秒过期
  }

  if (count > limit) {
    console.log("❌ 访问过于频繁，请稍后再试");
  } else {
    console.log("✅ 正常访问");
  }
});
```

---

## 四、案例三：实时排行榜系统（如直播打赏榜）

### 🧠 背景

直播打赏、积分排行榜、点赞排行等，都属于**实时排序需求**。

### 🔧 Redis 方案

使用 `ZINCRBY` 维护用户分数，`ZREVRANGE` 获取前 N 名。

### 💻 实现代码（Java 示例）

```java
Jedis jedis = new Jedis("localhost");

// 用户A打赏10元
jedis.zincrby("live:room1:rank", 10, "user:A");

// 查询排行榜前 3 名
Set<String> top3 = jedis.zrevrange("live:room1:rank", 0, 2);
System.out.println("Top 3: " + top3);
```

**排行榜结构：**

```text
Sorted Set key: live:room1:rank

"user:A" -> 120
"user:B" -> 98
"user:C" -> 80
```

📈 这种结构来自【第 2 章：Redis 常用数据结构详解】中提到的 `Sorted Set`。

---

## 五、案例四：发布订阅实现实时消息通知

比如某个订单状态变更后，需要推送给多个客户端。

### 🔧 Redis 方案

使用 `PUBLISH` + `SUBSCRIBE`

### 💻 实现代码（PHP 示例）

```php
$redis = new Redis();
$redis->connect('127.0.0.1');

// 发布订单状态变更
$redis->publish('order:status', json_encode([
    'order_id' => 1024,
    'status' => 'shipped'
]));
```

> ✅ 参考第 4 章讲解的发布订阅机制

---

## 六、案例五：防重复提交（防表单重复点击）

### 🧠 背景

用户点击“提交订单”按钮，如果不做防护，可能造成多笔订单。

### 🔧 Redis 方案

使用 `SET key value NX EX`

```bash
SET order:submit:userid123 abc123 NX EX 10
```

> 如果返回 OK，表示 10 秒内首次提交。
> 否则视为重复提交。

---

## 七、案例六：Redis Sentinel 高可用方案（Docker Compose 实现）

### 🧠 背景

线上 Redis 服务不能宕机，我们需要通过 Sentinel 实现自动主从切换。

### 🔧 方案图示

![Redis Sentinel 架构图](https://img-blog.csdnimg.cn/20210419110356672.png)

### 💻 Docker Compose 文件示例

```yaml
version: '3'
services:
  redis-master:
    image: redis
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"

  redis-slave:
    image: redis
    command: redis-server --replicaof redis-master 6379
    ports:
      - "6380:6379"

  sentinel:
    image: redis
    command: redis-sentinel /etc/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/sentinel.conf
    ports:
      - "26379:26379"
```

📌 sentinel.conf 示例文件中请配置主节点地址及监控配置。

---

## 八、小结：Redis 是工具箱中的瑞士军刀

在这章中，我们通过多个真实项目场景讲解 Redis 的实战能力：

- 存储验证码
- 实现限流
- 防重复提交
- 实时排行榜
- 消息通知
- 高可用部署

结合前面学的 Redis 数据结构 + 持久化 + 发布订阅 + Sentinel，我们把「工具」真正应用到了「项目」。

---

## 九、推荐阅读 & 参考资料（大陆可访问）

- [Redis 中文网](https://www.redis.net.cn) ✅
- [菜鸟教程 Redis 应用场景](https://www.runoob.com/redis/redis-tutorial.html) ✅
- [掘金 Redis 实战专栏](https://juejin.cn/tag/redis) ✅
- [Redis 使用模式（译）](https://github.com/huangz1990/redis-design) ✅
- 图源：CSDN 博主 @AlexBlog（https://img-blog.csdnimg.cn）✅

---