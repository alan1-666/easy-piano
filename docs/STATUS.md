# EasyPiano 工作状态快照

> 最后更新：2026-04-20

当前版本是可端到端演示的内测级产品：登录/注册、曲库、课程、游戏（含真钢琴音色 + 自动伴奏）、练习记录上报、admin 后台都打通。下一块核心是**电钢琴 MIDI 接入**，代码已写好 90%，只待真设备验证。

---

## 1. 架构与技术栈

### 前端（`app/`）

- **框架**：React Native 0.76 + Expo SDK 52（bare workflow，`ios/` 在本地 prebuild 不入仓）
- **路由**：expo-router 4
- **状态**：Zustand（userStore / midiStore / gameStore / courseStore / settingsStore）
- **数据获取**：@tanstack/react-query
- **持久化**：react-native-mmkv（token、用户对象、设置、syncQueue）
- **图形**：react-native-skia + react-native-svg（渐变、径向背景、SVG 图标）
- **动画**：react-native-reanimated
- **音频**：expo-av（MP3 采样 + playback rate pitch-shift）
- **MIDI 解析**：@tonejs/midi
- **本地模块**：`app/modules/easy-piano-midi`（Expo Module，iOS CoreMIDI 308 行 Swift，Android stub）

### 后端（`server/`）

- **语言**：Go 1.26，Gin + GORM
- **DB**：PostgreSQL 16
- **缓存**：Redis 7
- **认证**：JWT（access 1h / refresh 7d，HS256）
- **部署**：docker-compose（postgres + redis + server + caddy）
- **域名 / HTTPS**：Caddy on 443 + nip.io 域，ACME 自动签 cert —— **目前被 GFW 拦**，Let's Encrypt validator 连不进来
- **admin 静态 UI**：Gin StaticFile serve `server/admin/index.html`

### 分布环境

- Dev：本机 → SSH tunnel → staging 8080（绕开 macOS 代理对 RN NSURLSession 的不兼容）
- Staging server：`117.72.160.220`（阿里云 or 腾讯云，Ubuntu 22.04，root SSH 免密）
- 生产：未部署

---

## 2. 已完成功能（按模块）

### 2.1 账户与认证

- [x] 邮箱/密码注册、登录、logout
- [x] Apple Sign-In / 微信登录按钮占位（后端端点有、前端未实装）
- [x] JWT access + refresh 双 token；client 401 时自动 refresh + 重放原请求（单飞 lock）
- [x] Token + 用户对象 MMKV 持久化，冷启动 hydrate 自动登录
- [x] Email trim + lowercase 归一化（防首字母大写 / 复制空格）
- [x] 人性化错误提示（401/400/ERR_NETWORK 分类）

### 2.2 曲库（Songs）

- [x] 真实 12 首曲目入库（公有领域古典 + 儿歌）：小星星 / 两只老虎 / 生日快乐 / 欢乐颂 / 小步舞曲（巴赫）/ 小夜曲（舒伯特）/ 致爱丽丝 / 卡农 / 月光奏鸣曲 I / 夜曲 Op.9 No.2 / 华丽大圆舞曲 / 土耳其进行曲
- [x] 6 首 JSON 种子 + 6 首 base64 `.mid`，解码器自动识别格式
- [x] 曲库 tab：搜索去抖、难度筛选、精选渐变卡、色块首字母条目
- [x] 曲目详情通过 `/v1/songs/:id` 拉、`@tonejs/midi` 解析

### 2.3 课程 / 学习路径

- [x] 3 个 Level 从后端拉
- [x] Level 1 的 10 节课完整
- [x] 课时状态按 `/me/progress` 实时计算（done / current / locked）
- [x] 径向 SVG 进度环
- [x] 课时详情 → 游戏页，带 `lessonId` 透传
- [x] 结算时自动 POST `/lessons/:id/complete` 推进进度

### 2.4 游戏引擎

