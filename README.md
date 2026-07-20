# Bone Cycle - 火柴人自行车闯关游戏

一个基于HTML5 Canvas的火柴人自行车闯关游戏，包含物理引擎、关卡设计和趣味玩法。

## 游戏特点

- 🚴 简约火柴人风格
- 🎮 流畅的自行车物理控制
- 🏔️ 多样化的关卡设计
- 🎯 丰富的障碍物和道具系统
- 💾 进度保存系统

## 分阶段开发计划

### 阶段一：核心基础 (v0.1.0) - 1-2周
- [x] 项目初始化和基础框架搭建
- [ ] 火柴人角色系统（行走、跳跃、骑行动画）
- [ ] 自行车物理引擎（加速、刹车、平衡控制）
- [ ] 简单地形生成（平地、坡道）
- [ ] 基础碰撞检测系统

### 阶段二：关卡系统 (v0.2.0) - 2-3周
- [ ] 关卡编辑器原型
- [ ] 5个基础关卡设计
- [ ] 障碍物系统（石头、水坑、断桥）
- [ ] 收集物系统（金币、星星）
- [ ] 关卡加载和进度追踪

### 阶段三：进阶玩法 (v0.3.0) - 2-3周
- [ ] 特殊能力系统（冲刺、跳跃增强）
- [ ] 天气和环境效果（雨天、夜晚）
- [ ] Boss关卡设计
- [ ] 成就系统
- [ ] 音效和背景音乐

### 阶段四：优化发布 (v1.0.0) - 1-2周
- [ ] 性能优化
- [ ] 移动端适配
- [ ] 存档系统完善
- [ ] 教程引导
- [ ] 最终测试和发布

## 技术栈

- **前端**: HTML5 Canvas + JavaScript
- **物理引擎**: 自研简易2D物理引擎
- **构建工具**: Vite
- **版本控制**: Git

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/YihanCai/Bone_Cycle.git

# 进入项目目录
cd Bone_Cycle

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 游戏操作

- **方向键**: 控制自行车前进/后退
- **空格键**: 跳跃
- **R键**: 重新开始当前关卡
- **ESC键**: 暂停游戏

## 项目结构

```
Bone_Cycle/
├── src/
│   ├── core/           # 核心游戏引擎
│   ├── entities/       # 游戏实体（角色、道具）
│   ├── levels/         # 关卡数据
│   ├── physics/        # 物理引擎
│   ├── utils/          # 工具函数
│   └── main.js         # 游戏入口
├── assets/
│   ├── sprites/        # 精灵图
│   ├── sounds/         # 音效文件
│   └── levels/         # 关卡配置
├── public/             # 静态资源
├── index.html          # 游戏页面
└── package.json        # 项目配置
```

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 作者

**YihanCai** - GitHub: [@YihanCai](https://github.com/YihanCai)

---

⭐ 如果觉得有用，请给个Star支持一下！
