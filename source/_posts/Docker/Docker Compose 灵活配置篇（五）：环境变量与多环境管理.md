---
title: "\U0001F433 Docker Compose 灵活配置篇（五）：环境变量与多环境管理"
date: '2025-06-07 13:00'
top_img: /images/post/docker/docker.jpg
cover: /images/post/docker/docker.jpg
categories:
  - Docker
tags:
  - Docker
  - 教程
abbrlink: 58030
---

# 🐳 配置随环境而变：环境变量与多环境 Docker Compose 实战！

哈喽！我们又见面啦！通过前几章的学习，你已经掌握了如何描述单个服务、定义项目结构以及操作 Docker Compose。你甚至能搞定服务之间的复杂依赖和健康检查了，非常棒！

现在，让我们面对一个更实际的问题：你的应用在**开发环境**可能连接的是本地的数据库，使用调试模式；在**生产环境**可能连接的是云端的数据库，需要更高的性能配置，使用生产模式。这些“随环境变化”的配置信息怎么管理呢？

硬生生地在 `docker-compose.yml` 文件里改来改去显然不是个好主意，容易出错，也不方便。幸运的是，Docker Compose 提供了非常灵活的方式来处理这些问题，主要就是通过**环境变量**和**多文件组合**来实现！

今天，我们就来深入学习如何让你的 Docker Compose 配置“活”起来，根据不同的环境加载不同的设置。

---

## 🌳 环境变量：配置信息的“活水”

在第一章我们就提到了 `environment` 和 `env_file` 字段，它们是把配置信息作为环境变量传递给容器。为什么环境变量这么重要呢？

1.  **灵活**：你可以在不修改镜像或 Docker Compose 文件本身的情况下，改变容器的行为。
2.  **安全**：相较于直接在代码里硬编码，环境变量更适合传递一些非敏感或敏感程度较低的配置。
3.  **标准**：这是云原生应用和微服务常用的配置方式，符合“十二要素应用”（The Twelve-Factor App）的原则。

### 复习：两种传递环境变量的方式

*   **`environment`**：直接在服务配置里列出变量名和值。
    ```yaml
    services:
      app:
        image: my-app
        environment:
          - NODE_ENV=development
          - PORT=3000
    ```
    *   **适合场景**：变量少，或者变量值比较固定且不敏感。

*   **`env_file`**：从一个或多个文件中读取变量。
    ```yaml
    services:
      app:
        image: my-app
        env_file:
          - .env # 加载当前目录下的 .env 文件
          - ./config/app.env # 也可以加载其他文件
    ```
    *   **适合场景**：变量多，或者想把配置和 `docker-compose.yml` 文件分开，让文件更整洁。

### `.env` 文件：Docker Compose 的“默认配置包”

当你在项目根目录下创建一个名为 `.env` 的文件时，**Docker Compose 在运行任何命令（如 `up`, `down`, `build` 等）时，会默认自动加载这个文件中的环境变量**。

```env
# 文件名：.env
# 格式：变量名=值 （注意等号两边通常没有空格，值如果有空格或特殊字符需要用引号包起来）

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mysecretpassword

API_KEY=abcdef123456
DEBUG=true
```

然后在 `docker-compose.yml` 文件中，你可以使用 `${变量名}` 的语法来引用这些变量：

