---
title: Redis 系列教程 | 第 7 章：Redis Stream 流式数据结构详解
description: Redis Stream 是 Redis 提供的流式数据结构，适用于订单处理、日志收集、传感器数据等场景。本章通过生活化小故事、图示和 demo
  演示，让你轻松掌握 Stream 用法。
keywords: 'Redis Stream, Redis 流结构, 消息队列, 实时流处理, Redis 教程'
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: 2025-06-11 18:30
abbrlink: 49451
---


## 一、937bb的快递流水线：理解 Stream

### 📦 故事入门

`937bb`网购了一台手机，现在仓库、快递站、分拣中心、派送员等多个环节都会生成一个“快递事件”：下单、打包、出库、派送、签收。
Redis Stream 就像快递公司内部的“流水线”，每个环节将事件“写入一条消息”，并自动打一个顺序 ID，消费者（如客服、物流系统等）可以按顺序读取，知道包裹在哪个节点。

---

## 二、核心机制和流程演示

### 1. 写入消息：`XADD`

```bash
XADD mystream * event "下单" user "937bb"
```

> **解释**：往 `mystream` 写入一条消息，字段包括 `event` 和 `user`。`*` 表示自动生成 ID。

假设 Redis 返回了：

```text
"1626337440000-0"
```

这就代表这条消息被记录为：

| ID              | event | user  |
| --------------- | ----- | ----- |
| 1626337440000-0 | 下单  | 937bb |

### 2. 浏览全部消息：`XRANGE`

```bash
XRANGE mystream - +
```

返回：

```text
1) 1) "1626337440000-0"
   2) 1) "event"
      2) "下单"
      3) "user"
      4) "937bb"
```

清晰看到上面那条消息对应的数据结构。

### 3. 按需读取：`XREAD`

```bash
XREAD COUNT 1 STREAMS mystream 0
```

返回：

```text
1) 1) "mystream"
   2) 1) 1) "1626337440000-0"
         2) 1) "event"
            2) "下单"
            3) "user"
            4) "937bb"
```

`XREAD` 从 ID=0 开始读一条，拿到我们刚写入的消息。

---

## 三、消费组机制：合作消费，不重复消费

假设937bb同一个订单流水线有客服和物流系统一起处理：

### 1. 创建消费组

```bash
XGROUP CREATE mystream groupA $ MKSTREAM
```

> `groupA` 从最新消息开始，只处理新增的消息。

### 2. 消费者读取消息

```bash
XREADGROUP GROUP groupA consumer1 COUNT 1 STREAMS mystream >
```

假设又新写入一条消息：

```bash
XADD mystream * event "出库" user "937bb"
```

消费者 `consumer1` 会收到：

```text
1) 1) "mystream"
   2) 1) 1) "1626337500000-0"
         2) 1) "event"
            2) "出库"
            3) "user"
            4) "937bb"
```

### 3. 确认处理完：`XACK`

```bash
XACK mystream groupA 1626337500000-0
```

这表示物流系统已处理“出库”事件，Stream 会记录这条消息已确认，不再重试。

---

## 四、为什么选择 Stream 而不是 Pub/Sub？

* **Pub/Sub** 是“广播喊话”，你当时不在就没有了。
* **Stream** 是“放在驿站”等你来领”，断线重连也能继续读。
  好比：Pub/Sub 是“快递员喊你取”，错过就没；Stream 是“快递存快递柜”，你随时来看。

---

## 五、示例：订单流水线的完整 Demo

```python
import redis

r = redis.Redis()

# 写入订单事件
id1 = r.xadd("order_stream", {"event": "下单", "user": "937bb"})
id2 = r.xadd("order_stream", {"event": "出库", "user": "937bb"})

print("写入两条消息，ID 分别为", id1, id2)

# 创建消费组
r.xgroup_create("order_stream", "order_group", id="0", mkstream=True)

# 消费者读取并确认第一条
msgs = r.xreadgroup("order_group", "c1", {"order_stream": ">"}, count=1)
for _, entries in msgs:
    for msg_id, fields in entries:
        print("消费者接收：", msg_id, fields)
        r.xack("order_stream", "order_group", msg_id)
        
# 再读第二条
msgs = r.xreadgroup("order_group", "c1", {"order_stream": ">"}, count=1)
for _, entries in msgs:
    for msg_id, fields in entries:
        print("消费者接收：", msg_id, fields)
        r.xack("order_stream", "order_group", msg_id)
```

**运行输出示范**：

```
写入两条消息，ID 分别为 1626337440000-0 1626337500000-0
消费者接收： 1626337440000-0 {'event': '下单', 'user': '937bb'}
消费者接收： 1626337500000-0 {'event': '出库', 'user': '937bb'}
```

---

## 六、适合的应用场景

* **订单处理流程**：能按顺序处理各环节事件。
* **日志收集**：服务上报日志 → 消费者解析并持久化。
* **传感器数据**：IoT 设备上报数据到 Stream，后端消费分析。
* **DIY 轻量 MQ**：无需再搭建 Kafka/RabbitMQ，即可实现可靠队列。

---

## 七、小结

* 用“快递流水线”的比喻，理解 Stream 的顺序、持久和可靠消费。
* 带 demo 的实战例子，让命令执行结果可视化。
* 如果你想拓展支持多消费者、重试机制等，可以在下一章一起深入讲解。

---

## 推荐阅读 & 参考资料

* [腾讯云：Redis Stream 数据结构全面解析](https://cloud.tencent.cn/developer/article/2343217) ✅
* [CSDN 图解 Redis Stream 架构](https://blog.csdn.net/SO_zxn/article/details/145528908) ✅
* [Redis 官方文档：Streams（英文）](https://redis.io/docs/data-types/streams/) ✅

---