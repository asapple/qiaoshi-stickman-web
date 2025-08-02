# Qiaoshi Stickman Web

基于 Vue 3 的智能设备管理网页应用，具备实时视频流和高级隐私保护功能。

[中文版本](README.zh-CN.md) | [English Version](README.md)

## 功能特性

- 设备管理仪表板，带有状态指示器
- 设备详情视图，包括：
  - 实时视频播放器
  - 隐私控制（火柴人模式和人像隐去）
  - 密码修改
  - 通知接收人管理
  - 异常事件图片库，支持灯箱预览
- 响应式设计，适配桌面和移动设备
- 使用 Vant 组件的现代化 UI

## 技术栈

- [Vue 3](https://v3.vuejs.org/) with Composition API
- [Vant](https://vant-ui.github.io/vant/#/zh-CN) - 移动端 UI 组件库
- [Vue Router](https://router.vuejs.org/zh/) 路由管理
- [Pinia](https://pinia.vuejs.org/zh/) 状态管理
- [Vite](https://vitejs.dev/) 构建工具
- [TypeScript](https://www.typescriptlang.org/) 类型安全

## 项目设置

### 前置要求

- Node.js (版本见 package.json)
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd qiaoshi-stickman-web

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 应用将在 http://localhost:5173 访问
```

### 构建

```bash
# 生产环境构建
npm run build

# 预览生产构建
npm run preview
```

### 测试

```bash
# 运行单元测试
npm run test:unit

# 运行端到端测试
npm run test:e2e
```

### 代码检查和格式化

```bash
# 代码检查
npm run lint

# 使用 Prettier 格式化代码
npm run format
```

## 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # 可复用组件
├── composables/      # Vue 组合式函数
├── router/           # Vue Router 配置
├── stores/           # Pinia 状态存储
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.ts           # 应用入口文件
```

## 核心组件

### 设备管理 (`DeviceView.vue`)

- 显示已连接设备的网格布局
- 显示设备状态（在线/离线/维护中）
- 支持添加新设备

### 设备详情 (`DeviceDetailView.vue`)

- 实时视频播放器组件
- 隐私控制功能：
  - 火柴人模式：将人物替换为火柴人
  - 人像隐去：模糊人脸
- 密码管理
- 通知接收人管理
- 异常事件图片库

### 视频播放器 (`VideoPlayer.vue`)

- 响应式视频播放器，16:9 宽高比
- 无视频流时显示带动画的占位符

## 路由

- `/login` - 登录页面
- `/device` - 设备管理仪表板
- `/device/:id` - 设备详情页面
- `/profile` - 用户个人资料页面

## 环境变量

在项目根目录创建 `.env` 文件：

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## 贡献

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT 许可证 - 详情见 [LICENSE](LICENSE) 文件。

## 致谢

- [Vant UI](https://github.com/youzan/vant) 移动端 UI 组件库
- [Vue.js](https://github.com/vuejs/vue) 渐进式框架
- [Vite](https://github.com/vitejs/vite) 快速构建工具