---
title: Redis 系列教程 | 第 10 章：Redis 集群架构详解及实战部署
description: \U0001F680 本章通过白话文深入讲解 Redis 集群原理及其与主从复制、哨兵机制的关系，附带 Docker Compose 实战部署示例和多语言客户端访问演示。
keywords: Redis Cluster, Redis 集群部署, Redis 高可用, Redis 槽位, Redis 实战部署, 主从复制, 哨兵
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: 2025-06-11 18:33
abbrlink: 19012
---


## 一、故事开头：一台 Redis 不够用怎么办？

想象你在做一个电商系统，刚开始一个 Redis 服务撑得住。但业务越做越大，单机 Redis 撑不住了：

- 内存不足，塞不下所有商品缓存
- 单点故障，一宕机整站崩
- QPS 达到极限，瓶颈明显

👉 **这时候，就该上 Redis 集群了！**

---

## 二、什么是 Redis 集群？

Redis Cluster 是官方提供的**分布式部署方案**，具备以下特性：

| 特性           | 是否支持 | 说明                          |
| -------------- | -------- | ----------------------------- |
| 水平扩展       | ✅        | 节点数量可动态增加            |
| 自动分片       | ✅        | 根据 key 哈希值分布到不同节点 |
| 高可用（主从） | ✅        | 节点失效自动故障转移          |
| 跨节点事务     | ❌        | 不支持                        |

> Redis Cluster = 自动分片 + 多主多从 + 故障转移

---

## 三、Redis 集群架构图

![Redis Cluster 架构图](/images/post/redis/cluster.png)

- **主节点负责存数据**
- **每个主节点配一个从节点**
- **槽位机制将 Key 分散到不同主节点**

---

## 四、白话解释：槽位机制怎么工作？

Redis Cluster 把整个 key 空间切成 **16384 个槽位（slots）**。

每个主节点负责一部分槽位。例如：

- 节点 A：负责槽位 0~5460
- 节点 B：负责槽位 5461~10922
- 节点 C：负责槽位 10923~16383

> Redis 根据 key 的 CRC16 值对 16384 取模，决定该 key 属于哪个槽位，由哪个节点管理。

举个例子：

```text
SET user:123 name:Jack
# Redis 计算 CRC16(user:123) % 16384 = 槽位编号
# 假如是 8421，则落到节点 B 上
````

---

## 五、部署一个本地 Redis 集群（Docker Compose）

### 💼 准备目录结构

```bash
redis-cluster/
├── docker-compose.yml
├── redis-node1/redis.conf
├── redis-node2/redis.conf
├── redis-node3/redis.conf
├── redis-node4/redis.conf
├── redis-node5/redis.conf
├── redis-node6/redis.conf
```

### ⚙️ docker-compose.yml 配置（6 个节点）

```yaml
version: '3'
services:
  redis-node1:
    image: redis
    ports:
      - "7001:6379"
    volumes:
      - ./redis-node1/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

  redis-node2:
    image: redis
    ports:
      - "7002:6379"
    volumes:
      - ./redis-node2/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

  redis-node3:
    image: redis
    ports:
      - "7003:6379"
    volumes:
      - ./redis-node3/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

  redis-node4:
    image: redis
    ports:
      - "7004:6379"
    volumes:
      - ./redis-node4/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

  redis-node5:
    image: redis
    ports:
      - "7005:6379"
    volumes:
      - ./redis-node5/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

  redis-node6:
    image: redis
    ports:
      - "7006:6379"
    volumes:
      - ./redis-node6/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
```

### 🧾 redis.conf 示例配置

```conf
port 6379
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
```

---

## 六、初始化集群

容器启动后进入任意容器执行：

```bash
docker exec -it redis-node1 redis-cli --cluster create \
  127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 \
  127.0.0.1:7004 127.0.0.1:7005 127.0.0.1:7006 \
  --cluster-replicas 1
```

> 创建集群并配置每个主节点配一个从节点

成功后你会看到：

```bash
>>> Performing hash slots allocation on 6 nodes...
>>> Trying to optimize slaves allocation for anti-affinity
...
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
>>> Finalizing cluster
>>> Cluster correctly created
```

---

## 七、集群运行效果

```bash
$ redis-cli -c -p 7001

127.0.0.1:7001> set name "Alice"
-> Redirected to slot [5798] located at 127.0.0.1:7002
OK

