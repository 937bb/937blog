---
title: MongoDB 和 Mongoose 入门指南：基础连接、Schema与CRUD (第一章)
top_img: /images/post/mongodb/mongodb.jpg
cover: /images/post/mongodb/mongodb.jpg
categories:
  - MongoDB
tags:
  - 教程
  - MongoDB
abbrlink: 8207
date: '2025-06-08 14:30'
---

# MongoDB 和 Mongoose 入门指南：基础连接、Schema与CRUD (第一章)

本文旨在为 Node.js 开发者提供一个关于如何使用 Mongoose 库操作 MongoDB 数据库的基础指南。我们将介绍 Mongoose 的基本概念、安装配置，以及如何进行最常见的数据操作：创建 (Create) 和读取 (Read)。

考虑到内容的详细性，本教程将分章节进行。

## 第一章：Mongoose 基础 - 连接数据库与数据模型

### 1. 理解 MongoDB 和 Mongoose

**MongoDB** 是一种 NoSQL 数据库，它以**文档 (Document)** 的形式存储数据。文档类似于 JSON 对象，具有灵活的结构。多个文档组成一个**集合 (Collection)**，类似于关系型数据库中的表。

**Mongoose** 是一个用于 Node.js 的 **MongoDB 对象模型工具 (Object Data Modeling, ODM)**。它在 Node.js 应用和 MongoDB 数据库之间提供了一个抽象层。使用 Mongoose 的主要原因包括：

*   **定义数据结构 (Schemas)**：Mongoose 允许你定义文档应有的结构、字段类型和验证规则，这有助于保证数据的一致性和可靠性。
*   **数据验证 (Validation)**：在数据保存到数据库之前，Mongoose 可以根据 Schema 定义自动进行数据验证。
*   **便捷的操作方法 (Models)**：Mongoose 提供了丰富的、易于使用的 API 来执行数据库的增、删、改、查等操作。
*   **处理数据关系 (Population)**：虽然 MongoDB 是无模式的，但在实际应用中数据之间常有关联。Mongoose 提供了 Population 功能来方便地处理这些关联。

简单来说，Mongoose 提供了一种更结构化和高效的方式来在 Node.js 应用中与 MongoDB 交互。

### 2. 环境准备与安装

开始之前，请确保你已经安装了 Node.js 和 npm（Node.js 安装包管理器）。

1.  **创建项目文件夹**：
    ```bash
    mkdir my-mongoose-app
    cd my-mongoose-app
    ```
2.  **初始化项目**：
    ```bash
    npm init -y
    ```
    这会创建一个 `package.json` 文件。
3.  **安装 Mongoose**：
    ```bash
    npm install mongoose
    ```
    这将 Mongoose 库添加到你的项目依赖中。

### 3. 连接到 MongoDB 数据库

在你的项目根目录下创建一个 JavaScript 文件，例如 `app.js`。

你需要一个运行中的 MongoDB 数据库实例。可以是本地安装的 MongoDB 服务，或者像 MongoDB Atlas 这样的云服务。

编辑 `app.js` 文件，编写连接数据库的代码：

```javascript
// app.js

// 引入 mongoose 库
const mongoose = require('mongoose');

// MongoDB 数据库连接字符串
// 格式通常为: mongodb://[用户名:密码@]主机名:端口/[数据库名]
// 如果是本地默认安装且没有设置用户名密码，通常是:
const dbURI = 'mongodb://localhost:27017/myMongooseDatabase'; // myMongooseDatabase 是你要连接/创建的数据库名

// 定义一个异步函数来处理数据库连接
async function connectDB() {
    try {
        // 使用 mongoose.connect() 方法连接数据库
        // 第二个参数是可选的连接选项，在新版 Mongoose 中很多默认值已优化
        await mongoose.connect(dbURI, {
            // 以下选项在新版本可能不再需要，但旧代码中常见，了解即可：
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true, // 用于确保索引创建成功
            // useFindAndModify: false // 禁用 findOneAndUpdate/deleteOne 等方法的旧行为
        });
        console.log('MongoDB 数据库连接成功!');

        // 连接成功后，你可以在这里开始定义 Schema、Model 并执行数据库操作

    } catch (err) {
        // 连接失败时捕获错误并输出
        console.error('MongoDB 数据库连接失败:', err);
        // 可以选择在此处退出程序，因为数据库是核心依赖
        process.exit(1);
    }
}

// 调用连接函数开始连接
connectDB();

// 监听 mongoose 连接断开事件 (可选)
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB 数据库连接已断开');
});

// 监听 Node.js 进程终止信号，优雅地关闭 Mongoose 连接 (可选，推荐在服务中添加)
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose 连接因应用终止而断开');
    process.exit(0);
});
```

