# ipy.me - Python 在线代码运行器

一个纯前端的 Python 在线练习网站，无需后端服务器。

## 技术方案

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| Python 运行时 | **Pyodide** | Python 编译为 WebAssembly，浏览器内运行 |
| 代码编辑器 | **CodeMirror 6** | 语法高亮、行号、自动缩进 |
| UI | 纯 HTML/CSS/JS | 轻量无框架，深色主题 |
| 部署 | 静态托管 | GitHub Pages / Cloudflare Pages |

## 核心功能

1. **代码编辑** - Python 语法高亮、行号显示、自动缩进
2. **代码执行** - 点击运行，捕获 stdout/stderr
3. **错误展示** - 友好的错误信息展示
4. **示例代码** - 预置入门示例

## Pyodide 特性

### ✅ 支持
- 标准库（math、json、datetime 等）
- 按需加载第三方库（numpy、pandas、matplotlib）
- print 输出捕获
- 异常捕获和展示

### ⚠️ 限制
- 无网络请求（fetch、requests 不可用）
- 无文件系统（虚拟文件系统可用）
- 首次加载较慢（~10MB WASM 文件）

## 文件结构

```
ipy.me/
├── index.html      # 主页面
├── style.css       # 样式
├── app.js          # 核心逻辑
└── Design.md       # 设计文档
```

## UI 设计

- 亮色/暗色主题（自动跟随系统，支持手动切换）
- 左侧代码编辑区
- 右侧/下方输出区
- 响应式布局，支持移动端

## 作者

- **Ansen** - 项目发起人
- **Antigravity (Google DeepMind)** - AI 编程助手

## 许可证

[MIT License](LICENSE)