```yaml
version: '3.8'

services:
  app:
    image: my-app
    environment:
      # 直接引用 .env 文件里或者宿主机环境中的变量
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - API_KEY=${API_KEY}
      - DEBUG=${DEBUG}
      # 你也可以同时设置一些没有在 .env 文件里的变量
      - APP_MODE=web

    # 或者使用 env_file 加载 .env 文件，效果一样，但这种方式更显式
    # env_file:
    #   - .env

  db:
    image: mysql:5.7
    environment:
      # 同样引用变量
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
      - MYSQL_DATABASE=mydatabase
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

当你运行 `docker-compose up` 时，Docker Compose 会：
1.  读取当前目录下的 `.env` 文件，将里面的 `DB_HOST`, `DB_PORT` 等变量加载到内存中。
2.  解析 `docker-compose.yml` 文件。
3.  遇到 `${DB_HOST}` 等占位符时，用从 `.env` 或宿主机环境中加载到的实际值替换它们。
4.  用替换后的完整配置来创建和启动容器，并将这些变量传递给容器。

*   **变量加载顺序 (优先级从高到低)**：
    1.  在命令行中传递的环境变量（例如 `DB_HOST=192.168.1.1 docker-compose up`）。
    2.  宿主机/Shell 环境中已经存在的环境变量。
    3.  `.env` 文件中的变量。
    4.  `docker-compose.yml` 中 `environment` 字段直接设置的值。
    *理解这个顺序很重要，你可以通过设置宿主机环境变量来覆盖 `.env` 文件中的值！*

*   **`.env` 文件适合场景**：
    *   存储开发环境的默认配置。
    *   存储一些非敏感的应用参数。
    *   方便团队成员共享基础配置。

*   **`.env` 文件**不适合**场景**：
    *   存储真正的**生产环境敏感密钥**（如生产数据库密码、第三方服务 API Key）。虽然 `.env` 文件本身可能不提交到 Git，但这种方式不够安全和健壮。生产环境推荐使用 Docker Secrets 或 Kubernetes Secrets 等更专业的密钥管理方案。

---

## 🔄 多环境管理：用 `-f` 组合不同的配置文件！

`.env` 文件方便了环境变量的管理，但如果不同环境（dev/prod）的配置差异很大，比如：

*   开发环境：使用本地构建的镜像 (`build`)，端口映射到 `3000`，挂载本地代码目录 (`volumes: .:/app`)，连接 Docker 网络内的数据库 (`DB_HOST=db`)。
*   生产环境：使用预构建的镜像 (`image: my-app:latest`)，端口映射到 `80`，不挂载本地代码，连接外部的云数据库 (`DB_HOST=prod.database.com`)。

这些差异涉及到 `build`, `image`, `ports`, `volumes`, `environment` 等多个字段，只靠 `.env` 文件就很难管理了。

这时，最佳实践是使用 **多个 `docker-compose.yml` 文件**，并通过 `docker-compose` 命令的 `-f` 参数来组合和覆盖配置！

基本思想是：
1.  创建一个 **基础文件** (`docker-compose.yml`)：包含所有环境共用的配置（比如服务名称、网络定义、卷定义、一些通用的环境变量、重启策略等）。
2.  创建 **环境特定覆盖文件** (`docker-compose.dev.yml`, `docker-compose.prod.yml` 等)：只包含特定环境的配置**差异**或**覆盖项**。

当使用 `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` 时，Docker Compose 会**合并**这两个文件。后面文件的配置会覆盖前面文件的相同部分。

### 示例：开发环境 vs 生产环境

假设你有以下需求：

*   **基础配置 (`docker-compose.yml`)**：
    *   定义 `app` 和 `db` 服务。
    *   定义一个共同的网络 `app_network`。
    *   `db` 服务使用 `mysql:5.7` 镜像，持久化到命名卷 `db_data`。
    *   `app` 服务连接到 `app_network`，依赖 `db`。
    *   通用环境变量如 `API_KEY`，从 `.env` 加载。
    *   `restart` 策略为 `unless-stopped`。

*   **开发环境覆盖 (`docker-compose.dev.yml`)**：
    *   `app` 服务使用 `build: .` 构建本地镜像。
    *   `app` 服务端口映射 `3000:3000`。
    *   `app` 服务挂载本地代码卷 `. : /app`。
    *   `app` 服务设置 `NODE_ENV=development`。
    *   `db` 服务使用默认端口和内部网络名连接 (`DB_HOST=db`)。
    *   使用 `.env.dev` 文件加载开发环境特有变量。

*   **生产环境覆盖 (`docker-compose.prod.yml`)**：
    *   `app` 服务使用 `image: myapp:latest` 镜像。
    *   `app` 服务端口映射 `80:3000`。
    *   `app` 服务不挂载本地代码卷。
    *   `app` 服务设置 `NODE_ENV=production`。
    *   `db` 服务连接外部数据库 (`DB_HOST=prod.database.com`)。
    *   使用 `.env.prod` 文件加载生产环境特有变量。

**第一步：创建 `.env.dev` 和 `.env.prod` 文件**

```env
# 文件名：.env.dev
# 开发环境特有的变量
DB_HOST=db # 在 docker 网络里，数据库服务名叫 db
DB_PORT=3306
DEBUG=true
```

```env
# 文件名：.env.prod
# 生产环境特有的变量
DB_HOST=prod.database.com # 外部数据库地址
DB_PORT=3306
DEBUG=false
```
*(注意：`.env` 文件如果存在，也会被默认加载，然后 `.env.dev` 或 `.env.prod` 如果被 env_file 指定，其中的变量会覆盖 `.env` 中同名的变量。)*

**第二步：创建基础文件 (`docker-compose.yml`)**

```yaml
# 文件名: docker-compose.yml
version: '3.8'