**代码说明:**

*   `require('mongoose')`: 引入 Mongoose 库。
*   `dbURI`: 定义你的 MongoDB 连接字符串，包含数据库地址和数据库名称。
*   `async function connectDB() { ... }`: 封装连接逻辑在一个异步函数中，使用 `async/await` 使异步代码更易读。
*   `mongoose.connect(dbURI, { ... })`: Mongoose 提供的连接数据库方法。它返回一个 Promise，因此可以使用 `await` 等待其完成。
*   `try...catch`: 标准的错误处理机制，用于捕获连接过程中可能发生的错误。
*   `mongoose.connection.on('disconnected', ...)`: 监听连接断开事件，便于调试或记录状态。
*   `process.on('SIGINT', ...)`: 监听操作系统的终止信号 (例如 Ctrl+C)，在程序退出前执行清理工作，如关闭数据库连接。

运行 `node app.js`。如果一切顺利，你应该会在控制台看到 "MongoDB 数据库连接成功!"。

### 4. 定义数据结构：Schema (模式)

连接成功后，下一步是定义你存储在集合中的文档应该具有什么样的结构。这通过 Mongoose 的 **Schema** 来完成。

在 `connectDB` 函数内部（在连接成功后），或者在一个单独的文件中定义 Schema：

```javascript
// app.js (继续在 connectDB 函数成功连接后的位置)

async function connectDB() {
    try {
        await mongoose.connect(dbURI, { /* options */ });
        console.log('MongoDB 数据库连接成功!');

        // === 1. 定义 Schema (模式) ===
        // Schema 描述了 MongoDB 文档的字段、字段类型、默认值、验证规则等
        const userSchema = new mongoose.Schema({
            // 字段名: { 配置对象 }
            name: {
                type: String, // 数据类型为字符串
                required: true // 表示这个字段是必须的
            },
            age: {
                type: Number, // 数据类型为数字
                min: 0,      // 可选：设置数字的最小值验证
                max: 120     // 可选：设置数字的最大值验证
            },
            email: {
                type: String,
                required: true,
                unique: true, // 表示这个字段的值在整个集合中必须是唯一的
                lowercase: true // 可选：保存前将邮箱转换为小写
            },
            registerDate: {
                type: Date, // 数据类型为日期
                default: Date.now // 可选：设置默认值为当前时间
            },
            isActive: {
                type: Boolean, // 数据类型为布尔值
                default: true  // 可选：设置默认值为 true
            }
            // 还可以定义数组、嵌套对象等复杂类型
            // hobbies: [String], // 字符串数组
            // address: {
            //     street: String,
            //     city: String
            // }
        });

        console.log('用户 Schema 定义完成');

        // === 2. 基于 Schema 创建 Model (模型) ===
        // Model 是 Mongoose 用来与特定集合交互的类或构造函数
        // 'User' 是 Model 的名字。Mongoose 会自动将其转换为复数小写形式作为集合名，即 'users'
        const User = mongoose.model('User', userSchema);

        console.log('用户 Model 创建完成');

        // 定义好 Model 后，就可以使用 User 这个 Model 来操作 'users' 集合了
        // ... 后续的 CRUD 操作将使用这个 User Model ...

    } catch (err) {
        console.error('连接 MongoDB 数据库失败:', err);
        process.exit(1);
    }
}

// ... 接下来的监听代码 ...
```

**代码说明:**

