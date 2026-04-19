# 原生 MIDI 接入实施文档

> 版本: v1.0.0 | 更新日期: 2026-04-19

---

## 1. 目标

这份文档回答的是“接下来怎么真正把电钢琴接进 App”，而不是“应该选哪种接入方式”。

接入方案的产品决策已经在 [电钢琴接入方案](./piano-input-connectivity.md) 里确定:

- 主方案: `USB MIDI`
- 第二方案: `BLE MIDI`
- 补充模式: `麦克风识别`
- `HDMI` 只负责投屏或音频输出

本文件聚焦的是工程实施:

- iOS / iPadOS 怎么接
- Android 怎么接
- Expo 项目怎么切到可承载原生模块的开发模式
- 现有 `midiStore`、游戏页和连接页怎么复用

---

## 2. 当前代码基线

当前仓库已经具备“统一输入入口”，这让原生接入可以增量完成，而不用推翻现有游戏逻辑。

### 2.1 现有关键文件

- [app/src/types/midi.ts](../../app/src/types/midi.ts)
  - 已定义 `MIDIDevice` 和 `MIDINoteEvent`
- [app/src/stores/midiStore.ts](../../app/src/stores/midiStore.ts)
  - 已有 `availableDevices`、`connectionStatus`、`activeNotes`
  - 已有 `handleNoteEvent(event)` 和 `clearActiveNotes()`
- [app/src/hooks/useMIDI.ts](../../app/src/hooks/useMIDI.ts)
  - 已把 MIDI store 能力封装成 Hook
- [app/app/midi/connect.tsx](../../app/app/midi/connect.tsx)
  - 当前仍是 mock UI
- [app/app/game/%5BsongId%5D.tsx](../../app/app/game/%5BsongId%5D.tsx)
  - 已监听 `midiStore.activeNotes`
  - 外设输入和触屏输入走同一套判定逻辑

### 2.2 当前还缺什么

- 已经接入 `expo-dev-client` 依赖，并在 `app/modules/easy-piano-midi/` 生成本地 Expo Module 骨架
- 已经生成 `ios/` 和 `android/` 原生工程，并验证 `EasyPianoMidi` 自动链接进入原生工程
- iOS 侧已经完成 CoreMIDI 第一阶段，具备基础设备枚举、连接/断开与 `noteOn / noteOff` 解析能力
- 没有把原生 `noteOn / noteOff` 注入到 JS store
- 还没有完成真机外设验证
- Android 侧还没有开始 `MidiManager` 第一阶段实现

---

## 3. 推荐总体架构

```text
USB MIDI / BLE MIDI Device
          │
          ▼
iOS CoreMIDI / Android MidiManager
          │
          ▼
Expo Local Module (Swift / Kotlin)
          │
          ▼
TypeScript Adapter
          │
          ▼
midiStore
          │
          ├── MIDI 连接页
          └── 游戏页 / 判定引擎
```

核心原则:

- 原生层负责“设备”和“事件”
- JS 层负责“状态”和“业务”
- 游戏引擎不直接依赖平台 API
- 连接页和游戏页共用同一份 MIDI 状态源

---

## 4. Expo 侧实施路径

当前项目是 Expo App，但真实 MIDI 接入需要原生能力，因此应该切到 `Expo Development Build` 工作流。

### 4.1 推荐做法

1. 安装开发客户端依赖
2. 创建本地 Expo Module
3. 生成或接管 `ios/` 和 `android/` 原生工程
4. 在本地模块里实现 Swift / Kotlin MIDI 桥
5. 用 Development Build 调试，而不是只依赖 `Expo Go`

### 4.2 推荐命令

```bash
cd /Users/zhangza/code/easypiano/easy-piano/app
npx expo install expo-dev-client
npx create-expo-module@latest modules/easy-piano-midi --local --name EasyPianoMidi
```

生成本地模块后，再执行:

```bash
cd /Users/zhangza/code/easypiano/easy-piano/app
npx expo prebuild --clean
```

开发阶段建议直接使用:

```bash
cd /Users/zhangza/code/easypiano/easy-piano/app
npx expo run:ios
npx expo run:android
```

### 4.3 为什么不用只靠 Expo Go

- `Expo Go` 不包含你自定义的原生模块
- 一旦加入原生 MIDI 模块，就必须重新构建 Development Build
- 原生能力变更后，不能只靠刷新 JS bundle 生效

另外需要明确:

- USB MIDI 和 BLE MIDI 的最终验收要用真机完成
- 模拟器可以继续验证页面和导航，但不适合作为外设接入验收环境

---

## 5. 模块目录建议

推荐使用本地 Expo Module，而不是把原生代码散落到应用入口附近。

建议目录:

```text
app/
├── modules/
│   └── easy-piano-midi/
│       ├── expo-module.config.json
│       ├── src/
│       │   └── index.ts
│       ├── ios/
│       │   └── EasyPianoMidiModule.swift
│       └── android/
│           └── src/main/java/.../EasyPianoMidiModule.kt
```

这样做的好处:

