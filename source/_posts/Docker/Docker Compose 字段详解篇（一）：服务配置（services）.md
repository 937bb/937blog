---
title: "\U0001F433 Docker Compose 字段详解篇（一）：服务配置（services）"
date: '2025-06-07 10:24'
top_img: /images/post/docker/docker.jpg
cover: /images/post/docker/docker.jpg
categories:
  - Docker
tags:
  - Docker
  - 教程
abbrlink: 7671
---

# 🐳 服务配置（services）全面解读 - 写给小白的超详细指南！

你好呀！欢迎来到 Docker Compose 的世界！如果你觉得 `docker-compose.yml` 文件看起来有点复杂，别担心，我们一步一步来拆解它。

这个文件里最重要的部分就是 `services` 了，你可以简单理解它就像一个菜单，列出了你的项目里需要运行的所有“服务”（比如你的网站后端、数据库、缓存等等）。每个服务对应一个容器，而 `services` 下面的每一项，就是告诉你 Docker Compose 怎么去创建和运行这个容器。

今天，我们就来把 `services` 里那些最常用、最能帮你解决问题的字段，用大白话给你讲清楚！

---

## 🧩 1. `image`：直接用现成的“积木”

想象一下，Docker Hub 上有很多已经搭好的“积木”（镜像），比如 Nginx（用来跑网站）、MySQL（数据库）、Redis（缓存）。`image` 字段就是告诉你 Docker Compose，你想用哪块现成的积木来启动你的服务。

```yaml
services:
  # 我要定义一个服务，名字叫 web（名字你可以随便起）
  web:
    # 好了，web 这个服务，我要用哪个 Docker 镜像来启动呢？
    image: nginx:latest  # 我要用 Docker Hub 上的 nginx 镜像，版本是 latest（最新版）
                          # 比如 image: mysql:5.7 就是用 MySQL 5.7 版本镜像
```

*   **作用**：超级简单快速地启动一个标准服务，不用你自己从零开始搭。
*   **适合场景**：
    *   你想快速跑个数据库、缓存或者一个标准的 Web 服务器（比如 Nginx）。
    *   你的团队已经帮你打包好了镜像，你只需要拿来用就行。

🧪 **举个栗子：快速启动一个 Redis 缓存服务**

```yaml
services:
  # 定义一个服务叫 redis
  redis:
    # 直接用官方的 Redis 镜像，版本指定 7.2
    image: redis:7.2
```

---

## 🛠️ 2. `build`：自己动手，“捏”一个专属积木

有时候，现成的积木不满足你的需求，比如你写了自己的网站代码或者应用。这时候，你就需要根据你的代码和配置，自己动手“捏”一个专属的镜像。`build` 字段就是干这个的。它会告诉 Docker Compose 去哪里找到你的“制作图纸”（Dockerfile），然后帮你把镜像做出来。

```yaml
services:
  # 我要定义一个服务叫 myapp
  myapp:
    # 我不直接用现成镜像，我要从我的本地代码来“构建”一个专属镜像
    build:
      # context: 告诉 Docker 去哪个目录找你的代码和 Dockerfile
      context: ./app           # 比如，我的应用代码和 Dockerfile 都在当前目录下的 app 文件夹里
      # dockerfile: 如果你的制作图纸不叫 Dockerfile（默认名字），或者你想用特定的图纸
      dockerfile: Dockerfile.dev  # 比如，我用了专门给开发环境准备的 Dockerfile.dev 文件
      # args: 在构建镜像的时候，可以传一些参数进去，影响制作过程
      args:
        NODE_ENV: development     # 比如，告诉制作过程现在是开发环境
```

*   **作用**：根据你的代码和 `Dockerfile`，构建一个包含你应用的定制镜像。
*   **适合场景**：
    *   你需要运行你自己开发的应用（Web 应用、API 服务等）。
    *   你需要为不同的环境（开发、测试、生产）构建不同的镜像。

