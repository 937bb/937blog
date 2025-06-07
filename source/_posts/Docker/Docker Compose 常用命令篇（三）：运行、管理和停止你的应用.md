---
title: "\U0001F433 Docker Compose 常用命令篇（三）：运行、管理和停止你的应用"
date: '2025-06-07 12:55'
top_img: /images/post/docker/docker.jpg
cover: /images/post/docker/docker.jpg
categories:
  - Docker
tags:
  - Docker
  - 教程
abbrlink: 34934
---

# 🐳 Docker Compose 命令宝典 - 让你的应用栈“动”起来！

嘿！你已经学会了如何用 `docker-compose.yml` 文件来描述你的应用栈（服务、卷、网络）。这就像有了一张详细的建筑图纸，告诉你你的应用需要哪些“房间”（服务）、“仓库”（卷）、“走廊”（网络），以及它们各自的配置。

但是，光有图纸还不够啊！我们得把它变成现实，把这些“房间”盖起来，让它们“住人”（运行容器），让它们“通电通水”（网络连接），让“仓库”能存东西！

这就轮到 **Docker Compose 的命令行工具**登场了！它们是把你的 `yml` 图纸变成眼前跑着的容器的魔法棒。掌握这些命令，你就能轻松地启动、停止、管理和调试你的整个应用了。

今天，我们就来学习 Docker Compose 最最常用、也最重要的几个命令！

---

## 🚀 1. `docker-compose up`：启动你的整个应用！

这是你使用 Docker Compose 时最频繁的命令，它的作用就是**根据你的 `docker-compose.yml` 文件，创建并启动所有定义的服务**。

想象一下，你有一堆乐高积木的说明书（`docker-compose.yml`），`docker-compose up` 就是那个“开始拼装并启动”的按钮！

```bash
# 基本用法：启动你的项目里的所有服务
docker-compose up

# 常用选项 -d：以后台（分离）模式运行
# 这是最常用的方式，启动后终端不会被容器日志霸占
docker-compose up -d

# 常用选项 --build：在启动前强制重新构建有 build 配置的服务镜像
# 当你改动了本地代码或者 Dockerfile 时，就需要加上这个
docker-compose up -d --build

# 常用选项 --force-recreate：强制重新创建容器，即使配置没有变化
# 有时候用来解决一些奇怪的问题，或者确保应用了某些非配置类的改动（比如资源限制）
docker-compose up -d --force-recreate

# 只启动特定的服务（以及它们的依赖）
# 比如只启动 app 服务，如果 app 依赖 db，db 也会被启动
docker-compose up -d app db

# 如果你的 docker-compose.yml 文件不在当前目录，或者名字不是 docker-compose.yml
# 可以用 -f 参数指定文件
docker-compose -f /path/to/your/compose.yml up -d
```

*   **作用**：读取 `docker-compose.yml` 文件，执行构建（如果需要）、创建网络、创建卷、创建容器，并启动所有服务。
*   **流程**：
    1.  Docker Compose 读取当前目录（或 `-f` 指定）的 `docker-compose.yml` 文件。
    2.  根据顶层 `networks` 定义，创建自定义网络（如果不存在）。
    3.  根据顶层 `volumes` 定义，创建命名卷（如果不存在）。
    4.  遍历 `services` 里的每个服务。
    5.  如果服务有 `build` 配置，Docker Compose 会根据 `Dockerfile` 构建镜像（如果本地没有或者加了 `--build`）。
    6.  如果服务有 `image` 配置，Docker Compose 会尝试拉取镜像（如果本地没有）。
    7.  根据 `depends_on` 配置的服务依赖关系，按顺序创建和启动容器。
    8.  将容器连接到指定的网络，进行端口映射，挂载数据卷，设置环境变量等等。
    9.  启动容器里定义的应用进程。
*   **使用场景**：
    *   第一次运行你的 Docker Compose 项目。
    *   在开发环境中启动整个应用栈。
    *   更新了代码或配置文件后，重新部署服务。
    *   从停止状态恢复运行。

---

## 🛑 2. `docker-compose down`：优雅地停止并移除你的应用！