*   `new mongoose.Schema({...})`: 创建一个新的 Schema 实例。
*   花括号内的对象定义了文档的结构。键是字段名，值是一个配置对象，用于指定字段的 `type` (类型) 和其他属性，如 `required` (是否必需)、`unique` (是否唯一)、`default` (默认值)、验证规则 (如 `min`, `max`) 等。
*   `mongoose.model('ModelName', schemaInstance)`: 基于 Schema 创建 Model。第一个参数是 Model 的名称，**推荐使用单数、大写字母开头**的字符串。Mongoose 会根据这个名称自动确定对应的集合名（通过转换为小写复数）。例如，'User' 对应 'users' 集合，'Product' 对应 'products' 集合。
*   创建的 Model（这里是 `User` 变量）是一个类，用于创建 Document 实例或执行查询操作。

### 5. 新增数据：创建并保存文档 (Create)

有了 Model (`User`)，我们就可以使用它来创建和保存新的文档到 `users` 集合中。

有两种主要方法：

**方法 1: 创建 Document 实例然后保存**

```javascript
// app.js (继续在 Model 定义后的位置)

async function connectDB() {
    try {
        await mongoose.connect(dbURI, { /* options */ });
        console.log('MongoDB 数据库连接成功!');

        // Schema 和 Model 定义...
        const userSchema = new mongoose.Schema({ /* ... */ });
        const User = mongoose.model('User', userSchema);
        console.log('用户 Schema 和 Model 创建完成');

        // === 开始新增数据 ===

        // 创建一个新的用户 Document 实例
        const newUser = new User({
            name: 'Alice',
            age: 28,
            email: 'alice@example.com', // email 字段会自动转换为小写
            // registerDate 和 isActive 会使用默认值
        });

        // 调用实例的 save() 方法将文档保存到数据库
        try {
            const savedUser = await newUser.save(); // save() 返回一个 Promise
            console.log('用户保存成功:', savedUser);
        } catch (saveErr) {
            // 如果保存失败（例如，unique 验证失败，required 字段缺失等）
            console.error('用户保存失败:', saveErr.message);
        }

        // === 新增数据结束 ===

        // ... 后续的查询代码将放在这里 ...


    } catch (err) {
        console.error('连接 MongoDB 数据库失败:', err);
        process.exit(1);
    }
}

// ... 接下来的监听代码 ...
```

**方法 2: 使用 Model 的 create() 方法 (更简洁)**

```javascript
// app.js (继续在 Model 定义后的位置)

async function connectDB() {
    try {
        await mongoose.connect(dbURI, { /* options */ });
        console.log('MongoDB 数据库连接成功!');

        // Schema 和 Model 定义...
        const userSchema = new mongoose.Schema({ /* ... */ });
        const User = mongoose.model('User', userSchema);
        console.log('用户 Schema 和 Model 创建完成');

        // === 开始新增数据 ===

        // 使用 Model.create() 方法直接创建并保存文档
        // create() 方法返回一个 Promise，resolve 时返回新创建的文档
        try {
            const anotherUser = await User.create({
                name: 'Bob',
                age: 35,
                email: 'BOB@EXAMPLE.COM', // 同样会自动转换为小写
            });
            console.log('用户通过 create 保存成功:', anotherUser);

            // 尝试保存一个 email 已经存在的用户，会因为 unique 约束失败
            const duplicateEmailUser = await User.create({
                 name: 'Charlie',
                 age: 22,
                 email: 'alice@example.com' // 和 Alice 的邮箱重复
            });
            console.log('重复邮箱用户保存成功 (这行通常不会执行):', duplicateEmailUser); // 理论上会捕获到错误

        } catch (createErr) {
            // 捕获 create 方法中的错误
            console.error('用户通过 create 保存失败:', createErr.message);
        }

        // === 新增数据结束 ===

        // ... 后续的查询代码将放在这里 ...


    } catch (err) {
        console.error('连接 MongoDB 数据库失败:', err);
        process.exit(1);
    }
}
```

**代码说明:**

*   `new User({...})`: 使用 Model 作为构造函数创建一个新的 Document 对象。这个对象此时只存在于内存中。
*   `document.save()`: Document 实例的方法，用于将内存中的 Document 对象保存到数据库。这是一个异步操作。
*   `User.create({...})`: Model 的静态方法。它是一个快捷方式，等同于 `new User({...}).save()`。它接收一个对象（或对象数组）并直接在数据库中创建文档。同样是异步操作。
*   `try...catch`: 在进行保存操作时，务必使用 `try...catch` 捕获可能的错误，特别是 Mongoose Schema 验证错误或 MongoDB 的唯一索引错误。

