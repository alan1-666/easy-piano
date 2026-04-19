# EasyPiano - 游戏化钢琴学习 App 设计文档

> 版本: v0.2.1 | 更新日期: 2026-04-19

> 当前说明: 这份文档保留长期设计方向，同时会标注已落地原型的关键状态。当前前端原型已经具备首页、曲库、MIDI 连接页、游戏页和结果页；游戏页现阶段使用 React Native 视图实现下落音符与键盘交互，原生 USB MIDI / BLE MIDI 接入仍在规划实施中。电钢琴接入的最新结论见 [电钢琴接入方案](./architecture/piano-input-connectivity.md)。

---

## 目录

1. [产品概述](#1-产品概述)
2. [竞品分析](#2-竞品分析)
3. [技术栈选型](#3-技术栈选型)
4. [系统架构](#4-系统架构)
5. [核心功能设计](#5-核心功能设计)
6. [数据模型设计](#6-数据模型设计)
7. [API 设计](#7-api-设计)
8. [MIDI 技术方案](#8-midi-技术方案)
9. [音频引擎方案](#9-音频引擎方案)
10. [游戏引擎设计](#10-游戏引擎设计)
11. [离线模式设计](#11-离线模式设计)
12. [容错与错误处理](#12-容错与错误处理)
13. [测试策略](#13-测试策略)
14. [部署与运维](#14-部署与运维)
15. [国际化设计](#15-国际化设计)
16. [项目结构](#16-项目结构)
17. [实施路线图](#17-实施路线图)

---

## 1. 产品概述

### 1.1 愿景

让学钢琴像玩游戏一样有趣。通过 MIDI 连接电钢琴，将传统枯燥的练琴过程转化为互动游戏体验，降低钢琴学习的入门门槛。

### 1.2 目标用户

| 用户群体 | 特征 | 核心需求 |
|---------|------|---------|
| 零基础成人 | 20-35岁，有学琴兴趣但怕枯燥 | 轻松有趣地入门 |
| 琴童家长 | 孩子4-12岁，希望提高练琴兴趣 | 让孩子主动练琴 |
| 业余爱好者 | 有一定基础，想弹喜欢的曲子 | 丰富曲库 + 挑战 |

### 1.3 核心卖点

- **MIDI 精准连接**: 比麦克风识别精准100倍，力度/时值全捕获
- **游戏化驱动**: 下落音符 + 闯关 + 成就 + 排行榜
- **系统化课程**: 不只是工具，是完整的学习路径
- **即时反馈**: 每个音符实时评分，所见即所得

### 1.4 平台策略

- **Phase 1**: iOS + iPadOS (琴童用户以 iPad 为主，放谱架上体验最佳，需同步适配)
- **Phase 2**: Android (React Native 跨平台复用)

### 1.5 商业模式

| 模式 | 内容 | 说明 |
|------|------|------|
| **免费层** | Level 1 全部课程 + 5首免费曲库 | 降低入门门槛，让用户体验核心价值 |
| **订阅制** | ¥28/月 或 ¥198/年 | 解锁全部课程 + 完整曲库 + 排行榜 |
| **终身买断** | ¥498 一次性 | 针对长期用户，降低决策成本 |
| **单曲购买** | ¥3-6/首 | 非订阅用户按需购买热门曲目 |

设计影响：
- 数据模型需增加 `subscriptions` 表和 `song_purchases` 表
- API 需要权限校验中间件，根据订阅状态决定内容访问权限
- 曲目和课程数据需增加 `is_free` 标记字段

---

## 2. 竞品分析

### 2.1 市场格局

```
                    游戏性强
                       ↑
                       |
          Yousician    |    ★ EasyPiano (目标定位)
                       |
    麦克风 ←───────────┼───────────→ MIDI
                       |
          Simply Piano |    Synthesia
          Flowkey      |    Piano Marvel
                       |
                       ↓
                    教学性强
```

### 2.2 详细对比

| 维度 | Simply Piano | Yousician | Synthesia | Piano Marvel | **EasyPiano** |
|------|-------------|-----------|-----------|-------------|---------------|
| 输入方式 | 麦克风 | 麦克风 | MIDI | MIDI | **MIDI** |
| 识别精度 | 中 | 中 | 高 | 高 | **高** |
| 游戏性 | 中 | 高 | 中 | 低 | **高** |
| 课程体系 | 完善 | 完善 | 无 | 完善 | **完善** |
| 力度分析 | 否 | 否 | 是 | 是 | **是** |
| 价格 | ¥148/月 | ¥128/月 | ¥198买断 | ¥98/月 | **待定** |

### 2.3 差异化策略

1. **MIDI + 强游戏性**: 市面上 MIDI app 游戏性弱，游戏性强的 app 用麦克风
2. **力度教学**: 利用 MIDI velocity 数据做力度训练，这是麦克风 app 做不到的
3. **精确到毫秒的节奏训练**: MIDI 时间精度远超麦克风

---

## 3. 技术栈选型

### 3.1 总览

| 层级 | 技术 | 版本 | 理由 |
|------|------|------|------|
| **移动端框架** | React Native + Expo | SDK 52+ | 跨平台，生态成熟，后续 Android 低成本 |
| **游戏渲染** | React Native Views（当前）/ Skia（预研） | — | 当前原型优先保证稳定可运行，后续如需更强渲染性能再升级 |
| **状态管理** | Zustand | 5.x | 轻量、TypeScript 友好、性能好 |
| **导航** | Expo Router | 4.x | 基于文件系统路由，开发体验好 |
| **MIDI 连接** | CoreMIDI / Android MIDI API (Native Module) | — | 主方案为 USB MIDI，BLE MIDI 为第二接入方式 |
| **音频引擎** | AUGraph + SoundFont (Native Module) | — | 虚拟键盘音色、示范播放、节拍器，低延迟 |
| **后端框架** | Go + Gin | 1.22+ | 高性能、并发好，用户指定 |
| **ORM** | GORM | 2.x | Go 生态最成熟的 ORM |
| **数据库** | PostgreSQL | 16+ | 关系型，适合课程/用户数据 |
| **缓存** | Redis | 7+ | 排行榜、会话管理 |
| **认证** | JWT + Refresh Token | — | 无状态认证，移动端友好 |
| **对象存储** | S3 兼容 (MinIO/阿里云OSS) | — | 音频文件、曲谱资源 |

### 3.2 前端关键库

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react-native": "0.76.x",
    "@shopify/react-native-skia": "^1.0.0",
    "zustand": "^5.0.0",
    "expo-router": "~4.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-mmkv": "^3.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0"
  }
}
```

### 3.3 后端关键库

```go
module github.com/alan1-666/easy-piano/server

require (
    github.com/gin-gonic/gin         v1.10+
    gorm.io/gorm                     v1.25+
    gorm.io/driver/postgres          v1.5+
    github.com/redis/go-redis/v9     v9.5+
    github.com/golang-jwt/jwt/v5     v5.2+
    github.com/gomidi/midi/v2        v2.2+    // MIDI 文件解析
    go.uber.org/zap                  v1.27+   // 日志
    github.com/swaggo/swag           v1.16+   // API 文档
)
```

---

## 4. 系统架构

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    iOS App (React Native)            │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ 课程模块  │  │ 游戏引擎  │  │  MIDI Native     │  │
│  │ (Screen) │  │ (Skia)   │  │  Module (Swift)   │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                  │            │
│  ┌────┴──────────────┴──────────────────┴────────┐  │
│  │              Zustand Store                     │  │
│  │   (gameState, midiState, userState, courses)  │  │
│  └────────────────────┬──────────────────────────┘  │
│                       │                              │
│  ┌────────────────────┴──────────────────────────┐  │
│  │           API Client (Axios + React Query)     │  │
│  └────────────────────┬──────────────────────────┘  │
└───────────────────────┼──────────────────────────────┘
                        │ HTTPS
                        ▼
┌───────────────────────────────────────────────────────┐
│                   Go Backend (Gin)                     │
│                                                       │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐ │
│  │  Auth   │  │  Course   │  │  Score  │  │ Leader │ │
│  │ Handler │  │  Handler  │  │ Handler │  │ board  │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └───┬────┘ │
│       └─────────────┴─────────────┴────────────┘      │
│                         │                              │
│  ┌──────────────────────┴───────────────────────────┐ │
│  │              Service Layer                        │ │
│  └──────────────────────┬───────────────────────────┘ │
│                         │                              │
│  ┌──────────┐    ┌──────┴─────┐    ┌──────────────┐  │
│  │PostgreSQL│    │   Redis    │    │   S3 / OSS   │  │
│  │用户/课程  │    │排行榜/缓存  │    │  曲谱/音频    │  │
│  └──────────┘    └────────────┘    └──────────────┘  │
└───────────────────────────────────────────────────────┘
```

### 4.2 MIDI 数据流

```
┌──────────┐    USB / BLE-MIDI     ┌──────────────┐
│ 电钢琴    │ ───────────────────→  │   CoreMIDI   │
│(MIDI Out) │                      │  (iOS 系统)   │
└──────────┘                       └──────┬───────┘
                                          │ MIDI Message
                                          ▼
                                   ┌──────────────┐
                                   │ Native Module │
                                   │   (Swift)     │
                                   └──────┬───────┘
                                          │ RCTEvent / TurboModule
                                          ▼
                                   ┌──────────────┐
                                   │  useMIDI()   │
                                   │  React Hook  │
                                   └──────┬───────┘
                                          │ { note, velocity, timestamp, channel }
                                          ▼
                                   ┌──────────────┐
                                   │ Game Engine  │
                                   │ 音符匹配+评分 │
                                   └──────┬───────┘
                                          │
                              ┌───────────┼───────────┐
                              ▼           ▼           ▼
                        ┌─────────┐ ┌──────────┐ ┌────────┐
                        │ Skia UI │ │评分动画   │ │连击计数 │
                        │键盘高亮  │ │Perfect!  │ │Combo!  │
                        └─────────┘ └──────────┘ └────────┘
```

### 4.3 延迟预算

整个链路从按键到画面反馈需要控制在 **< 30ms**:

| 环节 | 预算 | 说明 |
|------|------|------|
| MIDI 传输 (USB) | < 1ms | USB 几乎无延迟 |
| MIDI 传输 (BLE) | 3-10ms | 蓝牙有固有延迟 |
| CoreMIDI 处理 | < 1ms | 系统级处理 |
| Native → JS Bridge | 5-10ms | TurboModule 可优化到 < 5ms |
| Game Engine 处理 | < 2ms | 纯计算 |
| Skia 渲染 | < 16ms | 一帧时间 (60fps) |
| **总计 (USB)** | **< 25ms** | 可接受 |
| **总计 (BLE)** | **< 35ms** | 可接受 |

#### 降级方案

当 JS 线程繁忙（如 Skia 渲染密集帧期间），Native → JS Bridge 延迟可能飙升到 20ms+。应对策略：

1. **延迟监测**: 运行时统计每次 MIDI 事件从 Native 到 JS 的实际延迟，展示在开发者调试面板
2. **关键逻辑下沉**: 如果监测发现延迟持续超标，将 `findMatchingNote` 音符匹配逻辑下沉到 Swift Native 层，JS 层只接收匹配结果
3. **时间戳校正**: 所有 MIDI 事件使用 CoreMIDI 的 `MIDITimeStamp`（mach_absolute_time 精度），而非 JS 层接收时间，消除过桥延迟对评分精度的影响

### 4.4 时间同步机制

游戏中的时间基准至关重要，直接影响评分准确性：

```
时间源选择:
┌─────────────────────────────────────────────────────────────┐
│  CoreMIDI MIDITimeStamp (mach_absolute_time)                │
│  ↓ 转换为毫秒                                                │
│  Native Module 记录 MIDI 事件绝对时间                         │
│  ↓ 传递到 JS                                                 │
│  GameEngine 使用绝对时间做匹配 (非 deltaTime 累加)              │
│  ↓                                                           │
│  NoteScheduler 基于绝对时间计算音符位置 (容忍帧率波动)           │
└─────────────────────────────────────────────────────────────┘

关键原则:
- 音符位置 = f(absoluteTime, songStartTime, bpm)，非 deltaTime 累加
- MIDI 事件时间戳来自 CoreMIDI，不受 JS 线程阻塞影响
- Skia 渲染帧率不稳定时，音符位置仍然准确（因为每帧根据绝对时间重新计算）
```

---

## 5. 核心功能设计

### 5.1 MIDI 连接模块

#### 功能清单

| 功能 | 描述 | 优先级 |
|------|------|--------|
| USB MIDI 自动发现 | 插入即识别，无需手动配置 | P0 |
| BLE-MIDI 扫描 | 列出附近蓝牙 MIDI 设备 | P0 |
| BLE-MIDI 配对 | 选择设备一键连接 | P0 |
| 连接状态显示 | 实时显示连接/断开状态 | P0 |
| 自动重连 | 断线后自动尝试重连 | P0 |
| MIDI 信号测试 | 连接后弹几个键验证信号 | P1 |
| 多设备管理 | 记住历史设备，快速切换 | P1 |

#### Native Module 接口设计 (Swift → JS)

```typescript
// MIDIModule.ts - Native Module 的 TypeScript 接口

interface MIDIDevice {
  id: string;
  name: string;
  type: 'usb' | 'bluetooth';
  connected: boolean;
}

interface MIDINoteEvent {
  type: 'noteOn' | 'noteOff';
  note: number;        // 0-127, 60 = Middle C (C4)
  velocity: number;    // 0-127
  channel: number;     // 0-15
  timestamp: number;   // 毫秒级时间戳
}

interface MIDIModule {
  // 设备管理
  getAvailableDevices(): Promise<MIDIDevice[]>;
  connectDevice(deviceId: string): Promise<boolean>;
  disconnectDevice(deviceId: string): Promise<void>;
  startBLEScan(): Promise<void>;
  stopBLEScan(): Promise<void>;

  // 事件监听
  onDeviceConnected(callback: (device: MIDIDevice) => void): void;
  onDeviceDisconnected(callback: (device: MIDIDevice) => void): void;
  onNoteEvent(callback: (event: MIDINoteEvent) => void): void;
  onBLEDeviceFound(callback: (device: MIDIDevice) => void): void;
}
```

### 5.2 下落音符游戏

#### 游戏界面布局

```
┌────────────────────────────────────┐
│  ♪ 小星星        ⚙️  Score: 1280   │  ← 顶部信息栏
│  ───────────────────────────────── │
│                                    │
│    ┃   ┃   ┃   ┃   ┃   ┃   ┃     │
│    ┃   ┃ █ ┃   ┃   ┃   ┃   ┃     │  ← 下落区域
│    ┃   ┃ █ ┃   ┃ █ ┃   ┃   ┃     │    音符方块从上方
│    ┃ █ ┃   ┃   ┃ █ ┃   ┃   ┃     │    下落到判定线
│    ┃ █ ┃   ┃   ┃   ┃ █ ┃   ┃     │
│    ┃   ┃   ┃ █ ┃   ┃ █ ┃   ┃     │
│  ══╬═══╬═══╬═══╬═══╬═══╬═══╬══   │  ← 判定线
│    ┃   ┃   ┃   ┃   ┃   ┃   ┃     │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐   │  ← 虚拟键盘
│  │C│D│E│F│G│A│B│C│D│E│F│G│A│   │    (显示当前可见
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘   │     音域范围)
│                                    │
│  Combo: 23x    Perfect!            │  ← 底部反馈
│  ████████████░░░ 68%               │  ← 进度条
└────────────────────────────────────┘
```

#### 音符渲染规则

| 属性 | 规则 |
|------|------|
| 颜色 | 左手 = 蓝色系，右手 = 绿色系；黑键略深 |
| 宽度 | 与对应琴键宽度一致 |
| 高度 | 与音符时值成正比 (全音符 > 二分 > 四分 > 八分) |
| 下落速度 | 与 BPM 同步，可调 0.25x ~ 2x |
| 透明度 | 已弹过的音符渐隐 |

#### 评分系统

```
                    完美区间   良好区间   可接受区间
                   ←──50ms──→←─100ms─→←──200ms──→
                        |         |         |
    ────────────────────┼─────────┼─────────┼──────── 时间轴
                        |         |         |
                    判定线到达时刻

    Perfect (完美)  : 时间偏差 ≤ 50ms   → 100分 × combo倍率
    Great   (很好)  : 时间偏差 ≤ 100ms  → 75分  × combo倍率
    Good    (不错)  : 时间偏差 ≤ 200ms  → 50分  × combo倍率
    Miss    (错过)  : 时间偏差 > 200ms 或按错键 → 0分, combo重置
```

#### Combo 倍率

| 连击数 | 倍率 |
|--------|------|
| 0-9 | 1.0x |
| 10-29 | 1.2x |
| 30-49 | 1.5x |
| 50-99 | 2.0x |
| 100+ | 3.0x |

#### 星级评价

| 星级 | 条件 |
|------|------|
| ★☆☆ | 完成度 ≥ 60% |
| ★★☆ | 完成度 ≥ 80% 且 Perfect率 ≥ 50% |
| ★★★ | 完成度 ≥ 95% 且 Perfect率 ≥ 80% |

### 5.3 练习模式

| 模式 | 描述 | 使用场景 |
|------|------|---------|
| **标准模式** | 音符按原速下落，实时评分 | 正式挑战/考核 |
| **等待模式** | 音符到达判定线后暂停，等弹对了再继续 | 初学者慢慢练 |
| **自由速度** | 用户自行调节 0.25x ~ 2x 速度 | 难段反复练 |
| **分手练习** | 只显示左手或右手音符 | 分手练习 |
| **循环练习** | 选定小节范围反复循环 | 攻克难点 |

### 5.4 课程体系

#### 课程结构

```
课程体系
├── Level 1: 钢琴启蒙 (10课)
│   ├── 1.1 认识键盘 - 白键与黑键
│   ├── 1.2 坐姿与手型
│   ├── 1.3 找到中央C
│   ├── 1.4 右手 do re mi
│   ├── 1.5 右手 do re mi fa sol
│   ├── 1.6 节奏入门 - 四分音符
│   ├── 1.7 节奏进阶 - 二分音符与全音符
│   ├── 1.8 第一首曲子 - 小星星 (右手)
│   ├── 1.9 左手入门 - do si la sol fa
│   └── 1.10 闯关挑战 - Level 1 Boss
│
├── Level 2: 基础演奏 (12课)
│   ├── 2.1 八分音符
│   ├── 2.2 附点音符
│   ├── 2.3 C大调音阶
│   ├── 2.4 简单指法 - 穿指与跨指
│   ├── 2.5 力度控制 - forte 与 piano
│   ├── 2.6 欢乐颂 (右手)
│   ├── 2.7 左手伴奏入门
│   ├── 2.8 双手配合 - 小星星 (双手)
│   ├── 2.9 简单和弦 - C / G / Am / F
│   ├── 2.10 生日快乐 (双手)
│   ├── 2.11 连奏与断奏
│   └── 2.12 闯关挑战 - Level 2 Boss
│
├── Level 3: 进阶技巧 (12课)
│   ├── 3.1 G大调
│   ├── 3.2 F大调
│   ├── 3.3 升降号
│   ├── 3.4 踏板入门 (MIDI 踏板)
│   ├── 3.5 琶音基础
│   ├── 3.6 卡农 (简化版)
│   ├── 3.7 三连音
│   ├── 3.8 切分音
│   ├── 3.9 梦中的婚礼 (简化版)
│   ├── 3.10 小调入门 - Am
│   ├── 3.11 表情记号
│   └── 3.12 闯关挑战 - Level 3 Boss
│
└── Level 4+: 持续扩展...
```

#### 每课结构

```
一节课 (约15-20分钟)
│
├── 1. 知识讲解 (2-3分钟)
│   └── 动画 + 文字介绍新概念
│
├── 2. 示范演奏 (1-2分钟)
│   └── 播放示范 MIDI + 下落音符演示
│
├── 3. 跟弹练习 (5-8分钟)
│   ├── 片段1: 等待模式 (容错)
│   ├── 片段2: 慢速模式 (0.5x)
│   └── 片段3: 原速模式
│
├── 4. 挑战关卡 (3-5分钟)
│   └── 标准模式评分，需达到1星才算通过
│
└── 5. 课后总结
    └── 评分 + 薄弱点提示 + 鼓励
```

### 5.5 用户系统

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 手机号/邮箱注册 | 基础注册登录 | P0 |
| Apple ID 登录 | iOS 要求 | P0 |
| 微信登录 | 国内用户必备 | P1 |
| 练习记录 | 每次练习时长/曲目/评分 | P0 |
| 进度同步 | 多设备进度云同步 | P0 |
| 个人主页 | 练习统计、成就展示 | P1 |
| 家长控制 | 儿童账号绑定家长、练习时长限制、内容过滤 | P1 |
| 用户设置 | 下落速度偏好、左右手颜色、音色选择等个性化配置 | P1 |

### 5.6 游戏化系统 (P1)

#### 经验值 & 等级

```
每次练习获得 XP:
  - 完成课程: 100 XP
  - 每首曲子: 基础分 × 星级 (1/2/3) XP
  - 每日首次登录: 20 XP
  - 连续打卡奖励: 天数 × 10 XP

等级:
  Lv.1  初学者     0 XP
  Lv.5  入门琴手   500 XP
  Lv.10 业余琴手   2000 XP
  Lv.20 进阶琴手   8000 XP
  Lv.30 钢琴达人   20000 XP
  Lv.50 钢琴大师   60000 XP
```

#### 成就系统

| 成就 | 条件 | 图标 |
|------|------|------|
| 初次触键 | 完成第一次 MIDI 连接 | 🎹 |
| 第一首歌 | 完成第一首曲目 | 🎵 |
| 完美主义 | 单曲全 Perfect | 💎 |
| 坚持不懈 | 连续练习7天 | 🔥 |
| 百曲斩 | 完成100首曲目 | 👑 |
| 速度恶魔 | 2x 速度通关 | ⚡ |

### 5.7 曲库系统

#### 曲目数据格式

每首曲目在后端存储为结构化 JSON (从 MIDI 文件解析而来):

```json
{
  "id": "song_001",
  "title": "小星星",
  "artist": "莫扎特",
  "difficulty": 1,
  "bpm": 120,
  "timeSignature": "4/4",
  "keySignature": "C",
  "duration": 45,
  "tags": ["入门", "古典", "儿歌"],
  "tracks": [
    {
      "hand": "right",
      "notes": [
        { "note": 60, "start": 0, "duration": 500, "velocity": 80 },
        { "note": 60, "start": 500, "duration": 500, "velocity": 80 },
        { "note": 67, "start": 1000, "duration": 500, "velocity": 85 },
        { "note": 67, "start": 1500, "duration": 500, "velocity": 85 }
      ]
    },
    {
      "hand": "left",
      "notes": [
        { "note": 48, "start": 0, "duration": 2000, "velocity": 60 }
      ]
    }
  ]
}
```

#### 曲目分级

| 难度 | 星数 | 特征 |
|------|------|------|
| 1 | ★ | 单手、简单节奏、窄音域 |
| 2 | ★★ | 单手、稍复杂节奏 |
| 3 | ★★★ | 简单双手、基本和弦 |
| 4 | ★★★★ | 双手配合、变化多 |
| 5 | ★★★★★ | 快速音群、复杂和弦 |

---

## 6. 数据模型设计

### 6.1 ER 图

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │   courses    │     │    songs     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ username     │     │ title        │     │ title        │
│ email        │     │ description  │     │ artist       │
│ phone        │     │ level        │     │ difficulty   │
│ avatar_url   │     │ order_index  │     │ bpm          │
│ password_hash│     │ is_free      │     │ duration     │
│ apple_id     │     │ created_at   │     │ time_sig     │
│ wechat_openid│     └──────┬───────┘     │ key_sig      │
│ level        │            │             │ midi_data    │
│ xp           │            │             │ tags         │
│ parent_id    │ (家长账号)   │             │ cover_url    │
│ is_child     │            │             │ is_free      │
│ created_at   │            │             │ locale       │
│ deleted_at   │ (软删除)    │             │ created_at   │
└──────┬───────┘     ┌──────┴───────┐     └──────┬───────┘
       │             │   lessons    │            │
       │             ├──────────────┤            │
       │             │ id           │            │
       │             │ course_id    │←───────────┘
       │             │ song_id      │    (lesson 关联 song)
       │             │ title        │
       │             │ description  │
       │             │ order_index  │
       │             │ type         │  (teach/practice/challenge)
       │             │ content      │  (知识点JSON)
       │             └──────┬───────┘
       │                    │
       │             ┌──────┴───────┐
       └────────────→│ user_progress│
                     ├──────────────┤
                     │ id           │
                     │ user_id      │
                     │ lesson_id    │
                     │ status       │  (locked/unlocked/completed)
                     │ best_score   │
                     │ stars        │
                     │ attempts     │
                     │ completed_at │
                     └──────────────┘

┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ practice_logs│     │  achievements    │     │  subscriptions   │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id           │     │ id               │     │ id               │
│ user_id      │     │ name             │     │ user_id          │
│ song_id      │     │ description      │     │ plan             │ (monthly/yearly/lifetime)
│ mode         │     │ icon             │     │ status           │ (active/expired/cancelled)
│ speed        │     │ condition_type   │     │ started_at       │
│ score        │     │ condition_value  │     │ expires_at       │
│ accuracy     │     └────────┬─────────┘     │ apple_tx_id      │
│ max_combo    │              │               └──────────────────┘
│ perfect_count│     ┌────────┴─────────┐
│ great_count  │     │ user_achievements│     ┌──────────────────┐
│ good_count   │     ├──────────────────┤     │  song_purchases  │
│ miss_count   │     │ id               │     ├──────────────────┤
│ duration     │     │ user_id          │     │ id               │
│ played_at    │     │ achievement_id   │     │ user_id          │
│ synced       │     │ unlocked_at      │     │ song_id          │
└──────────────┘     └──────────────────┘     │ purchased_at     │
                                              │ apple_tx_id      │
┌──────────────────┐                          └──────────────────┘
│  user_settings   │
├──────────────────┤
│ id               │
│ user_id          │
│ fall_speed       │  (默认下落速度偏好)
│ left_hand_color  │
│ right_hand_color │
│ sound_font       │  (音色选择)
│ metronome_on     │
│ daily_goal_min   │  (每日练习目标分钟数)
│ locale           │  (语言偏好)
└──────────────────┘
```

### 6.2 Go Model 定义

```go
// model/user.go
type User struct {
    ID            uint           `gorm:"primaryKey"`
    Username      string         `gorm:"uniqueIndex;size:50"`
    Email         string         `gorm:"uniqueIndex;size:100"`
    Phone         string         `gorm:"uniqueIndex;size:20"`
    PasswordHash  string         `gorm:"size:255"`
    AppleID       string         `gorm:"uniqueIndex;size:200"`
    WechatOpenID  string         `gorm:"uniqueIndex;size:200"`
    AvatarURL     string         `gorm:"size:500"`
    Level         int            `gorm:"default:1"`
    XP            int            `gorm:"default:0"`
    ParentID      *uint          `gorm:"index"`
    IsChild       bool           `gorm:"default:false"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
    DeletedAt     gorm.DeletedAt `gorm:"index"`
}

// model/song.go
type Song struct {
    ID            uint           `gorm:"primaryKey"`
    Title         string         `gorm:"size:200"`
    Artist        string         `gorm:"size:100"`
    Difficulty    int            `gorm:"index"`
    BPM           int
    Duration      int            // 秒
    TimeSignature string         `gorm:"size:10"`  // "4/4", "3/4"
    KeySignature  string         `gorm:"size:10"`  // "C", "G", "Am"
    MidiData      datatypes.JSON // 曲目JSON数据
    Tags          datatypes.JSON
    CoverURL      string         `gorm:"size:500"`
    IsFree        bool           `gorm:"default:false;index"`
    Locale        string         `gorm:"size:10;default:'zh-CN'"`
    CreatedAt     time.Time
}

// model/practice_log.go
type PracticeLog struct {
    ID           uint      `gorm:"primaryKey"`
    UserID       uint      `gorm:"index"`
    SongID       uint      `gorm:"index"`
    Mode         string    `gorm:"size:20"`  // standard/wait/free
    Speed        float64   `gorm:"default:1.0"` // 0.25 ~ 2.0
    Score        int
    Accuracy     float64   // 0.0 ~ 1.0
    MaxCombo     int
    PerfectCount int
    GreatCount   int
    GoodCount    int
    MissCount    int
    Duration     int       // 秒
    PlayedAt     time.Time `gorm:"index"`
    Synced       bool      `gorm:"default:true"` // 离线记录同步标记
}

// model/subscription.go
type Subscription struct {
    ID         uint      `gorm:"primaryKey"`
    UserID     uint      `gorm:"index"`
    Plan       string    `gorm:"size:20"` // monthly/yearly/lifetime
    Status     string    `gorm:"size:20"` // active/expired/cancelled
    StartedAt  time.Time
    ExpiresAt  *time.Time
    AppleTxID  string    `gorm:"size:200"`
    CreatedAt  time.Time
    UpdatedAt  time.Time
}

// model/user_settings.go
type UserSettings struct {
    ID             uint    `gorm:"primaryKey"`
    UserID         uint    `gorm:"uniqueIndex"`
    FallSpeed      float64 `gorm:"default:1.0"`
    LeftHandColor  string  `gorm:"size:7;default:'#4A90D9'"`
    RightHandColor string  `gorm:"size:7;default:'#50C878'"`
    SoundFont      string  `gorm:"size:50;default:'default'"`
    MetronomeOn    bool    `gorm:"default:false"`
    DailyGoalMin   int     `gorm:"default:30"`
    Locale         string  `gorm:"size:10;default:'zh-CN'"`
}
```

---

## 7. API 设计

### 7.1 API 概览

Base URL: `https://api.easypiano.app/v1`

#### 认证

| 端点 | 方法 | 描述 |
|------|------|------|
| `/auth/register` | POST | 注册 |
| `/auth/login` | POST | 登录 |
| `/auth/refresh` | POST | 刷新 Token |
| `/auth/apple` | POST | Apple ID 登录 |
| `/auth/wechat` | POST | 微信登录 |

#### 用户

| 端点 | 方法 | 描述 |
|------|------|------|
| `/users/me` | GET | 获取当前用户信息 |
| `/users/me` | PUT | 更新用户信息 |
| `/users/me/stats` | GET | 获取练习统计 |
| `/users/me/settings` | GET | 获取用户设置 |
| `/users/me/settings` | PUT | 更新用户设置 |
| `/users/me/children` | GET | 获取绑定的儿童账号列表 |
| `/users/me/children` | POST | 创建儿童账号 |

#### 课程

| 端点 | 方法 | 描述 |
|------|------|------|
| `/courses` | GET | 获取课程列表 |
| `/courses/:id/lessons` | GET | 获取课程下的课时 |
| `/lessons/:id` | GET | 获取课时详情 (含曲谱数据) |
| `/lessons/:id/complete` | POST | 提交课时完成记录 |

#### 曲库

| 端点 | 方法 | 描述 |
|------|------|------|
| `/songs` | GET | 曲目列表 (支持筛选/分页) |
| `/songs/:id` | GET | 曲目详情 + MIDI 数据 |

#### 练习记录

| 端点 | 方法 | 描述 |
|------|------|------|
| `/practice/log` | POST | 上传练习记录 |
| `/practice/sync` | POST | 批量同步离线练习记录 |
| `/practice/history` | GET | 练习历史 |
| `/practice/streak` | GET | 连续打卡天数 |

#### 订阅 & 购买

| 端点 | 方法 | 描述 |
|------|------|------|
| `/subscription/status` | GET | 当前订阅状态 |
| `/subscription/verify` | POST | 验证 Apple IAP 收据 |
| `/purchases/songs` | GET | 已购买曲目列表 |
| `/purchases/songs` | POST | 购买单曲 (验证收据) |

#### 排行榜 (P1)

| 端点 | 方法 | 描述 |
|------|------|------|
| `/leaderboard/song/:id` | GET | 单曲排行 |
| `/leaderboard/weekly` | GET | 周排行 |

### 7.2 关键 API 示例

#### 登录

```
POST /v1/auth/login

Request:
{
  "email": "user@example.com",
  "password": "xxx"
}

Response:
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "username": "pianist",
    "level": 5,
    "xp": 1200,
    "avatar_url": "https://..."
  }
}
```

#### 获取课时详情

```
GET /v1/lessons/3

Response:
{
  "id": 3,
  "course_id": 1,
  "title": "找到中央C",
  "description": "学习在键盘上找到中央C的位置",
  "type": "teach",
  "order_index": 3,
  "content": {
    "sections": [
      {
        "type": "text",
        "body": "中央C位于钢琴键盘的正中间位置..."
      },
      {
        "type": "image",
        "url": "https://.../middle-c.png"
      },
      {
        "type": "practice",
        "song_id": 101,
        "mode": "wait",
        "description": "现在请在你的钢琴上按下中央C"
      }
    ]
  },
  "song": {
    "id": 101,
    "title": "中央C练习",
    "bpm": 60,
    "tracks": [...]
  },
  "user_progress": {
    "status": "unlocked",
    "best_score": null,
    "stars": 0
  }
}
```

#### 提交练习记录

```
POST /v1/practice/log

Request:
{
  "song_id": 1,
  "mode": "standard",
  "score": 8750,
  "accuracy": 0.92,
  "max_combo": 45,
  "perfect_count": 38,
  "great_count": 12,
  "good_count": 5,
  "miss_count": 3,
  "duration": 48
}

Response:
{
  "practice_id": 456,
  "stars": 2,
  "xp_earned": 150,
  "new_total_xp": 1350,
  "level_up": false,
  "new_achievements": [
    {
      "id": "combo_master",
      "name": "连击大师",
      "description": "单曲达成40连击"
    }
  ]
}
```

### 7.3 API 安全设计

#### Rate Limiting

| 端点类型 | 限制 | 说明 |
|---------|------|------|
| `/auth/login` | 5次/分钟/IP | 防暴力破解 |
| `/auth/register` | 3次/小时/IP | 防批量注册 |
| 通用 API | 60次/分钟/用户 | 正常使用足够 |
| `/practice/log` | 10次/分钟/用户 | 防刷分 |

实现：Redis 滑动窗口计数器 + Gin 中间件

#### 防作弊机制

客户端上报分数天然不可信，需要多层防护：

1. **服务端合理性校验**: 根据曲目音符总数、时长、BPM 计算理论最高分，拒绝超出范围的分数
2. **统计异常检测**: 短时间内分数飙升、准确率异常（如突然从 60% 跳到 99%）触发标记
3. **排行榜延迟生效**: 异常分数不立即上榜，人工审核后生效
4. **关键校验公式**:
   ```
   max_possible_score = total_notes × 100 × max_combo_multiplier(3.0)
   if submitted_score > max_possible_score: reject
   if perfect_count + great_count + good_count + miss_count != total_notes: reject
   ```

#### 输入校验

所有 API 入参使用 `go-playground/validator` 做结构体校验：

```go
type PracticeLogRequest struct {
    SongID       uint    `json:"song_id" binding:"required"`
    Mode         string  `json:"mode" binding:"required,oneof=standard wait free"`
    Speed        float64 `json:"speed" binding:"required,min=0.25,max=2.0"`
    Score        int     `json:"score" binding:"min=0"`
    Accuracy     float64 `json:"accuracy" binding:"min=0,max=1"`
    MaxCombo     int     `json:"max_combo" binding:"min=0"`
    PerfectCount int     `json:"perfect_count" binding:"min=0"`
    GreatCount   int     `json:"great_count" binding:"min=0"`
    GoodCount    int     `json:"good_count" binding:"min=0"`
    MissCount    int     `json:"miss_count" binding:"min=0"`
    Duration     int     `json:"duration" binding:"required,min=1,max=7200"`
}
```

#### 内容权限控制

```
中间件链: Auth → SubscriptionCheck → Handler

SubscriptionCheck 逻辑:
1. 查询用户订阅状态 (Redis 缓存，TTL 5min)
2. 免费内容 (is_free=true): 直接放行
3. 付费内容: 需要 active 订阅 或 单曲购买记录
4. 无权限: 返回 403 + 订阅引导信息
```

---

## 8. MIDI 技术方案

### 8.0 2026-04-19 决策更新

- 输入主链路确定为 `USB MIDI`
- `BLE MIDI` 作为第二接入方式
- `麦克风识别` 只作为补充模式，不进入主判定链路
- `HDMI` 仅用于投屏或音频输出，不作为键盘输入方案

详细对比、实施顺序和官方参考资料，统一见 [电钢琴接入方案](./architecture/piano-input-connectivity.md)。

### 8.1 CoreMIDI Native Module (Swift)

```swift
// ios/MIDIManager.swift - 核心 MIDI 管理类

import CoreMIDI
import CoreBluetooth

@objc(MIDIManager)
class MIDIManager: RCTEventEmitter {

    private var midiClient: MIDIClientRef = 0
    private var inputPort: MIDIPortRef = 0

    override init() {
        super.init()
        setupMIDI()
    }

    private func setupMIDI() {
        // 创建 MIDI Client
        MIDIClientCreateWithBlock("EasyPiano" as CFString, &midiClient) {
            [weak self] notification in
            self?.handleMIDINotification(notification)
        }

        // 创建 Input Port
        MIDIInputPortCreateWithProtocol(
            midiClient,
            "Input" as CFString,
            ._1_0,
            &inputPort
        ) { [weak self] eventList, srcConnRefCon in
            self?.handleMIDIEvents(eventList)
        }
    }

    private func handleMIDIEvents(_ eventList: UnsafePointer<MIDIEventList>) {
        // 解析 MIDI 事件，发送到 JS 层
        let events = eventList.pointee
        // ... 解析 Note On/Off, velocity, channel
        sendEvent(withName: "onMIDINote", body: [
            "type": isNoteOn ? "noteOn" : "noteOff",
            "note": noteNumber,
            "velocity": velocity,
            "channel": channel,
            "timestamp": timestamp
        ])
    }
}
```

### 8.2 MIDI 音符映射

```
MIDI Note Number → 音名 → 键盘位置

21  = A0  (钢琴最低音)
...
60  = C4  (中央C)
61  = C#4
62  = D4
63  = D#4
64  = E4
65  = F4
66  = F#4
67  = G4
68  = G#4
69  = A4  (标准音 440Hz)
...
108 = C8  (钢琴最高音)

标准88键钢琴: MIDI 21 ~ 108
```

### 8.3 BLE-MIDI 连接流程

```
1. 用户点击"蓝牙连接"
        │
        ▼
2. App 调用 CBCentralManager.scanForPeripherals
   过滤 MIDI Service UUID: 03B80E5A-EDE8-4B33-A751-6CE34EC4C700
        │
        ▼
3. 发现设备 → 显示设备列表
        │
        ▼
4. 用户选择设备 → centralManager.connect(peripheral)
        │
        ▼
5. 连接成功 → discoverServices → discoverCharacteristics
        │
        ▼
6. 订阅 MIDI Characteristic (UUID: 7772E5DB-3868-4112-A1A9-F2669D106BF3)
        │
        ▼
7. 接收 BLE-MIDI 数据包 → 解析 → 转为标准 MIDI 事件
        │
        ▼
8. 发送到 JS 层 (与 USB MIDI 相同接口)
```

---

## 9. 音频引擎方案

### 9.1 音频需求分析

| 场景 | 需求 | 延迟要求 |
|------|------|---------|
| 虚拟键盘音色 | 用户点击屏幕键盘或无外接设备时发声 | < 10ms |
| 示范演奏 | 播放曲目的示范音频，配合下落音符 | 无严格要求 |
| 节拍器 | 练习时提供节拍参考 | < 5ms (需与视觉节拍同步) |
| 命中音效 | Perfect/Great/Miss 等反馈音效 | < 20ms |
| MIDI 输入回声 | 用户弹奏时，App 同时发出钢琴音色 | < 10ms |

### 9.2 技术选型

```
┌──────────────────────────────────────────────────┐
│              AudioEngine Native Module (Swift)    │
│                                                  │
│  ┌────────────────┐  ┌──────────────────────┐   │
│  │  AVAudioEngine  │  │  AUSampler (SF2)     │   │
│  │  (音频图管理)    │  │  (SoundFont 钢琴音色) │   │
│  └───────┬────────┘  └──────────┬───────────┘   │
│          │                       │               │
│  ┌───────┴───────────────────────┴───────────┐   │
│  │            Audio Processing Graph          │   │
│  │  SoundFont → Sampler → Mixer → Output     │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌────────────────┐  ┌──────────────────────┐   │
│  │  SFX Player    │  │  Metronome           │   │
│  │  (命中音效)     │  │  (节拍器)             │   │
│  └────────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────┘
```

选择 `AVAudioEngine + AUSampler` 而非第三方库的理由：
- iOS 系统原生，无额外依赖
- 延迟可控（可配置 buffer size 降到 ~5ms）
- 原生支持 SoundFont (.sf2) 格式，钢琴音色质量高
- 与 CoreMIDI 同在 Native 层，不需要过桥就能响应 MIDI 输入

### 9.3 音频模块接口

```typescript
interface AudioModule {
  // 音色管理
  loadSoundFont(name: string): Promise<void>;
  setSoundFont(name: string): Promise<void>;
  getAvailableSoundFonts(): Promise<string[]>;

  // 音符播放
  playNote(note: number, velocity: number): void;
  stopNote(note: number): void;
  stopAllNotes(): void;

  // MIDI 回声 (Native 层直连，不过 JS Bridge)
  enableMIDIEcho(enabled: boolean): void;

  // 示范播放
  playSong(midiData: object, bpm: number): Promise<void>;
  pauseSong(): void;
  resumeSong(): void;
  seekSong(positionMs: number): void;

  // 节拍器
  startMetronome(bpm: number, timeSignature: string): void;
  stopMetronome(): void;
  setMetronomeBPM(bpm: number): void;

  // 音效
  playSFX(name: 'perfect' | 'great' | 'good' | 'miss' | 'combo_break' | 'level_up'): void;
}
```

### 9.4 MIDI 回声优化

为了实现最低延迟的弹奏音色反馈，MIDI 输入触发音色应在 **Native 层直连**，不经过 JS Bridge：

```
电钢琴 → CoreMIDI → MIDIManager
                        ├── (1) sendEvent → JS (用于游戏引擎匹配，可有延迟)
                        └── (2) AudioEngine.playNote() (Native 层直连，< 2ms)
```

### 9.5 内置 SoundFont 策略

| 音色 | 文件大小 | 用途 |
|------|---------|------|
| Piano-Basic.sf2 | ~5MB | 内置默认音色，App 随包发布 |
| Piano-Concert.sf2 | ~30MB | 高品质音色，首次使用时按需下载 |
| Piano-Bright.sf2 | ~15MB | 明亮音色，按需下载 |

---

## 10. 游戏引擎设计

### 10.1 核心游戏循环

```typescript
// engine/GameEngine.ts

class GameEngine {
  private state: GameState;
  private noteScheduler: NoteScheduler;
  private scoreCalculator: ScoreCalculator;

  // 主循环 - 每帧调用 (60fps, ~16ms)
  update(deltaTime: number): FrameData {
    // 1. 更新音符位置
    this.noteScheduler.advanceNotes(deltaTime);

    // 2. 检查已过判定线的音符 → Miss
    const missedNotes = this.noteScheduler.checkMissedNotes();
    missedNotes.forEach(note => {
      this.scoreCalculator.recordMiss(note);
    });

    // 3. 返回当前帧渲染数据
    return {
      visibleNotes: this.noteScheduler.getVisibleNotes(),
      score: this.scoreCalculator.getScore(),
      combo: this.scoreCalculator.getCombo(),
      progress: this.noteScheduler.getProgress(),
    };
  }

  // MIDI 输入回调 - 由 useMIDI hook 触发
  onNoteInput(event: MIDINoteEvent): HitResult | null {
    if (event.type !== 'noteOn') return null;

    // 查找最近的匹配音符
    const match = this.noteScheduler.findMatchingNote(event.note, event.timestamp);

    if (match) {
      const result = this.scoreCalculator.calculateHit(match, event);
      this.noteScheduler.markNoteAsHit(match.id);
      return result; // { grade: 'perfect', score: 100, combo: 24 }
    }

    return { grade: 'miss', score: 0, combo: 0 };
  }
}
```

### 10.2 Skia 渲染层

```typescript
// components/FallingNotes/FallingNotesCanvas.tsx

const FallingNotesCanvas: React.FC<Props> = ({ frameData, keyboardLayout }) => {
  return (
    <Canvas style={{ flex: 1 }}>
      {/* 背景网格线 (小节线) */}
      {frameData.barLines.map(line => (
        <Line key={line.id} p1={...} p2={...} color="#333" strokeWidth={1} />
      ))}

      {/* 下落音符 */}
      {frameData.visibleNotes.map(note => (
        <RoundedRect
          key={note.id}
          x={getNoteX(note, keyboardLayout)}
          y={note.currentY}
          width={getNoteWidth(note, keyboardLayout)}
          height={getNoteHeight(note)}
          r={4}
          color={getNoteColor(note)}
        />
      ))}

      {/* 判定线 */}
      <Line
        p1={{ x: 0, y: JUDGEMENT_LINE_Y }}
        p2={{ x: SCREEN_WIDTH, y: JUDGEMENT_LINE_Y }}
        color="#FFD700"
        strokeWidth={2}
      />

      {/* Hit 特效 */}
      {frameData.hitEffects.map(effect => (
        <HitEffect key={effect.id} {...effect} />
      ))}
    </Canvas>
  );
};
```

#### 性能优化策略

Skia Canvas 内使用声明式 JSX `.map()` 渲染大量音符时，每帧创建新的 React 元素会引发 GC 抖动。优化方案：

1. **使用 imperative API**: 密集音符区域改用 `canvas.drawRect()` 直接绘制，避免 React reconciliation
2. **可见区域裁剪**: 只渲染屏幕内可见的音符（判定线上方 1.5 屏到判定线下方 0.2 屏）
3. **对象池**: 复用 `RoundedRect` 渲染对象，避免每帧 new/gc
4. **分层渲染**: 静态元素（网格线、判定线）和动态元素（音符、特效）分 Canvas 层，静态层不重绘

```typescript
// 优化后的渲染方式 - 使用 useDrawCallback
const onDraw = useDrawCallback((canvas, paint) => {
  // 静态元素跳过 (由另一层处理)

  // 动态音符 - 直接绘制，无 React 元素创建
  for (const note of visibleNotes) {
    paint.setColor(getNoteColor(note));
    canvas.drawRRect(
      rrect(getNoteX(note), note.currentY, getNoteWidth(note), getNoteHeight(note), 4, 4),
      paint
    );
  }
}, [visibleNotes]);
```

### 10.3 状态管理

```typescript
// stores/gameStore.ts

interface GameStore {
  // 游戏状态
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'completed';
  mode: 'standard' | 'wait' | 'free';
  speed: number; // 0.25 ~ 2.0

  // 当前曲目
  currentSong: Song | null;

  // 实时数据
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  progress: number; // 0 ~ 1

  // Actions
  loadSong: (song: Song) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => GameResult;
  setMode: (mode: GameMode) => void;
  setSpeed: (speed: number) => void;
}

// stores/midiStore.ts

interface MIDIStore {
  // 连接状态
  connectionStatus: 'disconnected' | 'scanning' | 'connecting' | 'connected';
  connectedDevice: MIDIDevice | null;
  availableDevices: MIDIDevice[];

  // 实时输入
  activeNotes: Set<number>; // 当前按下的键

  // Actions
  startScan: () => void;
  connectDevice: (device: MIDIDevice) => void;
  disconnect: () => void;
}
```

---

## 11. 离线模式设计

### 11.1 离线能力矩阵

| 功能 | 离线可用 | 说明 |
|------|---------|------|
| 已下载曲目练习 | ✅ | 曲谱数据缓存在本地 |
| 评分与游戏核心 | ✅ | 纯本地计算，不依赖网络 |
| 课程学习 | ✅ | 课程内容预下载 |
| 成就解锁 | ✅ | 本地判定，联网后同步 |
| 练习记录 | ✅ | 本地暂存，联网后同步 |
| 曲库浏览/下载新曲 | ❌ | 需要网络 |
| 排行榜 | ❌ | 需要网络 |
| 注册/登录 | ❌ | 需要网络 |

### 11.2 本地存储方案

```
┌────────────────────────────────────────────────┐
│                  本地存储架构                     │
│                                                │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │    MMKV      │  │    SQLite (可选)       │    │
│  │  (快速KV)     │  │  (结构化离线数据)       │    │
│  ├──────────────┤  ├──────────────────────┤    │
│  │ - JWT Token  │  │ - 离线练习记录         │    │
│  │ - 用户设置    │  │ - 课程进度缓存         │    │
│  │ - 设备记忆    │  │ - 曲谱数据缓存         │    │
│  │ - 简单缓存    │  │ - 待同步队列           │    │
│  └──────────────┘  └──────────────────────┘    │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │            FileSystem                     │  │
│  ├──────────────────────────────────────────┤  │
│  │ - SoundFont 音色文件 (.sf2)               │  │
│  │ - 课程媒体资源 (图片/动画)                  │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### 11.3 离线同步策略

```
联网后自动同步流程:

1. App 进入前台 / 网络恢复
        │
        ▼
2. 检查待同步队列 (synced = false)
        │
        ▼
3. 按时间顺序批量上传 (POST /v1/practice/sync)
        │
        ├── 成功 → 标记 synced = true
        │
        └── 冲突 → 乐观策略: 客户端数据优先 (练习记录无冲突风险)
                   课程进度: 取 best_score 最大值
```

---

## 12. 容错与错误处理

### 12.1 MIDI 设备异常

| 异常 | 处理 | 用户体验 |
|------|------|---------|
| USB 设备拔出 | 自动暂停游戏 + 弹出重连提示 | "设备已断开，重新插入后继续" |
| BLE 信号丢失 | 3 秒内自动重连，超时暂停 | 先静默重试，失败后暂停 |
| MIDI 数据异常 | 丢弃无效包，不中断游戏 | 用户无感知 |
| 设备切换 | 暂停游戏，确认新设备后继续 | 弹出设备选择 |

### 12.2 网络异常

| 场景 | 处理 |
|------|------|
| API 请求超时 | 3 次指数退避重试 (1s → 2s → 4s) |
| 练习记录上传失败 | 存入离线队列，后台自动重试 |
| Token 过期 | 自动用 Refresh Token 刷新，失败则引导重新登录 |
| 课程数据加载失败 | 优先使用本地缓存，提示用户 "使用离线版本" |

### 12.3 游戏崩溃恢复

```
每 10 秒自动保存游戏状态快照到 MMKV:
{
  songId, currentPosition, score, combo, mode, speed,
  hitNotes: [...noteIds], timestamp
}

App 重启时检测到未完成的快照:
→ 提示 "检测到上次未完成的练习，是否继续？"
→ 继续: 从快照位置恢复
→ 放弃: 清除快照，回到主页
```

---

## 13. 测试策略

### 13.1 测试分层

| 层级 | 范围 | 工具 | 覆盖目标 |
|------|------|------|---------|
| **单元测试** | 评分算法、音符匹配、时间计算 | Jest | 核心引擎逻辑 100% |
| **组件测试** | UI 组件渲染、交互 | React Native Testing Library | 关键交互路径 |
| **Native 测试** | CoreMIDI 模块、音频引擎 | XCTest (Swift) | MIDI 解析、音频播放 |
| **后端单元测试** | Service 层业务逻辑 | Go testing + testify | 业务逻辑 80%+ |
| **API 集成测试** | HTTP 端点 | Go testing + httptest | 所有端点覆盖 |
| **E2E 测试** | 核心用户流程 | Detox | 注册→连接→练习→评分 |

### 13.2 MIDI 输入模拟

```typescript
// test/helpers/mockMIDI.ts

class MockMIDIDevice {
  private listeners: Map<string, Function[]> = new Map();

  simulateNoteOn(note: number, velocity: number, delayMs: number = 0) {
    setTimeout(() => {
      this.emit('onNoteEvent', {
        type: 'noteOn',
        note,
        velocity,
        channel: 0,
        timestamp: performance.now(),
      });
    }, delayMs);
  }

  simulateSequence(notes: Array<{note: number, time: number, velocity: number}>) {
    notes.forEach(n => this.simulateNoteOn(n.note, n.velocity, n.time));
  }
}
```

### 13.3 关键测试场景

- 评分边界: 恰好 50ms/100ms/200ms 偏差的判定结果
- Combo 计算: 连击倍率切换点 (9→10, 29→30, 49→50, 99→100)
- 等待模式: 音符暂停→正确输入→继续下落
- 离线→联网: 离线记录同步后数据一致性
- MIDI 断连: 游戏中拔出 USB 的状态恢复
- 并发输入: 和弦（多个音符同时按下）的匹配准确性

---

## 14. 部署与运维

### 14.1 后端部署架构

```
┌─────────────────────────────────────────────┐
│                  阿里云 / AWS                 │
│                                             │
│  ┌─────────┐     ┌──────────────────────┐   │
│  │ Nginx   │────→│  Go Server (Docker)  │   │
│  │ (反代+  │     │  × 2 实例 (最小)       │   │
│  │  SSL)   │     └──────────┬───────────┘   │
│  └─────────┘                │               │
│                    ┌────────┴────────┐       │
│               ┌────┴────┐    ┌──────┴────┐  │
│               │PostgreSQL│    │   Redis   │  │
│               │ (RDS)    │    │ (托管)     │  │
│               └──────────┘    └───────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │         OSS / S3 (曲谱+音频+CDN)      │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 14.2 CI/CD

```yaml
# GitHub Actions 流水线
触发: push to main / PR

Pipeline:
  ├── Backend:
  │   ├── go test ./...
  │   ├── go vet + golangci-lint
  │   ├── docker build
  │   └── deploy to staging (PR) / production (main)
  │
  └── Mobile:
      ├── TypeScript type check
      ├── Jest unit tests
      ├── EAS Build (Expo)
      └── TestFlight upload (main only)
```

### 14.3 监控

| 层级 | 工具 | 监控内容 |
|------|------|---------|
| **服务端** | Prometheus + Grafana | API 延迟、错误率、QPS |
| **服务端日志** | Zap → ELK / 阿里云日志服务 | 结构化日志、错误追踪 |
| **客户端崩溃** | Sentry (React Native) | JS 异常、Native 崩溃 |
| **客户端性能** | 自定义埋点 | MIDI 延迟、帧率、渲染耗时 |
| **业务指标** | 自建 + 阿里云 ARMS | DAU、留存率、课程完成率、付费转化率 |

### 14.4 数据库迁移

使用 `golang-migrate/migrate` 管理数据库版本：

```bash
# 创建迁移
migrate create -ext sql -dir migrations -seq create_subscriptions

# 执行迁移
migrate -database "postgres://..." -path migrations up

# 回滚
migrate -database "postgres://..." -path migrations down 1
```

---

## 15. 国际化设计

### 15.1 多语言策略

MVP 阶段以中文为主，但在架构层面预留国际化能力：

| 层级 | 方案 |
|------|------|
| **前端 UI** | `i18next` + `react-i18next`，所有文案走 key-value |
| **课程内容** | 数据库 `locale` 字段区分语言版本，同一课程可有多语言变体 |
| **曲目元数据** | `Song.locale` 标记语言，搜索/筛选时优先展示用户语言的曲目 |
| **后端 API** | `Accept-Language` header 控制返回语言，错误信息多语言 |

### 15.2 支持语言规划

| 阶段 | 语言 |
|------|------|
| Phase 1 | 简体中文 (zh-CN) |
| Phase 2 | 英语 (en) |
| Phase 3 | 日语 (ja)、繁体中文 (zh-TW) |

### 15.3 前端示例

```typescript
// i18n/zh-CN.json
{
  "game.perfect": "完美!",
  "game.great": "很好!",
  "game.miss": "错过",
  "game.combo": "{{count}}连击",
  "course.level1": "钢琴启蒙",
  "midi.connect": "连接设备",
  "midi.scanning": "正在搜索蓝牙设备..."
}
```

---

## 16. 项目结构

```
easy-piano/
│
├── docs/
│   └── DESIGN.md              # 本文档
│
├── app/                        # React Native (Expo) 前端
│   ├── app/                    # Expo Router 页面
│   │   ├── (tabs)/             # Tab 导航
│   │   │   ├── index.tsx       # 首页 (课程入口)
│   │   │   ├── songs.tsx       # 曲库
│   │   │   ├── practice.tsx    # 练习记录
│   │   │   └── profile.tsx     # 个人中心
│   │   ├── game/
│   │   │   └── [songId].tsx    # 游戏主屏
│   │   ├── course/
│   │   │   ├── [courseId].tsx   # 课程详情
│   │   │   └── lesson/
│   │   │       └── [lessonId].tsx  # 课时页面
│   │   ├── midi/
│   │   │   └── connect.tsx     # MIDI 连接页
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── _layout.tsx
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Piano/
│   │   │   │   ├── PianoKeyboard.tsx     # 虚拟键盘
│   │   │   │   ├── PianoKey.tsx
│   │   │   │   └── constants.ts          # 键盘布局常量
│   │   │   ├── FallingNotes/
│   │   │   │   ├── FallingNotesCanvas.tsx # Skia 画布
│   │   │   │   ├── NoteBlock.tsx
│   │   │   │   └── HitEffect.tsx         # 命中特效
│   │   │   ├── ScoreBoard/
│   │   │   │   ├── ScoreDisplay.tsx
│   │   │   │   └── ComboCounter.tsx
│   │   │   ├── MIDIConnect/
│   │   │   │   ├── DeviceList.tsx
│   │   │   │   └── ConnectionStatus.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── ProgressBar.tsx
│   │   │
│   │   ├── engine/
│   │   │   ├── GameEngine.ts             # 游戏主循环
│   │   │   ├── NoteScheduler.ts          # 音符调度
│   │   │   ├── ScoreCalculator.ts        # 评分计算
│   │   │   └── MIDIParser.ts             # MIDI 数据解析
│   │   │
│   │   ├── stores/
│   │   │   ├── gameStore.ts              # 游戏状态
│   │   │   ├── midiStore.ts              # MIDI 连接状态
│   │   │   ├── userStore.ts              # 用户信息
│   │   │   ├── courseStore.ts            # 课程进度
│   │   │   └── settingsStore.ts          # 用户设置
│   │   │
│   │   ├── hooks/
│   │   │   ├── useMIDI.ts               # MIDI 连接 Hook
│   │   │   ├── useGameLoop.ts           # 游戏循环 Hook
│   │   │   ├── useAudio.ts              # 音频引擎 Hook
│   │   │   ├── useOfflineSync.ts        # 离线同步 Hook
│   │   │   └── useAuth.ts
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts                # Axios 实例
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── songs.ts
│   │   │   ├── practice.ts
│   │   │   └── subscription.ts          # 订阅 & 购买
│   │   │
│   │   ├── i18n/
│   │   │   ├── index.ts                 # i18next 配置
│   │   │   ├── zh-CN.json
│   │   │   └── en.json
│   │   │
│   │   ├── offline/
│   │   │   ├── syncQueue.ts             # 离线同步队列
│   │   │   └── cacheManager.ts          # 本地缓存管理
│   │   │
│   │   ├── utils/
│   │   │   ├── noteUtils.ts             # 音符名称/位置映射
│   │   │   └── formatters.ts
│   │   │
│   │   └── types/
│   │       ├── midi.ts
│   │       ├── game.ts
│   │       ├── song.ts
│   │       └── user.ts
│   │
│   ├── ios/
│   │   └── Modules/
│   │       ├── MIDIManager.swift         # CoreMIDI 管理
│   │       ├── MIDIManager.m             # RN Bridge
│   │       ├── BLEMIDIManager.swift      # 蓝牙 MIDI
│   │       ├── AudioEngine.swift         # 音频引擎 (AVAudioEngine)
│   │       └── AudioEngine.m             # RN Bridge
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── sounds/                       # 音效 (Perfect/Great/Miss)
│   │   ├── soundfonts/                   # SoundFont 钢琴音色
│   │   │   └── Piano-Basic.sf2
│   │   └── fonts/
│   │
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Go 后端
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                   # 入口
│   │
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go                 # 配置管理
│   │   │
│   │   ├── handler/                      # HTTP Handlers
│   │   │   ├── auth.go
│   │   │   ├── user.go
│   │   │   ├── course.go
│   │   │   ├── lesson.go
│   │   │   ├── song.go
│   │   │   ├── practice.go
│   │   │   ├── subscription.go
│   │   │   └── leaderboard.go
│   │   │
│   │   ├── service/                      # 业务逻辑层
│   │   │   ├── auth_service.go
│   │   │   ├── user_service.go
│   │   │   ├── course_service.go
│   │   │   ├── song_service.go
│   │   │   ├── practice_service.go
│   │   │   ├── achievement_service.go
│   │   │   ├── subscription_service.go
│   │   │   ├── anticheat_service.go      # 防作弊校验
│   │   │   └── leaderboard_service.go
│   │   │
│   │   ├── repository/                   # 数据访问层
│   │   │   ├── user_repo.go
│   │   │   ├── course_repo.go
│   │   │   ├── song_repo.go
│   │   │   ├── practice_repo.go
│   │   │   ├── subscription_repo.go
│   │   │   └── achievement_repo.go
│   │   │
│   │   ├── model/                        # 数据模型
│   │   │   ├── user.go
│   │   │   ├── course.go
│   │   │   ├── lesson.go
│   │   │   ├── song.go
│   │   │   ├── practice_log.go
│   │   │   ├── subscription.go
│   │   │   ├── user_settings.go
│   │   │   └── achievement.go
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.go                   # JWT 认证
│   │   │   ├── cors.go
│   │   │   ├── ratelimit.go              # 滑动窗口限流
│   │   │   └── subscription.go           # 订阅权限校验
│   │   │
│   │   └── router/
│   │       └── router.go                 # 路由注册
│   │
│   ├── pkg/
│   │   ├── midi/
│   │   │   └── parser.go                 # MIDI 文件解析工具
│   │   └── response/
│   │       └── response.go               # 统一响应格式
│   │
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_courses.sql
│   │   ├── 003_create_songs.sql
│   │   ├── 004_create_practice_logs.sql
│   │   ├── 005_create_achievements.sql
│   │   ├── 006_create_subscriptions.sql
│   │   ├── 007_create_song_purchases.sql
│   │   └── 008_create_user_settings.sql
│   │
│   ├── go.mod
│   ├── go.sum
│   ├── Makefile
│   └── Dockerfile
│
├── assets/
│   └── songs/                  # MIDI 曲目源文件
│       ├── twinkle_twinkle.mid
│       ├── ode_to_joy.mid
│       └── happy_birthday.mid
│
├── .gitignore
└── README.md
```

---

## 17. 实施路线图

### Phase 1: MVP (6-8周)

```
Week 1-2: 项目搭建 + MIDI 连接
├── Expo 项目初始化 + 基础导航 + i18n 框架
├── Go 后端项目初始化 + 数据库 + golang-migrate
├── CoreMIDI Native Module (USB)
├── BLE-MIDI 扫描与连接
├── 音频引擎 Native Module (AVAudioEngine + SoundFont)
└── MIDI 连接测试页面

Week 3-4: 游戏核心
├── 虚拟键盘组件 (Skia)
├── 下落音符渲染引擎 (imperative API 优化)
├── 游戏主循环 + 音符调度 (绝对时间同步)
├── MIDI 输入匹配 + 评分系统
├── 音频回声 (Native 层直连)
├── 延迟监测机制
└── 基础游戏 UI (分数/连击/进度)

Week 5-6: 课程 + 用户
├── 后端课程/曲目 API + 输入校验
├── 用户注册登录 (JWT + Apple ID)
├── 课程浏览页面
├── 练习记录上传 + 防作弊校验
├── Rate limiting 中间件
└── iPadOS 适配 (大屏布局)

Week 7-8: 离线 + 联调
├── 本地缓存管理 (MMKV + 曲谱缓存)
├── 离线练习 + 同步队列
├── 游戏崩溃恢复机制
├── Sentry 客户端监控接入
├── 核心引擎单元测试
└── MVP 联调测试
```

### Phase 2: 游戏化增强 + 商业化 (4-5周)

```
Week 9-10: 游戏体验优化
├── 等待模式 / 自由速度模式
├── 分手练习 / 循环练习
├── 节拍器功能
├── 命中特效动画
├── 音效反馈 (Perfect/Great/Miss)
├── 多音色支持 (音色下载管理)
└── 结算页面 (星级/统计)

Week 11-12: 激励 + 商业化
├── 经验值 + 等级系统
├── 成就系统 (后端+前端)
├── 每日打卡 + 连续天数
├── 个人主页 + 练习统计
├── 曲库浏览 + 难度筛选
├── 订阅系统 (Apple IAP 接入)
├── 内容权限控制中间件
└── 用户设置页面

Week 13: 家长 & 儿童功能
├── 家长控制功能
├── 儿童账号绑定
└── 练习时长限制
```

### Phase 3: 社交 & 上线 (4-5周)

```
Week 14-15: 社交功能
├── 单曲排行榜 (防作弊审核)
├── 周排行榜
├── 好友系统
└── 分享功能

Week 16-17: 上线准备
├── 性能优化 (Skia 渲染/网络/延迟)
├── UI 打磨 + 动画细节
├── 新手引导流程
├── E2E 测试 (Detox)
├── CI/CD 流水线 (GitHub Actions)
├── 服务端部署 (Docker + Nginx)
├── 监控体系搭建 (Prometheus + Grafana)
├── TestFlight 测试
└── App Store 审核提交

Week 18+: Phase 3.5 国际化
├── 英语版本翻译
├── 英文曲库补充
└── 海外市场上架准备
```

---

## 附录

### A. 参考项目

| 项目 | 地址 | 参考价值 |
|------|------|---------|
| Midiano | https://midiano.com | 下落音符 + 等待模式的 Web 实现 |
| PianoBooster | https://github.com/pianobooster/PianoBooster | 开源 MIDI 钢琴学习 |
| react-native-skia | https://github.com/Shopify/react-native-skia | Skia 渲染参考 |
| MIKMIDI | https://github.com/mixedinkey-opensource/MIKMIDI | iOS CoreMIDI 封装参考 |
| gomidi/midi | https://github.com/gomidi/midi | Go MIDI 文件解析 |

### B. MIDI 设备兼容性测试清单

| 品牌 | 型号 | 连接方式 | 状态 |
|------|------|---------|------|
| Yamaha | P-125 | USB | 待测 |
| Roland | FP-30X | USB + BLE | 待测 |
| Casio | PX-S1100 | USB + BLE | 待测 |
| Korg | B2 | USB | 待测 |
| NUX | NPK-10 | USB + BLE | 待测 |
