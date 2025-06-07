---
title: 🐳 Docker Compose 深入服务配置篇（六）：资源限制与其他字段
date: 2025-06-07 14:00
top_img: /images/post/docker/docker.jpg
cover: /images/post/docker/docker.jpg
categories: ["Docker"]
tags: ["Docker","教程"]
---

# 🐳 精细控制你的容器：资源限制、命名与日志配置！

你好呀！欢迎来到 Docker Compose 教程的第六章！我们已经一起走过了 Docker Compose 的基础构建（服务配置）、整体结构（顶层定义）、操作命令、服务依赖与健康检查，以及灵活的多环境配置。你的 Docker Compose “功力”正在显著提升！

现在，是时候看看一些更进阶的服务配置字段了。这些字段虽然不像 `image`、`ports`、`volumes` 那样常用，但在特定的场景下却非常重要，比如控制容器对服务器资源的占用、给容器起个好记的名字，或者调整容器的日志行为。

掌握这些字段，能让你对容器的控制更加精细，构建出更稳定、更易于管理的 Docker 化应用。

---

## 🏷️ 1. `container_name`：给你的容器起个专属名字

默认情况下，Docker Compose 会给容器起一个由项目名、服务名和序号组成的冗长名字（比如 `myapp_web_1`）。虽然可以通过服务名在 Docker 网络中互相访问，但有时候你可能希望给特定的容器起一个更简单、更固定、更容易记住的名字。

`container_name` 字段就是用来干这个的！

```yaml
version: '3.8'

services:
  web:
    image: my-web-app
    # container_name: 给这个服务创建的容器指定一个固定的名字
    container_name: my_awesome_web_container # 我想让 web 服务的容器名字就叫这个

  db:
    image: mysql:5.7
    # container_name:
    container_name: my_project_mysql # 数据库容器名字

# ... 其他配置 ...
```

*   **作用**：为服务创建的容器指定一个固定的、用户友好的名称。
*   **优点**：
    *   **易于识别**：在 `docker ps` 命令输出中一眼就能认出容器。
    *   **方便操作**：可以直接使用这个固定名字来执行 `docker stop`, `docker rm`, `docker exec` 等 Docker 命令，而不用找那个长长的自动生成的名字。
*   **缺点和注意事项**：
    *   **唯一性**：Docker 容器的名字在宿主机上必须是唯一的。如果你的 `docker-compose.yml` 文件会部署多次（比如在不同的服务器上），或者同一个服务需要运行多个副本（`replicas > 1`，这在 Docker Compose V3 配合 Swarm/Kubernetes 时才会用到），就不能使用 `container_name`，因为这样会导致名字冲突。
    *   **不适用于 Scale Up**：因为名字是固定的，如果你通过 `docker-compose up --scale web=3` 运行 `web` 服务创建多个副本，只有第一个容器能成功使用 `container_name`，后面的会因为名字冲突而失败。
*   **适合场景**：
    *   开发环境，容器数量少且固定，方便调试和手动操作。
    *   单实例运行的服务（不打算 Scale Up）。

---

## 🏋️ 2. 资源限制：控制你的容器不要“吃光”服务器资源！

容器虽然提供了隔离，但默认情况下，容器里的应用可以使用宿主机几乎全部的 CPU 和内存资源。如果你的应用出现 Bug 导致内存泄漏或者 CPU 占用 100%，它可能会影响甚至拖垮宿主机上运行的其他服务或进程。

为了避免这种情况，在生产环境或者资源有限的环境中，强烈建议给你的容器设置**资源限制 (Resource Limits)**。Docker Compose 提供了字段来让你限制容器可以使用的 CPU 和内存。

### 内存限制

*   **`mem_limit`**：设置容器可以使用的**最大内存量**（包括 RAM 和 Swap）。
*   **`memswap_limit`**：设置容器可以使用的总内存（RAM + Swap）。如果 `memswap_limit` 大于 `mem_limit`，差值就是容器可以使用 Swap 的最大量。如果 `memswap_limit` 和 `mem_limit` 相等，则禁用 Swap。如果 `memswap_limit` 不设置且 `mem_limit` 设置了，则容器可以使用 Swap 的量是 `mem_limit` 的两倍。

```yaml
version: '3.8'

services:
  app:
    image: my-memory-hungry-app
    # mem_limit: 限制容器最大内存使用，例如 512MB
    mem_limit: 512m # 支持 b, k, m, g (bytes, kilobytes, megabytes, gigabytes) 单位

    # memswap_limit: 限制总内存 (RAM + Swap)。这里设置为 1g，表示可以额外使用 512m 的 Swap (1g - 512m)
    memswap_limit: 1g

    # 如果只想限制 RAM 且禁用 Swap，可以这样：
    # mem_limit: 512m
    # memswap_limit: 512m # RAM 和 Swap 上限相等，禁用 Swap

    # ... 其他配置 ...
```

