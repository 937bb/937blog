---
title: MongoDB 和 Mongoose 入门指南：数据更新与删除 (第二章)
top_img: /images/post/mongodb/mongodb.jpg
cover: /images/post/mongodb/mongodb.jpg
categories:
  - MongoDB
tags:
  - 教程
  - MongoDB
abbrlink: 8208
date: '2025-06-09 14:31'
---

# MongoDB 和 Mongoose 入门指南：数据更新与删除 (第二章)

欢迎来到 Mongoose 入门指南的第二章！在[上一章](./{{ config.source_dir }}/_posts/MongoDB和Mongoose入门指南：基础连接、Schema与CRUD (第一章).md)中，我们学习了 Mongoose 的基本概念，包括连接数据库、定义 Schema 和 Model，以及如何进行数据的创建 (Create) 和读取 (Read)。

本章，我们将继续深入，学习如何修改已有的数据（**更新 - Update**）和移除不再需要的数据（**删除 - Delete**）。掌握这些操作，你就能完成数据库的四种基本操作，即 CRUD (Create, Read, Update, Delete) 中的 U 和 D 了！



### 1. 回顾与准备

在开始之前，请确保你已经完成了第一章的环境准备，并且有一个可以连接的 MongoDB 数据库。我们将继续使用第一章中创建的 `app.js` 文件结构和 `User` Model。

你的 `app.js` 文件应该包含连接数据库的代码，以及 `userSchema` 和 `User` Model 的定义，像这样：

```javascript
// app.js

const mongoose = require('mongoose');

const dbURI = 'mongodb://localhost:27017/myMongooseDatabase';

async function connectDB() {
    try {
        await mongoose.connect(dbURI, { /* options */ });
        console.log('MongoDB 数据库连接成功!');

        // === Schema 和 Model 定义 ===
        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            age: { type: Number, min: 0, max: 120 },
            email: { type: String, required: true, unique: true, lowercase: true },
            registerDate: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true }
        });
        const User = mongoose.model('User', userSchema);
        console.log('用户 Schema 和 Model 已加载.');

        // === 在这里进行后续的更新和删除操作 ===
        // 为了演示，我们先确保数据库里有一些用户数据
        await User.deleteMany({}); // 清空之前的测试数据 (可选，方便每次运行脚本从头开始)
        await User.create([ // 创建一些用于测试的用户
            { name: 'Alice', age: 28, email: 'alice@example.com' },
            { name: 'Bob', age: 35, email: 'bob@example.com' },
            { name: 'Charlie', age: 22, email: 'charlie@example.com' },
            { name: 'David', age: 35, email: 'david@example.com', isActive: false }
        ]);
        console.log('已创建测试用户.');

        // 现在，我们可以开始更新和删除操作了...

    } catch (err) {
        console.error('MongoDB 数据库连接失败:', err);
        process.exit(1);
    }
}

connectDB();

// ... 后续的监听代码 ...
```

**注意:** 上面的代码中增加了 `deleteMany({})` 和 `create([...])` 来清空并填充一些测试数据，方便我们演示更新和删除操作。在实际应用中，你不会每次运行都清空数据库。

### 2. 更新数据：修改文档 (Update)

更新数据是指修改数据库中已有的文档。Mongoose Model 提供了多种更新方法，可以根据需求选择：

*   **`Model.updateOne(filter, update, options)`**: 更新**第一条**匹配 `filter` 条件的文档。
*   **`Model.updateMany(filter, update, options)`**: 更新**所有**匹配 `filter` 条件的文档。
*   **`Model.findByIdAndUpdate(id, update, options)`**: 根据指定的 `_id` 查找并更新文档。这是一个常用的方法，因为它结合了查找和更新两个步骤。
*   **`Model.findOneAndUpdate(filter, update, options)`**: 根据 `filter` 条件查找**第一条**匹配的文档并更新。类似于 `findByIdAndUpdate`，但不限于按 `_id` 查找。

这些方法通常需要使用 MongoDB 的**更新操作符 (Update Operators)** 来指定如何修改字段，最常用的有：

