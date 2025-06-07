---
title: "\U0001F433 Docker Compose 结构详解篇（二）：顶层配置（version, volumes, networks）"
date: '2025-06-07 10:25'
top_img: /images/post/docker/docker.jpg
cover: /images/post/docker/docker.jpg
categories:
  - Docker
tags:
  - Docker
  - 教程
abbrlink: 59411
---

# 🐳 Docker Compose 顶层配置全面解读 - 搞懂 `yml` 文件的“骨架”！

你好呀！欢迎来到 Docker Compose 教程的第二站！上一章我们详细拆解了 `services` 里那些用于配置单个服务的字段。`services` 就像是一份菜单，列出了你的所有菜品（服务），并描述了每道菜怎么做。

但这道菜单本身需要放在一个特定的格式里，并且有时候你需要为这些菜品准备一些“公共资源”，比如一个专门存放食材的冰箱（数据卷）或者一个服务员们内部沟通的网络。

`docker-compose.yml` 文件除了 `services` 之外，顶部通常还有一些其他重要的字段，它们是整个文件的“骨架”，用来定义 Docker Compose 项目的整体结构和一些共享的配置。今天，我们就来学习这些顶层字段：`version`, `volumes`, 和 `networks`。

---

## 🏗️ `version`：告诉 Docker Compose 你用的是哪个“规范”

`version` 字段通常是 `docker-compose.yml` 文件的第一行，它告诉 Docker Compose 解析器，你正在使用哪个版本的 Docker Compose 文件格式规范。不同的版本支持不同的字段和特性。

```yaml
# version: 指定 Docker Compose 文件格式的版本
version: '3.8' # 这是一个常用的版本，支持很多现代特性，比如命名卷和自定义网络

# 你可能会看到其他版本，比如 '2.0', '2.1', '3', '3.1', '3.9' 等等
# 建议使用较新的稳定版本，比如 '3.8' 或更高
```

*   **作用**：指定 Docker Compose 文件语法的版本，确保你的配置能被正确解析。
*   **重要性**：不同的 `version` 支持的字段和语法可能有差异。比如，`volumes` 和 `networks` 在早期版本中写法不同，或者某些高级特性（如 `healthcheck` 的 `start_period`）只在较新的版本中支持。
*   **选择建议**：通常推荐使用最新的稳定版本，以便使用最新的功能和语法。`3.8` 或 `3.9` 是不错的选择。

---

## 💾 `volumes` (顶层)：声明和管理你的“共享冰箱”或“持久化存储”

在上一章我们讲到 `volumes` 可以在服务内部用于本地路径挂载（Bind Mount）或命名卷挂载。但如果你使用了命名卷，你需要在 `docker-compose.yml` 文件的最**顶层**声明这些命名卷。

顶层声明 `volumes` 的作用是告诉 Docker Compose 你需要创建并管理一个或多个“命名卷”（Named Volumes）。这些命名卷就像是 Docker 管理的一块专门用于存储数据的区域，它的生命周期独立于任何一个容器。

```yaml
# version 和 services 中间（或者在 services 下面），可以定义顶层 volumes
version: '3.8'

services:
  # ... 你的服务定义，比如数据库服务 ...
  db:
    image: mysql:5.7
    volumes:
      # 在服务内部使用顶层声明的命名卷
      # 把容器里的 /var/lib/mysql 目录（MySQL 存放数据的地方）
      # 挂载到顶层声明的 'db-data' 这个命名卷上
      - db-data:/var/lib/mysql
    # ... 其他 db 配置 ...

# volumes: 在文件的最顶层声明你使用的命名卷
volumes:
  # 声明一个名字叫 'db-data' 的命名卷
  # Docker Compose 在执行 docker-compose up 时如果发现没有这个命名卷，就会自动创建一个
  db-data:
    # 你可以在这里添加一些配置，比如指定驱动或标签
    # driver: local # 默认就是 local 驱动，通常不用写
    # labels:
    #   app: myapp
    #   type: database-data
    # 你也可以配置外部卷，但对于初学者，简单声明名字就行了
    # external: true # 如果这个卷是预先通过 docker volume create 创建好的，用 external: true

  # 你可以声明多个命名卷
  app-logs:
    # 这个命名卷可以用来保存应用日志
    pass
    # 或者 driver_opts 用于一些高级配置，比如 NFS 挂载等，这里不展开

```

