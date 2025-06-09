---
title: MongoDB 和 Mongoose 入门指南：聚合管道 (Aggregation Pipeline) (第五章)
top_img: /images/post/mongodb/mongodb.jpg
cover: /images/post/mongodb/mongodb.jpg
categories:
  - MongoDB
tags:
  - 教程
  - MongoDB
abbrlink: 8211
date: '2025-06-09 16:05'
---

# MongoDB 和 Mongoose 入门指南：聚合管道 (Aggregation Pipeline) (第五章)

欢迎来到 Mongoose 入门指南的第五章！在前面的章节里，我们学习了如何连接数据库、定义数据结构、执行基础的 CRUD 操作，以及如何使用 Population 处理文档之间的关联，还探讨了索引、虚拟属性、静态方法和实例方法等进阶特性。

现在，我们要介绍一个在 MongoDB 中进行复杂数据处理和分析的强大工具——**聚合管道 (Aggregation Pipeline)**。Mongoose 提供了便捷的方式来使用它。

本章，我们将学习什么是聚合管道、为什么需要它，以及如何在 Mongoose 中使用它来执行一些常见的数据分析任务。


### 1. 什么是聚合 (Aggregation)？为什么需要它？

简单的 `find()` 查询可以帮助我们查找符合特定条件的文档。但是，如果我们需要执行更复杂的操作，比如：

*   计算某个字段的平均值、总和、最大值、最小值。
*   按某个字段分组，然后对每组进行统计。
*   重构文档的结构，只保留或重命名字段。
*   将多个集合的数据关联起来进行处理。
*   对数据进行一系列的转换和过滤。

这时，简单的 `find()` 方法就力不从心了。这就是 **聚合 (Aggregation)** 的用武之地。

MongoDB 的聚合框架基于**管道 (Pipeline)** 的概念。你可以把它想象成一个数据处理的流水线。数据（文档）从管道的一端流入，经过一系列**阶段 (Stages)** 的处理，最后从另一端流出经过转换或汇总的结果。每个阶段都对输入的数据进行特定的操作，并将结果作为输入传递给下一个阶段。

**为什么需要它？**

*   **强大的数据分析能力:** 可以进行复杂的统计计算、分组、排序等。
*   **灵活的数据转换:** 可以重构文档结构，将数据整理成你需要的格式。
*   **高效:** 聚合管道通常在 MongoDB 服务器端执行，可以利用索引等优化手段，比在应用代码中手动处理数据更高效。

### 2. 聚合管道的基本概念：阶段 (Stages)

聚合管道由一个或多个阶段组成。每个阶段都是一个特定的操作，以 `$ + 阶段名称` 的形式表示（例如 `$match`, `$group`, `$project`）。以下是一些常用的聚合阶段：

*   `$match`: **过滤文档**。类似于 `find()` 方法的查询条件，用来筛选进入下一个阶段的文档。应尽可能放在管道的前面，以便快速减少处理的数据量。
*   `$group`: **按指定字段分组**。对输入的文档进行分组，并可以使用累加器操作符（如 `$sum`, `$avg`, `$max`, `$min`, `$push`, `$addToSet`）对每组进行计算。
*   `$project`: **重构文档结构**。用来选择、重命名字段，或创建新的计算字段。可以用来隐藏 `_id` 字段等。
*   `$sort`: **对文档进行排序**。类似于 `sort()` 方法。
*   `$limit`: **限制返回的文档数量**。类似于 `limit()` 方法。
*   `$skip`: **跳过指定数量的文档**。类似于 `skip()` 方法，常用于分页。
*   `$lookup`: **执行左外连接**。用于将当前集合的文档与另一个集合的文档进行关联，非常类似于关系型数据库的 JOIN 操作。
*   `$unwind`: **展开数组字段**。如果文档中包含数组，`$unwind` 可以将数组中的每个元素都转换成一个独立的文档，常用于数组的处理和分组。

这只是部分常用的阶段，MongoDB 聚合管道还有很多其他阶段用于更复杂的场景。

### 3. 在 Mongoose 中使用聚合管道

Mongoose Model 提供了一个 `aggregate()` 方法来执行聚合管道操作。它接收一个包含聚合阶段的数组作为参数。