🚀 **构建流程（Docker Compose 帮你做的）**
1.  Docker Compose 会找到你指定的 `context` 目录（比如上面的 `./app`）。
2.  它会在那个目录里找到你指定的 `dockerfile` 文件（比如 `Dockerfile.dev`）。
3.  如果定义了 `args`，它会把这些参数传给构建过程。
4.  Docker 会按照 `Dockerfile` 里的步骤，把你的代码、依赖等都打包进一个新的镜像。
5.  最后，Docker Compose 会用这个刚构建好的镜像来启动你的容器。

---

## 🚪 3. `ports`：给你的容器“开个门”

容器就像一个独立的“小房子”，默认外面是访问不到里面的服务的（比如容器里跑的网站）。`ports` 字段就像在“小房子”和外面的“宿主机”（运行 Docker 的那台电脑或服务器）之间开一道门，让外面的人可以通过宿主机的地址和端口，访问到容器里的服务。

```yaml
services:
  # 我要定义一个服务叫 web
  web:
    image: my-web-server
    # ports: 设置端口映射，把宿主机的端口和容器里的端口连起来
    ports:
      # 格式是："宿主机端口:容器内部端口"
      - "8080:80"  # 意思是：访问我宿主机的 8080 端口，实际上就访问到了 web 容器里的 80 端口
      # 你也可以这样写："127.0.0.1:8080:80" 只让宿主机本地访问 8080
      # 或者只写容器端口："80" 这样 Docker 会随机给你分配一个宿主机端口
```

*   **作用**：让外部网络（比如你的浏览器、或者别的电脑）能够访问到 Docker 容器内部运行的服务。
*   **格式说明**：`宿主机端口:容器端口` 或者 `宿主机IP:宿主机端口:容器端口`。
*   **适合场景**：
    *   你需要通过浏览器访问容器里的网站或 Web 应用。
    *   你需要通过客户端工具连接容器里的数据库（比如 Navicat 连接 MySQL）。
    *   其他任何需要从外部访问容器内部服务的场景。

🌍 **例子：跑两个服务，分别用不同端口访问**

```yaml
services:
  # 定义一个前端服务
  frontend:
    image: my-vue-app # 假设这是你打包好的 Vue 应用镜像
    ports:
      - "3000:80"    # 把宿主机的 3000 端口映射到容器前端应用的 80 端口

  # 定义一个后端服务
  backend:
    image: my-node-api # 假设这是你打包好的 Node.js API 镜像
    ports:
      - "4000:8080"  # 把宿主机的 4000 端口映射到容器后端 API 的 8080 端口
```

这样，你就可以通过 `http://宿主机IP:3000` 访问前端，通过 `http://宿主机IP:4000` 访问后端了。

---

## 💾 4. `volumes`：让容器的数据“活”下来，或者和本地同步

容器在停止或删除后，里面的数据通常就没了。而且开发时，我们希望改了本地代码，容器里的代码也能立刻更新，不用重新构建镜像。`volumes` 就是来解决这两个问题的利器！它可以把宿主机的目录或者一个特殊的“数据卷”挂载到容器里。

```yaml
services:
  # 我要定义一个服务叫 app
  app:
    image: my-app-image
    # volumes: 设置数据卷挂载
    volumes:
      # 格式是："宿主机路径或命名卷名:容器内部路径"

      # 第一种：本地路径挂载（也叫绑定挂载 Bind Mount）
      # 作用：把宿主机当前目录（.）整个挂载到容器里的 /app 目录
      # 效果：你改动宿主机当前目录的文件，容器 /app 里的文件也跟着变，反之亦然
      # 适合：本地开发时同步代码，或者共享配置文件
      - .:/app

      # 第二种：命名卷挂载（Named Volume）
      # 作用：创建一个由 Docker 专门管理的数据存储区域，名字叫 data-volume
      #      然后把容器里 /var/lib/mysql 目录的数据都存到这个 data-volume 里
      # 效果：即使你删除了这个容器，data-volume 里保存的数据还在，下次启动新容器还可以继续用
      # 适合：保存数据库数据、日志文件等需要长期保留的数据
      - data-volume:/var/lib/mysql

  # 我要定义一个服务叫 db
  db:
    image: mysql:5.7
    volumes:
      # 把 db 容器的数据库文件目录挂载到前面定义的 data-volume 命名卷里
      - data-volume:/var/lib/mysql

# 重要！所有用到的“命名卷”需要在 docker-compose.yml 文件的最顶层单独声明
volumes:
  # 声明一个名字叫 data-volume 的命名卷
  data-volume:
    # 你可以在这里加一些配置，但通常直接声明名字就行了
```

