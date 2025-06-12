---
title: Redis 系列教程 | 第 14 章：运维监控与故障排查
description: "\U0001F6E0️ 本章通过白话故事切入，介绍 Redis 运维监控关键指标、故障排查方法与自动告警，附 docker-compose 部署监控体系及多语言健康检查脚本，助你构建高可用 Redis。"
keywords: 'Redis 运维监控, Redis 故障排查, Docker Compose Redis 监控, Prometheus, Grafana, Redis 教程'
top_img: /images/post/redis/redis.png
cover: /images/post/redis/redis.png
categories:
  - Redis
tags:
  - 教程
  - Redis
date: '2025-06-12 12:30'
abbrlink: 47303
---

[![redis\_exporter监控所有redis实例 ...](https://images.openai.com/thumbnails/a2e44e9f8f7ee1db14fa292a78c23b43.jpeg)](https://blog.zzppjj.top/pages/90eefc/)

---

## 一、开篇小故事：Redis“小红”的健康体检

想象 Redis 是仓库管理员“小红”，平时活力十足，进货快、出货快。但有一天，小红频繁跑错货架（响应变慢），还总是累成一团（CPU 拉满）……阿杰意识到：“不能再让小红单打独斗了，该给她配监控、定期体检了！”

---

## 二、运维关注核心指标

这些指标相当于“医疗体检表”：

| 指标           | 比喻对应       | 说明            |
| ------------ | ---------- | ------------- |
| 内存使用量        | 仓库货架的拥挤程度  | 🟥 高则慢，需清理或扩容 |
| 连接数          | 门口排队人数     | ⚠️ 洪峰来袭，容易卡顿  |
| 每秒请求量（QPS）   | 订单处理速度     | 📈 波动大先检查流量变化 |
| 慢查询（Slowlog） | 找出“跑不动”的操作 | 🐢 用作性能调优依据   |
| 主从复制与延迟      | 仓库副本是否同步   | 🔁 数据备份是否及时   |

---

## 三、基本运维命令和脚本

```bash
# 检查内存使用
redis-cli info memory | grep used_memory_human

# 检查连接数
redis-cli info clients | grep connected_clients

# 查看慢查询记录（设定慢阈值10毫秒）
redis-cli config set slowlog-log-slower-than 10000
redis-cli slowlog get 5
```

输出示例可能类似：

```
used_memory_human:128.50M
connected_clients:57
1) 1) (integer) 12
   2) (integer) 1625647890
   3) (integer) 23000
   4) 1) "hgetall"
      2) "key:huge_hash"
```

---

## 四、可视化监控体系（Grafana + Prometheus）

通过图表一览 Redis 健康状态，并结合告警触发机制。

### Docker Compose 示例：

```yaml
version: '3.8'
services:
  redis:
    image: redis:7
    ports: ["6379:6379"]
  redis_exporter:
    image: oliver006/redis_exporter
    ports: ["9121:9121"]
    environment:
      - REDIS_ADDR=redis://redis:6379
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secret
```

`prometheus.yml` 配置示例：

```yaml
scrape_configs:
  - job_name: 'redis_exporter'
    static_configs:
      - targets: ['redis_exporter:9121']
```

启动后：

* Prometheus 收集 Redis 状态指标；
* Grafana 可使用导入模板展示图表视图。

---

## 五、实战图展示

图表包括：

* CPU、内存、慢查询趋势（图来自开源 Grafana 模板）([redis.io][1])。

---

## 六、日志查看与自动告警示例

```bash
# 查看日志路径
redis-cli config get logfile

# 实时查看日志
tail -f /var/log/redis_6379.log
```

示例告警脚本（报警至企业微信）：

```bash
#!/bin/bash
# 检查连接数是否超过阈值
cur=$(redis-cli info clients | grep connected_clients | cut -d: -f2)
if [ "$cur" -gt 100 ]; then
  curl -X POST -H 'Content-Type:application/json' \
    -d '{"msgtype":"text","text":{"content":"Redis 连接数过高：'"$cur"'"}}' \
    'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx'
fi
```

建议将其加入定时任务（cron）或程序监控流程。

---

## 七、多语言 Health Check 示例

```python
# Python
import redis
print("PONG" if redis.Redis().ping() else "ERROR")
```

```js
// Node.js
const Redis = require('ioredis');
new Redis().ping().then(console.log);
```

```java
// Java (Jedis)
System.out.println(new Jedis("localhost",6379).ping());
```

```php
// PHP
$redis = new Redis();
$redis->connect('127.0.0.1',6379);
echo $redis->ping();
```

---

## 八、常见故障排查指南

| 故障场景     | 排查建议                      |
| -------- | ------------------------- |
| 无法连接     | 检查 bind、端口、防火墙            |
| 内存激增     | 用 `MEMORY USAGE key` 找大对象 |
| 响应变慢     | 查看慢日志和命令耗时                |
| 主从延迟或不同步 | 检查网络状况、`repl_backlog`     |
| 锁住或阻塞    | 脚本命令执行是否卡主主线程             |
| 持久化异常    | 检查 RDB/AOF 配置是否正常         |

---

## 九、小结

* Redis 运维关键是：**监控 + 可视化 + 报警 + 健康检查**
* 推荐工具：RedisInsight、Prometheus + Grafana + Redis Exporter
* 故障排查靠 `INFO`, `SLOWLOG`, 日志、脚本检查快速定位
* 用多语言脚本定时 ping Redis 可纳入 CI/CD 流程

---

## 🔗 推荐资源（中国大陆可访问）

* [Prometheus + Grafana 监控 Redis 实战 · Dev.to](https://dev.to/rslim087a/monitoring-redis-with-prometheus-and-grafana-56pk) ([grafana.com][2], [dev.to][3], [volkovlabs.medium.com][4])
* [Grafana 官方：Redis Data Source & Dashboard](https://grafana.com/grafana/dashboards/12776-redis/) ([grafana.com][2])
* [CSDN 教程：Docker Compose 监控 Redis Grafana](https://blog.zzppjj.top/pages/90eefc/) ([dev.to][5])
* [DeepFlow Redis 可观测性介绍](https://www.deepflow.io/blog/zh/021-grafana-deepflow-dashboard-for-redis/index.html) ([deepflow.io][6])

---

📘 **本系列大功告成！** 如果你想整理成 PDF 或添加目录页、封面，也可以继续告诉我，我来帮你生成✨

[1]: https://redis.io/docs/latest/integrate/prometheus-with-redis-enterprise/?utm_source=chatgpt.com "Prometheus and Grafana with Redis Enterprise Software | Docs"
[2]: https://grafana.com/grafana/dashboards/12776-redis/?utm_source=chatgpt.com "Redis | Grafana Labs"
[3]: https://dev.to/rslim087a/monitoring-redis-with-prometheus-and-grafana-56pk?utm_source=chatgpt.com "Monitoring Redis with Prometheus Exporter and Grafana"
[4]: https://volkovlabs.medium.com/grafana-data-streaming-meets-redis-d89f2bc25339?utm_source=chatgpt.com "Grafana data streaming meets Redis | by ..."
[5]: https://dev.to/docker/how-to-monitor-redis-with-prometheus-and-grafana-for-real-time-analytics-23i3?utm_source=chatgpt.com "How to monitor Redis with Prometheus and Grafana using Docker ..."
[6]: https://www.deepflow.io/blog/zh/021-grafana-deepflow-dashboard-for-redis/index.html?utm_source=chatgpt.com "使用DeepFlow 开启Redis 可观测性- 云原生 ..."