当你不需要运行你的应用栈时，直接关闭终端或者强制停止 Docker 可能导致资源残留。`docker-compose down` 是最推荐的方式来停止并清理你的 Docker Compose 项目。

它就像是那个“关闭并拆除”的按钮，会停止所有运行中的容器，并移除与该项目相关的容器、网络和（可选）卷。

```bash
# 基本用法：停止并移除当前项目的所有容器和网络
docker-compose down

# 常用选项 -v (或 --volumes)：同时移除声明在 yml 文件顶层的命名卷
# **注意！** 这个操作会删除命名卷里存储的数据，慎用！
docker-compose down -v

# 常用选项 --rmi type：移除服务使用的镜像
# type 可以是 'local' (只移除 build 的镜像) 或 'all' (移除所有)
# 不常用，一般不删除镜像，除非是彻底清理
docker-compose down --rmi local

# 常用选项 --remove-orphans：移除那些不再被当前 docker-compose.yml 文件定义的容器
# 有时候yml改动了，旧容器还在，可以用这个清理
docker-compose down --remove-orphans
```

*   **作用**：停止并删除由 `docker-compose up` 创建的容器、默认网络以及顶层定义的网络。可以选泽是否删除命名卷和镜像。
*   **流程**：
    1.  Docker Compose 识别出当前项目相关的容器和网络。
    2.  按依赖关系的逆序（先停止依赖别人的服务），优雅地发送停止信号给容器。
    3.  移除容器。
    4.  移除项目默认创建的网络和顶层定义的网络。
    5.  如果指定了 `-v`，则移除顶层声明的命名卷。
    6.  如果指定了 `--rmi`，则移除相应的镜像。
*   **使用场景**：
    *   关闭开发环境。
    *   进行大的项目配置或代码改动前，先完全停止清理。
    *   彻底移除一个不再需要的应用栈。

---

## 👀 3. `docker-compose ps`：看看你的服务“活”得怎么样？

`docker-compose up` 之后，你怎么知道你的服务是不是都正常运行了？`docker-compose ps` 命令就是用来**查看你的 Docker Compose 项目中所有服务的状态**。

```bash
# 查看当前项目里所有服务的状态
docker-compose ps
```

*   **作用**：列出当前 Docker Compose 项目所管理的所有容器，显示它们的名字、命令、状态、端口映射等信息。
*   **输出解读**：
    *   `Name`：容器的完整名称。
    *   `Command`：容器启动时执行的命令。
    *   `State`：容器的状态，比如 `Up` (运行中)、`Exited` (已退出)、`Up (health: starting)` (正在启动健康检查)、`Up (healthy)` (健康)、`Up (unhealthy)` (不健康)。
    *   `Ports`：端口映射信息（比如 `0.0.0.0:8080->80/tcp` 表示宿主机的 8080 端口映射到容器的 80 端口）。
*   **使用场景**：
    *   确认所有服务都成功启动。
    *   检查是否有服务异常退出 (`Exited`)。
    *   查看服务的健康检查状态 (`healthy`/`unhealthy`)。
    *   确认端口映射是否正确。

---

## 📜 4. `docker-compose logs`：看一看服务里发生了啥？

当服务启动失败、异常退出，或者运行不正常时，查看它的日志是定位问题最直接的方式。`docker-compose logs` 命令可以**显示你的 Docker Compose 项目中一个或多个服务的标准输出和标准错误日志**。

```bash
# 查看当前项目里所有服务的历史日志
docker-compose logs

# 常用选项 -f (或 --follow)：实时追踪并显示新的日志输出
# 这在调试时非常有用，可以看到服务启动过程中的详细信息或运行时的错误
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs app db

# 实时追踪特定服务的日志
docker-compose logs -f app

# 常用选项 --tail number：只显示日志的最后 N 行
docker-compose logs --tail 50 app

# 结合使用：实时追踪特定服务日志的最后100行（先显示历史的后100行，再追踪新的）
docker-compose logs -f --tail 100 app
```

