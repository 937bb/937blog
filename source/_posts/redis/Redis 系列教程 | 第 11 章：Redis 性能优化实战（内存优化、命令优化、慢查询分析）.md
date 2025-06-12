---
title: Redis 系列教程 | 第 11 章：Redis 性能优化实战（内存优化、命令优化、慢查询分析）
description: \U0001F680 本章深入剖析 Redis 性能瓶颈成因，从内存优化、命令使用、慢查询分析三方面，结合实践与可视化工具，助你打造高性能 Redis 应用。
keywords: Redis 性能优化, Redis 慢查询分析, Redis 内存优化, Redis 命令优化, Redis 实战调优
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: 2025-06-12 10:00
abbrlink: 40489
---

[![Boosting Performance with Redis Caching ...](https://images.openai.com/thumbnails/f09fa8452b172c5b62a7d555d1b1131b.jpeg)](https://blog.devops.dev/boosting-performance-with-redis-caching-in-spring-boot-applications-12fc4d63bfcf)

---

## 一、开篇小故事：`KEYS *`，就像翻遍整个仓库找钥匙

想象一下你是一名仓库管理员，有人突然问你：“你们有没有带‘手机’字样的货物？”
你于是拿着手电筒，在几万件货物里一个个箱子翻，一一查看标签……是不是很崩溃？

这就是你在 Redis 里执行 `KEYS *` 的感觉。

这个命令会让 Redis 把**所有的 key 都翻出来**（哪怕你只要一个），整个内存都要配合这次“地毯式搜索”，过程中 Redis 是没法干别的事的，严重的话还可能导致**阻塞或服务宕机**！

👨‍🔧 **白话总结：**

> `KEYS *` 就像用放大镜在仓库里挨个翻箱找货。量一大，就卡爆系统。
> 正确做法是：用 `SCAN`，像分页一样慢慢找，一次只扫一部分。


---

## 二、性能优化从哪下手？

看图👇 性能优化，可从这三大块切入：

1. **内存优化**：让 Redis 存更多也更省内存
2. **命令优化**：别用会拖慢 Redis 的指令
3. **慢查询分析**：抓住“罪魁祸首”命令，精准解决

---

## 三、内存优化 ✂️

### 1. 用对数据结构

如果你用 `String` 存对象，Redis 会麻烦又占内存，推荐改用 `Hash`：

```bash
# 推荐方式：用 Hash 存用户信息
HSET user:1001 name "张三" age 28 gender "男"
```

更节约内存，还方便修改。

### 2. TTL 过期设置

避免缓存无限增长：

```bash
# session 有效 1 小时
SET session:1001 "token123" EX 3600
```

### 3. 启用淘汰策略

```conf
maxmemory 100mb
maxmemory-policy allkeys-lru
```

淘汰冷数据，控制内存上限。

---

## 四、命令优化 ⚙️

### 避免使用低效命令

| 错误命令         | 问题                           | 优化代替         |
| ---------------- | ------------------------------ | ---------------- |
| `KEYS *`         | 全库阻塞，生产环境大坑         | `SCAN` 分批迭代  |
| `SMEMBERS set:*` | 返回可能成千上万元素，内存暴涨 | `SSCAN` 分段获取 |
| `FLUSHALL`       | 清库导致瞬时挂起               | 避免使用此命令   |

#### 批量扫描示例（Python）：

```python
for key in r.scan_iter(match="user:*", count=100):
    print("找到 key:", key)
```

---

## 五、慢查询排查 🔍

### 开启 Slowlog

```conf
slowlog-log-slower-than 10000   # 单位：微秒（10ms）
slowlog-max-len 128
```

### 查看慢指令示例：

```bash
127.0.0.1:6379> SLOWLOG GET 5
```

如发现 `HGETALL user:9999` 花了 50ms，就说明应该拆字段或改结构。

---

## 六、实战总结建议清单

| 场景           | 建议                                            |
| -------------- | ----------------------------------------------- |
| 缓存穿透／击穿 | 缓存空值加短过期，或使用布隆过滤器              |
| 大数量 key     | 用 `SCAN` 避免阻塞，不用 `KEYS *`               |
| 大对象访问     | 拆小重构数据，防止 bloating                     |
| CPU/IO 高延迟  | 查 `slowlog` 找慢命令，改用批处理/管道/异步删除 |
| 频繁 COW       | 控制 RDB 周期，或迁移到 Cluster 调低单实例压力  |

---

## 七、多语言“过期设置”示例

### Java（Jedis）

```java
jedis.setex("session:1001", 3600, "token123"); // 1小时过期
```

### Python

```python
r.set("session:1001", "token123", ex=3600)
```

### Node.js（ioredis）

```js
client.setEx("session:1001", 3600, "token123");
```

### PHP（phpredis）

```php
$redis->setEx("session:1001", 3600, "token123");
```

---

## 八、最佳实践流程图

[![Multilevel Redis Caching Strategy to ...](https://images.openai.com/thumbnails/4bd22f14f05b1678e2ed12a99720397e.jpeg)](https://blog.devgenius.io/multilevel-redis-caching-to-improve-performance-8603f0ea146f)

---

## 九、小结 ✨

* **结构选对，结构用好**
* **过期设置好**
* **慢命令别用**
* **持续监控 slowlog**

Redis 优化靠的是“持续改善”，不像一时之功。希望你也能像阿杰一样，用这三步把 Redis 养成“性能老虎”！

---

## 🔗 推荐阅读 & 学习资源（中国大陆可访问）

* [Redis 性能优化指南 · 博客园](https://www.cnblogs.com/wzh2010/p/17205492.html) 
* [Redis 性能优化 13 条军规 · 博客园](https://www.cnblogs.com/vipstone/p/12582622.html) 
* [菜鸟教程 · Redis 性能调优](https://www.runoob.com/redis/redis-performance.html) ✅
* [CSDN 实用图解 · Redis 性能排查](https://blog.csdn.net/nav/redis) ✅

---