*   **作用**：实现宿主机和容器之间、或者容器和持久化存储区域之间的数据共享和同步。
*   **类型**：
    *   **本地路径挂载 (Bind Mount)**：`宿主机目录:/容器目录`。直接把宿主机的一个目录映射到容器里。适合开发时的代码同步、挂载配置文件。
    *   **命名卷挂载 (Named Volume)**：`命名卷名:/容器目录`。Docker 自己管理的一块存储区域。适合需要持久化保存的数据（数据库、上传文件等）。
*   **适合场景**：
    *   开发时需要实时修改代码，容器立即看到效果（热更新）。
    *   需要保证数据库、缓存等服务的数据在容器重启或删除后不丢失。
    *   多个服务需要共享同一个配置文件。

---

## 🌱 5. `environment`：给容器“喂”配置信息

很多应用在启动时需要一些配置信息，比如数据库地址、用户名密码、API密钥、运行模式（开发/生产）等等。`environment` 字段就是把这些信息作为“环境变量”传递给容器里的应用。

```yaml
services:
  # 我要定义一个服务叫 api
  api:
    image: my-api-image
    # environment: 设置环境变量列表
    environment:
      # 格式： 变量名=值
      - NODE_ENV=production    # 告诉容器里的 Node.js 应用，当前是生产环境
      - DB_HOST=db             # 告诉应用数据库的主机名是 'db'（后面会讲到如何在服务间通信）
      - DB_USER=myuser         # 数据库用户名
      # 也可以写成对象形式，效果一样：
      # DB_PASS: mysecretpassword # 数据库密码
```

*   **作用**：把配置参数、密钥、运行模式等信息传递给容器里运行的应用。
*   **适合场景**：
    *   配置应用的数据库连接信息。
    *   设置 API 密钥或 Token。
    *   切换应用的运行模式（如 debug 开关）。
    *   任何需要外部配置的应用。

---

## 📄 6. `env_file`：批量加载环境变量

如果你的环境变量特别多，或者包含一些敏感信息（虽然不推荐直接写在 yml 里，但有时开发方便），把它们都写在 `environment` 字段里会显得很乱。`env_file` 字段可以让你把环境变量统一写在一个或多个文件里（通常命名为 `.env`），然后让 Docker Compose 一次性加载进来。

```yaml
services:
  # 我要定义一个服务叫 web
  web:
    image: my-web-app
    # env_file: 指定要加载的环境变量文件
    env_file:
      - .env  # 加载当前目录下的 .env 文件
      # 也可以加载多个文件：
      # - ./config/common.env
      # - ./config/secret.env
```

*   **作用**：从指定的文件中读取环境变量，并设置到容器里。
*   **适合场景**：
    *   项目有很多环境变量，方便集中管理。
    *   不想把敏感信息（如密码）直接暴露在 `docker-compose.yml` 文件中（虽然 `.env` 文件本身也需要保护）。

📌 **`.env` 文件长啥样？**

它就是个普通文本文件，每行一个 `变量名=值`，像这样：

```env
# 这是一个 .env 文件示例

# 数据库配置
DB_USER=root
DB_PASS=supersecretpassword123
DB_NAME=myapp

# 应用配置
API_KEY=abcdef123456
DEBUG_MODE=true
```

---

## 🎯 7. `command` 与 `entrypoint`：控制容器启动后执行什么

一个镜像在制作时，通常会指定容器启动后默认执行什么命令（比如启动一个 Web 服务器或者运行一个脚本）。`command` 和 `entrypoint` 字段可以让你覆盖镜像里预设的启动命令。