运行 `node app.js`，你会看到用户成功保存或保存失败（如邮箱重复）的日志信息。

### 6. 查询数据：查找文档 (Read)

数据保存后，下一步就是从数据库中读取数据。Mongoose Model 提供了多种强大的查询方法。

继续在连接成功后的代码块里添加查询逻辑：

```javascript
// app.js (继续在新增数据后的位置)

async function connectDB() {
    try {
        await mongoose.connect(dbURI, { /* options */ });
        console.log('MongoDB 数据库连接成功!');

        // Schema 和 Model 定义...
        const userSchema = new mongoose.Schema({ /* ... */ });
        const User = mongoose.model('User', userSchema);
        console.log('用户 Schema 和 Model 创建完成');

        // 新增数据代码... (可以注释掉，避免重复创建)
        // const savedUser = await newUser.save();
        // const anotherUser = await User.create({...});
        // ...

        // === 开始查询数据 ===

        console.log('\n--- 开始查询用户数据 ---');

        // 1. 查询所有用户
        // Model.find({}) 返回集合中所有文档的数组
        try {
            const allUsers = await User.find({}); // {} 是查询条件对象，空对象表示没有条件
            console.log('所有用户:', allUsers);
        } catch (findErr) {
            console.error('查询所有用户失败:', findErr.message);
        }

        // 2. 根据条件查询用户
        // Model.find({ 条件对象 }) 返回所有符合条件的文档数组
        // 查询 age 大于等于 30 的用户
        try {
            const usersOver30 = await User.find({ age: { $gte: 30 } }); // $gte 是 MongoDB 查询操作符，表示 '大于等于'
            console.log('年龄 >= 30 的用户:', usersOver30);
        } catch (findErr) {
            console.error('查询年龄 >= 30 用户失败:', findErr.message);
        }

         // 查询 name 是 'Alice' 且 age 小于 30 的用户
         try {
             const specificUser = await User.find({ name: 'Alice', age: { $lt: 30 } }); // $lt 表示 '小于'
             console.log("姓名是 Alice 且年龄 < 30 的用户:", specificUser);
         } catch (findErr) {
             console.error("查询姓名是 Alice 且年龄 < 30 的用户失败:", findErr.message);
         }


        // 3. 查询符合条件的第一个用户
        // Model.findOne({ 条件对象 }) 只返回匹配到的第一个文档，如果没找到返回 null
        try {
            const firstUser = await User.findOne({ isActive: true });
            console.log('找到第一个活跃用户:', firstUser);
        } catch (findOneErr) {
            console.error('查询第一个活跃用户失败:', findOneErr.message);
        }

        // 4. 根据文档的 _id 查询 (每个 MongoDB 文档自动生成的唯一标识符)
        // Model.findById(id) 是 findOne({ _id: id }) 的简写
        // 你需要一个实际存在的 _id 值来测试
        // 例如，你可以从上面新增或查询返回的 savedUser 或 anotherUser 对象中获取 _id
        // 假设你知道一个用户的 _id (这里用一个示例，实际使用时应从数据库获取)
        const exampleUserId = '这里替换为你数据库中某个用户的实际_id字符串'; // !!! 替换成实际ID !!!
         if (exampleUserId !== '这里替换为你数据库中某个用户的实际_id字符串') {
             try {
                 const userById = await User.findById(exampleUserId);
                 console.log(`根据ID ${exampleUserId} 查询到的用户:`, userById);
             } catch (findByIdErr) {
                 console.error(`根据ID ${exampleUserId} 查询用户失败:`, findByIdErr.message);
             }
         } else {
             console.log('未提供实际的用户ID，跳过按ID查询示例。');
         }


        // 5. 链式查询：结合排序、字段选择、分页等
        // 查询所有用户，按 age 降序排列，只返回 name 和 email 字段
        try {
            const sortedAndSelectedUsers = await User.find({}) // 查找所有
                                                    .sort({ age: -1 }) // 按 age 字段排序，-1 表示降序，1 表示升序
                                                    .select('name email') // 选择返回 name 和 email 字段 (_id 默认也返回)
                                                    // .limit(2) // 可选：限制返回文档数量为 2
                                                    // .skip(1) // 可选：跳过前 1 个文档 (用于分页)
                                                    .exec(); // 执行查询 (使用 await 时 exec() 是可选的，加上更明确)
            console.log('用户按年龄降序，只显示姓名和邮箱:', sortedAndSelectedUsers);
        } catch (chainedQueryErr) {
            console.error('链式查询用户失败:', chainedQueryErr.message);
        }

        // === 查询数据结束 ===


    } catch (err) {
        console.error('连接 MongoDB 数据库失败:', err);
        process.exit(1);
    }
}

// ... 接下来的监听代码 ...
```

