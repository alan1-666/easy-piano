# 电钢琴接入方案

> 版本: v1.0.0 | 更新日期: 2026-04-19

---

## 1. 结论

- 主方案: `USB MIDI` 数据线接入
- 备选方案: `BLE MIDI` 无线接入
- 补充模式: `麦克风识别`，仅作为声学钢琴或低精度陪练模式
- `HDMI` 只负责大屏投屏或音频输出，不承载琴键输入事件

这个结论的核心原因很简单: EasyPiano 当前的游戏玩法依赖精确的 `noteOn / noteOff`、长音 Hold 时长、左右手统计和后续可能加入的力度、踏板数据，主链路必须使用标准 MIDI 事件，而不是从音频里反推。

---

## 2. 方案对比

| 方案 | 适合度 | 优点 | 风险 / 限制 | 结论 |
|------|--------|------|-------------|------|
| USB MIDI | 最高 | 延迟最低、稳定性最好、事件最完整 | 需要转接头和机型兼容适配 | 作为主链路 |
| BLE MIDI | 高 | 无线方便、家庭场景更友好 | 延迟和抖动更难控，重连体验复杂 | 作为第二接入方式 |
| 麦克风识别 | 低 | 不需要外设，声学钢琴也能用 | 和弦、踏板、噪音、重复音识别更脆弱 | 仅做补充模式 |
| HDMI | 很低 | 适合投屏和课堂展示 | 不传输按键事件 | 不作为输入方案 |

---

## 3. 为什么主推 USB MIDI

### 3.1 对当前玩法最匹配

EasyPiano 已经在游戏原型里实现了这些核心能力:

- 精确判定 `perfect / great / good / miss`
- 长音 Hold 开始、持续和提前松手判定
- 左右手分别统计
- 动态音域键盘与多首曲目谱面

这些能力都依赖明确的按下和松开事件。`USB MIDI` 能天然提供：

- `noteOn`
- `noteOff`
- `velocity`
- `channel`
- 后续可扩展的踏板等控制消息

### 3.2 延迟和稳定性更适合节奏玩法

对下落式节奏玩法来说，输入链路越稳定越好。`USB MIDI` 通常比蓝牙更稳，也明显优于麦克风识别这种“先收音再推断音高”的链路。

---

## 4. 为什么 BLE MIDI 适合做第二方案

`BLE MIDI` 的优势是连接体验更轻，适合家庭、便携和无线场景。但它的挑战也很明确:

- 延迟比 USB 更高
- 连接质量会受距离、设备状态和系统蓝牙栈影响
- 扫描、配对、重连和断线恢复的边界更多

因此更合适的产品策略是:

1. 先把 `USB MIDI` 做稳，建立一条确定性强的主链路
2. 再补 `BLE MIDI`，复用同样的事件协议和游戏判定

---

## 5. 为什么麦克风识别不能做主链路

麦克风识别的优点是“不用接设备也能玩”，但它本质上是从音频波形推断音高和节奏，这和直接拿 MIDI 事件不是一回事。

在 EasyPiano 这个场景里，麦克风识别不适合作为主链路的原因包括:

- 和弦与复音识别更难
- 踏板、共鸣、环境噪声会影响判断
- 难以稳定拿到清晰的 `noteOff`
- 长音 Hold、重复音、快速音群容易失真

因此它更适合做一个单独模式:

- 声学钢琴陪练模式
- 无外设时的轻量体验模式
- 低要求入门试玩模式

---

## 6. HDMI 在方案里的角色

`HDMI` 更像“显示输出通道”，不是“钢琴输入通道”。

比较合理的使用方式是:

- iPad / iPhone 通过 HDMI 接电视或课堂大屏
- 电钢琴按键事件仍通过 `USB MIDI` 或 `BLE MIDI` 进入 App

也就是说，后续如果做“课堂大屏模式”，组合关系应该是:

- 画面输出: `HDMI`
- 键盘输入: `USB MIDI` 或 `BLE MIDI`

---

## 7. 平台实现建议

