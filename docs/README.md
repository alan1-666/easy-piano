# EasyPiano 文档索引

> 更新日期: 2026-04-19

## 建议先看

- [总设计文档](./DESIGN.md)
- [电钢琴接入方案](./architecture/piano-input-connectivity.md)
- [原生 MIDI 接入实施文档](./architecture/native-midi-implementation.md)
- [原生 MIDI 接入进展](./architecture/native-midi-progress.md)
- [游戏主屏](./ui/game-play.md)
- [MIDI 连接页](./ui/midi-connect.md)

## 当前实现状态

- App 主要页面已经可运行，包含 onboarding、登录注册、首页、曲库、课程、练习和个人中心
- 游戏页支持单独横屏，结果页自动切回竖屏
- 下落音符支持长短音视觉差异，长音已接入 Hold 判定
- 结果页支持左右手分别统计
- 游戏输入已统一为 `activeNotes` 事件流，后续可以平滑接入 USB MIDI / BLE MIDI
- 已接入 `expo-dev-client`、本地 Expo Module，并生成 `ios/` / `android/` 原生工程
- iOS `EasyPianoMidi` 已完成 CoreMIDI 第一阶段骨架，能枚举设备、连接 Source 并解析基础按键事件
- 原生事件已经写回 `midiStore`，`MIDI 连接页` 已切到真实 store 数据源
- 真机外设验证、连接失败态完善、Android 实现仍是下一阶段工作

## 架构文档

- [电钢琴接入方案](./architecture/piano-input-connectivity.md)
- [原生 MIDI 接入实施文档](./architecture/native-midi-implementation.md)
- [原生 MIDI 接入进展](./architecture/native-midi-progress.md)
- [UI 重设计说明](./architecture/ui-redesign.md)

## 界面文档

- [Onboarding](./ui/onboarding.md)
- [登录注册](./ui/auth.md)
- [首页](./ui/home.md)
- [曲库](./ui/songs.md)
- [课程](./ui/course.md)
- [MIDI 连接](./ui/midi-connect.md)
- [游戏主屏](./ui/game-play.md)
- [游戏结果](./ui/game-result.md)
- [个人中心](./ui/profile.md)
- [设计系统](./ui/design-system.md)

## 文档维护约定

- 设计文档优先描述长期方向
- 页面文档需要同时标注“当前实现状态”和“目标体验”
- 涉及平台能力、接入策略、系统 API 的结论，优先沉淀到 `docs/architecture/`
- 尚未落地或还需继续补齐的文档项，统一放到 [文档待办](./TODO.md)