**代码说明:**

*   Mongoose 的查询方法（如 `find`, `findOne`, `findById`）通常都返回一个 Promise，因此可以使用 `await` 来等待查询结果。
*   `Model.find(queryConditions)`: 用于查找所有匹配 `queryConditions` 的文档。`queryConditions` 是一个对象，键值对对应字段和期望的值。你可以使用 MongoDB 的各种查询操作符（如 `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$nin`, `$regex` 等）在条件对象中构建更复杂的查询。
*   `Model.findOne(queryConditions)`: 与 `find` 类似，但只返回第一个匹配到的文档。如果没有任何文档匹配，返回 `null`。
*   `Model.findById(id)`: 根据文档的 `_id` 字段查找特定文档。这是 `findOne({ _id: id })` 的便捷方式。
*   **链式调用**: Mongoose 的查询方法返回一个 Query 对象，你可以在其上链式调用其他查询辅助方法，如：
    *   `.sort({ field: 1/-1 })`: 对结果进行排序。`1` 为升序，`-1` 为降序。
    *   `.select('field1 field2 -field3')`: 选择要返回或排除的字段。字段名前加 `-` 表示排除该字段。`_id` 字段默认返回，除非明确排除 (`- _id`)。
    *   `.limit(number)`: 限制返回文档的最大数量。
    *   `.skip(number)`: 跳过指定数量的文档（常用于分页）。
    *   `.exec()`: 执行链式查询。当使用 `await` 时，通常可以省略 `.exec()`，Mongoose 会自动执行。但加上它有时能让代码意图更清晰。

运行 `node app.js`，你应该能在控制台看到各种查询的结果。

### 7. 本章小结与使用场景

在这一章中，我们学习了 Mongoose 的基本入门知识，包括：

*   理解 Mongoose 作为 MongoDB 的 ODM 的作用。
*   如何在 Node.js 项目中安装 Mongoose。
*   如何连接到 MongoDB 数据库。
*   Mongoose 的核心概念：Schema (数据结构定义)、Model (操作数据库的工具)。
*   如何定义文档的 Schema，包括字段类型、必需性、唯一性、默认值等属性。
*   如何使用 Model 创建并保存新的文档到数据库 (Create)。
*   如何使用 Model 的不同方法从数据库中查询文档 (Read)，包括查询所有、按条件查询、按 ID 查询、以及使用链式方法进行排序和字段选择。

这些基础知识是你使用 Mongoose 进行后端开发的起点。

**基本使用场景:**

*   **用户注册:** 定义用户 Schema，使用 `User.create()` 保存新用户数据。
*   **博客列表页:** 定义文章 Schema，使用 `Article.find({})` 或 `Article.find({ status: 'published' })` 查询文章列表并显示。
*   **获取用户详情:** 使用 `User.findById(userId)` 根据用户ID获取用户的详细信息。
*   **查找特定数据:** 根据条件（如邮箱、用户名等）使用 `findOne` 或 `find` 查找符合条件的文档。

### 后续内容

下一章，我们将继续学习 Mongoose 的数据更新 (Update) 和删除 (Delete) 操作，以及更深入的查询技巧和数据验证的使用。

请确保你动手实践了本章的代码，这有助于你更好地理解 Mongoose 的工作方式。