*   `$set`: 设置字段的值。
*   `$inc`: 增加数字字段的值。
*   `$unset`: 移除一个字段。
*   `$push`: 向数组字段添加元素。
*   `$pull`: 从数组字段移除特定元素。
*   等等... (MongoDB 文档中有完整的操作符列表)

下面是使用这些更新方法的示例：

```javascript
// app.js (在 connectDB 函数内部，测试数据创建完成后)

// ... Schema, Model 定义和测试数据创建代码 ...

// === 开始更新数据 ===
console.log('\n--- 开始更新用户数据 ---');

// 场景 1: 使用 updateOne 更新单个文档
// 将名字为 'Alice' 的用户的年龄修改为 29
try {
    // updateOne 返回一个对象，包含匹配和修改的数量等信息
    const updateOneResult = await User.updateOne(
        { name: 'Alice' },       // filter: 查询条件
        { $set: { age: 29 } }     // update: 使用 $set 操作符更新 age 字段
    );
    console.log('updateOne 更新结果:', updateOneResult); // { acknowledged: true, modifiedCount: 1, ... }

    // 验证更新是否成功 (可选)
    const aliceAfterUpdate = await User.findOne({ name: 'Alice' });
    console.log('更新后 Alice 的信息:', aliceAfterUpdate);

} catch (updateErr) {
    console.error('updateOne 更新失败:', updateErr.message);
}

// 场景 2: 使用 updateMany 更新多个文档
// 将年龄大于等于 35 岁的所有用户设置为非活跃状态 isActive: false
try {
    const updateManyResult = await User.updateMany(
        { age: { $gte: 35 } }, // filter: 查询年龄 >= 35 的用户
        { $set: { isActive: false } } // update: 设置 isActive 为 false
    );
    console.log('updateMany 更新结果:', updateManyResult); // { acknowledged: true, modifiedCount: 2, ... }

    // 验证更新是否成功 (可选)
    const usersOver35AfterUpdate = await User.find({ age: { $gte: 35 } });
    console.log('更新后年龄 >= 35 的用户:', usersOver35AfterUpdate);

} catch (updateManyErr) {
    console.error('updateMany 更新失败:', updateManyErr.message);
}

// 场景 3: 使用 findByIdAndUpdate 根据 ID 更新并获取更新后的文档
// 假设你知道 Charlie 的 _id (通常从查询结果中获得)
// 我们先查找到 Charlie 的文档，然后使用它的 _id
try {
    const charlie = await User.findOne({ name: 'Charlie' });
    if (charlie) {
        console.log('找到 Charlie:', charlie);
        // 更新 Charlie 的年龄为 23，邮箱为新的，并获取更新后的文档
        // 注意 options: { new: true }，这会返回更新后的文档，默认返回更新前的文档
        const updatedCharlie = await User.findByIdAndUpdate(
            charlie._id,                    // id: Charlie 的 _id
            { $set: { age: 23, email: 'charlie.new@example.com' } }, // update: 更新内容
            { new: true }                   // options: 返回更新后的文档
        );
        console.log('通过 findByIdAndUpdate 更新 Charlie 成功:', updatedCharlie);
    } else {
        console.log('未找到 Charlie 用户，无法演示 findByIdAndUpdate.');
    }

} catch (findByIdUpdateErr) {
    console.error('findByIdAndUpdate 更新 Charlie 失败:', findByIdUpdateErr.message);
}

// 场景 4: 使用 findOneAndUpdate 根据条件更新并获取更新前的文档 (默认行为)
// 查找第一个非活跃用户，将其设置为活跃，并获取更新前的文档
try {
    const oldInactiveUser = await User.findOneAndUpdate(
        { isActive: false }, // filter: 查找非活跃用户
        { $set: { isActive: true } } // update: 设置为活跃
        // { new: false } // options: 这是默认行为，可以省略
    );
    console.log('通过 findOneAndUpdate 将非活跃用户设为活跃，返回更新前的文档:', oldInactiveUser); // oldInactiveUser.isActive 仍然是 false

    // 验证更新是否成功 (可选)
    const userAfterFindOneUpdate = await User.findById(oldInactiveUser._id);
    console.log('该用户更新后的状态:', userAfterFindOneUpdate); // userAfterFindOneUpdate.isActive 应该是 true

} catch (findOneAndUpdateErr) {
    console.error('findOneAndUpdate 更新失败:', findOneAndUpdateErr.message);
}


// === 更新数据结束 ===

// ... 后续的删除代码将放在这里 ...

```