*   **作用**：防止单个容器耗尽宿主机的内存资源，提高系统的稳定性。
*   **流程**：当容器尝试使用的内存超过 `mem_limit` 时，Docker 会尝试终止该容器中的进程。

### CPU 限制

CPU 限制有几种方式，可以提供不同粒度的控制：

*   **`cpu_shares` (或 `cpu_weight`)**：设置 CPU “份额”或“权重”。这是一个相对值。如果两个容器，一个 `cpu_shares` 是 1024 (默认值)，另一个是 512，当 CPU 资源紧张时，第一个容器可能会获得两倍于第二个容器的 CPU 时间。这是一个软限制。
    ```yaml
    services:
      app:
        image: my-app
        cpu_shares: 512 # 分配的 CPU 份额较低，在 CPU 竞争时优先级低

      worker:
        image: my-background-worker
        cpu_shares: 1024 # 默认值
      # ...
    ```
    *   **作用**：在 CPU 资源紧张时，按比例分配 CPU 时间给容器。
    *   **适合场景**：区分服务的优先级，重要的服务给更高的份额。

*   **`cpu_quota` 和 `cpu_period`**：更精确的 CPU 硬限制。`cpu_period` 设置一个周期（默认 100ms），`cpu_quota` 设置在这个周期内容器最多可以使用多少 CPU 时间（微秒，1ms = 1000us）。
    *   例如，`cpu_period: 100ms` (或 `100000`)，`cpu_quota: 50000`，表示在每 100ms 内，容器最多使用 50ms 的 CPU 时间，相当于限制为 0.5 个 CPU 核。
    *   如果宿主机有 4 个 CPU 核，设置 `cpu_quota: 200000` 相当于限制为 2 个 CPU 核 (`200000 / 100000 = 2`)。
    *   通常只设置 `cpu_quota`，`cpu_period` 使用默认值即可。
    ```yaml
    services:
      app:
        image: my-app
        # cpu_quota: 限制在每个周期内最多使用 50000 微秒的 CPU 时间 (相当于 0.5 个 CPU 核)
        cpu_quota: 50000
        # cpu_period: 周期，默认 100000 微秒 (100ms)
        # cpu_period: 100000 # 通常不用写

      # ...
    ```
    *   **作用**：将容器的 CPU 使用限制在固定的上限，即使宿主机资源富余，也不会超过这个限制。
    *   **适合场景**：严格控制服务占用的 CPU 资源，避免其影响其他关键服务，或者根据服务需求分配固定的 CPU 核数。

*   **`cpuset`**：将容器绑定到特定的 CPU 核。
    ```yaml
    services:
      app:
        image: my-app
        cpuset: "0,1" # 将容器限定在宿主机的 CPU 核 0 和 1 上运行

      worker:
        image: my-worker
        cpuset: "2" # 将容器限定在宿主机的 CPU 核 2 上运行
      # ...
    ```
    *   **作用**：将容器的 CPU 使用锁定在特定的 CPU 核，可以用于性能调优或隔离。
    *   **适合场景**：需要隔离高性能应用，或者在 NUMA 架构下优化性能。

### 新的 `resources` 语法 (Compose V3.8+)

在 Docker Compose V3.8 及更高版本中，推荐使用 `resources` 字段来组织资源限制，结构更清晰。

```yaml
version: '3.8' # 确保版本 >= 3.8

services:
  app:
    image: my-app
    deploy: # 资源限制通常是部署相关的配置，放在 deploy 下 (Swarm Mode 语法，但在 Compose V3+ 中也常用于普通模式)
      resources:
        limits: # 硬限制 (不能超过)
          cpus: '0.5' # 限制为 0.5 个 CPU 核 (相当于 cpu_quota / cpu_period)
          memory: 512M # 限制最大内存 512MB (相当于 mem_limit)
        reservations: # 预留资源 (保证至少拥有)
          cpus: '0.25' # 预留 0.25 个 CPU 核
          memory: 256M # 预留 256MB 内存
    # ... 其他配置 ...
```
*注意：`deploy` 字段最初是用于 Docker Swarm 模式的部署配置，但在 Docker Compose V3.8+ 中，`deploy.resources` 也被用于普通模式下的资源限制。同时，旧的顶层 `cpus`, `mem_limit`, `memswap_limit` 等字段仍然可用，但推荐使用 `deploy.resources`。`cpu_shares` 和 `cpuset` 不在 `deploy.resources` 下，仍是服务顶层字段。*

*   **`deploy.resources.limits`**：定义容器可以使用的资源上限（硬限制）。
*   **`deploy.resources.reservations`**：定义为容器预留的资源量。当宿主机资源不足时，Docker 会优先保证预留了资源的容器。这是一个软保证，但有助于调度。

