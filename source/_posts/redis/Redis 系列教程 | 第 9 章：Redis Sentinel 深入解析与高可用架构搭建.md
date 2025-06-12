---
title: Redis 系列教程 | 第 9 章：Redis Sentinel 深入解析与高可用架构搭建
description: 本章用通俗易懂的语言，详细讲解 Redis Sentinel 的工作原理、使用场景及高可用架构搭建，配合实战 Demo 和流程图，助你轻松掌握 Redis
  高可用保障。
keywords: Redis Sentinel, Redis 高可用, 哨兵机制, Redis 容错, Redis 故障转移, Redis 教程
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: 2025-06-11 18:32
abbrlink: 46923
---


## 一、为什么需要 Redis Sentinel？

小李是一个电商开发工程师，他的系统用 Redis 来做缓存和会话存储。有一天，Redis 主节点突然宕机，导致整个系统缓存失效，性能严重下降，客户投诉不断。

这时候，小李意识到：**单机 Redis 故障会带来巨大影响，必须实现 Redis 的高可用！**

于是他找到了 Redis Sentinel。

Redis Sentinel 是 Redis 官方提供的**高可用解决方案**，它能实时监控 Redis 集群状态，一旦主节点故障，自动完成**故障转移**，让从节点顶上去，保证系统继续正常运行。

---

## 二、Redis Sentinel 的核心功能

1. **监控（Monitoring）**  
   Sentinel 会持续监控所有 Redis 实例，检测它们是否正常工作。

2. **通知（Notification）**  
   当 Sentinel 发现 Redis 出现异常，会通知管理员或其他程序。

3. **自动故障转移（Automatic Failover）**  
   主节点挂了，Sentinel 会自动将其中一个从节点升级为新的主节点，应用无感知。

4. **配置提供者（Configuration Provider）**  
   客户端通过 Sentinel 获取当前 Redis 主节点地址，实现动态连接。

---

## 三、Redis Sentinel 架构流程图

下面这张图是 Sentinel 的工作流程简化示意：

![Redis Sentinel 工作流程](/images/post/redis/RedisSentinel.png)


---

## 四、Sentinel 工作原理白话解读

Sentinel 不是单独工作的，它们**一般会部署多个实例**（比如 3 个 Sentinel），相互之间通信并达成一致：

- Sentinel 会通过“心跳检测”监控 Redis 主从实例的健康状况。
- 如果某个 Sentinel 发现主节点失联（比如多次 ping 不通），会通知其他 Sentinel。
- 多数 Sentinel 达成共识后，判定主节点“真的挂了”，触发故障转移。
- 从节点中选出一个最合适的节点升级为新主节点。
- 其它 Sentinel 更新配置，新主节点信息广播给客户端。

---

## 五、Redis Sentinel 使用场景

| 场景                           | 说明                             |
| ------------------------------ | -------------------------------- |
| 高可用 Redis 缓存集群          | 主节点故障自动切换，保障服务稳定 |
| 会话存储需要持续访问保障       | 避免单点故障导致数据访问中断     |
| 分布式系统中的缓存和消息中间件 | 实现无缝故障转移                 |

---

## 六、实战演示：搭建简单 Redis Sentinel 集群

假设你有一主两从的 Redis 集群，Sentinel 部署三个实例。

### 1. Redis 配置（主节点 redis.conf）

```bash
# redis.conf 主节点示例配置
port 6379
# 允许从节点连接的端口
````

### 2. Redis 配置（从节点 redis.conf）

```bash
# redis.conf 从节点示例配置
port 6380
# 指定主节点地址和端口
replicaof 127.0.0.1 6379
```

### 3. Sentinel 配置 sentinel.conf

```bash
port 26379
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
sentinel parallel-syncs mymaster 1
```

* **mymaster** 是主节点名字
* **127.0.0.1 6379** 是主节点 IP 和端口
* **2** 是 Sentinel 判定主节点宕机需要的最少 Sentinel 数量

### 4. 启动 Redis 和 Sentinel

```bash
# 启动主节点
redis-server /path/to/redis.conf

# 启动从节点
redis-server /path/to/redis-slave.conf

# 启动 Sentinel
redis-sentinel /path/to/sentinel.conf
```

### 5. 模拟故障切换

在主节点上执行：

```bash
redis-cli -p 6379 shutdown
```

Sentinel 会自动检测到主节点挂掉，从节点会自动升级为主节点。你可以通过 Sentinel 查看当前主节点：

```bash
redis-cli -p 26379 sentinel get-master-addr-by-name mymaster
```

示例输出：

```
1) "127.0.0.1"
2) "6380"
```

说明主节点已经变成了原来的从节点 6380 端口。

---

## 七、多语言示例代码：如何连接 Sentinel 获取主节点地址

### Python 示例（redis-py）

```python
import redis
from redis.sentinel import Sentinel

