---
title: Redis 系列教程 | 第 6 章：Redis 的事务与 Lua 脚本机制
description:   Redis 的事务机制提供了一种原子执行多个命令的方法，而 Lua 脚本则是提升 Redis
  原子性与扩展能力的强大武器。本章用白话+实战+故事形式，深入剖析事务与脚本在实际业务中的作用。
keywords: 'Redis 事务, Redis Lua 脚本, Redis 原子性, Redis 脚本执行, Redis 教程'
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-11 18:00'
abbrlink: 10505
---

## 一、白话理解：Redis 事务是啥？

### 📖 小故事：三件事不能漏！

假设你去银行办事，一口气要求柜员：

> “给我转账 100 块，然后把账单寄给我，最后注销旧账号。”

**如果这三件事有一件没做完**（比如转账成功但注销失败），你就会很不爽。

同理，Redis 事务就是为了**让一组命令“打包”执行，不漏、不拆、不打断**。

---

## 二、事务的作用和使用场景

### ✅ 作用：

* 保证一组命令**按顺序执行**
* 保证**全部执行或全部不执行**（虽然不完全等于数据库事务）

### 💼 常见场景：

| 场景     | 描述                               |
| ------ | -------------------------------- |
| 用户注册流程 | 插入用户信息 → 更新统计数量 → 发送欢迎消息（必须全部成功） |
| 秒杀场景   | 检查库存 → 扣库存 → 创建订单                |
| 批量更新数据 | 需要对多个键做原子修改，避免中途被其他命令干扰          |

---

## 三、Redis 事务的三部曲

Redis 的事务包含以下三个命令：

| 命令        | 说明              |
| --------- | --------------- |
| `MULTI`   | 开始事务，进入命令队列模式   |
| `EXEC`    | 提交事务，执行队列中的所有命令 |
| `DISCARD` | 放弃事务，清空队列       |

### 示例代码：

```bash
MULTI
SET user:1001:name "Alice"
INCR user:count
EXEC
```

执行后：

* 所有命令将依次执行
* 如果执行中间失败，**不会自动回滚**

---

## 四、WATCH：提高事务安全性

Redis 是单线程模型，如果有多个客户端并发修改同一个 key，事务可能会出现冲突。

这时可以使用 `WATCH` 命令监控一个或多个键：

```bash
WATCH goods:stock
MULTI
DECR goods:stock
SET order:user1001 "已下单"
EXEC
```

> 如果在 `WATCH` 之后到 `EXEC` 之间，`goods:stock` 被其他客户端修改了，事务会失败。

### 🎯 使用建议：

* 秒杀 / 竞拍 / 抢购类业务必用 `WATCH` 做乐观锁
* 避免死锁、数据不一致风险

---

## 五、Lua 脚本：事务更强力的升级版

### 🧠 为什么需要 Lua？

Redis 事务虽然能打包命令，但还是有以下限制：

* 不支持条件判断、循环等逻辑
* 键不能动态拼接
* 多次网络交互性能低

Lua 脚本可以解决这些痛点：**在 Redis 内部一次性执行所有逻辑，无需多次往返！**

---

## 六、Lua 脚本入门示例

### 💡 模拟秒杀脚本：

```lua
-- 秒杀脚本：判断库存，扣减库存，创建订单
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock <= 0 then
    return 0
else
    redis.call('DECR', KEYS[1])
    redis.call('SET', KEYS[2], 'success')
    return 1
end
```

Python 调用示例：

```python
import redis
r = redis.Redis()

script = """
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock <= 0 then
    return 0
else
    redis.call('DECR', KEYS[1])
    redis.call('SET', KEYS[2], 'success')
    return 1
end
"""

result = r.eval(script, 2, 'goods:stock', 'order:user1001')
print("抢购结果：", "成功" if result == 1 else "失败")
```

### 🧩 参数说明：

* `eval(script, numkeys, key1, key2, ...)`
* `KEYS` 数组用于传 key
* 其他参数可通过 `ARGV` 数组传递

---

## 七、事务 vs Lua：何时选哪一个？

| 功能点    | Redis 事务 | Lua 脚本     |
| ------ | -------- | ---------- |
| 原子性    | 有        | 有          |
| 条件判断支持 | 无        | 支持 if/else |
| 支持循环逻辑 | 无        | 支持 for 循环  |
| 性能优化   | 一般       | 极高（无网络往返）  |
| 复杂业务逻辑 | 不适合      | 非常适合       |

---

## 八、小结

* Redis 事务提供基本的命令打包执行，适合简单批量操作
* `WATCH` 命令提供乐观锁机制，适合并发控制
* Lua 脚本更强大，支持完整逻辑控制、一次性原子操作，是高级优化利器

---

## 推荐阅读 & 参考资料

* [Redis 官方事务机制文档](https://redis.io/docs/interact/transactions/) ✅
* [Redis 官方 Lua 脚本文档](https://redis.io/docs/manual/programmability/eval-intro/) ✅
* [菜鸟教程 Redis 事务](https://www.runoob.com/redis/redis-transactions.html) ✅
* [极客时间 Redis 核心技术与实战（第 14 讲）](https://time.geekbang.org/course/intro/100009601) ✅

---