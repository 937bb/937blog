---
title: MongoDB 和 Mongoose 入门指南：事务 (Transactions) (第六章)
top_img: /images/post/mongodb/mongodb.jpg
cover: /images/post/mongodb/mongodb.jpg
categories:
  - MongoDB
tags:
  - 教程
  - MongoDB
abbrlink: 8212
date: '2025-06-09 17:15'
---

# MongoDB 和 Mongoose 入门指南：事务 (Transactions) (第六章)

欢迎来到 Mongoose 入门指南的第六章！在前面的章节中，我们学习了如何独立地执行创建、读取、更新和删除单个或多个文档的操作。

但在实际应用中，很多业务场景需要你执行一系列数据库操作，并且要保证这些操作是“原子性”的——要么全部成功，要么全部失败，不能出现部分成功部分失败的情况。例如，在一个转账场景中，需要从一个账户扣款，并给另一个账户加款。这两步操作必须同时成功或同时失败，否则就会出现资金丢失或凭空出现的问题。

在传统关系型数据库中，这种需求通常通过**事务 (Transactions)** 来实现。MongoDB 在 4.0 版本后引入了对多文档事务的支持，Mongoose 也提供了相应的功能来使用事务。

本章，我们将学习什么是 MongoDB 事务、为什么需要它，以及如何在 Mongoose 中使用事务来保证数据操作的原子性。



### 1. 为什么需要事务？

在 MongoDB 早期版本中，单个文档的操作是原子性的。这意味着当你修改一个文档时，这个修改要么完全发生，要么完全不发生，不会出现文档只修改了一半的情况。但是，如果你的业务逻辑需要修改**多个文档**，或者在执行多个操作时（比如先插入一个文档，再更新另一个文档），就无法保证原子性了。如果在这些操作执行过程中发生错误（比如网络中断、服务器崩溃等），数据就可能处于不一致的状态。

MongoDB 4.0 版本引入了**多文档事务 (Multi-document Transactions)**，允许你在**副本集 (Replica Set)** 或**分片集群 (Sharded Cluster)** 环境下，对多个文档（甚至跨多个集合和数据库）执行原子性操作。

**核心概念：**

*   **原子性 (Atomicity)**: 事务中的所有操作被视为一个不可分割的单元。要么所有操作都成功提交，对数据库可见；要么任何一个操作失败，整个事务被回滚 (rollback)，数据库回到事务开始前的状态。

### 2. MongoDB 事务的要求与工作原理

要使用 MongoDB 的事务，你的 MongoDB 部署必须是：

*   **副本集 (Replica Set)** 或 **分片集群 (Sharded Cluster)**。单节点 MongoDB 无法使用事务。
*   MongoDB 版本 4.0 或更高。

事务的工作原理大致是：

1.  开始一个事务 (`startTransaction`)。
2.  在事务中执行一系列读写操作。这些操作只在事务内部可见，不会立即影响数据库中的实际数据。
3.  如果所有操作都成功，提交事务 (`commitTransaction`)。此时，事务中的所有修改才会一次性地应用到数据库，并对其他客户端可见。
4.  如果在事务执行过程中发生错误，或者你决定取消事务，回滚事务 (`abortTransaction`)。此时，事务中的所有修改都会被丢弃，数据库保持原样。

### 3. 在 Mongoose 中使用事务

在 Mongoose 中使用事务，你需要通过一个 **会话 (Session)** 来进行。通过 Mongoose 连接获取一个会话后，你可以在这个会话上开始、提交和回滚事务，并在执行 Model 或 Document 操作时将该会话传递进去。

