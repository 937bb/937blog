---
title: Redis 系列教程 | 第 4 章：Redis 发布订阅机制详解
description: \U0001F680 本章深入解析 Redis 发布订阅（Pub/Sub）机制，包括应用场景、命令使用与消息流程，助你构建实时通信服务。
keywords: Redis 发布订阅, Pub/Sub 机制, 消息系统, 实时通信, Redis 教程
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-11 17:00'
abbrlink: 51523
---

## 一、什么是 Redis 的发布订阅？

Redis 的发布订阅（Pub/Sub）是一种**消息通信机制**，发布者将消息发送到某个“频道”，所有订阅该频道的客户端都可以**实时接收到消息**。

这种机制非常适合做：

* 实时通知（如消息推送）
* 聊天系统
* 服务间的异步通信

## 二、基本原理流程图

下面是一个发布订阅的消息流程图：

```
+---------+     +---------+         +---------+
| ClientA | --> | Channel | <-----> | ClientB |
| 发布者  |     | sports  |         | 订阅者  |
+---------+     +---------+         +---------+

ClientB 通过 SUBSCRIBE 订阅了 Channel "sports"
ClientA 通过 PUBLISH 发送消息到 "sports"
ClientB 会实时收到这条消息
```

## 三、核心命令详解

### 1. 订阅频道

```bash
SUBSCRIBE sports
```

> 客户端进入“阻塞监听”状态，等待接收频道消息。

### 2. 发布消息

```bash
PUBLISH sports "世界杯决赛今晚举行！"
```

> 所有订阅 `sports` 频道的客户端将立即收到该消息。

### 3. 取消订阅

```bash
UNSUBSCRIBE sports
```

### 4. 模式匹配订阅（可同时监听多个频道）

```bash
PSUBSCRIBE news.*
# 匹配所有以 news. 开头的频道
```

```bash
PUBLISH news.cn "中国新闻"
PUBLISH news.en "国际新闻"
```

## 四、代码示例（Python）

借助 `redis-py` 模块实现简单的发布/订阅示例：

```python
# subscriber.py
import redis

r = redis.Redis()
pubsub = r.pubsub()
pubsub.subscribe('chat')

print("开始监听频道 chat...")
for message in pubsub.listen():
    if message['type'] == 'message':
        print(f"收到消息：{message['data'].decode('utf-8')}")
```

```python
# publisher.py
import redis
r = redis.Redis()
r.publish('chat', 'Hello Redis！')
```

运行 `subscriber.py`，再执行 `publisher.py`，你会看到订阅端收到实时消息。

## 五、发布订阅的注意事项

* Redis Pub/Sub 是**无状态**的，不存储历史消息。
* 客户端断线后，消息不会重发。
* 适用于**实时通知类业务**，不适合可靠消息队列场景。

### 如果需要“消息可靠投递”，请考虑：

* Redis 的 `Stream`
* Kafka、RabbitMQ 等专业消息系统

## 六、典型应用场景

| 场景         | 说明                                   |
| ------------ | -------------------------------------- |
| 聊天系统     | 用户 A 发消息 → 订阅者 B、C 实时接收   |
| 直播弹幕     | 弹幕消息通过频道广播给多个客户端       |
| 多服务通知   | 微服务 A 状态更新，通知 B/C 立即响应   |
| 后台任务通知 | 后台完成任务后，向前端发送任务完成通知 |

## 七、图解对比：Pub/Sub vs 消息队列

| 特性     | Redis Pub/Sub  | 消息队列（如 Kafka）     |
| -------- | -------------- | ------------------------ |
| 消息存储 | 不存储         | 支持持久化               |
| 可靠性   | 弱             | 强                       |
| 实时性   | 高             | 高                       |
| 适用场景 | 通知类、广播类 | 可靠处理类、异步任务处理 |

## 八、小结

* Redis Pub/Sub 提供实时、简单的发布订阅能力
* 适合通知、广播、弹幕等场景
* 不具备消息可靠性，如有需要应选用消息队列或 Redis Stream

---

## 推荐阅读 & 参考资料

* [Redis 官方文档：Pub/Sub](https://redis.io/docs/interact/pubsub/) ✅
* [Redis 中文网发布订阅指南](https://www.redis.net.cn/order/pubsub.html) ✅
* [菜鸟教程 Redis 发布订阅](https://www.runoob.com/redis/redis-pub-sub.html) ✅
* 《Redis 实战》第 3 章，发布订阅系统讲解 ✅

---