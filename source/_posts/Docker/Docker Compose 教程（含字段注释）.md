---
title: "\U0001F433 Dockerfile + Docker Compose 教程（含字段注释）"
top_img: /images/post/docker/docker.jpg
cover: /images/post/docker/docker.jpg
categories:
  - Docker
tags:
  - Docker
  - 教程
abbrlink: 48960
date: 2025-06-07 00:00:00
---

# 🐳 Dockerfile + Docker Compose 教程（含字段注释）

---

## 📦 一、Dockerfile 教程（构建镜像）

`Dockerfile` 是用于定义 Docker 镜像内容的脚本。你可以用它自动打包部署环境和项目。

### 📁 示例：构建一个 Node.js 应用镜像

```dockerfile
# 使用官方 Node 镜像作为基础镜像
FROM node:18

# 设置容器内的工作目录
WORKDIR /app

# 复制依赖文件（更高缓存利用）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件到容器
COPY . .

# 映射端口（仅用于文档说明，实际映射需用 docker run 或 docker-compose）
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

### 🧾 字段解释

| 指令      | 含义                               |
| --------- | ---------------------------------- |
| `FROM`    | 指定基础镜像                       |
| `WORKDIR` | 设置容器中的工作目录               |
| `COPY`    | 将文件复制进镜像                   |
| `RUN`     | 执行命令（在构建时执行）           |
| `EXPOSE`  | 声明容器会监听的端口（非实际映射） |
| `CMD`     | 容器启动时执行的默认命令           |

---

## 🧩 二、Docker Compose 教程（管理多容器）

`docker-compose.yml` 是用来定义多个服务（容器）的配置文件，常用于本地开发或测试部署。

---

### 🌐 示例：Node.js + MongoDB 服务组合

```yaml
version: '3.8'

services:
  app:
    build:
      context: .              # Dockerfile 所在路径
      dockerfile: Dockerfile # 可选指定文件名
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    depends_on:
      - mongo
    environment:
      - MONGO_URL=mongodb://mongo:27017/mydb
    command: ["npm", "run", "dev"]
    restart: always
    networks:
      - backend

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: on-failure
    networks:
      - backend

volumes:
  mongo-data:

networks:
  backend:
```

---

### 🧾 所有常用字段注解（Compose v3.8）

#### ✅ 根级字段

| 字段       | 说明                       |
| ---------- | -------------------------- |
| `version`  | Compose 文件的语法版本     |
| `services` | 所有要运行的服务（容器）   |
| `volumes`  | 声明可复用的数据卷         |
| `networks` | 声明自定义网络             |
| `configs`  | 管理配置文件（高级用法）   |
| `secrets`  | 管理敏感数据，如密码、证书 |

---

#### ✅ `services` 下常见字段

| 字段                   | 类型          | 说明                                                           |
| ---------------------- | ------------- | -------------------------------------------------------------- |
| `image`                | string        | 使用已有镜像                                                   |
| `build`                | object/string | 使用 Dockerfile 构建镜像（支持配置项）                         |
| `context`              | string        | 构建上下文路径                                                 |
| `dockerfile`           | string        | Dockerfile 文件名                                              |
| `ports`                | list          | 端口映射（主机:容器）                                          |
| `volumes`              | list          | 数据卷挂载（持久化或挂载代码）                                 |
| `environment`          | list/map      | 设置环境变量                                                   |
| `env_file`             | string/list   | 从文件中读取环境变量                                           |
| `depends_on`           | list          | 定义服务之间的启动顺序                                         |
| `command`              | string/list   | 覆盖容器启动时默认命令                                         |
| `entrypoint`           | string/list   | 覆盖默认 entrypoint                                            |
| `restart`              | string        | 容器重启策略（`no`, `always`, `on-failure`, `unless-stopped`） |
| `networks`             | list          | 加入一个或多个网络                                             |
| `hostname`             | string        | 容器主机名                                                     |
| `extra_hosts`          | list          | 添加 hosts 映射（本地 DNS）                                    |
| `logging`              | object        | 配置日志驱动                                                   |
| `healthcheck`          | object        | 设置健康检查                                                   |
| `tty`                  | bool          | 分配 TTY 伪终端（多用于交互容器）                              |
| `stdin_open`           | bool          | 保持 STDIN 打开（`docker run -i`）                             |
| `depends_on.condition` | object        | 控制服务依赖条件（需要配合 `healthcheck`）                     |

---

#### ✅ `volumes` 下字段

```yaml
volumes:
  db-data:
    driver: local         # 存储驱动
    driver_opts:          # 驱动参数
      type: none
      device: /my/data
      o: bind
```

---

#### ✅ `networks` 下字段

```yaml
networks:
  backend:
    driver: bridge        # 网络驱动（默认为 bridge）
    ipam:                 # 自定义 IP 地址管理（可选）
      config:
        - subnet: 172.16.238.0/24
```

---

#### ✅ `configs` & `secrets`（仅 Swarm 模式）

```yaml
configs:
  my_config:
    file: ./config.json

secrets:
  db_password:
    file: ./pw.txt
```

---

## 🚀 三、常用命令速查

| 命令                           | 说明                   |
| ------------------------------ | ---------------------- |
| `docker-compose up`            | 构建 + 启动所有服务    |
| `docker-compose up -d`         | 后台运行               |
| `docker-compose down`          | 停止并清理容器、网络等 |
| `docker-compose ps`            | 查看运行中的服务       |
| `docker-compose logs -f`       | 查看日志               |
| `docker-compose exec app bash` | 进入容器终端           |
| `docker-compose build`         | 仅构建镜像，不启动     |
| `docker-compose stop`          | 暂停服务，不删除容器   |
| `docker-compose restart`       | 重启服务               |

---

## 🧯 四、常见问题排查

| 问题             | 原因                          | 解决方法                                       |
| ---------------- | ----------------------------- | ---------------------------------------------- |
| 服务端口访问不到 | `ports` 映射未设置或被占用    | 确认 `宿主机:容器端口` 正确且未冲突            |
| 代码热更新无效   | 未挂载 `volumes` 或 Node 缓存 | 检查 `volumes`，可加 `nodemon`                 |
| 数据丢失         | 缺少数据卷挂载                | 添加 `volumes`，确保路径正确                   |
| 服务顺序问题     | `depends_on` 无法确保服务就绪 | 使用 `healthcheck` 配合 `depends_on.condition` |

---

## 📘 五、推荐项目结构

```
my-app/
├── docker-compose.yml
├── Dockerfile
├── .env
├── package.json
├── config/
├── secrets/
└── src/
    └── index.js
```

---

## 📚 六、延伸阅读

- Docker 官方文档：https://docs.docker.com/
- Compose 文件语法参考：https://docs.docker.com/compose/compose-file/
- 官方 Compose 示例：https://github.com/docker/awesome-compose
- Swarm 集群：https://docs.docker.com/engine/swarm/

---

> 作者：**[937bb]**  
> 本文适用于初学者与中小团队服务部署使用，转载请注明出处 🐳