**代码说明:**

*   **`filter` 对象**: 用来指定要更新哪些文档，语法与查询时的条件对象相同。
*   **`update` 对象**: 使用 MongoDB 的更新操作符 (`$set`, `$inc` 等) 来定义如何修改数据。`$set` 是最常用的，用来直接设定字段的新值。
*   **`options` 对象**: 提供了额外的配置项，例如 `{ new: true }` 用于让 `findByIdAndUpdate` 和 `findOneAndUpdate` 返回更新**后**的文档（默认为更新**前**）。
*   `updateOne` 和 `updateMany` 方法返回的是一个表示操作结果的对象，通常包含 `acknowledged` (是否被确认) 和 `modifiedCount` (实际修改的文档数量) 等信息。它们**不返回**被更新的文档本身。
*   `findByIdAndUpdate` 和 `findOneAndUpdate` 方法返回的是被更新的文档（取决于 `new` 选项），如果找不到匹配的文档，则返回 `null`。

### 3. 删除数据：移除文档 (Delete)

删除数据是指从集合中移除文档。Mongoose 也提供了多种删除方法：

*   **`Model.deleteOne(filter)`**: 删除**第一条**匹配 `filter` 条件的文档。
*   **`Model.deleteMany(filter)`**: 删除**所有**匹配 `filter` 条件的文档。
*   **`Model.findByIdAndDelete(id)`**: 根据指定的 `_id` 查找并删除文档。
*   **`Model.findOneAndDelete(filter)`**: 根据 `filter` 条件查找**第一条**匹配的文档并删除。

下面是使用这些删除方法的示例：

```javascript
// app.js (在 connectDB 函数内部，更新操作完成后)

// ... Schema, Model 定义，测试数据创建和更新代码 ...

// === 开始删除数据 ===
console.log('\n--- 开始删除用户数据 ---');

// 场景 1: 使用 deleteOne 删除单个文档
// 删除名字为 'Alice' 的用户
try {
    // deleteOne 返回一个对象，包含删除数量等信息
    const deleteOneResult = await User.deleteOne({ name: 'Alice' });
    console.log('deleteOne 删除结果:', deleteOneResult); // { acknowledged: true, deletedCount: 1 }

    // 验证删除是否成功 (可选)
    const aliceAfterDelete = await User.findOne({ name: 'Alice' });
    console.log('删除 Alice 后查询结果:', aliceAfterDelete); // 应该是 null

} catch (deleteErr) {
    console.error('deleteOne 删除失败:', deleteErr.message);
}

// 场景 2: 使用 deleteMany 删除多个文档
// 删除所有年龄小于 25 岁的用户
try {
    const deleteManyResult = await User.deleteMany({ age: { $lt: 25 } }); // $lt 表示 '小于'
    console.log('deleteMany 删除结果:', deleteManyResult); // { acknowledged: true, deletedCount: ... }

    // 验证删除是否成功 (可选)
    const usersUnder25AfterDelete = await User.find({ age: { $lt: 25 } });
    console.log('删除年龄 < 25 用户后查询结果:', usersUnder25AfterDelete); // 应该是空数组 []

} catch (deleteManyErr) {
    console.error('deleteMany 删除失败:', deleteManyErr.message);
}

// 场景 3: 使用 findByIdAndDelete 根据 ID 删除并获取被删除的文档
// 查找名字为 'Bob' 的用户，然后根据其 ID 删除
try {
    const bob = await User.findOne({ name: 'Bob' });
    if (bob) {
        console.log('找到 Bob:', bob);
        // 根据 Bob 的 _id 删除用户
        const deletedBob = await User.findByIdAndDelete(bob._id);
        console.log('通过 findByIdAndDelete 删除 Bob 成功，返回被删除的文档:', deletedBob);

        // 验证删除是否成功 (可选)
        const bobAfterFindByIdDelete = await User.findById(bob._id);
        console.log('删除 Bob 后查询结果:', bobAfterFindByIdDelete); // 应该是 null

    } else {
         console.log('未找到 Bob 用户，无法演示 findByIdAndDelete.');
    }

} catch (findByIdDeleteErr) {
    console.error('findByIdAndDelete 删除 Bob 失败:', findByIdDeleteErr.message);
}

// 场景 4: 使用 findOneAndDelete 根据条件删除并获取被删除的文档
// 查找第一个非活跃用户并删除它 (如果还有非活跃用户的话，比如 David)
try {
     // 注意：如果之前 updateMany 已经把所有年龄 >= 35 的用户设为非活跃，这里可能删除的是 David
     // 如果 David 在 deleteMany({ age: { $lt: 25 } }) 中未被删除
    const deletedInactiveUser = await User.findOneAndDelete({ isActive: false });
    if (deletedInactiveUser) {
         console.log('通过 findOneAndDelete 删除非活跃用户成功，返回被删除的文档:', deletedInactiveUser);

        // 验证删除是否成功 (可选)
        const inactiveUserAfterFindOneDelete = await User.findById(deletedInactiveUser._id);
        console.log('删除非活跃用户后查询结果:', inactiveUserAfterFindOneDelete); // 应该是 null

    } else {
        console.log('未找到非活跃用户，无法演示 findOneAndDelete.');
    }

} catch (findOneDeleteErr) {
    console.error('findOneAndDelete 删除失败:', findOneDeleteErr.message);
}


// === 删除数据结束 ===


    } catch (err) {
        console.error('MongoDB 数据库连接失败:', err);
        process.exit(1);
    }
}

// ... 接下来的监听代码 ...
```

