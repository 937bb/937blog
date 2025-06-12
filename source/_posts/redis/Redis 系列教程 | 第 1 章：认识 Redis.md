---
title: Redis 系列教程 | 第 1 章：认识 Redis
description: "\U0001F680 本系列博客将带你从 0 到 1 掌握 Redis，包括它的原理、使用方法、最佳实践等，适合初学者和想要深入理解 Redis 的开发者。"
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-11 15:57'
abbrlink: 18448
---

## 一、什么是 Redis？

Redis 是一个基于内存的键值数据库，全称为：**Remote Dictionary Server**，即“远程字典服务器”。它的特点是：

* **性能极高**：所有数据都在内存中操作，读写速度非常快。
* **多种数据类型**：支持字符串、列表、集合、哈希表、有序集合等。
* **功能丰富**：支持事务、发布订阅、持久化、Lua 脚本、主从复制、集群等。
* **使用广泛**：被广泛应用于缓存、排行榜、计数器、消息队列等场景。

Redis 通常用作缓存数据库，也可以用作消息中间件、实时排行榜存储等。

---

## 二、Redis 的使用场景

为了让你快速理解 Redis 的作用，我们来看几个典型的使用场景：

### 1. 网站缓存

**目的**：减少数据库访问压力，提高访问速度。

**流程图**：

```
[用户请求] → [检查 Redis 缓存] → 命中缓存 → 返回结果
                            ↓
                        未命中 → 查询数据库 → 存入 Redis → 返回结果
```

### 2. 排行榜/点赞数等实时统计

Redis 的 `Sorted Set` 类型支持按照分数自动排序，非常适合排行榜类数据，如：

* 游戏积分排行榜
* 短视频播放量排行榜

### 3. 分布式锁

利用 Redis 的 `SETNX` 命令（只在 key 不存在时设置）可以实现简单的分布式锁机制。

---

## 三、Redis 安装与启动

### Windows 用户

建议使用 [Memurai](https://www.memurai.com/) 或 WSL 安装 Redis。

### macOS 用户

```bash
brew install redis
brew services start redis
```

### Linux 用户（以 Ubuntu 为例）

```bash
sudo apt update
sudo apt install redis-server
```

启动服务：

```bash
sudo systemctl start redis
```

验证是否安装成功：

```bash
redis-cli ping
# 输出：PONG 表示服务启动成功
```

---

## 四、第一个 Redis 命令

我们用 redis-cli（命令行客户端）执行以下命令：

```bash
redis-cli
```

进入 Redis 交互式命令行后：

```bash
set name "redis小课堂"
# 设置一个 key 为 name，值为 redis小课堂

get name
# 获取 key 为 name 的值，输出应为："redis小课堂"
```

Redis 是基于键值对的数据库，我们刚才就是用 `set` 写入数据，用 `get` 读取数据。

---

## 五、总结

* Redis 是一个高性能的内存数据库，适合做缓存、排行榜等应用。
* 支持多种数据结构，不局限于字符串。
* 安装和启动相对简单，使用 redis-cli 进行交互。
* 初步认识了 `set` 和 `get` 命令。

---

## 推荐阅读 & 参考资料

* [Redis 中文文档](https://www.redis.net.cn/) ✅
* [菜鸟教程 Redis 入门](https://www.runoob.com/redis/redis-tutorial.html) ✅
* [图解 Redis 原理](https://juejin.cn/post/6844903967146287112) ✅
* 《Redis 实战》（机械工业出版社）