- [x] `GameEngine` 判定窗口（Perfect 50ms / Great 100ms / Good 200ms）
- [x] 下落音符 + 判定线 + 连击计分
- [x] 暂停 / 恢复 / 重开 / 退出
- [x] 横屏锁定
- [x] AppState 切后台自动暂停
- [x] 真实演奏时长计算（排除暂停间隔）并随 practice log 上报

### 2.5 音频

- [x] `expo-av` 封装的 `AudioEngine`：3 个基准采样（A3/A4/A5 MP3，tonejs-instruments MIT 许可）+ Sound 对象池 + playback rate pitch-shift，覆盖 MIDI 45-93
- [x] 按键回声：虚拟键点击或 MIDI note-in 触发
- [x] 自动伴奏：音符经过判定线时自动奏出（索引式 O(1) per tick）
- [x] 按设置开关门控 audio.playNote 调用

### 2.6 练习记录与统计

- [x] 结算挂载时 POST `/practice/log`
- [x] 真实 duration 字段（秒，不含暂停）
- [x] 上报失败自动入 `syncQueue`（MMKV 持久队列）
- [x] 冷启动 + 前台 + 登录时自动 flush
- [x] `/me/stats` 聚合：current_streak / total_sessions / total_practice_seconds / total_songs_played
- [x] 首页从 history 推算本周柱状图 + 今日分钟

### 2.7 成就系统

- [x] 8 条经典成就入库（初次触键 / 曲库新手 / 百曲斩 / 坚持不懈 / 专注月 / 连击大师 / 连击神 / 完美主义）
- [x] POST /practice/log 自动触发 `CheckAndUnlock`
- [x] `/me/achievements` 返回目录 + 已解锁状态
- [x] Profile tab 成就面板渲染

### 2.8 设置

- [x] 音频开关：按键回声 / 自动伴奏
- [x] 游戏：每日目标分钟 / 下落速度倍率
- [x] MMKV 持久化，路由 `/settings`，从 profile tab 入口
- [x] MIDI 连接状态下设置文案动态切换（提示关按键回声）

### 2.9 离线能力

- [x] `syncQueue` MMKV 持久化队列
- [x] `submitOrQueue` 自动入队 on 网络失败 / 5xx / 401
- [x] 单飞 flush，批内遇 4xx 丢弃 / 网络错停批避免雪崩
- [x] 触发点：冷启动 + AppState 变 active + 登录/注册成功

### 2.10 MIDI 接入（部分）

- [x] iOS 原生 CoreMIDI Swift 模块（308 行，含设备枚举、事件解析、生命周期、源变更通知）
- [x] JS 层：midiStore / useMIDI / nativeMIDI 全部接好事件
- [x] `initializeNativeMIDIBridge` 在根 layout 启动时调用
- [x] MIDI 连接页 UI（未连接态 / 已连接态 / 信号测试键盘）
- [ ] **待验证**：模拟器无法跨 host CoreMIDI，需要真机 + 真琴
- [ ] Android MidiManager 实现（stub 返回空列表）

### 2.11 Admin 后台

- [x] 网页 UI：`http://117.72.160.220:8080/admin`（HTML + 原生 JS，无 framework）
- [x] 登录（与 app 共用 `/v1/auth/login`）
- [x] **曲库管理**：列表、CRUD、上传 `.mid`、清空 MIDI
- [x] **用户管理**：列表 + 搜索 + 分页、详情 modal（基本信息 / 订阅 / 活跃度）、toggle admin
- [x] 后端端点：
  - `POST / PATCH / DELETE /v1/admin/songs`
  - `POST / DELETE /v1/admin/songs/:id/midi`
  - `GET /v1/admin/users` (分页 + 搜索)
  - `GET /v1/admin/users/:id` (含 subscription + stats)
  - `PATCH /v1/admin/users/:id` (is_admin / is_child)
- [x] `users.is_admin` 字段 + `AdminMiddleware`

### 2.12 视觉 / 设计

- [x] Uniswap 风格浅色设计系统整套接入（粉色主色 + 6 组辅助调色板 + Inter Tight）
- [x] 全 7 屏重绘（Onboarding / Home / Songs / Courses / Profile / Game / Result）
- [x] 原子组件：Button / Card / Pill / ProgressBar / ScreenContainer / Header / LinearBar / RadialBg
- [x] 自定义 SVG 图标集

