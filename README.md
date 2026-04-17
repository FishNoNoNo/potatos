# 🥔 Potatos Todo

> 一个基于 Tauri + Vue 构建的轻量级待办事项管理工具。

Potatos Todo 是一款简洁高效的待办事项管理应用，支持任务的创建、查看、删除和更新。它不仅提供图形界面，还内置了强大的命令行工具，方便终端用户快速管理任务。

---

## ✨ 功能特性

- ✅ 创建待办事项（标题、描述、开始时间、提醒时间）
- 📋 列出所有待办事项
- 🗑️ 删除指定待办事项
- ✏️ 更新待办事项（标题、描述、开始时间）
- 🖥️ 提供 CLI 命令行工具
- 🧩 基于 Tauri 构建，轻量、安全、跨平台

---

## 📦 安装

### 下载安装包

前往 [Releases](https://github.com/yourusername/potatos/releases) 页面下载对应操作系统的安装包：

- Windows: `.msi` 或 `.exe`
- macOS: `.dmg` 或 `.app`
- Linux: `.deb` 或 `.AppImage`

### 从源码构建

```bash
# 克隆项目
git clone https://github.com/yourusername/potatos.git
cd potatos

# 安装前端依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建生产版本
npm run tauri build
```

🖱️ 图形界面使用
启动应用后，你可以通过图形界面：

添加新的待办事项

查看所有任务列表

编辑或删除任务

⌨️ 命令行工具（CLI）
Potatos 提供了 CLI 工具 potatos-cli，可在终端中直接管理任务。

命令说明

1. 添加任务

```bash
potatos-cli add --title "写报告" --description "完成季度总结" --start_time "2025-04-20 14:00:00" --notify_before 30
```

参数 简写 说明
--title -t 任务标题（必填）
--start_time -time 开始时间，UTC 格式（必填）
--description -d 任务描述
--notify_before -n 提前提醒分钟数 2. 列出所有任务

```bash
potatos-cli ls
```

输出示例：

text
e53ceb50-874f-4538-a722-6aaae00a5e5c | 写报告 | 2025-04-20 14:00:00 | 完成季度总结 | completed=false 3. 删除任务

```bash
potatos-cli rm e53ceb50-874f-4538-a722-6aaae00a5e5c
```

4. 更新任务

```bash
potatos-cli update e53ceb50-874f-4538-a722-6aaae00a5e5c --title "修改后的标题" --start_time "2025-04-21 10:00:00"
```

支持的更新参数与 add 相同。

帮助信息

```bash
potatos-cli --help
```

🗄️ 数据存储
待办事项数据默认存储在本地数据库中（具体路径取决于操作系统），无需联网，数据完全由你掌控。

🛠️ 技术栈
前端框架：Vue 3

桌面框架：Tauri

后端语言：Rust

数据库：SQLite（通过 Rust 操作）

📝 开发计划
任务完成状态切换（completed 字段支持）

提醒通知（系统通知）

标签分类

数据导入/导出

🤝 贡献
欢迎提交 Issue 或 Pull Request。

Fork 本仓库

创建你的功能分支 (git checkout -b feature/amazing-feature)

提交修改 (git commit -m 'Add some amazing feature')

推送到分支 (git push origin feature/amazing-feature)

打开 Pull Request

📄 许可证
MIT License © 2025 [Your Name]

📬 联系
如有问题或建议，欢迎通过 Issues 反馈。
