---
title: Redis 系列教程 | 第 12 章：Redis 安全最佳实践（认证、访问控制、加密）
description: \U0001F6E1️ 本章深入讲解 Redis 在实际部署中如何做好安全防护，包括认证机制、访问控制、加密通信等关键手段，防止数据被篡改或非法访问。
keywords: Redis 安全, Redis 认证, Redis ACL, Redis 加密, Redis 安全配置
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: 2025-06-12 11:41
abbrlink: 58537
---


## 一、小故事开场：Redis “裸奔”被黑的那一天

阿杰最近接手了一个新项目，他兴冲冲上线 Redis 缓存服务，但忘记配置密码。第二天就收到报警：Redis 里被插入了大量恶意 key，甚至有人通过它写入了系统任务计划，执行了挖矿脚本！

阿杰懊悔不已：“我只想缓存个数据，结果差点成了矿场管理员……”

### ☠️ 真相：默认 Redis 是没有身份验证和访问控制的，一旦部署在公网，任何人都能连进来操作数据！

---

## 二、Redis 安全三板斧

1. **开启认证机制（requirepass）**
2. **配置访问控制列表（ACL）**
3. **启用加密通信（TLS）**

我们下面逐一说明。

---

## 三、开启认证机制（requirepass）

### 📌 场景说明：

Redis 默认不需要登录，一连接就能操作所有数据。显然，这在生产环境中是非常危险的。

### 🧪 使用方法：

修改 `redis.conf` 或配置文件：

```conf
requirepass myStrongP@ssw0rd
```

如果你用 Docker，可以这么配置：

```bash
docker run -d --name redis-secure -p 6379:6379 redis redis-server --requirepass "myStrongP@ssw0rd"
```

### 🧪 客户端使用密码连接：

```bash
# redis-cli
auth myStrongP@ssw0rd
```

### ⚠️ 注意事项：

* 一旦开启密码验证，所有客户端都必须使用 AUTH 命令通过验证后才能操作 Redis。
* 不推荐使用弱密码（如 redis、123456），建议使用长度不小于 12 的强密码。

---

## 四、访问控制列表（ACL）机制（Redis 6+ 支持）

### 📚 什么是 ACL？

ACL 是 Redis 提供的多用户授权机制，可以给不同用户分配不同权限，例如：

* 用户 A 只能读，不能写。
* 用户 B 只能操作某些 key。
* 用户 C 只能执行某些命令。

### 👩‍💻 示例配置：

创建一个只读用户：

```bash
ACL SETUSER readonly on >readonly123 allcommands ~* -write
```

说明：

* `on`：启用用户
* `>readonly123`：设置密码
* `allcommands`：默认允许所有命令
* `-write`：禁止写类命令

登录时这样使用：

```bash
AUTH readonly readonly123
```

---

## 五、Redis 支持加密传输吗？（TLS 配置）

从 Redis 6 开始，支持 TLS 加密通信，但需要编译时开启。

### 🎯 为什么要用加密？

因为 Redis 默认使用明文传输，所有数据、密码、命令在网络上传输时可能被抓包！

### 🔐 如何开启加密？

要使用 TLS，需要以下步骤：

1. 准备证书（CA、服务端、客户端）
2. 启动 Redis 时加上相关参数：

```bash
redis-server \
  --tls-port 6379 \
  --port 0 \
  --tls-cert-file /path/to/server.crt \
  --tls-key-file /path/to/server.key \
  --tls-ca-cert-file /path/to/ca.crt
```

3. 客户端连接时：

```bash
redis-cli --tls \
  --cert /path/to/client.crt \
  --key /path/to/client.key \
  --cacert /path/to/ca.crt
```

> 🎓 如果你使用的是 Redis Stack、RedisInsight 等图形化客户端，它们也支持 TLS。

---

## 六、防火墙配置与监听绑定（bind + protected-mode）

```conf
bind 127.0.0.1
protected-mode yes
```

* `bind`：限制只能本地访问 Redis，防止暴露公网
* `protected-mode yes`：开启保护模式，防止无密码连接被滥用

### 🚫 不推荐这样做：

```conf
bind 0.0.0.0
```

这会让 Redis 对外暴露所有网卡接口，极易被攻击！

---

## 七、防御扫描器的骚扰（重命名危险命令）

攻击者常常使用 `FLUSHALL`、`KEYS *`、`CONFIG` 等命令破坏数据，可以使用以下方式重命名或禁用：

```conf
rename-command CONFIG ""
rename-command FLUSHALL ""
rename-command KEYS "no_keys_for_you"
```

---

## 八、实战示例：结合 Docker Compose 配置安全 Redis

```yaml
version: '3'
services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"
    command: redis-server --requirepass "StrongP@ss123" --bind 0.0.0.0
```

你还可以将 `redis.conf` 挂载进去，集中配置 TLS、ACL、rename-command 等内容。

---

## 九、常见攻击方式与防范

| 攻击方式    | 说明                   | 防御手段               |
| ------- | -------------------- | ------------------ |
| 未认证远程访问 | 没配置密码，暴露公网           | requirepass + bind |
| 执行破坏性命令 | 执行 flushall、config 等 | rename-command     |
| 命令注入    | 客户端或 Web 服务拼接命令被注入攻击 | 参数过滤、使用库封装         |
| 明文传输被抓包 | 网络抓包获取密码或数据          | 使用 TLS             |

---

## 十、小结

| 安全手段           | 是否必须 | 推荐等级 |
| -------------- | ---- | ---- |
| requirepass    | ✅    | ⭐⭐⭐⭐ |
| bind 127.0.0.1 | ✅    | ⭐⭐⭐⭐ |
| ACL 权限管理       | ✅    | ⭐⭐⭐⭐ |
| TLS 加密         | ✅    | ⭐⭐⭐  |
| 重命名命令          | 可选   | ⭐⭐   |

---

## 推荐阅读与学习资源

* [Redis 官方文档：Security](https://redis.io/docs/management/security/) ✅
* [Redis 中文网 安全配置手册](https://www.redis.net.cn/order/security.html) ✅
* [菜鸟教程 Redis 安全配置](https://www.runoob.com/redis/redis-security.html) ✅
* 《Redis 深度历险》 第 12 章：Redis 安全管理 ✅

---