---
title: Redis 系列教程 | 第 5 章：深入理解 Redis 的过期键与淘汰策略
description: >-
  Redis 的过期键机制和内存淘汰策略，是保障高性能与内存可控的关键机制。本章将以图文+代码形式，深入剖析 Redis
  如何设置过期时间、如何清理数据、以及何时触发淘汰。
keywords: 'Redis 过期键, Redis 淘汰策略, Redis 内存管理, Redis 教程, Redis 内存清理机制'
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-11 17:30'
abbrlink: 35735
---

## 一、为什么需要过期机制？

Redis 存储在内存中，一旦内存满了就无法继续写入。为此：

* 我们可以设置键的“**过期时间**”，让旧数据自动清除；
* Redis 提供多种“**内存淘汰策略**”，确保关键数据常驻内存。

这套机制被广泛应用于缓存、临时数据等场景。

---

## 二、设置与查看过期时间

### 设置过期时间

```bash
SET session:user123 "Tom" EX 60
# 设置键 session:user123，有效期 60 秒（秒级）
```

```bash
EXPIRE product:1001 120
# 给已有 key 设置 120 秒有效期
```

### 查看过期时间

```bash
TTL session:user123
# 返回剩余有效期（单位：秒）
```

```bash
PTTL session:user123
# 返回剩余毫秒
```

### 删除过期时间

```bash
PERSIST session:user123
# 移除键的过期时间，使其永久存在
```

---

## 三、Redis 清除过期键的三种策略

Redis **不会立即删除过期键**，而是采用以下三种机制混合处理：

| 类型   | 描述                 |
| ---- | ------------------ |
| 定时删除 | 设置过期时间时注册定时器，自动删除  |
| 惰性删除 | 访问键时才检查是否过期，若过期则删除 |
| 定期删除 | 每隔一段时间，随机检查并清除过期键  |

### 简易流程图：

```
[键设置了过期时间]
       ↓
[定时器注册 → 定时删除]
       ↓
[键被访问 → 惰性删除]
       ↓
[后台周期任务 → 随机抽查定期删除]
```

这种机制保证了性能不会被大规模删除操作拖垮。

---

## 四、Redis 的内存淘汰策略

当 Redis 内存达到 `maxmemory` 限制时，且无法通过过期机制释放更多内存，会触发**淘汰机制**。

在 `redis.conf` 中配置如下：

```ini
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### 常见策略一览表：

| 策略名称            | 说明                |
| --------------- | ----------------- |
| noeviction      | 不淘汰，返回错误（默认）      |
| allkeys-lru     | 所有键中最近最少使用淘汰      |
| volatile-lru    | 仅对设置了过期时间的键执行 LRU |
| allkeys-random  | 所有键中随机淘汰          |
| volatile-random | 仅对设置了过期时间的键随机淘汰   |
| volatile-ttl    | 优先淘汰即将过期的键        |
| allkeys-lfu（推荐） | 所有键中使用频率最低的淘汰     |
| volatile-lfu    | 仅过期键中淘汰使用频率最低的    |

### 推荐策略：

> 对于缓存服务，建议使用：

```ini
maxmemory-policy allkeys-lfu
```

它能优先保留访问频率高的热点数据。

---

## 五、常见误区与建议

### ❌ 误区：以为 `EXPIRE` 后就会立即删除

✔ 实际上，Redis 清除是**延迟 + 定期 + 访问触发**的组合机制。

### ❌ 忘记设置 `maxmemory` 导致服务 OOM

✔ 生产环境务必设置内存上限，并启用淘汰策略。

### ❌ 全部用默认策略 `noeviction`

✔ 默认策略会在内存满时报错，影响稳定性。

---

## 六、代码实践：自动过期的 Session 缓存

```python
import redis

r = redis.Redis()

# 用户登录成功，保存 Session，设置有效期 30 分钟
r.set("session:user1001", "login-token-xxx", ex=1800)

# 检查是否还有效
if r.ttl("session:user1001") > 0:
    print("会话有效")
else:
    print("需要重新登录")
```

---

## 七、小结

* Redis 支持灵活设置过期时间，保障数据自动清理
* 清除机制以性能优先，采用三种方式混合
* 内存淘汰策略非常关键，推荐使用 LRU 或 LFU
* 实际业务中，缓存系统务必设置 maxmemory 与合理策略

---

## 推荐阅读 & 参考资料

* [Redis 过期键机制 - redis.net.cn](https://www.redis.net.cn/order/expire.html) ✅
* [菜鸟教程 Redis 设置过期时间](https://www.runoob.com/redis/redis-keys.html) ✅
* [掘金：图解 Redis 淘汰策略](https://juejin.cn/post/6844904202102419464) ✅
* 《Redis 实战》第 4 章：缓存策略 ✅

---