```javascript
// app.js (在 connectDB 函数内部，连接成功后)

// ... User Schema 和 Model 定义 ...
// 为了演示，假设我们还有一个 Account Model
const accountSchema = new mongoose.Schema({
    name: String,
    balance: {
        type: Number,
        default: 0,
        min: [0, '余额不能为负数'] // 添加验证
    }
});
const Account = mongoose.model('Account', accountSchema);
console.log('Account Model 创建完成.');

// ... 创建测试用户数据 ...
// 创建一些测试账户数据
async function setupAccounts() {
    await Account.deleteMany({}); // 清空账户
    await Account.create([
        { name: '张三的账户', balance: 1000 },
        { name: '李四的账户', balance: 500 }
    ]);
    console.log('已创建测试账户数据.');
}
// 在 connectDB 函数内部调用
// await setupAccounts();


// === 开始事务示例 ===
console.log('\n--- 开始事务示例 (转账场景) ---');

async function transfer(fromAccountName, toAccountName, amount) {
    // 1. 获取一个会话
    const session = await mongoose.startSession();

    try {
        // 2. 在会话中开始一个事务
        session.startTransaction();

        console.log(`\n开始从 "${fromAccountName}" 转账 ${amount} 到 "${toAccountName}"`);

        // 3. 在事务中执行操作
        // 查找转出账户 (注意传递 session)
        const fromAccount = await Account.findOne({ name: fromAccountName }).session(session);

        // 查找转入账户 (注意传递 session)
        const toAccount = await Account.findOne({ name: toAccountName }).session(session);

        // 检查账户是否存在
        if (!fromAccount || !toAccount) {
            throw new Error('转账账户不存在');
        }

        // 检查余额是否充足
        if (fromAccount.balance < amount) {
             throw new Error('余额不足');
        }

        // 从转出账户扣款
        fromAccount.balance -= amount;
        await fromAccount.save({ session }); // 保存时也传递 session

        // 给转入账户加款
        toAccount.balance += amount;
        await toAccount.save({ session }); // 保存时也传递 session

        // 4. 如果所有操作成功，提交事务
        await session.commitTransaction();
        console.log('事务提交成功：转账完成!');

    } catch (error) {
        // 5. 如果发生错误，回滚事务
        console.error('事务执行失败，回滚中...');
        await session.abortTransaction();
        console.error('事务已回滚:', error.message);

    } finally {
        // 6. 无论成功或失败，最后结束会话
        await session.endSession();
        console.log('会话已结束.');
    }
}

// 在 connectDB 函数内部调用转账示例
async function runTransactionDemo() {
     await setupAccounts(); // 确保账户数据存在

     console.log('\n转账前账户余额:');
     const accountsBefore = await Account.find({});
     console.log(accountsBefore);

     // 场景 1: 成功转账 100
     await transfer('张三的账户', '李四的账户', 100);

     console.log('\n成功转账后账户余额:');
     const accountsAfterSuccess = await Account.find({});
     console.log(accountsAfterSuccess);

     // 场景 2: 失败转账 (余额不足)
     await transfer('张三的账户', '李四的账户', 2000); // 张三只有 900了，不够转 2000

      console.log('\n失败转账后账户余额 (应不变):');
     const accountsAfterFailure = await Account.find({});
     console.log(accountsAfterFailure);
}

// 在 connectDB 函数成功连接并定义完 Model 后调用
// runTransactionDemo();


// === 事务示例结束 ===

    } catch (err) {
        console.error('MongoDB 数据库连接失败:', err);
        process.exit(1);
    }
}

connectDB();

// ... 后续的监听代码 ...
```

**代码说明:**

*   `mongoose.startSession()`: 获取一个新的客户端会话。这是一个异步操作，需要 `await`。
*   `session.startTransaction()`: 在获取到的会话上开始一个事务。
*   `.session(session)`: 在执行任何 Model 或 Query 操作（如 `find`, `findOne`, `create`, `updateOne`, `deleteOne` 等）时，通过链式调用 `.session()` 方法并将当前会话对象传递进去，告诉 Mongoose 这个操作属于哪个事务。
*   `document.save({ session })`: 在保存 Document 实例时，将 `{ session: session }` 作为 options 参数传递进去。
*   `session.commitTransaction()`: 提交事务。如果所有操作都成功，调用此方法将修改应用到数据库。这是一个异步操作。
*   `session.abortTransaction()`: 回滚事务。如果事务中有任何操作失败，调用此方法将撤销所有修改。这是一个异步操作。
*   `session.endSession()`: 结束会话。事务完成后，无论成功或失败，都应该调用 `endSession()` 释放资源。通常放在 `finally` 块中确保执行。
*   **错误处理**: 务必使用 `try...catch` 块来包围事务中的操作。在 `catch` 块中，你需要调用 `session.abortTransaction()` 来回滚事务。
*   **先查后改**: 在事务中更新文档时，推荐使用“先查找，再修改 Document 实例，最后保存”的方式（如示例中的 `findOne` 后跟 `save`），而不是直接使用 Model 的更新方法（如 `updateOne`），因为直接更新方法可能不会触发 Schema 的验证和中间件，并且在事务中处理复杂逻辑时，操作 Document 实例更灵活。如果使用 `findOneAndUpdate` 等方法，需要确保它在事务中正确执行且符合预期。

