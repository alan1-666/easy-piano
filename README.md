# EasyPiano

通过游戏化方式学习钢琴的 iOS App。连接电钢琴（MIDI），让练琴像玩游戏一样有趣。

## Features

- MIDI 连接（USB / 蓝牙）实时互动
- 下落音符游戏模式（类似节奏大师 / Synthesia）
- 系统化课程体系（入门→初级→中级→高级）
- 多种练习模式（标准 / 等待 / 自由速度 / 分手练习）
- 游戏化激励（经验值 / 等级 / 成就 / 排行榜）

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Rendering | @shopify/react-native-skia |
| MIDI | CoreMIDI (Native Module) |
| Backend | Go (Gin) |
| Database | PostgreSQL + Redis |

## Project Structure

```
easy-piano/
├── docs/           # 设计文档
├── app/            # React Native 前端
├── server/         # Go 后端
└── assets/         # MIDI 曲目等资源
```

## Documentation

- [Design Document](docs/DESIGN.md) - 完整设计文档（产品需求、技术架构、API 设计、数据模型）

## Getting Started

> Coming soon - 项目处于设计阶段

## License

MIT
