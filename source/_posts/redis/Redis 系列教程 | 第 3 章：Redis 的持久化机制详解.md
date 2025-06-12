---
title: Redis 系列教程 | 第 3 章：Redis 的持久化机制详解
description: \U0001F680 本系列博客将带你从 0 到 1 掌握 Redis，包括它的原理、使用方法、最佳实践等，适合初学者和想要深入理解 Redis 的开发者。
keywords: 本系列博客将带你从 0 到 1 掌握 Redis，包括它的原理、使用方法、最佳实践等，适合初学者和想要深入理解 Redis 的开发者。Redis 系列教程 | 第 3 章：Redis 的持久化机制详解
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-11 16:40'
abbrlink: 64071
---


## 一、什么是 Redis 持久化？

Redis 是基于内存的数据库，但我们不能接受数据一断电就消失。因此 Redis 提供了两种持久化机制：

* **RDB（Redis DataBase）**：定时快照保存内存数据。
* **AOF（Append Only File）**：所有写操作追加写入日志。

这两种机制可以单独使用，也可以一起开启，保证数据安全性。

---

## 二、RDB 快照持久化

RDB 是将某一时刻内存中的数据保存为一个快照文件（后缀 `.rdb`），存储在磁盘上。

### 启动方式：

配置文件 `redis.conf` 中的：

```ini
save 900 1
save 300 10
save 60 10000
```

表示：

* 900 秒内有 1 个写操作
* 300 秒内有 10 个写操作
* 60 秒内有 10000 个写操作

就会触发快照保存。

### 手动触发：

```bash
save   # 同步保存（阻塞）
bgsave # 后台保存（推荐）
```

### 文件位置：

默认保存在 Redis 安装目录下：

```bash
dump.rdb
```

### 优点：

* 对性能影响小（使用子进程）
* 启动加载快

### 缺点：

* 可能会丢失最后一次快照后的数据

### 使用场景：

* 对数据实时性要求不高
* 适合大批量数据冷备份

---

## 三、AOF 日志持久化

AOF 记录所有写命令（如 set、hset、zadd 等）到一个日志文件中，Redis 重启时重新执行这些命令来恢复数据。

### 开启方式：

在 `redis.conf` 中：

```ini
aof-enabled yes
aof-filename "appendonly.aof"
aof-rewrite-percentage 100
aof-rewrite-min-size 64mb
```

### 写入策略：

```ini
everysec   # 每秒写入一次（默认，推荐）
always      # 每次写操作都写入（最安全但最慢）
no          # 不主动写，依赖操作系统 flush
```

### 重写机制：

AOF 日志可能越来越大，Redis 会定期压缩旧命令：

```bash
bgrewriteaof
```

将旧的 AOF 文件重写为更简洁的新文件，比如：

```bash
set key1 val1
set key1 val2
# 最终只保留 set key1 val2
```

### 优点：

* 更高的数据安全性（几乎不丢）
* 文件可读性强，适合审计

### 缺点：

* 启动稍慢（重放日志）
* 文件可能更大

### 使用场景：

* 对数据安全性要求高
* 金融、电商、消息类系统

---

## 四、RDB vs AOF 对比

| 特性     | RDB 快照           | AOF 日志           |
| -------- | ------------------ | ------------------ |
| 触发方式 | 定时 / 手动        | 每次写操作         |
| 数据安全 | 可能丢失几分钟数据 | 最多丢失 1 秒数据  |
| 文件大小 | 相对小             | 相对大（可重写）   |
| 恢复速度 | 快                 | 稍慢               |
| 可读性   | 二进制文件，不可读 | 文本格式，可读     |
| 性能影响 | 少                 | 稍大（视写入策略） |

---

## 五、最佳实践建议

* **推荐搭配使用**：`开启 AOF + 定期 RDB`，兼顾性能与安全
* 对于高并发写入，建议开启 `appendfsync everysec`
* 定期压缩 AOF 文件，避免过大
* 快照文件可用作定期备份，存储到对象存储或异地服务器

---

## 六、小结

* RDB 更轻便、恢复快；AOF 更安全、日志清晰
* Redis 支持灵活配置持久化策略，适配不同业务场景
* 数据安全和性能往往是权衡的结果，建议评估场景选择策略

---

## 推荐阅读 & 参考资料

* [Redis 持久化机制详解 - redis.net.cn](https://www.redis.net.cn/order/persistence.html) ✅
* [菜鸟教程 Redis 持久化](https://www.runoob.com/redis/redis-persistence.html) ✅
* [掘金图解：RDB 和 AOF 差异](https://juejin.cn/post/6974626965538869255) ✅
* 《Redis 深度历险》黄健宏 ✅

---