services:
  app:
    # build 或 image 在覆盖文件里指定
    # ports 在覆盖文件里指定
    # volumes (代码挂载) 在覆盖文件里指定
    # environment (NODE_ENV, DB_HOST等) 在覆盖文件里指定
    # env_file 在覆盖文件里指定

    restart: unless-stopped # 重启策略是通用的

    depends_on:
      # app 依赖 db 处于健康状态 (需要 db 服务配置 healthcheck)
      db:
        condition: service_healthy

    networks:
      - app_network # app 和 db 都在同一个网络里通信

    # 通用健康检查 (如果健康检查方式不同，可以在覆盖文件里重写)
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: mysql:5.7
    # environment (密码, DB_NAME) 可以在 .env 或者覆盖文件里指定
    # volumes (数据卷) 在这里指定结构，或者在覆盖文件里指定不同类型
    volumes:
      - db_data:/var/lib/mysql # 默认使用命名卷

    restart: unless-stopped # 重启策略是通用的

    networks:
      - app_network # app 和 db 在同一个网络里通信

    # 数据库健康检查 (通用)
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5


# 顶层声明命名卷 (通用)
volumes:
  db_data:

# 顶层声明网络 (通用)
networks:
  app_network:
```

**第三步：创建开发环境覆盖文件 (`docker-compose.dev.yml`)**

```yaml
# 文件名: docker-compose.dev.yml
# 这个文件会覆盖 docker-compose.yml 中的一些设置

version: '3.8' # 版本号需要和基础文件一致

services:
  app:
    # 覆盖或添加 app 服务的配置
    build:
      context: . # 开发环境从本地构建
      dockerfile: Dockerfile.dev # 可能使用不同的 Dockerfile

    ports:
      - "3000:3000" # 开发环境映射到 3000

    volumes:
      # 覆盖 volumes，添加本地代码挂载（注意：列表是合并，如果基础文件有命名卷，这里需要重写整个 volumes 列表）
      # Docker Compose V3+ 合并规则是：列表类型的字段会**合并**，映射类型的字段会**覆盖**。
      # 为了清晰，通常在覆盖文件里写全需要的所有 volumes。
      - .:/app # 添加本地代码挂载
      - db_data:/var/lib/mysql # 也要保留数据库的数据卷挂载

    environment:
      # 覆盖或添加环境变量
      NODE_ENV: development

    env_file:
      - .env.dev # 加载开发环境特有的变量文件

  db:
    # 覆盖或添加 db 服务的配置
    # 在开发环境，db 的健康检查可能更宽松
    healthcheck:
      interval: 5s # 检查频率高一点
      timeout: 3s
      retries: 3
      start_period: 10s

    # db 在 dev 环境可能也需要一些特定的环境变量，比如创建测试数据库
    environment:
      MYSQL_DATABASE: myapp_dev # 覆盖或添加环境变量