**代码说明:**

*   **`filter` 对象**: 用来指定要删除哪些文档，语法与查询和更新时的条件对象相同。
*   `deleteOne` 和 `deleteMany` 方法返回的是一个表示操作结果的对象，通常包含 `acknowledged` 和 `deletedCount` (实际删除的文档数量) 等信息。它们**不返回**被删除的文档本身。
*   `findByIdAndDelete` 和 `findOneAndDelete` 方法返回的是被删除的文档，如果找不到匹配的文档，则返回 `null`。它们结合了查找和删除两个步骤。

### 4. 更新与删除的使用场景

本章学到的更新和删除操作在实际应用中非常常见：

*   **更新用户信息:** 用户修改自己的昵称、年龄、密码等，使用 `findByIdAndUpdate` 或 `findOneAndUpdate`。
*   **修改文章内容:** 编辑博客文章，使用 `findByIdAndUpdate` 更新文章标题、内容等字段。
*   **批量修改状态:** 将一批订单标记为已发货，使用 `updateMany`。将所有用户的活跃状态设置为 false（例如在用户被禁用时）。
*   **删除用户账户:** 用户注销账户，使用 `findByIdAndDelete` 或 `deleteOne`。
*   **清除过期数据:** 定期删除注册后长时间未激活的用户或过期的临时数据，使用 `deleteMany`。
*   **移除特定内容:** 删除某条评论、某个产品信息等，使用 `deleteOne` 或 `findByIdAndDelete`。

### 5. 本章小结

在这一章中，我们学习了 Mongoose 的数据更新 (Update) 和删除 (Delete) 操作：

*   学习了 Mongoose Model 提供的多种更新方法 (`updateOne`, `updateMany`, `findByIdAndUpdate`, `findOneAndUpdate`)。
*   了解了如何使用 MongoDB 的更新操作符（如 `$set`）来指定更新内容。
*   学习了 Mongoose Model 提供的多种删除方法 (`deleteOne`, `deleteMany`, `findByIdAndDelete`, `findOneAndDelete`)。
*   理解了不同更新和删除方法的返回值和使用场景。
*   通过代码示例实践了这些操作。

你现在已经掌握了使用 Mongoose 进行数据库基本 CRUD 操作的所有核心方法！

### 后续内容

在接下来的章节中，我们将探讨更高级的 Mongoose 特性，例如：

*   深入学习更多查询技巧和操作符。
*   数据验证 (Validation) 的更多细节。
*   如何处理文档之间的关系 (Population)。
*   Mongoose 的中间件 (Middleware)。
*   以及如何在实际项目中组织 Mongoose 代码。

继续加油！动手实践是学习数据库操作的关键。

---