127.0.0.1:7002> get name
"Alice"
```

✅ 命令自动跳转到对应槽位节点。

---

## 八、集群中的故障转移（模拟）

你可以停掉某个主节点容器观察效果：

```bash
docker stop redis-node2
```

Redis Cluster 会在几秒钟后自动将其从节点（如 node5）升级为主节点，继续服务。

---

## 九、Redis 集群、主从复制与哨兵的关系详解

---

### 1. 它们分别是什么？

| 名称                      | 作用及特点                                                                     |
| ------------------------- | ------------------------------------------------------------------------------ |
| **主从复制**              | Redis 的基础复制机制，主节点写，多个从节点读，提升读取能力和数据冗余。         |
| **哨兵（Sentinel）**      | 监控主从状态，主节点宕机时自动进行故障转移（选举新主），保证高可用。           |
| **Redis 集群（Cluster）** | 将数据自动分片分布到多个主节点，实现水平扩展，内置故障转移，无需单独哨兵系统。 |

---

### 2. 它们之间有什么联系和区别？

| 特性         | 主从复制 + 哨兵                | Redis 集群（Cluster）                  |
| ------------ | ------------------------------ | -------------------------------------- |
| 复制模式     | 单主多从                       | 多主多从                               |
| 故障转移     | Sentinel 监控，自动选主        | 内置自动故障转移                       |
| 数据分片     | 不支持                         | 支持（槽位机制，自动分片）             |
| 横向扩展能力 | 较弱（单主限制写能力）         | 强，支持多主并行写                     |
| 管理复杂度   | 较低（单主复制链路，哨兵管理） | 较高（多节点，槽位分布，网络通信复杂） |
| 应用场景     | 适合读多写少，或简单高可用方案 | 适合大规模读写，分布式高可用集群       |

---

### 3. 白话理解

* **主从 + 哨兵**就像一座房子，房子有一扇主门（主节点），平时大家通过主门进出（写操作），还有很多侧门（从节点）供人观看（读操作）。哨兵是门卫，门卫时刻盯着主门，主门坏了立刻安排其他侧门变成主门，保证房子不停工。

* **Redis 集群**是一个由多座房子组成的社区（多个主节点），每座房子管理不同的区域（槽位），大家通过地图找到该去哪个房子办事（写操作定位），而且社区自己有内建门卫系统，自动维护和切换门，社区规模更大更复杂。

---

### 4. 配合示意图

```plaintext
主从 + 哨兵架构

        +-------------+                +-----------+
        |   主节点    | <------------> | 哨兵监控  |
        +-------------+                +-----------+
          /          \
    +--------+    +--------+
    | 从节点1 |    | 从节点2 |
    +--------+    +--------+

Redis 集群架构

+-------+   +-------+   +-------+
| 主节点1|   | 主节点2|   | 主节点3|
+-------+   +-------+   +-------+
   |            |           |
+-----+      +-----+     +-----+
|从节点|      |从节点|     |从节点|
+-----+      +-----+     +-----+

每个主节点负责一部分槽位，所有节点通过槽位通信，自动管理故障转移。
```

---

### 5. Redis 集群实战演示（简要）

Redis 集群内置自动故障转移，无需哨兵辅助。

```bash
# 创建6节点集群（3主3从）
docker exec -it redis-node1 redis-cli --cluster create \
  127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 \
  127.0.0.1:7004 127.0.0.1:7005 127.0.0.1:7006 --cluster-replicas 1
```

---

### 6. 多语言示例：连接 Redis 集群（Node.js）

```js
```


const Redis = require("ioredis");

const cluster = new Redis.Cluster(\[
{ port: 7001, host: "127.0.0.1" },
{ port: 7002, host: "127.0.0.1" },
{ port: 7003, host: "127.0.0.1" }
]);

(async () => {
await cluster.set("foo", "bar");
const val = await cluster.get("foo");
console.log(val); // bar
cluster.disconnect();
})();

```

---

## 十、总结

- **单机 Redis 适合小规模缓存和简单场景**
- **主从复制+哨兵保证高可用，适合读写分离及容灾**
- **Redis 集群实现数据分片，支持大规模分布式缓存和高可用**
- 选型要根据业务需求：容量、QPS、可用性、运维复杂度

---

## 十一、参考资料

- [Redis 官方文档](https://redis.io/docs/manual/)
- [Redis Sentinel 介绍](https://redis.io/docs/manual/sentinel/)
- [Redis Cluster 介绍](https://redis.io/docs/manual/cluster/)
- [Redis 官方 GitHub](https://github.com/redis/redis)

---