*   **资源限制总结**：
    *   **内存**：`mem_limit` 是最重要的，通常和 `memswap_limit` 一起用。
    *   **CPU**：
        *   软限制：`cpu_shares` (按比例分配 CPU 时间)
        *   硬限制：`cpu_quota` / `cpu_period` (限制绝对 CPU 使用上限) 或 `deploy.resources.limits.cpus` (推荐 V3.8+)。
        *   绑定核心：`cpuset` (将容器绑定到特定核)。
    *   **推荐**：在生产环境，至少设置 `mem_limit` 和 `deploy.resources.limits.cpus` 或 `cpu_quota`。

---

## 🔖 3. `labels`：给你的服务和容器贴个“标签”

`labels` 字段允许你给服务和由该服务创建的容器添加任意的元数据（metadata），也就是键值对形式的标签。这些标签本身不会影响容器的运行，但可以被 Docker 或第三方工具用于过滤、组织、监控、自动化等。

```yaml
version: '3.8'

services:
  web:
    image: my-web-app
    # labels: 给服务和容器添加标签
    labels:
      # 格式： 标签名: 标签值
      com.example.department: "marketing" # 可以用反向域名格式避免冲突
      version: "1.2.0" # 标明应用版本
      monitoring.enabled: "true" # 告诉监控系统这个服务需要被监控
      traefik.enable: "true" # 告诉 Traefik 这个服务需要被暴露 (Traefik 是一款流行的反向代理，常用标签来发现服务)

    # ... 其他配置 ...
```

*   **作用**：为服务和容器附加自定义的元数据，方便管理和自动化。
*   **使用场景**：
    *   **组织和分类**：按部门、环境、项目等对服务进行分类。
    *   **自动化和发现**：让像 Traefik (反向代理)、Prometheus (监控) 等工具通过标签来发现和配置服务。
    *   **过滤**：使用 `docker ps --filter label=key=value` 来查找特定标签的容器。
    *   **版本管理**：在标签中标明服务版本。

---

## 🪵 4. `logging`：控制你的容器日志去哪儿？

容器的标准输出 (stdout) 和标准错误 (stderr) 会被 Docker 捕获，并默认使用 `json-file` 驱动存储在宿主机上。`logging` 字段可以让你改变这种行为，选择不同的日志驱动 (Logging Driver) 并配置驱动的选项。

```yaml
version: '3.8'

services:
  app:
    image: my-app
    # logging: 配置日志行为
    logging:
      # driver: 指定日志驱动，默认是 json-file
      driver: "json-file" # 默认驱动，日志存储为 JSON 文件在宿主机

      # driver: "none" # 不记录日志，所有日志输出会被丢弃 (除非你手动进入容器查看)
      # driver: "syslog" # 将日志发送到宿主机的 syslog 服务
      # driver: "journald" # 将日志发送到宿主机的 systemd-journald 服务
      # driver: "fluentd" # 将日志发送到 Fluentd 日志收集器

      # options: 配置日志驱动的选项
      options:
        # json-file 驱动的选项：限制日志文件大小和数量
        max-size: "10m" # 每个日志文件最大 10MB
        max-file: "5" # 最多保留 5 个日志文件 (总共最多 50MB 日志)

        # 其他驱动有不同的选项，比如 syslog 可以指定地址和 Facility
        # syslog-address: "tcp://192.168.1.5:514"
        # syslog-facility: "daemon"

    # ... 其他配置 ...
```

*   **作用**：控制容器日志的存储方式、发送目的地以及相关的参数（如文件大小限制）。
*   **常用的日志驱动**：
    *   `json-file` (默认)：简单方便，日志保存在宿主机本地，适合开发和简单部署。但如果日志量大，需要注意文件大小和数量限制，防止磁盘空间耗尽。
    *   `none`：禁用日志记录，适合不需要日志的场景。
    *   `syslog`, `journald`, `fluentd`, `splunk`, `awslogs` 等：这些是专业的日志收集驱动，用于将日志发送到集中的日志管理系统，方便统一收集、分析和存储，适合生产环境。
*   **使用场景**：
    *   在开发环境中，使用默认 `json-file` 驱动并设置 `max-size` 和 `max-file` 防止日志文件过大。
    *   在生产环境中，配置 `logging` 驱动将日志发送到公司统一的日志收集平台。
    *   对于某些输出大量日志但不需要保留的服务，可以使用 `driver: "none"`。

---

## 🧐 其他一些可能有用的服务字段

除了上面详细介绍的，还有一些字段在特定场景下也会用到，这里简要提及：