### 7.1 iOS / iPadOS

- 原生能力: `CoreMIDI`
- USB MIDI 适合作为首发实现
- BLE MIDI 也可以走系统 MIDI 能力接入

### 7.2 Android

- 原生能力: `MidiManager` / `MidiDeviceInfo`
- USB 和蓝牙都可以统一映射到标准 MIDI 事件流

### 7.3 Expo 项目限制

当前前端是 Expo 项目，但真实 MIDI 接入不会停留在 `Expo Go`。

原因是:

- `USB MIDI` / `BLE MIDI` 需要自定义原生能力
- 需要原生模块把系统 MIDI 事件桥接到 JS
- 因此需要 `Expo Development Build` 或更底层的原生工程能力

---

## 8. 当前代码已经具备的基础

目前仓库已经为外设接入铺好了统一输入入口，后续原生模块接入时不需要重写整套游戏逻辑。

### 8.1 统一输入状态

- [app/src/stores/midiStore.ts](../../app/src/stores/midiStore.ts)
  - 管理 `activeNotes`
  - 支持 `handleNoteEvent`
  - 可以统一接收触屏输入或外设输入

### 8.2 输入桥

- [app/src/hooks/useMIDI.ts](../../app/src/hooks/useMIDI.ts)
  - 已暴露 `handleNoteEvent`、`addActiveNote`、`removeActiveNote`

### 8.3 游戏页消费 MIDI 输入

- [app/app/game/[songId].tsx](../../app/app/game/%5BsongId%5D.tsx)
  - 已监听 `midiStore.activeNotes`
  - 外设输入和触屏输入会复用同一套判定逻辑

### 8.4 判定引擎已经支持长音

- [app/src/engine/GameEngine.ts](../../app/src/engine/GameEngine.ts)
  - 已支持长音 Hold 开始
  - 已支持按住到结尾的成功结算
  - 已支持提前松手记为 `miss`

---

## 9. 推荐实施顺序

1. `iOS USB MIDI`
   - 优先把 iPad / iPhone 直连电钢琴跑通
   - 尽快验证真实延迟、判定手感和稳定性
2. `Android USB MIDI`
   - 复用统一事件协议
   - 补充 Android 端设备枚举和权限处理
3. `BLE MIDI`
   - 在已有主链路稳定后再补无线方案
   - 重点处理扫描、重连、断线恢复
4. `麦克风识别模式`
   - 作为单独模式建设，不进入主判定链路

工程落地细节见 [原生 MIDI 接入实施文档](./native-midi-implementation.md)。

---

## 10. 对产品文档的影响

后续涉及电钢琴接入、设备页、课堂模式或真机调试时，文档应统一遵守以下约定:

- 只把 `USB MIDI` 和 `BLE MIDI` 视为标准按键输入方案
- 明确区分“输入链路”和“画面输出链路”
- 若提到 `HDMI`，默认语义为投屏，不表示琴键数据接入
- 若提到 `麦克风识别`，默认语义为补充模式，而非主玩法

---

## 11. 参考资料

- Apple CoreMIDI / MIDI Services: [developer.apple.com](https://developer.apple.com/documentation/coremidi/midi-services)
- Apple Bluetooth 开发页: [developer.apple.com](https://developer.apple.com/bluetooth/)
- Apple GarageBand iPhone 蓝牙 MIDI 说明: [support.apple.com](https://support.apple.com/en-bw/guide/garageband-iphone/chse356a0321/ios)
- Android `MidiManager`: [developer.android.com](https://developer.android.com/reference/android/media/midi/MidiManager.html)
- Android `MidiDeviceInfo`: [developer.android.com](https://developer.android.com/reference/android/media/midi/MidiDeviceInfo)
- Expo 自定义原生代码: [docs.expo.dev](https://docs.expo.dev/workflow/customizing/)
- Apple Logic Pro 音频转 MIDI 说明: [support.apple.com](https://support.apple.com/en-nz/guide/logicpro/lgcpe2fd1b83/mac)