# 连接 Sentinel 集群
sentinel = Sentinel([('127.0.0.1', 26379)], socket_timeout=0.1)

# 获取当前主节点连接
master = sentinel.master_for('mymaster', socket_timeout=0.1)

# 设置和获取值
master.set('foo', 'bar')
print(master.get('foo').decode())
```

### Node.js 示例（ioredis）

```javascript
const Redis = require('ioredis');

// 连接 Sentinel 集群，指定主节点名
const redis = new Redis({
  sentinels: [{ host: '127.0.0.1', port: 26379 }],
  name: 'mymaster'
});

// 设置和获取数据
(async () => {
  await redis.set('foo', 'bar');
  const val = await redis.get('foo');
  console.log(val);
})();
```

### Java 示例（Jedis）

```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisSentinelPool;
import java.util.HashSet;
import java.util.Set;

public class SentinelDemo {
    public static void main(String[] args) {
        Set<String> sentinels = new HashSet<>();
        sentinels.add("127.0.0.1:26379");

        JedisSentinelPool pool = new JedisSentinelPool("mymaster", sentinels);

        try (Jedis jedis = pool.getResource()) {
            jedis.set("foo", "bar");
            String value = jedis.get("foo");
            System.out.println(value);
        }
    }
}
```

### PHP 示例（phpredis）

```php
<?php
$sentinels = [
    ['host' => '127.0.0.1', 'port' => 26379],
];
$redis = new Redis();
$redis->connect('127.0.0.1', 26379);
$master = $redis->rawCommand('SENTINEL', 'get-master-addr-by-name', 'mymaster');
$redis->connect($master[0], $master[1]);

$redis->set('foo', 'bar');
echo $redis->get('foo');
?>
```

---

## 八. 主从+哨兵实战演示（Docker Compose）

#### 目录结构

```
redis-ha/
├── docker-compose.yml
├── redis-master/redis.conf
├── redis-slave/redis.conf
├── sentinel/sentinel.conf
```

#### docker-compose.yml 配置

```yaml
version: '3'
services:
  redis-master:
    image: redis
    ports:
      - "6379:6379"
    volumes:
      - ./redis-master/redis.conf:/usr/local/etc/redis/redis.conf
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]

  redis-slave:
    image: redis
    ports:
      - "6380:6379"
    volumes:
      - ./redis-slave/redis.conf:/usr/local/etc/redis/redis.conf
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]

  sentinel:
    image: redis
    ports:
      - "26379:26379"
    volumes:
      - ./sentinel/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: ["redis-sentinel", "/usr/local/etc/redis/sentinel.conf"]
```

#### redis-master/redis.conf

```conf
port 6379
appendonly yes
```

#### redis-slave/redis.conf

```conf
port 6379
replicaof redis-master 6379    # 指向主节点，做主从复制
appendonly yes
```

#### sentinel/sentinel.conf

```conf
port 26379

sentinel monitor mymaster redis-master 6379 2
# 2 表示哨兵认为主节点挂了的最少投票数

sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
sentinel parallel-syncs mymaster 1
```

---

## 九. 哨兵监控与故障转移流程演示

1. 启动服务：

```bash
docker-compose up -d
```

2. 主节点写入数据：

```bash
redis-cli -p 6379 set foo "bar"
```

3. 从节点读取数据：

```bash
redis-cli -p 6380 get foo
# 输出 "bar"
```

4. 停掉主节点：

```bash
docker stop redis-master
```

5. 查看哨兵选举的新主节点：

```bash
redis-cli -p 26379 sentinel get-master-addr-by-name mymaster
# 返回新的主节点 IP 和端口
```

---



## 十、总结小故事

想象一下，小李的电商系统用 Redis 缓存热点商品数据，某天主节点意外宕机，系统本该宕机，但由于部署了 Sentinel，自动切换到从节点，缓存数据几乎无缝衔接，用户依然可以快速浏览商品，系统无任何中断，客户和老板都非常满意。

这就是 Sentinel 的魅力——**自动、实时、透明的故障转移，保障系统高可用！**

---

## 十一、推荐阅读 & 参考资料

* [Redis Sentinel 官方文档](https://redis.io/docs/manual/sentinel/) ✅
* [Redis 中文网 Sentinel 教程](https://www.redis.net.cn/order/sentinel.html) ✅
* [菜鸟教程 Redis Sentinel 入门](https://www.runoob.com/redis/redis-sentinel.html) ✅
* 《Redis 实战》（机械工业出版社）第六章 Sentinel 高可用章节 ✅
* [哨兵架构示意图 - jsDelivr CDN](https://cdn.jsdelivr.net/gh/redis-developer/blog/static/sentinel-architecture.png) ✅

---