*   **`command`**：主要用来指定容器启动后要执行的“主要”命令，它会替换 Dockerfile 里的 `CMD`。如果镜像里设置了 `ENTRYPOINT`，那么 `command` 里的内容会作为参数传给 `ENTRYPOINT`。
*   **`entrypoint`**：设置容器启动时第一个执行的程序或脚本。它会替换 Dockerfile 里的 `ENTRYPOINT` 指令。通常用于做一些初始化工作（比如权限设置、等待依赖服务等），然后再执行 `command` 或镜像默认的 `CMD`。

```yaml
services:
  # 定义一个服务叫 api
  api:
    image: my-api-image
    # command: 覆盖镜像默认的 CMD
    # 比如，镜像默认是只启动服务，但我想带一些参数启动
    command: ["npm", "run", "start:dev"]  # 告诉容器执行 npm run start:dev 命令来启动服务

  # 定义一个服务叫 worker
  worker:
    image: my-worker-image
    # entrypoint: 覆盖镜像默认的 ENTRYPOINT
    # 比如，镜像里有个 /init.sh 脚本用来做启动前的检查和设置
    entrypoint: ["/init.sh"]              # 容器启动时先执行 /init.sh 脚本
    # command: ["--process", "queue1"]    # 如果有 command，它会作为参数传给 entrypoint
                                        # 相当于执行： /init.sh --process queue1
```

*   **适合场景**：
    *   你的应用需要特定的启动参数。
    *   容器启动前需要执行一些初始化脚本（比如数据库迁移、权限设置）。
    *   你想改变镜像默认的启动行为。

**简单理解**：`ENTRYPOINT` 就像是你程序的入口或者启动器，`CMD` (或 `command`) 是传给这个启动器的参数，或者如果没启动器，就是直接执行的命令。

---

## 🔁 8. `restart`：让你的服务“摔倒了自己爬起来”

你的容器可能会因为各种原因意外停止，比如程序崩溃、内存不足等。`restart` 字段可以设置一个策略，让 Docker Compose 在容器停止后自动尝试重启它，提高服务的可用性。

```yaml
services:
  # 定义一个服务叫 frontend
  frontend:
    image: my-frontend-image
    # restart: 设置容器的重启策略
    restart: always # 意思是：无论容器是正常退出还是异常退出，Docker Compose 都会尝试重启它

    # 还有其他选项：
    # restart: no         # 默认值，容器停止后不会自动重启
    # restart: on-failure # 容器以非零状态码退出时（表示出错）才重启
    # restart: unless-stopped # 除非你手动用 docker stop 命令停掉它，否则一直重启
```

*   **作用**：配置容器在停止后是否自动重启，以及在什么情况下重启。
*   **选项说明**：
    *   `no`：不自动重启（默认）。
    *   `on-failure`：只有容器因非零状态码退出时才重启（表示发生错误）。
    *   `always`：无论容器如何退出，总是重启它（除非 Docker Daemon 重启，它也会跟着重启）。
    *   `unless-stopped`：除非用户或系统手动停止容器，否则总是重启。这是生产环境常用选项。
*   **适合场景**：
    *   后台服务容易因为各种原因崩溃，需要自动恢复。
    *   保障服务的持续运行和高可用性。

---

## 🧠 9. `depends_on`：告诉 Docker Compose 启动顺序

你的应用服务可能依赖于其他服务，比如你的 Web 后端需要先连接上数据库才能正常工作。`depends_on` 字段可以告诉 Docker Compose 在启动一个服务之前，先启动它依赖的其他服务。

```yaml
services:
  # 定义一个服务叫 web （比如你的后端 API）
  web:
    image: my-backend-api
    # depends_on: 这个服务依赖于其他服务
    depends_on:
      # 告诉 Docker Compose：在启动 web 服务之前，先启动名字叫 db 的服务
      - db

  # 定义一个服务叫 db （比如你的数据库）
  db:
    image: mysql:5.7
    # db 没有 depends_on，它会先启动

# 注意一个非常重要的地方！ depends_on 默认只保证依赖的服务“启动”了
# 它不保证依赖的服务已经“就绪”（比如数据库服务启动了，但可能还没完全初始化好，还没开始监听连接）
# 如果你的服务启动需要等待依赖的服务完全就绪，最好结合后面的 healthcheck 一起使用
```