```javascript
// app.js (在 connectDB 函数内部，连接成功后)

// ... User Schema 和 Model 定义 (如前几章包含索引的) ...
// ... Post Schema 和 Model 定义 (如第四章包含 author ref 的) ...
// ... 创建测试数据 (确保 User 和 Post Model 都可用且有数据) ...

// === 开始聚合管道示例 ===
console.log('\n--- 开始聚合管道示例 ---');

// 场景 1: 计算所有用户的平均年龄
try {
    const result = await User.aggregate([
        // 阶段 1: 不需要过滤，所有文档都进入管道
        // 阶段 2: $group 按一个常量分组 (null 或某个固定的值，这里用 null) 来对所有文档进行聚合计算
        {
            $group: {
                _id: null, // 按 null 分组意味着不分组，对所有文档进行一次聚合
                averageAge: { $avg: '$age' } // 计算 age 字段的平均值，使用 $avg 累加器，'$age' 表示age字段的值
            }
        },
        // 阶段 3: $project 重构输出，移除 _id 字段，只保留 averageAge
        {
            $project: {
                _id: 0, // 0 表示排除该字段
                averageAge: 1 // 1 表示包含该字段
            }
        }
    ]);
    console.log('所有用户的平均年龄:', result.length > 0 ? result[0].averageAge : '无数据'); // 结果是数组，取第一个元素的 averageAge

} catch (err) {
    console.error('计算平均年龄失败:', err.message);
}

// 场景 2: 按活跃状态分组，计算每组的用户数量
try {
    const result = await User.aggregate([
        // 阶段 1: $group 按 isActive 字段分组
        {
            $group: {
                _id: '$isActive', // 按 isActive 字段的值分组 (true 或 false)
                count: { $sum: 1 } // 计算每组的文档数量，$sum: 1 是一种计算数量的常用方式
            }
        },
        // 阶段 2: $sort 按 _id (即活跃状态) 排序 (可选)
        {
            $sort: { _id: 1 }
        },
        // 阶段 3: $project 可以重命名 _id 字段，让输出更清晰
         {
             $project: {
                 _id: 0, // 排除原始 _id
                 isActive: '$_id', // 将 _id (活跃状态) 重命名为 isActive
                 count: 1
             }
         }
    ]);
    console.log('按活跃状态分组的用户数量:', result); // [{ isActive: false, count: 1 }, { isActive: true, count: 3 }]

} catch (err) {
    console.error('按活跃状态分组失败:', err.message);
}

// 场景 3: 查找年龄大于等于 30 的用户，并按年龄降序排列，只保留姓名和年龄
// 这个场景虽然可以用 find + sort + select 实现，但用聚合也能做，演示阶段用法
try {
    const result = await User.aggregate([
        // 阶段 1: $match 过滤年龄 >= 30 的用户
        {
            $match: { age: { $gte: 30 } }
        },
        // 阶段 2: $sort 按年龄降序
        {
            $sort: { age: -1 }
        },
        // 阶段 3: $project 只保留姓名和年龄
        {
            $project: {
                _id: 0,
                name: 1,
                age: 1
            }
        }
    ]);
    console.log('年龄 >= 30 的用户 (按年龄降序，只保留姓名和年龄):', result);

} catch (err) {
    console.error('复杂查询失败 (聚合):', err.message);
}


// 场景 4: 使用 $lookup 进行跨集合关联 (演示 Post 关联 User)
// 查询每篇文章，并关联作者的姓名
try {
    const result = await Post.aggregate([
        // 阶段 1: $lookup 执行关联操作
        {
            $lookup: {
                from: 'users',       // 要关联的另一个集合的名称 (注意：这里是实际的集合名 'users'，不是 Model 名 'User')
                localField: 'author', // 当前集合 (posts) 中用于关联的字段 (存储的是 users 的 _id)
                foreignField: '_id', // 另一个集合 (users) 中与 localField 匹配的字段 (这里是 _id)
                as: 'authorInfo'     // 将关联到的文档存储到当前文档中的新字段名
            }
        },
        // $lookup 阶段会向每个 Post 文档添加一个名为 authorInfo 的数组字段，
        // 数组中包含匹配到的 User 文档 (通常只有一个，因为 author 字段是单值)

        // 阶段 2: $unwind 展开 authorInfo 数组 (如果确保只有一个匹配项，展开后更方便访问)
        // 注意：如果 author 字段在某些文档中可能没有对应用户，使用 { preserveNullAndEmptyArrays: true } 可以保留这些文档
        {
             $unwind: {
                 path: '$authorInfo',
                 preserveNullAndEmptyArrays: true // 保留那些没有匹配到作者的文章
             }
        },

        // 阶段 3: $project 重构输出，保留文章字段，并从 authorInfo 中获取作者姓名
        {
            $project: {
                _id: 1, // 保留文章的 _id
                title: 1,
                content: 1,
                createdAt: 1,
                // 访问展开后的 authorInfo 对象中的 name 字段
                authorName: '$authorInfo.name',
                authorEmail: '$authorInfo.email',
                // 也可以保留原始 author ObjectId，如果需要的话
                // authorId: '$author'
            }
        },
        // 阶段 4: $sort (可选) 按创建日期降序
        {
            $sort: { createdAt: -1 }
        }
    ]);
    console.log('查询文章并关联作者姓名 (聚合 $lookup):', result);
    // 结果示例：[{ _id: ..., title: '...', authorName: 'Alice', ... }, ...]

} catch (err) {
    console.error('聚合 $lookup 查询失败:', err.message);
}


// 场景 5: 按作者分组，计算每个作者的文章数量 ($group + $lookup)
try {
     const result = await Post.aggregate([
         // 阶段 1: $group 按 author _id 分组，计算每组文章数量
         {
             $group: {
                 _id: '$author', // 按作者 _id 分组
                 postCount: { $sum: 1 }, // 计算每组文章数量
                 // 也可以获取每组文章的标题列表等
                 // postTitles: { $push: '$title' }
             }
         },
         // 阶段 2: $lookup 关联 User 集合，获取作者信息
         {
             $lookup: {
                 from: 'users',
                 localField: '_id', // $group 阶段输出的 _id (即作者 _id)
                 foreignField: '_id',
                 as: 'authorInfo'
             }
         },
         // 阶段 3: $unwind 展开作者信息数组
         {
             $unwind: {
                 path: '$authorInfo',
                 preserveNullAndEmptyArrays: true
             }
         },
         // 阶段 4: $project 重构输出，保留统计信息，并从作者信息中获取姓名
         {
             $project: {
                 _id: 0, // 排除原始 _id
                 authorId: '$_id', // 保留作者 _id
                 postCount: 1,
                 authorName: '$authorInfo.name',
                 authorEmail: '$authorInfo.email'
             }
         },
         // 阶段 5: $sort (可选) 按文章数量降序
         {
             $sort: { postCount: -1 }
         }
     ]);
     console.log('按作者分组计算文章数量:', result);
     // 结果示例：[{ authorId: ..., postCount: 2, authorName: 'Alice', ... }, ...]

} catch (err) {
     console.error('按作者分组计算文章数量失败:', err.message);
}


// === 聚合管道示例结束 ===


    } catch (err) {
        console.error('MongoDB 数据库连接失败:', err);
        process.exit(1);
    }
}

connectDB();

// ... 后续的监听代码 ...
```