### 2.13 工程

- [x] expo-localization iOS 26 build 修补（`@unknown default`），用 patch-package 固化
- [x] ATS 配置放行 HTTP staging
- [x] `EXPO_PUBLIC_API_BASE_URL` 环境变量驱动
- [x] Caddy + docker-compose 部署框架（HTTPS 目前被 GFW 拦）

---

## 3. 待完成工作

### 3.1 高优先 · 明天要做

- [ ] **电钢琴 MIDI 接入验证**（依赖硬件）
  - [ ] 装 dev build 到 iOS 真机（Xcode signing + provisioning）
  - [ ] USB 接真键盘，确认 `listDevices()` 返回设备 + `noteOn/noteOff` 正确流到 midiStore
  - [ ] 游戏判定在真琴输入下工作
  - [ ] 测量输入延迟，若 >50ms 再调
  - [ ] 修可能暴露的 Swift bug（目前代码路径从未被真数据走过）
  - [ ] 配对断开 + 自动重连策略

### 3.2 高优先 · 本周

- [ ] **Android MidiManager 实现**
  - 现状：Kotlin stub 返回空数组
  - 需要：`MidiManager.getDevices()` 枚举 + `MidiOutputPort` 订阅 + onMessage 回调转发到 JS
  - 接口与 iOS 对称，JS 侧完全复用
- [ ] **MIDI 连接页：历史设备持久化 + 自动重连**
  - 记住上次成功连接的 deviceId（MMKV）
  - 启动后扫到同 ID 自动连
- [ ] **HTTPS 生产部署方案**
  - GFW 拦 LE validator。备选：Cloudflare Tunnel（需 CF 账号）/ 国内 CA（需备案）/ 海外 VPS
- [ ] **设置页真接 `/users/me/settings`**
  - 目前只本地 MMKV，换设备不同步
  - 后端端点已就绪，缺前端双向同步

### 3.3 中优先

- [ ] **测试覆盖**
  - GameEngine.judgeHit 判定窗口边界
  - ScoreCalculator 连击 / 评级
  - syncQueue.flush 三态退让逻辑
  - authService register/login/refresh 正确性
  - midiDecoder 两种格式的解码
- [ ] **音频质量下一步升级**
  - 当前每音 1 个采样 pitch-shift 覆盖 ±12 半音，极端音色偏
  - 可升 velocity-layered 采样（Salamander CC-BY 或 FreePats CC0），每音 ~500 KB × 多档力度 = bundle 涨 40 MB
  - 或加 FluidSynth 原生桥接 SoundFont
- [ ] **首页当前课程卡**的完成度进度与后端的 XP / streak 强一致
- [ ] **订阅付费**
  - 后端 `/subscription/verify` 还是 TODO（苹果收据校验空实现）
  - 前端没有订阅 UI
  - 付费曲目点击有锁图标但无购买流程
- [ ] **MIDI 文件批量导入** admin 页
  - 单文件上传已有
  - 批量（ZIP / 文件夹）会显著提速曲库扩充
- [ ] **曲目管理** admin 端缺查看 midi_data 原始内容（用于 debug 某首 note 解析错）

### 3.4 低优先 / 上架前

- [ ] **国际化 i18n 接线**
  - i18next 装了未用，全中文硬编码
  - 出海英文版才做
- [ ] **App 图标 + Splash 品牌资源**
  - 现占位图
  - 各尺寸 icon（AppIconSet）+ Splash + Launch Image
- [ ] **隐私合规**
  - `PrivacyInfo.xcprivacy` 已有 stub 要审
  - 隐私政策 + 用户协议页面
  - 国内上架：备案号 / ICP / 版号（音乐类可能涉及）
- [ ] **Onboarding 复访**
  - 现在只有首启后显示一次，没法从设置重看
