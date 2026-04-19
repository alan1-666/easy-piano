# UI 改版 — 测试场景

> 覆盖 US-UI-01 ~ US-UI-07 的��收标准

## 测试策略

UI 改版以视觉和交互为主，测试分两层：

| 层级 | 工具 | ��盖范围 |
|------|------|---------|
| 组件快照测试 | Jest + react-test-renderer | 通用组件渲染正确性 |
| E2E 视觉+交互 | Maestro | 用户操作路径、页面可见性 |

选择 Maestro 而非 Detox 的原因：配置简单，YAML 编写，适合 Expo 项目，支持 iOS 模拟器。

---

## 组件单元测试

### T-UNIT-01 主题色值完整性
- 验证 theme 导出包含所有必需色值（bg-primary ~ bg-elevated, text-primary ~ text-tertiary, accent, success, warning, error）
- 验证无 emoji 字符出现在组件渲染输出中

### T-UNIT-02 Button 组件
- 渲染 primary/secondary/ghost 三种变体，快照匹配
- disabled 态 opacity 正确
- loading 态展示 spinner

### T-UNIT-03 Card 组件
- 默认渲染匹配快照
- onPress 存在时可点击

### T-UNIT-04 Skeleton 组件（新增）
- 渲染宽高匹配 props
- 动画启动无报错

### T-UNIT-05 ProgressBar 组件
- progress=0 和 progress=1 渲染正确
- 颜色使用 accent 色

---

## E2E 测试场景

### T-E2E-01 首页信息架构（US-UI-03）
```yaml
- launchApp
- assertVisible: "欢迎" 或用户名
- assertVisible: 当前课程卡片区域
- assertVisible: tab 导航栏
- tapOn: 当前课程卡片
- assertVisible: 课程详情页
```

### T-E2E-02 曲库浏览与筛选（US-UI-04）
```yaml
- launchApp
- tapOn: "曲库" tab
- assertVisible: 搜索栏
- assertVisible: 难度筛选区
- assertVisible: 至少一个曲目卡片
- tapOn: 难度筛选按钮（如"初级"）
- assertVisible: 筛选后的曲目列表
```

### T-E2E-03 练习统计页（US-UI-05）
```yaml
- launchApp
- tapOn: "练习" tab
- assertVisible: 总时长数字
- assertVisible: 连续天数数字
- assertVisible: 练习图表区域
```

### T-E2E-04 个人中心（US-UI-06）
```yaml
- launchApp
- tapOn: "我的" tab
- assertVisible: 头像区域
- assertVisible: 等级信息
- assertVisible: 成就区域
```

### T-E2E-05 Tab 导航完整性（US-UI-01, US-UI-07）
```yaml
- launchApp
- assertVisible: "首页" tab（激活态）
- tapOn: "曲库" tab
- assertVisible: 曲库页内容
- tapOn: "练习" tab
- assertVisible: 练习页内容
- tapOn: "我的" tab
- assertVisible: 个人中心内容
- tapOn: "首页" tab
- assertVisible: 首页内容
```

### T-E2E-06 无 emoji 回归检查（US-UI-01）
```yaml
- launchApp
- 遍历四个 tab 页
- assertNotVisible: 常见 emoji 字符（🏠🎵📊👤🔥🎹⭐🔒）
```

---

## US → 测试覆盖矩阵

| User Story | 单��测试 | E2E 测试 |
|-----------|---------|---------|
| US-UI-01 高品质视觉体验 | T-UNIT-01, T-UNIT-02~05 | T-E2E-05, T-E2E-06 |
| US-UI-02 沉浸式��色主题 | T-UNIT-01 | T-E2E-05（各页视觉） |
| US-UI-03 清晰的首页信息架构 | — | T-E2E-01 |
| US-UI-04 优雅的曲库浏览体验 | — | T-E2E-02 |
| US-UI-05 激励性的练习数���呈现 | — | T-E2E-03 |
| US-UI-06 专业的个人中心 | — | T-E2E-04 |
| US-UI-07 流畅的页面转场与微交互 | T-UNIT-04 | T-E2E-05 |