**代码说明:**

*   `Model.aggregate([...stages...])`: 这是在 Mongoose 中执行聚合管道的方法。它接收一个数组，数组的每个元素代表管道中的一个阶段。
*   `$match`: 用于过滤文档，语法与 `find()` 的查询条件对象相似。
*   `$group`: 按 `_id` 指定的表达式对文档进行分组。`_id: null` 或常量表示对所有文档分组。`_id: '$fieldName'` 表示按 `fieldName` 字段的值分组。在 `$group` 阶段内部，可以使用累加器操作符（如 `$sum`, `$avg`, `$max`, `$min`, `$push`, `$addToSet`）来计算每组的汇总值。
*   `$project`: 用于选择、排除或重构字段。`fieldName: 1` 包含字段，`fieldName: 0` 排除字段。你可以用 `$fieldName` 来引用输入文档中的字段。
*   `$sort`, `$limit`, `$skip`: 与 `find` 方法的链式调用作用类似，但在聚合管道中使用它们作为单独的阶段。
*   `$lookup`: 用于执行跨集合的左外连接。
    *   `from`: 指定要连接的另一个集合的名称（**注意是实际集合名，不是 Model 名**）。
    *   `localField`: 当前集合中用于匹配的字段。
    *   `foreignField`: `from` 指定的集合中与 `localField` 匹配的字段。
    *   `as`: 指定一个新字段名，用于存储匹配到的文档（一个数组）。