*   **作用**：获取并显示一个或多个容器的日志流。
*   **使用场景**：
    *   排查服务启动失败的原因。
    *   监控服务的运行状态和输出信息。
    *   调试应用代码时查看打印的日志。
    *   了解服务内部的详细执行过程。

---

## 🏃 5. `docker-compose exec`：钻进容器里“搞事情”！

有时候你需要直接在运行中的容器里执行一些命令，比如进入一个 Web 容器的终端查看文件，或者进入数据库容器执行 SQL 命令，或者在应用容器里运行一个临时的脚本。`docker-compose exec` 命令就是用来**在指定的运行中容器里执行命令**。

```bash
# 基本用法：在 app 容器里执行一个简单的命令 (比如 ls -l)
docker-compose exec app ls -l /app

# 常用选项 -it：分配一个伪终端并保持标准输入开放
# 这对于进入交互式 shell (比如 bash) 是必须的
docker-compose exec -it app bash # 进入 app 容器的 bash 终端

# 进入 db 容器，并使用 mysql 客户端连接数据库
# 注意：这里的 mysql 命令是在 db 容器内部执行的
docker-compose exec -it db mysql -u root -p # 会提示输入密码

# 在特定的服务容器里运行一个迁移脚本
docker-compose exec app npm run migrate
```

*   **作用**：在一个已经运行的容器内部执行任意命令。
*   **使用场景**：
    *   调试：查看容器内的文件、环境变量、进程等。
    *   执行维护任务：运行数据库迁移、清理缓存等一次性脚本。
    *   获取交互式终端：像 SSH 一样进入容器内部操作。

---

## 🧱 6. `docker-compose build`：只构建镜像，不启动！

如果你的服务使用了 `build` 配置，`docker-compose up --build` 会在启动前构建镜像。但有时候你可能只想检查你的 `Dockerfile` 是否能成功构建，或者在部署前预先构建好所有镜像，而不想立即启动服务。`docker-compose build` 命令就是用来**单独构建或重新构建服务镜像**的。

```bash
# 构建当前项目里所有带有 build 配置的服务镜像
docker-compose build

# 常用选项 --no-cache：构建时禁用缓存
# 用于确保完全从头开始构建，排除缓存引起的问题
docker-compose build --no-cache app

# 只构建特定的服务镜像
docker-compose build app db
```

*   **作用**：根据 `Dockerfile` 构建（或重新构建）服务镜像，但不创建或启动容器。
*   **与 `up --build` 的区别**：
    *   `docker-compose build`：只构建镜像。
    *   `docker-compose up --build`：构建镜像后，继续创建和启动容器。
*   **使用场景**：
    *   在 CI/CD 流水线中，先构建镜像并推送到仓库。
    *   验证 `Dockerfile` 的正确性。
    *   预先准备好镜像，等待后续启动。

---

## 总结一下，常用的 Docker Compose 命令就是这几个：

*   `docker-compose up -d`：启动你的应用（后台）。
*   `docker-compose down`：停止并清理你的应用。
*   `docker-compose ps`：查看你的服务状态。
*   `docker-compose logs -f [服务名]`：实时查看服务日志。
*   `docker-compose exec -it [服务名] bash`：进入容器终端进行调试。
*   `docker-compose build [服务名]`：只构建镜像。

掌握了这些命令，你就拿到了操作 Docker Compose 的“遥控器”，可以随心所欲地启动、停止和管理你的容器化应用栈了！

---

**本章小结**

我们学习了 Docker Compose 最基础和最重要的几个命令：
*   `up`：启动应用栈。
*   `down`：停止并清理应用栈。
*   `ps`：查看服务状态。
*   `logs`：查看服务日志。
*   `exec`：在容器内部执行命令。
*   `build`：单独构建镜像。

这些命令是日常使用 Docker Compose 的基石。但在实际应用中，服务的启动顺序、依赖关系、以及如何判断一个服务是否“真正准备好”是非常关键的问题。下一章，我们将深入探讨 `depends_on` 和 `healthcheck` 的高级用法，学习如何确保你的服务按正确顺序启动，并且能够互相可靠地通信！敬请期待！