*   **作用**：在 Docker Compose 项目中创建和管理命名卷，用于实现数据的持久化存储。
*   **与服务内 `volumes` 的区别**：
    *   **顶层 `volumes`**：用于**声明命名卷**。这些卷由 Docker 自己管理，即使所有使用它们的容器都被删除了，卷本身默认也不会被删除，从而保留数据。
    *   **服务内 `volumes`**：用于**挂载**（attach）一个卷（无论是命名卷还是本地路径）到容器内部的某个路径。
*   **流程**：
    1.  在 `docker-compose.yml` 顶层声明你需要的命名卷（比如 `db-data:`）。
    2.  在需要使用这个卷的服务内部，通过 `volumes: - 命名卷名:/容器内部路径` 的格式来挂载它（比如 `volumes: - db-data:/var/lib/mysql`）。
    3.  当你运行 `docker-compose up` 时，如果 `db-data` 这个命名卷不存在，Docker 会自动创建它；如果存在，就直接使用。然后将它挂载到 `db` 服务的 `/var/lib/mysql` 目录。
*   **适合场景**：
    *   需要保存数据库数据、文件上传、日志文件等，确保容器删除或更新后数据不丢失。
    *   需要在同一个 Docker Compose 项目中的不同服务之间共享少量数据（虽然不常见，主要还是用于持久化）。

---

## 🌐 `networks` (顶层)：定义你的“内部通信频道”

就像 `volumes` 一样，`networks` 也可以在服务内部指定（让服务加入到某个网络），但更常见、更推荐的方式是在 `docker-compose.yml` 的**顶层**定义你自己的自定义网络。

顶层定义 `networks` 的作用是创建一个或多个自定义的网络。Docker Compose 会把这些网络创建出来，然后你可以在 `services` 部分指定哪些服务要加入到哪个网络。

**为什么需要自定义网络？**

默认情况下，Docker Compose 会为你的项目创建一个默认的网络（通常名字是 `项目目录名_default`）。这个默认网络已经可以让你项目中的服务通过服务名互相访问了。

但是，自定义网络提供了更好的隔离性和灵活性：

1.  **隔离性**：你可以创建不同的网络，把不同组的服务放在各自的网络里。这样，只有连接到同一个网络的服才能直接通信，提高了安全性。
2.  **清晰性**：通过自定义网络名，你可以更清晰地表达服务之间的通信关系。
3.  **控制**：可以配置网络的驱动、IP 地址范围等高级设置（尽管基础使用时通常不需要）。

```yaml
# version 和 services 中间（或者在 services 下面），可以定义顶层 networks
version: '3.8'

services:
  # 定义一个前端服务
  frontend:
    image: my-frontend
    # networks: 指定这个服务要连接到哪些网络
    networks:
      - frontend_network # 加入到 frontend_network
      # 如果前端也需要直接访问后端，可以也加入 backend_network
      # - backend_network

  # 定义一个后端服务
  backend:
    image: my-backend
    networks:
      - backend_network # 加入到 backend_network
      # 如果后端需要访问数据库，且数据库也在 backend_network，这里就这样写

  # 定义一个数据库服务
  db:
    image: mysql:5.7
    networks:
      - backend_network # 加入到 backend_network

# networks: 在文件的最顶层声明你使用的自定义网络
networks:
  # 声明一个名字叫 'frontend_network' 的网络
  frontend_network:
    # driver: bridge 是默认的网络类型，通常不用写，表示使用桥接网络
    # driver: bridge

  # 声明一个名字叫 'backend_network' 的网络
  backend_network:
    # driver: bridge # 同样是默认驱动，通常不用写

```

*   **作用**：创建自定义网络，让指定的容器能够互相发现和通信。
*   **服务发现**：连接到**同一个**自定义网络的容器，可以通过**服务名**作为主机名互相访问。
    *   比如，上面的 `backend` 服务可以通过 `db` 作为主机名连接到数据库服务，因为它俩都在 `backend_network` 里。
    *   如果 `frontend` 也在 `backend_network` 里，它就可以通过 `backend` 作为主机名访问后端服务。