```
*注意：`volumes` 字段是列表，Docker Compose 合并时会把所有列表项加在一起。如果你想**替换**某个卷而不是**添加**，或者想在覆盖文件中明确卷的类型（如本地路径 vs 命名卷），你需要写完整的 `volumes` 配置，它会覆盖基础文件中的同名字段。上面的例子中，`volumes` 列表被完整替换了，包含了基础文件中的命名卷和开发环境特有的绑定挂载。`environment` 是映射，同名变量会覆盖。*

**第四步：创建生产环境覆盖文件 (`docker-compose.prod.yml`)**

```yaml
# 文件名: docker-compose.prod.yml
# 这个文件会覆盖 docker-compose.yml 中的一些设置

version: '3.8' # 版本号需要和基础文件一致

services:
  app:
    # 覆盖或添加 app 服务的配置
    image: myapp:latest # 生产环境使用预构建的镜像
    # build: # 生产环境不需要 build，所以这里不写 build 字段，或者设置为 null/[]

    ports:
      - "80:3000" # 生产环境映射到 80

    volumes:
      # 生产环境不挂载本地代码，只保留数据卷挂载
      - db_data:/var/lib/mysql # 保留数据库的数据卷挂载

    environment:
      # 覆盖或添加环境变量
      NODE_ENV: production

    env_file:
      - .env.prod # 加载生产环境特有的变量文件

  db:
    # 生产环境 db 可能不需要特定的覆盖，使用基础文件和 .env.prod 中的配置即可
    # 如果需要，可以在这里添加覆盖配置
    environment:
      MYSQL_DATABASE: myapp_prod # 生产环境数据库名不同
```
*同样注意 `volumes` 的合并规则，这里只保留了 `db_data` 的挂载。*

### 运行不同环境的应用

现在，你可以使用 `-f` 参数来指定要加载哪些配置文件。

*   **运行开发环境：**
    ```bash
    # 默认 docker-compose.yml 是第一个加载的文件
    # 然后 docker-compose.dev.yml 会覆盖其中的配置
    # -d 参数表示以后台模式运行
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
    # --build 是为了确保开发环境总是使用最新的本地代码构建
    ```

*   **运行生产环境：**
    ```bash
    # 默认 docker-compose.yml 是第一个加载的文件
    # 然后 docker-compose.prod.yml 会覆盖其中的配置
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    # 生产环境通常使用 image，所以这里不需要 --build
    ```

*   **停止和清理特定环境：**
    ```bash
    # 停止开发环境
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

    # 停止生产环境 (注意 -v 慎用，它会删除数据卷)
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    ```

**文件合并规则总结 (V3.x)**：
*   **映射 (Map)**：例如 `environment`, `labels`, `healthcheck` 等，会**完全覆盖**基础文件中的对应映射。
*   **列表 (List)**：例如 `ports`, `volumes`, `networks` (服务内部的)，会**合并**基础文件和覆盖文件中的列表项。同名卷或端口映射可能会有复杂的行为，通常建议在覆盖文件里写全希望的最终列表项。
*   **顶层 `volumes` 和 `networks`**：会合并，同名项被覆盖。

使用 `-f` 参数组合文件是管理多环境配置最灵活和常用的方法。

---

## ♻️ `extends` 关键字：让配置更 DRY (Don't Repeat Yourself)

除了 `-f` 组合文件，Docker Compose 还提供了 `extends` 关键字，用于在不同服务之间**共享通用的配置片段**，或者在一个文件里引用另一个文件中的服务定义。这是一种**复用配置**的机制。

虽然 `extends` 也可以间接用于多环境（通过继承不同基础配置），但它更主要的用途是抽象和复用。

```yaml
# 文件名: common.yml # 存放通用配置片段
version: '3.8'

