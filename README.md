# Bone Cycle 🚴

火柴人自行车横版闯关游戏 - 过山车式的骑行体验

## 游戏特点

- 🎮 **横版闯关** - 经典的横向卷轴玩法
- 🚴 **过山车体验** - 在一条线上骑行，遇到坑洞跳跃通过
- 🎨 **简约风格** - 线条绘制的火柴人和自行车
- 🔄 **颜色选择** - 开始前自定义火柴人和自行车颜色
- 🎯 **简单上手** - D前进、A倒车、S停止、空格跳跃

## 操作说明

| 按键 | 功能 |
|------|------|
| D | 前进 |
| A | 倒车 |
| S | 停止 |
| 空格 | 跳跃 |
| R | 重新开始当前关卡 |
| ESC | 暂停游戏 |

### 颜色选择

游戏开始前可以选择：
- 火柴人颜色（3种可选）
- 自行车颜色（3种可选）

开始闯关后颜色固定，无法更改。

## 快速开始

### 环境要求

- Node.js 16+
- 现代浏览器（Chrome/Firefox/Safari）

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/YihanCai/Bone_Cycle.git

# 进入项目
cd Bone_Cycle

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:3000` 即可开始游戏！

## 项目结构

```
Bone_Cycle/
├── src/
│   ├── core/           # 核心游戏引擎
│   │   ├── Game.js     # 游戏主循环
│   │   ├── Input.js    # 输入管理
│   │   └── Camera.js   # 摄像机系统
│   ├── entities/       # 游戏实体
│   │   ├── Player.js   # 火柴人角色
│   │   └── Bicycle.js  # 自行车
│   ├── world/          # 世界系统
│   │   ├── Terrain.js  # 地形渲染
│   │   └── Level.js    # 关卡管理
│   ├── physics/        # 物理引擎
│   │   └── Physics.js  # 重力和碰撞
│   ├── ui/             # 用户界面
│   │   ├── UI.js       # 游戏内UI
│   │   └── Menu.js     # 开始/选择菜单
│   └── main.js         # 入口文件
├── assets/
│   └── levels/         # 关卡数据
├── index.html          # 游戏页面
└── package.json        # 项目配置
```

## 技术栈

- **渲染** - HTML5 Canvas
- **语言** - 原生 JavaScript (ES6+)
- **构建** - Vite
- **物理** - 自研简易2D物理引擎（含惯性系统）

## 开发计划

### 第一阶段：核心基础 ✅
- [x] 项目初始化
- [x] 游戏主循环
- [x] 输入系统（D/A/S/空格）
- [x] 开始页面（颜色选择）

### 第二阶段：角色系统 ✅
- [x] 火柴人绘制
- [x] 自行车绑定
- [x] 颜色选择界面
- [x] 跳跃动画

### 第三阶段：关卡系统 ✅
- [x] 地形数据结构
- [x] 第一关设计
- [x] 碰撞检测
- [x] 摄像机跟随

### 第四阶段：游戏逻辑 ✅
- [x] 生命值系统
- [x] 分数系统
- [x] 胜利/失败判定
- [x] UI显示

### 第五阶段：优化发布
- [ ] 性能优化
- [ ] 测试调试
- [ ] 部署上线

## 游戏截图

*开发中...*

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范

- 遵循现有代码风格
- 添加必要的注释
- 确保功能正常工作
- 更新相关文档

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 作者

**YihanCai** - [@YihanCai](https://github.com/YihanCai)

---

⭐ 如果觉得有用，请给个 Star 支持一下！
