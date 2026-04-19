# 原生 MIDI 接入进展

> 更新日期: 2026-04-19

## 文档用途

这份文档只记录“已经落地到仓库里的阶段性成果”，方便和 [原生 MIDI 接入实施文档](./native-midi-implementation.md) 配合使用。

- `native-midi-implementation.md` 负责回答“整体怎么做”
- 本文负责回答“当前已经做到哪一步”

---

## Block 1：Development Build 与本地模块基础设施

### 已完成

- 在 [app/package.json](../../app/package.json) 接入 `expo-dev-client`
- 在 [app/app/_layout.tsx](../../app/app/_layout.tsx) 引入 `expo-dev-client`
- 在 [app/modules/easy-piano-midi](../../app/modules/easy-piano-midi) 生成本地 Expo Module，并改成 MIDI 模块骨架
- 对齐模块和应用侧的设备类型定义，补齐 `manufacturer`、`isAvailable`
- 在 [app/app.json](../../app/app.json) 接入 `expo-dev-client` plugin
- 生成 `ios/`、`android/` 原生工程，并完成 CocoaPods 安装
- 用 `expo-modules-autolinking` 和 iOS Pods 工程确认 `EasyPianoMidi` 已被自动链接

### 当前模块接口

本地模块当前已经统一出下面这组 JS API：

- `isSupported`
- `listDevices`
- `startScan`
- `stopScan`
- `connectDevice`
- `disconnect`

当前已经预留的事件：

- `devicesChanged`
- `connectionChanged`
- `note`

### 验证结果

- `cd /Users/zhangza/code/easypiano/easy-piano/app && npx tsc --noEmit` 通过
- `cd /Users/zhangza/code/easypiano/easy-piano/app && npx expo prebuild --clean` 通过
- `cd /Users/zhangza/code/easypiano/easy-piano/app && npx expo-modules-autolinking search ./modules` 能识别 `easy-piano-midi`
- `ios/Pods/Pods.xcodeproj` 中已经出现 `EasyPianoMidi` target / scheme

---

## Block 2：iOS CoreMIDI 第一阶段

### 已完成

- 在 [EasyPianoMidiModule.swift](../../app/modules/easy-piano-midi/ios/EasyPianoMidiModule.swift) 接入 `CoreMIDI`
- 已完成 `MIDIClient` 和输入端口初始化
- 已完成系统 MIDI Source 枚举与设备序列化
- 已完成连接 / 断开指定 MIDI Source
- 已完成第一阶段 `noteOn / noteOff` 解析
- 已把原生事件统一映射成 `devicesChanged / connectionChanged / note`

### 当前能力边界

第一阶段只覆盖“把电钢琴基础按键事件送进 JS”这条最短链路，因此暂时只处理：

- `noteOn`
- `noteOff`
- `velocity == 0` 的 `noteOn` 兼容为 `noteOff`

当前还没有做：

- Control Change / Sustain Pedal
- Program Change
- SysEx
- BLE 专项扫描 UI
- 真机外设回归验证

### 验证结果

- `cd /Users/zhangza/code/easypiano/easy-piano/app && xcodebuild -project ios/Pods/Pods.xcodeproj -scheme EasyPianoMidi -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build` 通过

---

## Block 3：原生事件接入 `midiStore`

### 已完成

- 新增 [nativeMIDI.ts](../../app/src/services/midi/nativeMIDI.ts)，把 `devicesChanged / connectionChanged / note` 统一写回 store
- 更新 [midiStore.ts](../../app/src/stores/midiStore.ts)，新增 `isNativeSupported`、`lastNoteEvent`、真实的扫描/连接/断开动作
- 更新 [useMIDI.ts](../../app/src/hooks/useMIDI.ts)，让页面层直接消费当前连接状态、最后音符和设备列表
- 在 [app/_layout.tsx](../../app/app/_layout.tsx) 启动时初始化原生 MIDI bridge

### 验证结果

- `cd /Users/zhangza/code/easypiano/easy-piano/app && npx tsc --noEmit` 通过
- 游戏页继续读 `midiStore.activeNotes`，不需要改判定引擎入口

---

## Block 4：MIDI 连接页切到真实数据源

### 已完成

- 将 [midi/connect.tsx](../../app/app/midi/connect.tsx) 从 mock 页面切到真实 `useMIDI()` 数据
- 页面现在会显示系统返回的设备列表，而不是前端写死的假数据
- 已连接状态会显示最后一条接收到的音符事件
- 模拟器或不支持的环境会明确提示“需要真机 Development Build 才能完整验证”

### 当前能力边界

- 页面已经是真实数据源，但最终体验仍取决于系统是否真的枚举到外设
- 当前连接页还没有做连接失败重试、权限引导、历史设备持久化
- 真机 USB / BLE 的最终验收仍未完成

### 下一步

- 用真机和 USB MIDI 电钢琴验证一轮真实输入
- 补充连接失败态、空设备态和历史设备持久化
- 再补 Android `MidiManager` 第一阶段实现

---

## Block 5：缺失原生模块兜底

### 背景

在 Expo Go 或旧的 Development Build 里运行 App 时，`EasyPianoMidi` 这个自定义原生模块并不存在。如果 JS 顶层直接调用 `requireNativeModule`，App 会在启动阶段报 `Cannot find native module 'EasyPianoMidi'` 并中断。

### 已完成

- 将 [EasyPianoMidiModule.ts](../../app/modules/easy-piano-midi/src/EasyPianoMidiModule.ts) 改成 `requireOptionalNativeModule`
- 当当前运行壳没有 `EasyPianoMidi` 时，返回一个 no-op fallback
- fallback 会让 `isSupported()` 返回 `false`，并让扫描、连接、事件监听都安全空跑
- 普通页面和模拟器调试不会再因为 MIDI 原生模块缺失而崩溃

### 当前能力边界

- fallback 只负责避免崩溃，不提供真实设备枚举或按键输入
- 真实 USB MIDI / BLE MIDI 仍然必须重新构建并安装包含本地模块的 Development Build

### 验证结果

- `cd /Users/zhangza/code/easypiano/easy-piano/app && npx tsc --noEmit` 通过