services:
  _base_app: &base_app # 使用 YAML 锚点 & 定义一个可复用的配置块
    restart: unless-stopped
    networks:
      - app_network
    healthcheck: # 通用健康检查配置
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  _base_db: &base_db
    image: mysql:5.7
    restart: unless-stopped
    networks:
      - app_network
    healthcheck: # 通用数据库健康检查
      test: ["CMD", "mysqladmin", "ping -h localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  app_network: # 通用网络定义
```

```yaml
# 文件名: docker-compose.yml # 主文件，使用 extends 或引用通用片段
version: '3.8'

# 直接引用 common.yml 中的网络定义
networks:
  app_network:

services:
  # 使用 extends 继承 common.yml 中的 _base_app 配置
  app:
    # extends:
    #   file: common.yml # 指定从哪个文件继承
    #   service: _base_app # 指定继承哪个服务定义

    # 或者使用 YAML 锚点引用 (更简洁，但只能在同一个或被引用的文件中使用)
    <<: *base_app # 引用 common.yml 中定义的 _base_app 锚点

    # 然后在这里添加或覆盖特定配置
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - db_data:/var/lib/mysql
    environment:
      - NODE_ENV=development
      - DB_HOST=db

    depends_on:
      db:
        condition: service_healthy

  db:
    # 使用 extends 继承 common.yml 中的 _base_db 配置
    # extends:
    #   file: common.yml
    #   service: _base_db

    # 或者使用 YAML 锚点引用
    <<: *base_db

    # 然后在这里添加或覆盖特定配置
    volumes:
      - db_data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=mysecretpassword
      - MYSQL_DATABASE=mydatabase

volumes:
  db_data: # 在主文件或通用文件里声明卷
```
*注意：上面的例子结合使用了 `extends` 和 YAML 锚点。`extends` 用于引用**另一个文件**中的完整服务定义，YAML 锚点则用于在一个文件内部或被引用的文件中定义和复用配置块。在 V3+ 版本中，YAML 锚点配合 `-f` 多文件组合是实现 DRY 和多环境管理的一种常见且灵活的方式。*

*   **`extends` 适合场景**：
    *   多个服务有大量重复配置（如 logging, restart, common labels）。
    *   在大型项目中，将一些基础服务定义（如一个标准的 Web 服务模板）放在单独的文件中供其他项目复用。

*   **`extends` vs `-f` 组合**：
    *   `-f` 组合：更侧重于**合并和覆盖**配置，是实现**不同环境**配置切换的标准方式。
    *   `extends`：更侧重于**继承和复用**配置片段或服务定义，是实现 DRY 的一种方式。它们可以结合使用。

---

## ✅ 多环境管理的最佳实践

1.  **一个基础 `docker-compose.yml`**：包含项目共有的、不随环境变化的配置。
2.  **多个环境覆盖文件** (`docker-compose.dev.yml`, `docker-compose.prod.yml` 等)：只包含特定环境的**差异**和对基础配置的**覆盖**。
3.  **使用 `-f` 参数**：通过 `docker-compose -f docker-compose.yml -f docker-compose.[env].yml up -d` 命令来启动特定环境。
4.  **`.env` 文件用于加载变量**：每个环境可以有自己的 `.env.[env]` 文件，并通过 `env_file` 加载。对于简单变量，项目根目录的 `.env` 文件也可以作为默认值加载。
5.  **敏感信息处理**：开发环境可以使用 `.env` 并加入 `.gitignore`。生产环境**不推荐**将敏感信息放入 `.env` 或直接写在 yml 里，应考虑使用 Docker Secrets 或其他秘密管理工具。
6.  **配置合并理解**：牢记 Docker Compose 的配置合并规则（映射覆盖，列表合并），编写覆盖文件时要小心。

通过将通用配置放在基础文件，环境特定的差异放在覆盖文件，并结合环境变量的使用，你的 Docker Compose 配置将变得非常灵活、易于管理，并且能够轻松适应不同的部署环境！

---

**本章小结**

我们学习了 Docker Compose 中环境变量的高级用法和多环境配置管理：
*   复习了 `environment` 和 `env_file` 的作用。
*   深入了解了 `.env` 文件自动加载和变量覆盖的机制。
*   掌握了使用 `-f` 参数组合多个 `docker-compose.yml` 文件来实现不同环境配置切换的核心方法。
*   了解了 `extends` 关键字用于配置复用的功能。
*   总结了多环境管理的最佳实践。

现在，你不仅能定义服务，还能根据不同的需求轻松调整它们的配置了！接下来，我们将探索 Docker Compose 中用于限制容器资源使用、命名容器以及配置日志等方面的高级字段。这将在下一章“深入服务配置：资源限制与其他字段”中讲解！敬请期待！