*   **作用**：定义服务之间的启动依赖关系，确保被依赖的服务先启动。
*   **注意**：**默认情况下，`depends_on` 只等待依赖的容器“启动”成功，不等待它里面的应用完全“就绪”并可以接收请求。**
*   **推荐做法**：在需要等待依赖服务“就绪”时，结合 `healthcheck` 和更高级的 `depends_on.condition` (比如 `condition: service_healthy`) 来使用。

---

## ❤️ 10. `healthcheck`：检查你的服务是否“活”得健康

容器启动了，不代表里面的服务就真的正常工作了。比如一个 Web 服务可能启动了，但内部出错了，并不能响应请求。`healthcheck` 字段就是用来定义如何检查服务是否“健康”的，Docker Compose 会周期性地执行这个检查。

```yaml
services:
  # 定义一个服务叫 api
  api:
    image: my-api-image
    # healthcheck: 配置容器的健康检查
    healthcheck:
      # test: 定义健康检查命令。如果命令返回 0，表示健康；非 0 表示不健康
      # 这里用 curl 命令访问容器内部的 /health 接口，-f 参数表示如果 HTTP 状态码不是 2xx/3xx 就认为失败
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      # 你也可以用 CMD-SHELL 形式： test: ["CMD-SHELL", "pg_isready -U myuser -d mydatabase"] # 检查 PostgreSQL 数据库是否准备好

      # interval: 多久执行一次健康检查
      interval: 30s      # 每 30 秒检查一次

      # timeout: 每次健康检查的超时时间，如果命令执行超过这个时间还没结束，就认为失败
      timeout: 10s       # 每次检查最多等 10 秒

      # retries: 连续失败多少次后，把容器状态标记为 'unhealthy'
      retries: 3         # 连续失败 3 次就认为不健康

      # start_period: 给容器一个启动缓冲时间，在这段时间内的健康检查失败不会计入 retries
      # start_period: 60s # 容器启动后 60 秒内，健康检查失败暂时忽略
```

*   **作用**：自动检测容器内运行的服务是否正常响应，而不仅仅是容器进程是否活着。
*   **适合场景**：
    *   确保服务在后台运行，并且确实在提供服务（没有假死）。
    *   需要精确判断一个服务是否“就绪”来启动依赖它的服务（结合 `depends_on.condition: service_healthy`）。

---

## 🌐 11. `networks`：让你的服务们“说上话”

默认情况下，Docker Compose 会为你的项目创建一个网络，并把所有服务都放到这个网络里，这样它们就可以通过服务名互相访问了（比如 `api` 服务可以通过主机名 `db` 访问到数据库服务）。`networks` 字段可以让你把服务加入到特定的网络，或者定义自己的网络。

```yaml
services:
  # 定义一个前端服务
  frontend:
    image: my-frontend
    # networks: 把这个服务加入到哪些网络中
    networks:
      - frontend_net # 加入到名字叫 frontend_net 的网络
      - backend_net  # 也加入到名字叫 backend_net 的网络（如果需要直接访问后端）

  # 定义一个后端服务
  backend:
    image: my-backend
    networks:
      - backend_net # 加入到名字叫 backend_net 的网络

  # 定义一个数据库服务
  db:
    image: mysql:5.7
    networks:
      - backend_net # 加入到名字叫 backend_net 的网络

# 重要！所有用到的“自定义网络”需要在 docker-compose.yml 文件的最顶层单独声明
networks:
  frontend_net: # 声明一个叫 frontend_net 的网络
  backend_net:  # 声明一个叫 backend_net 的网络
    # driver: bridge 是默认的网络类型，通常不用写
```

*   **作用**：管理服务之间的网络连接，让服务可以通过服务名互相通信。
*   **适合场景**：
    *   你的应用包含多个服务（如前端、后端、数据库、缓存），它们需要互相访问。
    *   需要隔离不同的应用或服务组，让他们只能在各自的网络里通信。

---

