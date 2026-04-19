# 文档待办

> 更新日期: 2026-04-19

## 高优先

- 为曲谱数据和谱面生成补一份统一格式说明，沉淀 `tracks / note / duration / hand` 约定
- 用真机 + USB MIDI 电钢琴验证 iOS CoreMIDI 第一阶段链路
- 为连接失败、设备为空、系统不支持等情况补充明确的 UI 状态和文案
- 增加历史设备持久化与自动重连策略
- 开始 Android `MidiManager` 第一阶段实现

## 中优先

- 更新 `docs/ui/game-result.md`，同步左右手统计与当前结算字段
- 为课程、练习、曲库补“当前已实现 vs 后续规划”状态块
- 增补测试文档，覆盖横屏游戏、暂停、长音 Hold 和外设输入链路

## 已完成

- 新增 [电钢琴接入方案](./architecture/piano-input-connectivity.md)
- 新增 [原生 MIDI 接入实施文档](./architecture/native-midi-implementation.md)
- 新增 [原生 MIDI 接入进展](./architecture/native-midi-progress.md)
- 在 [app](/Users/zhangza/code/easypiano/easy-piano/app) 下接入 `expo-dev-client` 并生成 `easy-piano-midi` 本地 Expo Module 骨架
- 生成 `ios/` 和 `android/` 原生工程，并验证本地 Expo Module 自动链接到了 `EasyPianoMidi`
- 在 iOS 侧完成 `EasyPianoMidi` 的 CoreMIDI 第一阶段骨架
- 把原生 `devicesChanged / connectionChanged / note` 事件正式接进 `midiStore`
- 将 [MIDI 连接页](./ui/midi-connect.md) 切到真实 store 数据源
- 更新 [总设计文档](./DESIGN.md) 的当前实现说明
- 更新 [游戏主屏](./ui/game-play.md) 与 [MIDI 连接页](./ui/midi-connect.md) 的实现状态
- 更新根目录 [README](../README.md) 和文档索引 [docs/README.md](./README.md)