- iOS / Android 实现集中
- JS API 明确
- 后续如需抽成独立模块也更容易

---

## 6. JS 层统一接口建议

原生模块最终不要直接把平台差异暴露给业务层，而是先收敛成统一 TS 接口。

### 6.1 设备模型建议

沿用现有 `MIDIDevice`，但建议加两个字段:

```ts
export interface MIDIDevice {
  id: string;
  name: string;
  type: 'usb' | 'bluetooth';
  connected: boolean;
  manufacturer?: string;
  isAvailable?: boolean;
}
```

### 6.2 事件模型建议

继续沿用现有 `MIDINoteEvent`:

```ts
export interface MIDINoteEvent {
  type: 'noteOn' | 'noteOff';
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
}
```

### 6.3 建议的原生模块 JS API

```ts
interface NativeMIDIModule {
  isSupported(): Promise<boolean>;
  listDevices(): Promise<MIDIDevice[]>;
  startScan(): Promise<void>;
  stopScan(): Promise<void>;
  connectDevice(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  addListener(event: 'devicesChanged' | 'connectionChanged' | 'note', cb: (...args: any[]) => void): void;
  removeAllListeners(eventName: string): void;
}
```

### 6.4 JS 适配层职责

建议新增一个轻量适配层，例如:

- `app/src/services/midi/nativeMIDI.ts`

负责:

- 调用原生模块
- 监听 `devicesChanged`
- 监听 `connectionChanged`
- 监听 `note`
- 把结果写入 `midiStore`

这样 UI 页面和游戏页只读 store，不直接碰原生模块。

---

## 7. iOS / iPadOS 实施方案

### 7.1 推荐技术

- `CoreMIDI` 负责 MIDI 设备与消息
- 如需自定义 BLE 扫描 UI，再补 `CoreBluetooth`

### 7.2 基本流程

1. 创建 `MIDIClient`
2. 创建输入端口
3. 枚举系统 MIDI 源
4. 选择目标源并连接
5. 在回调里解析收到的 MIDI 事件
6. 转成统一的 `MIDINoteEvent`
7. 通过 Expo Module 事件发给 JS

### 7.3 推荐 API

- `MIDIClientCreateWithBlock`
- `MIDIInputPortCreateWithProtocol`
- `MIDIGetNumberOfSources`
- `MIDIGetSource`
- `MIDIPortConnectSource`
- `MIDIPortDisconnectSource`

这些 API 都来自 Apple `CoreMIDI` 官方文档。

### 7.4 事件解析建议

原生层只需要优先处理这几类消息:

- `noteOn`
- `noteOff`
- `noteOn velocity = 0` 视作 `noteOff`

第一阶段可以先不做:

- 踏板
- Aftertouch
- Program Change
- SysEx
- MIDI 2.0 高级能力

### 7.5 BLE 相关边界

如果 BLE 连接页只是展示系统已经可见的 MIDI 设备，优先继续走 `CoreMIDI` 即可。

如果后续希望在 App 内直接扫描 BLE MIDI 外设，再补 `CoreBluetooth`，并处理蓝牙权限说明。Apple 的 Core Bluetooth 文档说明，使用相关 API 时需要 `NSBluetoothAlwaysUsageDescription`。

### 7.6 iOS 第一阶段交付标准

- 插入 USB MIDI 电钢琴后，App 能枚举到设备
- 连接指定设备后，按键能触发 `noteOn / noteOff`
- 游戏页能正确响应长音 Hold
- 断开设备后，`activeNotes` 会被清空，避免卡键

---

## 8. Android 实施方案

### 8.1 推荐技术

- `MidiManager`
- `MidiDeviceInfo`
- `MidiReceiver`

Android 官方文档说明:

- `MidiManager` 是应用访问 MIDI 服务的公共接口
- `MidiDeviceInfo` 能标记设备类型，包括 `TYPE_USB` 和 `TYPE_BLUETOOTH`

### 8.2 基本流程

1. 检查 `FEATURE_MIDI`
2. 获取 `MidiManager`
3. 注册 `DeviceCallback`
4. 枚举设备列表
5. 打开指定设备
6. 打开输入端口并监听数据
7. 把消息转换成统一 `MIDINoteEvent`
8. 发到 JS 层并更新 store

### 8.3 推荐 API

- `PackageManager.hasSystemFeature(PackageManager.FEATURE_MIDI)`
- `MidiManager.getDevices()`
- `MidiManager.registerDeviceCallback(...)`
- `MidiManager.openDevice(...)`
- `MidiManager.openBluetoothDevice(...)`
- `MidiDeviceInfo.getType()`

### 8.4 权限边界

如果后续在 Android 里做自定义 BLE 扫描 UI，而不是只消费系统已知 MIDI 设备，需要注意蓝牙权限。

Android 官方文档说明:

- Android 12 及以上，引入了 `BLUETOOTH_SCAN` 和 `BLUETOOTH_CONNECT`
- BLE 扫描 API 需要 `BLUETOOTH_SCAN`
- 访问或连接 `BluetoothDevice` 时需要 `BLUETOOTH_CONNECT`