## 📘 推荐组合模板：一个典型的 Node.js 应用架构

把上面讲的常用字段组合起来，一个常见的 Web 应用（比如 Node.js 后端 + MySQL 数据库）的 `docker-compose.yml` 可能会长这样：

```yaml
# 指定 Docker Compose 文件格式的版本
version: '3.8' # 推荐使用较新的版本

# services: 定义我们项目要运行的所有服务
services:
  # 定义第一个服务：应用后端（比如一个 Node.js API）
  app:
    # build: 从本地代码构建镜像
    build:
      context: . # 构建上下文是当前目录
      dockerfile: Dockerfile # 使用当前目录下的 Dockerfile 文件
    # image: 你也可以在这里指定构建后的镜像名字，方便管理
    image: my-nodejs-app:latest

    # ports: 端口映射，让外部能访问到容器内的应用
    ports:
      # 把宿主机的 80 端口映射到容器里应用监听的 3000 端口
      - "80:3000"

    # volumes: 数据卷挂载，用于代码同步和数据持久化
    volumes:
      # 把宿主机当前目录的代码，同步到容器里的 /app 目录
      # 方便开发时改代码容器里立即生效
      - .:/app
      # 也可以挂载其他需要的目录，比如日志目录
      # - app-logs:/app/logs

    # environment: 设置容器内部的环境变量
    environment:
      - NODE_ENV=production    # 设置运行环境为生产模式
      - DB_HOST=db             # 告诉应用数据库的主机名是另一个服务 'db'
      - DB_USER=${DB_USER}     # 从宿主机的环境变量或 .env 文件读取数据库用户名
      - DB_PASS=${DB_PASSWORD} # 从宿主机的环境变量或 .env 文件读取数据库密码
      # 如果使用 env_file 更方便管理大量变量
      # env_file: .env

    # depends_on: 设置服务启动依赖
    depends_on:
      # 告诉 Docker Compose，启动 app 服务之前，先启动 db 服务
      # 注意：默认只等待 db 容器启动，不保证 db 服务完全就绪
      - db
      # 如果需要等待 db 健康，可以这样写（需要 db 服务配置 healthcheck）：
      # db:
      #   condition: service_healthy

    # restart: 重启策略，保障服务稳定性
    restart: unless-stopped # 除非手动停止，否则容器异常退出就自动重启

    # networks: 把服务加入到同一个网络，让他们能互相通信
    networks:
      - backend_network # 加入到叫 backend_network 的网络

    # healthcheck: 健康检查（推荐加上，确保服务真的在工作）
    # healthcheck:
    #   test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
    #   interval: 1m
    #   timeout: 10s
    #   retries: 3


  # 定义第二个服务：数据库服务（比如 MySQL）
  db:
    image: mysql:5.7 # 使用 MySQL 5.7 镜像

    # volumes: 数据卷挂载，持久化数据库数据
    volumes:
      # 把 db-data 命名卷挂载到容器里 MySQL 存储数据的目录
      # 这样数据库数据就不会丢失
      - db-data:/var/lib/mysql

    # environment: 设置数据库的环境变量（比如 root 密码，很重要！）
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD} # 从环境变量或 .env 读取 root 密码
      - MYSQL_DATABASE=${DB_NAME} # 自动创建的数据库名

    # restart: 重启策略
    restart: unless-stopped

    # networks: 加入到同一个网络
    networks:
      - backend_network # 和 app 服务在同一个网络，app 就可以通过主机名 'db' 访问它

    # healthcheck: 数据库的健康检查（也很重要！）
    # healthcheck:
    #   test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-p${MYSQL_ROOT_PASSWORD}"]
    #   interval: 10s
    #   timeout: 5s
    #   retries: 5


# volumes: 在顶层声明命名卷，让 Docker 管理数据存储
volumes:
  db-data: # 声明一个叫 db-data 的命名卷
  # app-logs: # 如果上面 volumes 也用了 app-logs，这里也要声明

# networks: 在顶层声明自定义网络
networks:
  backend_network: # 声明一个叫 backend_network 的网络
    # driver: bridge 是默认类型，通常不用写
```