*   `$unwind`: 用于将数组字段“展开”，为数组中的每个元素创建一个新的输出文档。这在 `$lookup` 后处理关联结果或处理存储数组的字段时非常有用。`preserveNullAndEmptyArrays: true` 选项很重要，它可以保留那些待展开字段为 null、空数组或不存在的文档，否则这些文档会被丢弃。

### 4. 聚合管道的使用场景

聚合管道非常适合以下场景：

*   **统计报表:** 计算用户总数、文章平均阅读时长、每日/每周/每月新增用户数等。
*   **数据分析:** 按地区、年龄段、活跃度等维度分析用户分布，分析最受欢迎的文章分类等。
*   **复杂查询:** 需要在多个集合之间关联数据并进行过滤、分组、排序的场景（使用 `$lookup`）。
*   **数据转换:** 将原始文档结构转换为报表所需的扁平或汇总结构。
*   **推荐系统基础:** 计算用户或物品之间的相似度（可能需要结合 `$group` 和其他操作符）。

虽然它的语法比简单的 `find` 复杂一些，但一旦掌握，它将成为你处理 MongoDB 数据最有力的工具之一。

### 5. 本章小结

在这一章中，我们学习了 Mongoose 中执行复杂数据分析和转换的核心工具 - **聚合管道 (Aggregation Pipeline)**：

*   理解了为什么需要聚合管道，以及它与简单查询的区别。
*   学习了聚合管道的基本概念：阶段 (Stages)。
*   了解并实践了几个常用的聚合阶段，如 `$match`, `$group`, `$project`, `$sort`, `$limit`, `$skip`。
*   特别学习了如何使用 `$lookup` 进行跨集合的关联操作，以及使用 `$unwind` 处理数组字段。
*   掌握了在 Mongoose 中如何使用 `Model.aggregate([...stages...])` 方法来执行聚合管道。
*   通过具体的代码示例理解了如何组合不同的阶段来完成数据分析任务。

掌握聚合管道，你就能够充分发挥 MongoDB 的数据处理能力，执行各种复杂的统计和分析任务。

### 6. 参考资料

在深入学习聚合管道时，查阅官方文档和实践非常关键。以下是一些推荐的参考资料，尽量使用在中国大陆可访问的官方地址，并按照您喜欢的样式组织：

## 📘 参考资料

*   📘 **Mongoose 官方文档**：[https://mongoosejs.com/docs/](https://mongoosejs.com/docs/) (Mongoose 的全面指南)
*   📘 **Mongoose Aggregation 文档**：[https://mongoosejs.com/docs/api/aggregate.html](https://mongoosejs.com/docs/api/aggregate.html) 或 [https://mongoosejs.com/docs/guide.html#aggregation](https://mongoosejs.com/docs/guide.html#aggregation) (Mongoose 中使用聚合的详细介绍)
*   📘 **MongoDB Aggregation Pipeline 文档**：[https://www.mongodb.com/docs/manual/core/aggregation-pipeline/](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/) (这是 MongoDB 官方关于聚合管道最权威的文档，包含了所有阶段和操作符的详细说明，虽然是英文的，但例子很清晰)
*   📘 **MongoDB 聚合管道操作符手册**：[https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/](https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/) (详细列出了聚合管道中可以使用的所有阶段和操作符)

*   推荐阅读：
    *   📘 **《MongoDB 权威指南》**：深入理解 MongoDB 数据库本身的原理和高级功能，对理解聚合管道非常有帮助。
    *   📘 **一些 MongoDB 中文社区的聚合管道教程**：搜索 "MongoDB 聚合管道 教程" 可以找到一些中文的实践文章和视频，结合官方文档学习效果更好。

---

恭喜你完成了 Mongoose 入门指南的第五章！聚合管道是一个分水岭，掌握它意味着你可以处理更复杂的业务需求。

接下来的章节，我们可以探讨一些更高级的主题，例如事务、插件、连接池管理、错误处理最佳实践等。

如果你在实践中遇到问题，记得拆解管道，一步步调试每个阶段的输出，这是学习聚合管道的有效方法！