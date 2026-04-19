# UI ��版 — 技术方案

> |文档状态| 2026-04-19 创建 |

## 1. 设计方向

参考 flowkey.com，整体走「深色 + 高级简约」路线：

| 维度 | 当前问题 | 改版方向 |
|------|---------|---------|
| 图标 | emoji 堆砌，不专业 | Lucide Icons 矢量图标库 |
| 配色 | 金色过度使用，层次单一 | 深色多层次背景 + 克制的青白主色调 |
| 排版 | 字号层次不够，间距紧凑 | 加大标题字号，增加段落留白 |
| 卡片 | 阴影偏重，样式单调 | 微妙边框 + 毛玻璃质感 |
| 动画 | 几乎没有 | Reanimated 入场动画 + 微交互 |
| 加载 | 空白等待 | 骨架屏占位 |

## 2. 色彩体系

```
背景层级（由深到浅）：
  bg-primary:    #0D0D14    — 全局背景
  bg-secondary:  #161622    — 卡片/容器
  bg-tertiary:   #1E1E2E    — 弹窗/浮层
  bg-elevated:   #252536    — hover/选中态

文字层级：
  text-primary:   #F5F5F7   — 主文字（接近白，不刺眼）
  text-secondary: #8E8E9A   — 次要信息
  text-tertiary:  #4A4A58   — 禁用/占位

功能色：
  accent:         #4FC3F7   — 主操作（淡蓝，克制优雅）
  accent-hover:   #81D4FA   — hover 态
  success:        #66BB6A   — 成功/完成
  warning:        #FFB74D   — 警告
  error:          #EF5350   — 错误/miss

手部配色（游戏内保留）：
  left-hand:      #5C9CE6
  right-hand:     #5ECE8A
```

## 3. 字体与排版

使用系统默认字体栈（iOS San Francisco），不引入外部字体：

```
标题层级：
  display:   32px / 700    — 页面大标题
  h1:        26px / 700    — 一级标题
  h2:        20px / 600    — 二级标题
  h3:        17px / 600    — 三级标题

正文层级：
  body:      15px / 400    — 正文
  caption:   13px / 400    — 辅助说明
  small:     11px / 400    — 极小文字

特殊：
  score:     48px / 800    — 游戏分数
  stat:      36px / 700    — 统计数字
```

行间距统一 1.5 倍，段落间距 16px。

## 4. 图标方案

使用 `lucide-react-native`（轻量、风格统一、支持 RN）：

```bash
npx expo install lucide-react-native react-native-svg
```

替换规则：
| 当前 emoji | 替换为 Lucide 图标 |
|-----------|-------------------|
| 🏠 | `Home` |
| 🎵 | `Music` |
| 📊 | `BarChart3` |
| 👤 | `User` |
| 🔍 | `Search` |
| 🔥 | `Flame` |
| 🎹 | `Piano` 或 `Keyboard` |
| ⭐ | `Star` |
| 🔒 | `Lock` |
| ✅ | `CheckCircle` |
| ▶️ | `Play` |
| ⚙️ | `Settings` |

## 5. 组件改造清单

### 5.1 主题系统 (`src/theme/index.ts`)
- 全面替换色值为新色彩体系
- 新增 `bg-tertiary`、`bg-elevated` 层级
- 调整字号和间距体系

### 5.2 通用���件 (`src/components/common/`)
- **Button**: 主按钮改为 accent 蓝色，取消金色；增加按压动画
- **Card**: 降低阴影，改用 `border: 1px solid rgba(255,255,255,0.06)` 微妙边框
- **Header**: 简化，去掉 `<` 字符改用 Lucide `ChevronLeft`
- **ProgressBar**: 改为 accent 蓝色填充，增加渐变
- **新增 Skeleton**: 骨架屏组件，用于加载占位

### 5.3 Tab 导航 (`app/(tabs)/_layout.tsx`)
- emoji → Lucide 图标
- 激活色改为 accent 蓝色
- 增加图标切换动画

### 5.4 页面改造

| 页面 | 关键改动 |
|------|---------|
| 首页 | 精简信息层级，突出当前课程卡片，推荐区改为横向大卡片 |
| 曲库 | 卡片式布局（2列网格），增加封面占位图，筛选条改为胶囊按钮 |
| 练习 | 统计数字放大突出，图表用 Skia 绘制，练习记录改为时间线布局 |
| 个人中心 | 头像区增加渐变背景环，成就改为精致徽章网格 |
| 登录/注册 | 去掉 emoji 标识，增加品牌 Logo 占位，整体更简洁 |
| 游戏界面 | 保持现有功能结构，仅调色 |
| 结果页 | 分数展示更大，评级用颜色渐变环表现 |

## 6. 动画方案

基于已有的 `react-native-reanimated`：

| 场景 | 动画方式 |
|------|---------|
| 页面入场 | `FadeInDown` 子元素依次入场（stagger 50ms） |
| 卡片点击 | `scale(0.97)` 按压回弹 |
| Tab 切换 | 图标 `scale` + `opacity` 过渡 |
| 数字变化 | 数字滚动动画 |
| 骨架屏 | shimmer 闪光扫过效果 |
| 进度条 | `width` 从 0 到目标值的弹性动�� |

## 7. 实施顺序

```
Phase 1: 基础设施（主题 + 图标 + 通用组件）
  ├── 更新 theme/index.ts
  ├── 安装 lucide-react-native
  ├── 改造 Button / Card / Header / ProgressBar
  └── 新增 Skeleton 组��

Phase 2: Tab 导航 + 首页
  ├── _layout.tsx Tab 栏改造
  └── index.tsx 首页重构

Phase 3: 曲库 + 练习 + 个人中心
  ├── songs.tsx
  ├── practice.tsx
  └── profile.tsx

Phase 4: 二级页面
  ├── 登录/��册
  ├── 游戏结果页
  ├── 课程详情
  └── MIDI 连接页

Phase 5: 动画与微交互
  └── 全局入场动画、骨架屏、按压反馈
```