因此建议分两步:

1. 第一阶段先优先实现 `USB MIDI`
2. 第二阶段做 BLE 时再完整引入蓝牙权限和扫描流程

### 8.5 Android 第一阶段交付标准

- 支持检测系统是否具备 MIDI 功能
- 支持枚举 USB MIDI 设备
- 连接成功后能稳定收到按键事件
- 断开时能触发 store 清理

---

## 9. 与现有前端代码的对接方式

### 9.1 连接页

[app/app/midi/connect.tsx](../../app/app/midi/connect.tsx) 当前使用 mock 数据。接入真实原生模块时建议按下面方式替换:

- `mockDevices` 替换为 store 中的 `availableDevices`
- `mockStatus` 替换为 store 中的 `connectionStatus`
- `handleStartBleScan` 改为调原生扫描接口
- `handleConnectDevice` 改为调用 store -> native connect
- `handleDisconnect` 改为调用 native disconnect

页面布局大体不需要重写，主要是数据源替换。

### 9.2 游戏页

[app/app/game/%5BsongId%5D.tsx](../../app/app/game/%5BsongId%5D.tsx) 已经消费 `midiStore.activeNotes`，所以原生接入后，游戏主逻辑可以尽量不动。

需要保证的只有两件事:

- 原生 `noteOn / noteOff` 能准确写入 store
- 设备断开和页面退出时能清空 `activeNotes`

### 9.3 时间戳策略

当前游戏页是通过 `activeNotes` 集合变化来触发按下和抬起逻辑，第一阶段不强依赖原生时间戳精度。

因此第一阶段建议:

- 先把 `timestamp` 保留下来用于日志和调试
- 游戏判定仍以 JS 收到事件时的节奏为主

后续如果需要进一步压缩延迟或对齐音频时钟，再做“原生时钟与 JS 时钟对齐”的专项优化。

---

## 10. 推荐实施顺序

1. 切换到 Development Build 工作流
2. 建立本地 Expo Module 骨架
3. 先完成 iOS `USB MIDI`
4. 把 iOS 设备枚举和事件桥接接到 `midiStore`
5. 用真实电钢琴验证游戏页和长音 Hold
6. 再补 Android `USB MIDI`
7. 最后补 BLE 扫描、权限和重连逻辑

原因是:

- iOS 当前是主平台
- 你们已经在用 iOS 模拟器和苹果设备做原型验证
- `USB MIDI` 的不确定性最少，能最快验证真实手感

---

## 11. 测试清单

### 11.1 连接层

- 设备插入后能出现在列表
- 设备拔出后能从列表移除
- 连接状态切换正确
- 断开后不会残留“已连接”状态
- 真机下验证 USB 直连与 BLE 连接，不以模拟器结果作为最终准入

### 11.2 事件层

- 单音 `noteOn / noteOff` 正确
- 重复快速按键不丢事件
- 双音或和弦可同时进入 `activeNotes`
- 提前松开长音会记为 `miss`
- 按住到结尾会正确结算 Hold

### 11.3 页面层

- MIDI 连接页测试键盘区能实时高亮
- 游戏页可用外接电钢琴完成整首曲目
- 结果页统计与实际演奏一致

### 11.4 异常场景

- 演奏中断开设备
- App 进入后台后恢复
- 蓝牙设备短暂掉线再重连
- 页面退出时仍有按键按下

---

## 12. 明确不在第一阶段做的事

- 麦克风识别
- 踏板与力度教学完整可视化
- MIDI 2.0 / UMP 专项支持
- 多设备同时连接
- App 内复杂 BLE 配对助手

这些能力不是不做，而是放在 USB MIDI 主链路稳定之后。

---

## 13. 参考资料

- Apple CoreMIDI / MIDI Services: [developer.apple.com](https://developer.apple.com/documentation/coremidi/midi-services)
- Apple `MIDIReceiveBlock` / 输入端口相关文档: [developer.apple.com](https://developer.apple.com/documentation/coremidi/midireceiveblock)
- Apple Bluetooth 开发页: [developer.apple.com](https://developer.apple.com/bluetooth/)
- Apple Core Bluetooth 文档: [developer.apple.com](https://developer.apple.com/documentation/corebluetooth/)
- Android `MidiManager`: [developer.android.com](https://developer.android.com/reference/android/media/midi/MidiManager.html)
- Android `MidiDeviceInfo`: [developer.android.com](https://developer.android.com/reference/android/media/midi/MidiDeviceInfo)
- Android 12 蓝牙权限变更: [developer.android.com](https://developer.android.com/about/versions/12/behavior-changes-12)
- Android BLE 扫描权限说明: [developer.android.com](https://developer.android.com/reference/android/bluetooth/le/BluetoothLeScanner)
- Expo Add custom native code: [docs.expo.dev](https://docs.expo.dev/workflow/customizing/)
- Expo Modules API get started: [docs.expo.dev](https://docs.expo.dev/modules/get-started/)
- Expo 开发版构建说明: [docs.expo.dev](https://docs.expo.dev/develop/development-builds/create-a-build)
