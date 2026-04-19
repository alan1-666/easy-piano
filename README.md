# EasyPiano

通过游戏化方式学习钢琴的移动 App。当前仓库以 `Expo + React Native` 前端原型为主，已经具备首页、曲库、课程、MIDI 连接页、游戏页和结果页的基础链路。

## Current Status

- 已完成主要页面原型和导航链路
- 游戏页支持单独横屏，结果页回到竖屏
- 已实现下落音符、长音 Hold 判定、左右手统计和结果结算
- 已接入多首 mock 曲目与基础双手谱面
- 游戏输入已统一到 `midiStore.activeNotes`，触屏和外设事件可共用同一套判定逻辑
- 原生 USB MIDI / BLE MIDI 设备接入仍待落地，目前 `MIDI 连接页` 还是 UI 原型

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo Router |
| Gameplay UI | React Native Views（当前实现） |
| Native Capability | Expo Development Build + 自定义原生模块 |
| Input State | Zustand |
| Networking | Axios + TanStack Query |
| Backend | Go (Gin) |
| Database | PostgreSQL + Redis |

## Project Structure

```text
easy-piano/
├── docs/           # 产品、架构、UI 文档
├── app/            # React Native / Expo 前端
├── server/         # Go 后端
└── assets/         # 曲目、封面、音频等资源
```

## Documentation

- [文档索引](docs/README.md)
- [总设计文档](docs/DESIGN.md)
- [电钢琴接入方案](docs/architecture/piano-input-connectivity.md)
- [原生 MIDI 接入实施文档](docs/architecture/native-midi-implementation.md)
- [游戏页说明](docs/ui/game-play.md)
- [MIDI 连接页说明](docs/ui/midi-connect.md)
- [文档待办](docs/TODO.md)

## Getting Started

```bash
cd app
npm install
npx expo start
```

类型检查：

```bash
cd app
npx tsc --noEmit
```

原生 MIDI 能力后续会依赖自定义原生代码，因此最终设备接入不会停留在 `Expo Go`，而会走 `Expo Development Build`。

## License

MIT
