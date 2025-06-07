---
title: Docker 从零开始入门教程（超详细）
top_img: /images/post/docker/docker.jpg
cover: /images/post/docker/docker.jpg
categories:
  - Docker
tags:
  - Docker
  - 教程
abbrlink: 3065
date: 2025-06-06 00:00:00
---

# 🚢 Docker 从零开始入门教程（超详细）

Docker 是现代开发中最常用的容器技术之一。本文将带你从 0 开始，逐步掌握 Docker 的安装、使用、构建和实战部署。

---

## ✨ 什么是 Docker？

Docker 是一个**轻量级虚拟化平台**，它可以把你的应用程序及其所有依赖项打包成一个“容器”，这个容器可以在任何地方运行——不需要担心环境不一致的问题。

**简单理解：**  
传统部署 = 装系统 + 装运行环境 + 装依赖库  
Docker 部署 = 打包成一个“集装箱”，一搬就走 ✅

---

## 🧠 Docker 工作原理简图

```
+-----------------------+
|     应用（App）      |
|  +-----------------+ |
|  | 所有依赖 & 运行时 | |
|  +-----------------+ |
+----------容器----------+
          ↓
     由 Docker 引擎统一管理
```

Docker 利用 Linux 内核的容器技术（如 namespaces 和 cgroups）隔离进程，实现“轻量级虚拟机”的效果。

---

## 🧰 一、安装 Docker

### ✅ Windows / macOS 用户

1. 访问官网：https://www.docker.com/products/docker-desktop
2. 下载 Docker Desktop 安装包
3. 一路点击“下一步”即可
4. 安装完成后重启电脑，右下角会出现🐳图标

### 🐧 Ubuntu Linux 用户

```bash
# 1. 更新系统
sudo apt-get update

# 2. 安装依赖
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. 添加 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. 添加 Docker 软件源
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. 安装 Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 6. 启动 Docker 并设置开机启动
sudo systemctl start docker
sudo systemctl enable docker

# 7. 查看 Docker 版本
docker --version
```

---

## 🚀 二、第一个 Docker 容器

我们用 nginx（一个常见的 Web 服务器）举例。

```bash
# 拉取 nginx 镜像
docker pull nginx

# 启动容器（映射本地 8080 到容器的 80）
docker run -d -p 8080:80 --name my-nginx nginx

# 查看正在运行的容器
docker ps

# 打开浏览器访问：
http://localhost:8080
```

---

## 📦 三、常用 Docker 命令详解

| 命令 | 作用 |
|------|------|
| `docker pull 镜像名` | 下载镜像 |
| `docker run` | 启动容器 |
| `docker ps` | 查看正在运行的容器 |
| `docker ps -a` | 查看所有容器 |
| `docker stop 容器ID` | 停止容器 |
| `docker rm 容器ID` | 删除容器 |
| `docker images` | 查看本地镜像 |
| `docker rmi 镜像ID` | 删除镜像 |
| `docker exec -it 容器ID bash` | 进入容器终端 |

---

## 🔧 四、使用 Dockerfile 构建自己的镜像

一个 Node.js 项目的 Dockerfile 示例：

```Dockerfile
# 使用官方 Node.js 镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm install

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
```

### 构建镜像

```bash
docker build -t my-node-app .
```

### 运行镜像

```bash
docker run -p 3000:3000 my-node-app
```

---

## 🧱 五、使用 Docker Compose 管理多个服务

`docker-compose.yml` 示例：

```yaml
version: '3'
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
```

运行：

```bash
docker-compose up -d
```

关闭：

```bash
docker-compose down
```

---

## 🧯 六、常见问题与排查

### ❓ Docker 无法启动

- 检查是否有虚拟化支持（BIOS 中开启 VT）
- macOS/Windows 重启 Docker Desktop

### ❓ 端口无法访问？

- 确认端口映射正确
- 本地防火墙是否阻止
- 用 `docker logs 容器ID` 查看日志

### ❓ 容器运行后秒退？

- 使用 `docker logs 容器ID` 检查错误日志
- 某些服务（如 Node）可能需要前台运行 (`CMD ["npm", "start"]`)

---

## 📚 七、学习资源推荐

- Docker 官网：https://www.docker.com/
- Docker 中文文档：https://docs.docker.com/get-started/
- 镜像仓库：https://hub.docker.com/
- 《Docker — 从入门到实践》：https://yeasy.gitbook.io/docker_practice/

---

> 📌 本文适合 2025 年 Docker 主流版本，如有问题欢迎留言交流。
>  
> 作者：**[937bb]**｜转载请注明出处 🙏
