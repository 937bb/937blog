---
title: Redis 系列教程 | 第 2 章：Redis 常用数据类型详解
description: \U0001F680 本系列博客将带你从 0 到 1 掌握 Redis，包括它的原理、使用方法、最佳实践等，适合初学者和想要深入理解 Redis 的开发者。
keywords:   本系列博客将带你从 0 到 1 掌握 Redis，包括它的原理、使用方法、最佳实践等，适合初学者和想要深入理解 Redis 的开发者。Redis 系列教程  | 第 2 章：Redis 常用数据类型详解
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-11 16:20'
abbrlink: 60178
---

## 一、前言

Redis 不止是简单的键值对，它还支持丰富的数据结构。正确理解这些类型，是高效使用 Redis 的基础。

本章将以图文 + 示例 + 场景 的方式，详细讲解 Redis 五大核心数据类型：String、List、Set、Hash、Sorted Set。

---

## 二、字符串（String）

最基础的数据结构，一般用于存储单值：

```bash
set username "Alice"
# 设置 key 为 username，值为 "Alice"

get username
# 获取 username 对应的值
```

### 使用场景：

* 缓存用户信息（如昵称、Token）
* 存储配置参数（如开关状态）
* 实现简单计数器（`INCR`、`DECR`）

### 补充指令：

```bash
incr page_view
# page_view 自增 1

append username "_2025"
# username 后追加字符串，结果变为 Alice_2025
```

---

## 三、列表（List）

支持双端插入/弹出的有序链表。

```bash
lpush queue task1
lpush queue task2
lpush queue task3
# 当前 queue: task3, task2, task1

rpop queue
# 弹出右侧元素 => task1
```

### 使用场景：

* 消息队列（先进先出）
* 聊天记录滚动展示

### 可视流程：

```
[LPUSH task3] → task3
[LPUSH task2] → task2, task3
[RPUSH task4] → task2, task3, task4
```

---

## 四、集合（Set）

无序集合，自动去重。

```bash
sadd tags redis nosql cache
sadd tags redis
# redis 自动去重

smembers tags
# 获取所有元素
```

### 使用场景：

* 统计活跃用户 ID（唯一性）
* 标签系统
* 用户点赞集合

### 常用命令：

```bash
sismember tags "redis"
# 判断是否存在

scard tags
# 获取集合元素数量
```

---

## 五、哈希（Hash）

适合表示对象结构的 key-value 映射。

```bash
hset user:1001 name Alice
hset user:1001 age 30

hgetall user:1001
# 返回整个结构体
```

### 使用场景：

* 存储用户资料（id、邮箱、角色）
* 商品详情（标题、价格、库存）

### 拓展命令：

```bash
hmget user:1001 name age
hdel user:1001 age
```

---

## 六、有序集合（Sorted Set）

在 Set 的基础上，每个元素关联一个 score 分数，自动排序。

```bash
zadd leaderboard 99.5 Alice
zadd leaderboard 88.0 Bob
zadd leaderboard 100.0 Tom

zrevrange leaderboard 0 2 withscores
# 获取前三名 + 分数
```

### 使用场景：

* 游戏积分排行榜
* 热门搜索词统计
* 积分商城排名

### 操作示意图：

```
添加：zadd 排行榜 Tom 100
查询：zrevrange 排行榜 0 2 withscores
```

---

## 七、五大数据类型对比表

| 类型       | 是否有序 | 是否允许重复 | 常见用途           |
| ---------- | -------- | ------------ | ------------------ |
| String     | 否       | 是           | 缓存字段、计数器   |
| List       | 是       | 是           | 消息队列、日志记录 |
| Set        | 否       | 否           | 点赞系统、标签分类 |
| Hash       | 否       | 键唯一       | 对象存储、信息聚合 |
| Sorted Set | 是       | 否           | 排名、热度排行     |

---

## 八、小结

* Redis 不止是字符串，五种核心类型各有特色。
* 熟练掌握数据结构，能有效提升系统性能与扩展能力。
* 后续章节将进一步探索高级用法，如位图、HyperLogLog、Geo 等。

---

## 推荐阅读 & 参考资料

* [Redis 数据结构文档 - redis.net.cn](https://www.redis.net.cn/order/structure.html) ✅
* [菜鸟教程 Redis 类型介绍](https://www.runoob.com/redis/redis-datatypes.html) ✅
* [掘金：图解 Redis 五种数据结构](https://juejin.cn/post/6844904094281238542) ✅
* 《Redis 设计与实现》黄健宏 ✅

---