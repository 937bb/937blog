---
title: Redis 系列教程 | 第 8 章：Redis 主从复制与高可用架构实战
description: \U0001F680 本章详细介绍 Redis 主从复制的原理、配置方法以及高可用架构设计，辅以多语言客户端示例，助你构建稳定可靠的 Redis 集群。
keywords: Redis 主从复制, Redis 高可用, Redis 集群, Redis 复制配置, Redis 多语言示例
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: 2025-06-11 18:31
abbrlink: 37357
---

# Redis 系列教程 | 第 8 章：Redis 主从复制与高可用架构实战

## 一、什么是 Redis 主从复制？

Redis 主从复制是 Redis 提供的一种数据复制机制，允许一个主节点（Master）把数据同步到一个或多个从节点（Slave）。这样做的目的主要有：

- **数据备份**：从节点保存主节点数据的副本，防止数据丢失。
- **读写分离**：主节点负责写操作，从节点负责读操作，提高系统读性能。
- **高可用和负载均衡**：多个从节点分担读请求，保障系统稳定。

---

## 二、主从复制的工作原理

主节点接收写请求，并将写命令异步发送给从节点，从节点执行相同命令保持数据同步。

初次同步时，从节点会向主节点请求完整数据快照（RDB文件），完成后再同步增量更新。

---

## 三、配置主从复制

### 1. 启动主从节点实例（命令行）

```bash
# 启动主节点（默认端口6379）
redis-server --port 6379

# 启动从节点（例如端口6380）
redis-server --port 6380
````

### 2. 配置从节点指向主节点（Redis CLI）

```bash
redis-cli -p 6380
> SLAVEOF 127.0.0.1 6379
```

执行后，6380端口的 Redis 将开始从 6379 端口的主节点同步数据。

---

## 四、多语言客户端连接示例

以下示例展示如何用 Java、Node.js、Python、PHP 分别连接主节点和从节点，演示写数据到主节点，读数据从从节点获取。

### 1. Java（Jedis）

```java
import redis.clients.jedis.Jedis;

public class RedisReplicationDemo {
    public static void main(String[] args) {
        try (Jedis master = new Jedis("localhost", 6379);
             Jedis slave = new Jedis("localhost", 6380)) {

            // 主节点写入数据
            master.set("user:1001", "Alice");

            // 从节点读取数据
            String value = slave.get("user:1001");
            System.out.println("从节点读取到的数据: " + value);
        }
    }
}
```

---

### 2. Node.js（ioredis）

```javascript
const Redis = require('ioredis');
const master = new Redis(6379);
const slave = new Redis(6380);

async function demo() {
  // 主节点写入
  await master.set('user:1001', 'Alice');

  // 从节点读取
  const value = await slave.get('user:1001');
  console.log('从节点读取到的数据:', value);

  process.exit(0);
}

demo();
```

---

### 3. Python（redis-py）

```python
import redis

master = redis.Redis(host='localhost', port=6379)
slave = redis.Redis(host='localhost', port=6380)

# 主节点写入
master.set('user:1001', 'Alice')

# 从节点读取
value = slave.get('user:1001')
print("从节点读取到的数据:", value.decode('utf-8'))
```

---

### 4. PHP（phpredis）

```php
<?php
$master = new Redis();
$master->connect('127.0.0.1', 6379);

$slave = new Redis();
$slave->connect('127.0.0.1', 6380);

// 主节点写入
$master->set('user:1001', 'Alice');

// 从节点读取
$value = $slave->get('user:1001');
echo "从节点读取到的数据: $value\n";
```

---

## 五、实战故事：如何用主从复制解决系统瓶颈？

假设你是一个电商平台的运维小王，发现数据库压力太大，查询响应变慢。

你决定用 Redis 主从复制：

1. 搭建一台主节点，负责处理写请求。
2. 搭建两台从节点，分担大量的读请求。
3. 应用程序读操作指向从节点，写操作指向主节点。

结果：

* 读请求响应时间明显降低。
* 主节点专注写操作，效率提升。
* 系统高可用性提高，某个从节点宕机不会影响整体读能力。

---

## 六、主从复制常见问题及解决方案

| 问题          | 解决方案                     |
| ----------- | ------------------------ |
| 数据不同步       | 检查网络连接，确认 SLAVEOF 配置是否正确 |
| 主节点故障导致服务中断 | 使用 Redis Sentinel 自动故障转移 |
| 从节点数据延迟较大   | 优化网络和硬件资源，避免阻塞写命令        |

---

## 七、高可用架构进阶：Redis Sentinel 和 Cluster

* **Redis Sentinel**：自动监控主从节点状态，主节点宕机时自动切换从节点为主节点，保证服务不中断。
* **Redis Cluster**：通过分片实现数据分布和负载均衡，支持水平扩展。

下一章我们将详细介绍 Redis Sentinel 和 Cluster 架构设计。

---

## 八、小结

* Redis 主从复制实现数据备份和读写分离。
* 主从配置简单，适合提升读性能和保障数据安全。
* 推荐结合 Sentinel 实现自动故障转移，提升系统高可用性。
* 多语言客户端均支持访问主从节点，方便集成。

---

## 推荐阅读 & 参考资料

* [Redis 官方主从复制文档](https://redis.io/docs/manual/replication/) ✅
* [Redis Sentinel 介绍](https://redis.io/docs/manual/sentinel/) ✅
* [菜鸟教程 Redis 主从复制](https://www.runoob.com/redis/redis-replication.html) ✅
* 《Redis 实战》 高可用架构篇 ✅

---