### 4. 事务的使用场景

事务是保证多个操作原子性的关键，适用于以下场景：

*   **资金转移:** 从一个账户扣款，给另一个账户加款。
*   **订单处理:** 创建订单、减少商品库存、生成支付记录等多个步骤。
*   **库存管理:** 销售商品时，减少商品库存，同时增加销售记录，并可能触发其他相关的库存调整。
*   **注册流程:** 创建用户记录，同时创建用户的初始钱包、积分记录等。
*   **复杂数据更新:** 需要同时修改多个相互关联的文档，确保它们状态一致。

### 5. 本章小结

在这一章中，我们学习了 Mongoose 中如何使用 MongoDB 的**事务 (Transactions)** 功能：

*   理解了为什么在处理多个文档操作时需要事务来保证原子性。
*   了解了 MongoDB 事务的基本要求（副本集/分片集群）和工作原理（会话、开始、提交、回滚）。
*   掌握了在 Mongoose 中使用事务的关键步骤：获取会话 (`mongoose.startSession()`)、开始事务 (`session.startTransaction()`)、在操作中传递会话 (`.session(session)` 或 `{ session }`)、提交事务 (`session.commitTransaction()`)、回滚事务 (`session.abortTransaction()`)、结束会话 (`session.endSession()`)。
*   通过转账的示例，理解了如何在实际场景中应用事务以及如何处理事务中的错误。

掌握事务，意味着你能够构建更加可靠、数据一致性更强的 Node.js 应用。

### 6. 参考资料

深入理解 MongoDB 事务及其在 Mongoose 中的使用，查阅官方文档至关重要。以下是一些推荐的参考资料，尽量使用在中国大陆可访问的官方地址，并按照您喜欢的样式组织：

## 📘 七、参考资料

*   📘 **Mongoose 官方文档**：[https://mongoosejs.com/docs/](https://mongoosejs.com/docs/) (Mongoose 的全面指南)
*   📘 **Mongoose Transactions 文档**：[https://mongoosejs.com/docs/transactions.html](https://mongoosejs.com/docs/transactions.html) (专门介绍 Mongoose 中如何使用事务的详细用法和示例)
*   📘 **MongoDB Transactions 文档**：[https://www.mongodb.com/docs/manual/core/transactions/](https://www.mongodb.com/docs/manual/core/transactions/) (MongoDB 官方关于多文档事务最权威的文档，理解底层原理，虽然是英文的)
*   📘 **MongoDB Node.js 驱动事务文档**：[https://www.mongodb.com/docs/drivers/node/current/usage-examples/transactions/](https://www.mongodb.com/docs/drivers/node/current/usage-examples/transactions/) (Mongoose 基于官方 Node.js 驱动，了解驱动层面的事务使用也有帮助)

*   推荐阅读：
    *   📘 **《MongoDB 权威指南》**：深入理解 MongoDB 本身的高级功能，包括事务的实现细节和限制。
    *   📘 **相关的技术博客和教程**：搜索 "MongoDB 事务 Node.js Mongoose" 可以找到一些中文社区的实践经验分享。

---

恭喜你完成了 Mongoose 入门指南的第六章！我们学习了如何使用事务保证复杂操作的数据一致性。

还有许多其他有趣的 Mongoose 和 MongoDB 主题可以探索，比如错误处理的最佳实践、连接池的优化、高级 Schema 类型、以及部署和性能调优等。我们可以根据你的兴趣决定下一章的内容方向。