*   **`privileged: true`**：赋予容器几乎所有宿主机的权限。非常危险！只有在极少数需要直接操作宿主机硬件或内核的特殊容器时才使用，比如 Docker In Docker (DIND) 容器。
*   **`cap_add`, `cap_drop`**：更细粒度地控制容器的 Linux 能力 (Capabilities)。比 `privileged` 安全得多，可以只赋予容器所需的特定权限（比如 `NET_ADMIN` 用于配置网络接口，`SYS_TIME` 用于修改系统时间）。
*   **`read_only: true`**：将容器的根文件系统设置为只读。提高了安全性，强制应用将需要写入的数据保存到数据卷或 `/tmp`。
*   **`tmpfs`**：挂载一个临时的文件系统到容器内，数据只存在于宿主机内存中，容器停止后数据会丢失。适合存放敏感或临时的非持久化数据，提高性能并减少对存储的 I/O。
*   **`sysctls`**：在容器内部设置内核参数 (sysctls)。比如调优网络参数，或者设置共享内存限制等。

```yaml
services:
  special_app:
    image: my-special-app
    privileged: true # 非常危险，慎用！
    # 或者更安全的做法：
    # cap_add:
    #   - NET_ADMIN
    #   - SYS_TIME
    read_only: true # 使容器文件系统只读

  temp_data_processor:
    image: my-processor
    # tmpfs: 挂载一个临时文件系统到容器的 /app/temp 目录
    tmpfs: /app/temp

  high_perf_network_app:
    image: my-network-app
    # sysctls: 在容器内设置内核参数
    sysctls:
      net.core.somaxconn: 1024 # 增大网络连接队列长度
      net.ipv4.tcp_syncookies: 0 # 关闭 SYN cookies

    # ... 其他配置 ...
```
这些字段相对更高级，通常在遇到特定需求或问题时才会用到。对于初学者，重点掌握 `container_name`, 资源限制 (`mem_limit`, `deploy.resources`), `labels`, `logging` 就足够了。

---

## ✨ 综合示例：结合一些高级字段

```yaml
version: '3.8'

services:
  app:
    build: .
    image: myapp:latest
    container_name: my_web_app # 指定容器名字

    ports:
      - "80:3000"

    volumes:
      - .:/app
      - app_logs:/app/logs # 日志卷

    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}

    # 资源限制：限制 CPU 和内存
    deploy:
      resources:
        limits:
          cpus: '0.75' # 限制最多使用 0.75 个 CPU 核
          memory: 768M # 限制最大内存 768MB
        reservations:
          cpus: '0.25' # 预留 0.25 个 CPU 核
          memory: 256M # 预留 256MB 内存

    labels: # 添加标签
      com.example.service: "web"
      com.example.version: "1.5"
      env: "production"

    logging: # 配置日志，限制文件大小和数量
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "3"

    depends_on:
      db:
        condition: service_healthy

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

    networks:
      - app_network

  db:
    image: mysql:5.7
    container_name: my_app_db # 指定容器名字

    volumes:
      - db_data:/var/lib/mysql

    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=mydatabase

    # 资源限制：数据库可能需要更多资源
    deploy:
      resources:
        limits:
          cpus: '1.0' # 限制最多使用 1 个 CPU 核
          memory: 1.5G # 限制最大内存 1.5GB
        reservations:
          cpus: '0.5' # 预留 0.5 个 CPU 核
          memory: 512M # 预留 512MB 内存

    labels: # 添加标签
      com.example.service: "database"
      db_type: "mysql"
      env: "production"

    logging: # 配置日志，也可以发送到其他地方
      driver: "json-file"
      options:
        max-size: "20m" # 数据库日志可能更大
        max-file: "5"


    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

    networks:
      - app_network

volumes:
  db_data:
  app_logs: # 声明日志卷

networks:
  app_network:
```
这个例子展示了如何在同一个文件里组合使用我们之前学过的核心字段和本章介绍的资源限制、命名、标签和日志配置。

---

**本章小结**

我们学习了一些 Docker Compose 中用于精细控制服务行为的字段：
*   `container_name`：给容器指定固定名称（方便操作，但有唯一性限制）。
*   资源限制 (`mem_limit`, `memswap_limit`, `cpu_shares`, `cpu_quota`, `cpuset`) 以及推荐的 `deploy.resources` 语法：控制容器对 CPU 和内存的占用。
*   `labels`：给服务和容器添加元数据标签，用于组织、过滤和自动化。
*   `logging`：配置容器日志的驱动和选项，控制日志的去向和管理方式。
*   简要了解了 `privileged`, `cap_add/drop`, `read_only`, `tmpfs`, `sysctls` 等高级字段。

掌握这些字段，你可以更好地管理容器的资源使用，提高系统的稳定性和安全性，并方便地集成到现有的运维体系中。

至此，我们已经覆盖了 Docker Compose 中大部分重要和常用的服务配置字段、顶层结构以及基本操作命令。在下一章，我们将把这些知识串联起来，通过一个**完整的实际应用栈示例**来回顾和实践，并讨论一些使用 Docker Compose 的**最佳实践**！敬请期待！