- [ ] **儿童模式**流程（`is_child` 字段在，UI 未做）
- [ ] **家长端 / 子账号**接口存在（`/me/children`），前端无入口

### 3.5 已知粗糙点 / 小 bug

- [ ] 游戏结算回「曲库」的 back 行为固定走 `/tabs/songs`，应该 router.back() 返回来源
- [ ] 游戏页「试听」按钮在曲库 featured 卡为空实现（`onPress={()=>{}}`）
- [ ] Profile 头像占位图（圆形用户 svg），没有真实上传流程
- [ ] 曲库列表 `difficulty` 星星显示用 `●○` 符号，未国际化
- [ ] Admin 删除曲目是硬删 —— practice_logs 里 song_id 会变野指针（历史统计还在但 song join 丢失）

---

## 4. 操作手册

### 4.1 Dev 启动

```bash
# 1. 确保 SSH tunnel 开着（首次后台启动）
ssh -fNT -L 18080:localhost:8080 root@117.72.160.220

# 2. 启动 Metro
cd app && npx expo start --dev-client

# 3. 装 iOS app 到模拟器（或热加载）
npm run ios
```

**登录账号**（dev 默认）：
- `alan_test@example.com` / `alantest123` （admin = true）

### 4.2 Admin UI

- URL: http://117.72.160.220:8080/admin
- 同账号登录
- 功能见 §2.11

### 4.3 曲目批量上传（脚本）

```bash
# 上传一首
TOKEN=$(curl -s -X POST http://127.0.0.1:18080/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alan_test@example.com","password":"alantest123"}' \
  | jq -r .data.access_token)

curl -X POST "http://127.0.0.1:18080/v1/admin/songs/<id>/midi" \
  -H "Authorization: Bearer $TOKEN" \
  -F "midi=@/path/to/song.mid"

# 批量生成+上传见 server/seed/gen-classical-mids.js
```

### 4.4 后端部署

```bash
# 代码推 git 后
rsync -avz --exclude '.env' --exclude 'vendor/' \
  /Users/zhangza/code/easypiano/easy-piano/server/ \
  root@117.72.160.220:/opt/easypiano/server/
ssh root@117.72.160.220 \
  "cd /opt/easypiano/server && docker compose build server && docker compose up -d server"
```

### 4.5 数据库管理

```bash
# 连进 postgres 容器
ssh root@117.72.160.220 \
  "docker exec -it easypiano-db psql -U easypiano -d easypiano"

# 授 admin
UPDATE users SET is_admin = true WHERE email = 'xxx@example.com';
```

### 4.6 关键路径 URL 速查

| 资源 | URL |
|---|---|
| API（tunnel） | http://127.0.0.1:18080/v1 |
| API（public） | http://117.72.160.220:8080/v1 |
| Health check | http://117.72.160.220:8080/health |
| Admin UI | http://117.72.160.220:8080/admin |
| HTTPS（被拦） | https://117-72-160-220.nip.io/v1 |

---

## 5. 已知约束

1. **iOS 模拟器不共享 host CoreMIDI** —— 本地虚拟 MIDI 源 sim 里看不到。MIDI 功能必须真机 + 真硬件验证。
2. **GFW 拦 Let's Encrypt** —— 端口开了但验证流量被 reset。HTTPS 需要走 Cloudflare Tunnel / 国内 CA / 海外节点。
3. **macOS 代理对 RN NSURLSession 透明度差** —— dev 环境用 SSH tunnel 绕，生产切 HTTPS 后消失。
4. **音频延迟 20-50ms** —— expo-av 播放 MP3 的开销，真琴接入用户可能觉得钝，必要时换底层（SoundFont + 直接 sample playback）。
5. **bundle 体积 ~12 MB** —— 还没压缩/splitting，加更多采样会快速膨胀。

---

## 6. 文档入口

- 设计文档：[DESIGN.md](./DESIGN.md)
- 架构：[architecture/](./architecture/)
- 产品：[product/](./product/)
- UI 规范：[ui/](./ui/)
- 测试：[testing/](./testing/)
- 任务历史：[TODO.md](./TODO.md)
