---
title: "GIT常用命令1 - \U0001F9E0 Git 使用教程（附公司级协作流程）"
top_img: /images/post/git/git.jpg
cover: /images/post/git/git.jpg
categories:
  - GIT
tags:
  - 教程
  - GIT
abbrlink: 28112
date: 2025-06-06 00:00:00
---


# 🧠 Git 使用教程（附公司级协作流程）

Git 是最流行的分布式版本控制系统，广泛应用于团队协作开发中。本文将从零讲解 Git 的基本操作，并重点介绍在公司中的使用规范和协作流程。

---

## 📦 一、什么是 Git？

Git 是一个**版本控制工具**，可以记录文件的修改历史，方便多人协作、代码回滚、版本发布等。

- 本地 Git 仓库：每个开发者都有完整历史记录
- 远程仓库（如 GitHub/GitLab）：集中托管协作开发

---

## 🛠️ 二、安装与配置

### 安装 Git

- 官网：https://git-scm.com/

Windows 用户可以下载安装包，其他平台推荐使用包管理器。

### 基本配置

```bash
git config --global user.name "你的姓名"
git config --global user.email "你的公司邮箱"
git config --global core.editor "code"  # 设置 VSCode 为默认编辑器
```

---

## 🔍 三、Git 常用命令速查

| 命令                   | 说明           |
| ---------------------- | -------------- |
| `git init`             | 初始化本地仓库 |
| `git clone 仓库地址`   | 克隆远程仓库   |
| `git status`           | 查看当前状态   |
| `git add 文件名`       | 暂存改动       |
| `git commit -m "注释"` | 提交改动       |
| `git push`             | 推送到远程     |
| `git pull`             | 拉取最新改动   |
| `git checkout 分支名`  | 切换分支       |
| `git branch`           | 查看本地分支   |
| `git merge 分支名`     | 合并分支       |

---

## 🧬 四、Git 工作流程图解

```
 本地工作区
    ↓
 暂存区 (add)
    ↓
本地仓库 (commit)
    ↓
远程仓库 (push)
```

> 📌 提交之前一定要 `git pull`，避免冲突！

---

## 👥 五、公司级 Git 协作流程（推荐）

在企业中，协作流程应当规范，常见模式如下：

### 🔁 Git 分支模型推荐（Git Flow 简化版）

```
main（线上稳定分支）
│
├── dev（开发集成分支）
│   ├── feature/xxx（功能开发分支）
│   └── bugfix/xxx（缺陷修复分支）
└── release/xxx（预发布分支，可选）
```

### 🏢 公司协作流程典型步骤

1. ✅ **从远程克隆项目**

```bash
git clone git@company.gitlab.com:team/project.git
cd project
```

2. ✅ **创建功能分支**

```bash
git checkout dev         # 确保从 dev 分支切出
git pull                 # 拉取最新代码
git checkout -b feature/login-page
```

3. ✅ **开发并提交代码**

```bash
git add .
git commit -m "feat: 完成登录页面功能"
```

4. ✅ **推送分支到远程**

```bash
git push origin feature/login-page
```

5. ✅ **提交 Merge Request（MR/PR）**

- 到 GitLab/GitHub 上发起合并请求
- 选择合并到 `dev` 分支
- 请求同事进行代码审核（Code Review）

6. ✅ **审核通过后合并**

- 审核人合并到 `dev`
- 如有冲突，开发者需解决后重新提交

7. ✅ **测试通过后，发布到 `main`**

由项目负责人将 `dev` 合并到 `main`，进行线上发布。

---

## 🧪 六、常用高级命令与技巧

### 1. 修改最近一次提交（不影响历史）

```bash
git commit --amend
```

### 2. 查看提交历史图

```bash
git log --oneline --graph --all
```

### 3. 恢复误删文件

```bash
git checkout HEAD -- 被删文件路径
```

### 4. 取消 add 操作

```bash
git reset HEAD 文件名
```

### 5. 创建忽略文件 `.gitignore`

```
node_modules/
dist/
.env
*.log
```

---

## 🧯 七、常见问题排查

### ❓ 合并冲突怎么办？

```bash
# 编辑冲突文件，手动选择保留的部分
# 然后执行：
git add 冲突文件
git commit
```

### ❓ 提交被拒：需要先 pull？

```bash
git pull --rebase
```

### ❓ 推送失败：权限被拒绝？

- 确认你添加了 SSH Key
- 查看 GitLab/GitHub 是否绑定了你的 Key

---

## 📚 八、团队协作建议

- ✅ 每次开发新功能都新建分支，命名清晰（如 `feature/login-ui`）
- ✅ 提交信息规范，如：
  - `feat: 新增注册页面`
  - `fix: 修复登录错误提示`
  - `refactor: 重构表单逻辑`
- ✅ 每次提交前都 `git pull`，避免代码冲突
- ✅ 开启 MR 的代码审核流程，提高代码质量

---

## 📘 九、参考资料

- 官方文档：https://git-scm.com/doc
- Git 图形化客户端：Sourcetree、Fork、GitHub Desktop
- 推荐阅读：  
  - 《Pro Git 中文版》 https://git-scm.com/book/zh/v2
  - 阮一峰的 Git 教程：https://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html

---

> 作者：**[937bb]**  
> 本文适用于中小型企业开发协作流程，欢迎转发分享，转载请注明出处 🙌
