---
title: Linux常用命令1 - 🐧 Linux 常用命令大全（小白入门 + 日常运维）
date: 2025-06-06
top_img: /images/post/linux/linux.jpg
cover: /images/post/linux/linux.jpg
categories: ["Linux"]
tags: ["教程","Linux"]
---


# 🐧 Linux 常用命令大全（小白入门 + 日常运维）

本文总结了日常使用 Linux 系统过程中最常用的命令，涵盖文件管理、用户权限、进程管理、网络、软件安装等常见场景。

---

## 📁 一、文件和目录操作

| 命令 | 作用 |
|------|------|
| `ls` | 查看当前目录内容 |
| `ls -l` | 详细列表 |
| `cd 目录名` | 进入目录 |
| `pwd` | 显示当前路径 |
| `mkdir 目录名` | 新建目录 |
| `rm 文件名` | 删除文件 |
| `rm -r 目录名` | 递归删除目录 |
| `cp 源 目标` | 复制文件/目录 |
| `mv 源 目标` | 移动/重命名 |
| `touch 文件名` | 创建空文件 |
| `cat 文件名` | 查看文件内容 |
| `more / less 文件名` | 分页查看大文件 |
| `head -n 10 文件` | 查看前 10 行 |
| `tail -n 10 文件` | 查看最后 10 行 |
| `tree` | 树状结构查看目录（需安装） |

---

## 🔍 二、查找与搜索

| 命令 | 说明 |
|------|------|
| `find /路径 -name 文件名` | 在目录下查找文件 |
| `grep "关键字" 文件名` | 搜索文本内容 |
| `grep -r "关键字" 路径` | 递归搜索 |
| `which 命令名` | 查看命令路径 |
| `locate 文件名` | 快速查找文件（需安装并更新数据库） |

---

## 🔐 三、权限与用户管理

| 命令 | 说明 |
|------|------|
| `chmod +x 文件` | 增加执行权限 |
| `chmod 755 文件` | 设置权限 |
| `chown 用户 文件` | 更改文件拥有者 |
| `adduser 用户名` | 添加用户 |
| `passwd 用户名` | 修改用户密码 |
| `su 用户名` | 切换用户 |
| `sudo 命令` | 以管理员权限执行 |

---

## ⚙️ 四、系统与进程管理

| 命令 | 说明 |
|------|------|
| `top` | 查看实时系统资源 |
| `htop` | 更友好的进程管理（需安装） |
| `ps aux` | 查看所有进程 |
| `kill PID` | 终止指定进程 |
| `kill -9 PID` | 强制终止 |
| `df -h` | 查看磁盘空间 |
| `du -sh *` | 查看目录大小 |
| `free -h` | 查看内存使用 |
| `uptime` | 系统运行时间 |
| `uname -a` | 查看系统信息 |
| `whoami` | 当前用户名 |

---

## 🌐 五、网络相关命令

| 命令 | 说明 |
|------|------|
| `ping 地址` | 测试网络连接 |
| `ifconfig` / `ip a` | 查看网络配置 |
| `netstat -tuln` | 查看监听端口 |
| `curl 地址` | 请求网页内容 |
| `wget 地址` | 下载文件 |
| `scp 文件 用户@IP:/路径` | 远程复制 |
| `ssh 用户@IP` | 远程登录 |

---

## 📦 六、软件安装和管理（以 Debian/Ubuntu 为例）

| 命令 | 说明 |
|------|------|
| `sudo apt update` | 更新软件源 |
| `sudo apt upgrade` | 升级系统 |
| `sudo apt install 包名` | 安装软件 |
| `sudo apt remove 包名` | 卸载软件 |
| `dpkg -i 包名.deb` | 安装本地包 |
| `apt search 包名` | 搜索包 |
| `apt list --installed` | 查看已安装 |

---

## 📄 七、压缩与解压

| 命令 | 说明 |
|------|------|
| `tar -czvf a.tar.gz 目录/` | 打包并压缩 |
| `tar -xzvf a.tar.gz` | 解压 |
| `zip -r a.zip 文件夹/` | 压缩为 zip |
| `unzip a.zip` | 解压 zip |

---

## 🐚 八、Shell 脚本基础（入门示例）

### 示例：自动备份脚本 `backup.sh`

```bash
#!/bin/bash
# 备份当前目录到 /backup

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backup/backup_$DATE"

mkdir -p $BACKUP_DIR
cp -r * $BACKUP_DIR

echo "Backup completed to $BACKUP_DIR"
```

运行方式：

```bash
chmod +x backup.sh
./backup.sh
```

---

## 🧯 九、常见问题解决

### ❓ 文件/命令找不到？

- 检查是否安装：`which 命令`
- 检查路径拼写
- 使用 `locate` 快速查找文件位置

### ❓ 权限不够？

- 加 `sudo` 试试
- `chmod` 或 `chown` 修改权限或所有者

### ❓ 命令执行卡住？

- 用 `Ctrl + C` 中断
- 或使用 `top` / `kill` 终止进程

---

## 📘 十、学习资源推荐

- Linux 命令大全：https://wangdoc.com/linux/
- 菜鸟教程：https://www.runoob.com/linux/linux-command-manual.html
- man 手册：`man 命令名`（如 `man ls`）

---

> 作者：**[937bb]**  
> 本文适合 Linux 新手与初级运维，欢迎转发收藏，转载请注明出处 🔁