*   **与服务内 `networks` 的区别**：
    *   **顶层 `networks`**：用于**声明自定义网络**。Docker Compose 会负责创建这些网络。
    *   **服务内 `networks`**：用于让服务**加入**（connect）到顶层声明的（或默认的）网络中。
*   **流程**：
    1.  在 `docker-compose.yml` 顶层声明你需要的自定义网络（比如 `backend_network:`）。
    2.  在需要加入这个网络的服务内部，通过 `networks: - 网络名` 的格式来连接它（比如 `networks: - backend_network`）。
    3.  当你运行 `docker-compose up` 时，Docker Compose 会创建 `backend_network`（如果不存在），然后将 `backend` 和 `db` 这两个服务的容器都连接到这个网络。
*   **适合场景**：
    *   你的项目包含多个服务，需要互相通信（这是最常见场景）。
    *   需要将不同的服务组进行网络隔离。
    *   需要更精细地控制服务间的通信路径。

---

## ✨ 组合使用：一个更完整的 `docker-compose.yml` 结构

现在我们知道了顶层 `version`, `volumes`, `networks` 以及服务内部的各种配置，一个常见的 `docker-compose.yml` 文件结构就会像这样：

```yaml
# 1. version: 文件格式版本，必须在第一行
version: '3.8'

# 2. services: 定义项目包含的所有服务（这是核心部分，通常最长）
services:
  # app 服务（比如你的后端应用）
  app:
    build: # 从本地代码构建
      context: .
      dockerfile: Dockerfile
    image: myapp:latest # 构建后的镜像名
    ports:
      - "80:3000" # 外部 80 端口映射到容器内部 3000 端口
    volumes:
      - .:/app # 本地代码挂载到容器，方便开发热更新
      # - app-logs:/app/logs # 使用顶层声明的命名卷挂载日志目录
    environment:
      - NODE_ENV=development
      - DB_HOST=db # 依赖 db 服务，通过服务名访问
      # 其他环境变量...
    depends_on:
      # 依赖 db 服务，确保 db 先启动
      # 更好的做法是使用 condition: service_healthy，但需要 db 配置 healthcheck
      - db
    restart: unless-stopped # 异常退出时自动重启
    networks:
      - app_network # 加入 app_network，用于和 db 通信

  # db 服务（比如数据库）
  db:
    image: mysql:5.7 # 使用官方 MySQL 5.7 镜像
    # 指定容器名称，可选，方便区分
    # container_name: my_mysql_db
    volumes:
      # 使用顶层声明的命名卷，持久化数据库数据
      - db_data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=mysecretpassword
      - MYSQL_DATABASE=mydatabase
      # 其他环境变量...
    restart: unless-stopped
    networks:
      - app_network # 加入 app_network，和 app 服务在同一个网络

# 3. volumes: 在顶层声明命名卷，用于数据持久化
volumes:
  db_data: # 声明一个叫 db_data 的命名卷

  # app_logs: # 如果上面 app 服务使用了 app-logs 命名卷，这里也要声明

# 4. networks: 在顶层声明自定义网络，用于服务间通信
networks:
  app_network: # 声明一个叫 app_network 的自定义网络
    # driver: bridge 是默认类型，通常不用写
```

这个例子展示了 `version`, `services`, `volumes`, `networks` 在一个文件中的组织方式。`services` 是核心，但 `version`, `volumes` 和 `networks` 提供了重要的全局配置和资源管理能力。

---

**本章小结**

现在你已经了解了 `docker-compose.yml` 文件的顶层结构：
*   `version` 定义了文件的规范版本。
*   顶层 `volumes` 声明了 Docker 管理的持久化数据存储区域（命名卷）。
*   顶层 `networks` 声明了自定义网络，用于服务间的隔离和通信。

搞清楚这些顶层配置，你就对 `docker-compose.yml` 的整体结构有了清晰的认识。接下来，最激动人心的部分来了：**如何真正运行起这个文件里定义的服务？** 在下一章，我们将学习 `docker-compose up`, `down`, `logs` 等最常用的命令，把你写好的配置变成眼前运行的容器！敬请期待！
