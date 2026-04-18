# JobFlow

JobFlow 是一个面向求职过程管理的 Web 应用，用于集中记录岗位申请、面试复盘、日程安排和求职数据洞察。项目以「看板推进 + 复盘沉淀 + 日程提醒 + 数据分析」为核心流程，帮助用户更清楚地管理多家公司、多轮面试和不同阶段的求职任务。

## 项目特点

- 申请看板：按「感兴趣、已投递、笔试、面试中、Offer、已拒」管理岗位进度。
- 复盘库：记录面试经历，支持 STAR 结构化复盘与结果沉淀。
- 日程管理：管理面试、笔试、电话沟通、复盘任务和截止事项。
- 数据洞察：基于申请与复盘数据生成通过率、能力雷达、情绪曲线和关键发现。
- 在线数据：接入 Supabase，支持新增、删除、编辑后的数据持久化。
- 展示体验：内置演示数据，打开页面即可看到完整产品效果。
- 响应式界面：适配桌面端和移动端基础使用场景。

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- lucide-react
- ESLint

## 功能模块

### 看板

看板用于管理求职申请的整体推进状态。

核心能力：

- 新增申请记录
- 查看申请详情
- 删除用户新增的申请记录
- 按状态分组展示申请
- 区分示例记录与用户新增记录
- 支持从看板直接跳转到复盘创建流程

### 复盘库

复盘库用于沉淀每一次面试或笔试后的经验。

核心能力：

- 新增复盘记录
- 查看复盘详情
- 编辑 STAR 复盘内容
- 删除用户新增的复盘记录
- 按「全部、趁热待写、挂了的、高分场」筛选
- 从复盘下一步动作跳转到日程创建流程

### 日程

日程模块用于安排一周内的求职事项。

核心能力：

- 新增日程事件
- 删除用户新增的日程事件
- 按日期展示事件
- 支持面试、电话、笔试、复盘、任务、休息、截止等类型

### 洞察

洞察页用于对求职数据进行汇总和分析。

核心能力：

- 计算不同题型通过率
- 展示能力雷达图
- 展示情绪曲线
- 汇总关键发现和下一步建议
- 根据申请和复盘记录动态更新统计结果

### 导航与搜索

顶部导航提供全局入口和轻量交互。

核心能力：

- 页面切换
- 全局搜索公司、岗位、复盘和日程
- 通知提示
- 展示账号说明

## 数据库设计

项目使用 Supabase 作为后端数据服务，主要包含三张表：

| 表名 | 用途 |
|---|---|
| `applications` | 存储求职申请记录 |
| `reviews` | 存储面试复盘记录 |
| `schedule_events` | 存储日程事件 |

前端通过自定义 hooks 统一管理数据读写：

- `useApplications`
- `useReviews`
- `useScheduleEvents`

## 环境变量

本地开发需要在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

项目中提供了 `.env.example` 作为环境变量模板。

注意：`.env` 包含真实密钥信息，不应提交到 GitHub。

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

类型检查：

```bash
npm run typecheck
```

代码检查：

```bash
npm run lint
```

生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 部署

推荐使用 Vercel 部署。

部署步骤：

1. 将项目推送到 GitHub。
2. 在 Vercel 中导入该 GitHub 仓库。
3. Framework Preset 选择 Vite。
4. Build Command 使用：

```bash
npm run build
```

5. Output Directory 使用：

```text
dist
```

6. 在 Vercel 项目设置中添加环境变量：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

7. 点击 Deploy 完成上线。

## 项目结构

```text
src
├── components
│   ├── Navigation.tsx
│   └── charts
├── data
│   └── mockData.ts
├── hooks
│   ├── useApplications.ts
│   ├── useReviews.ts
│   └── useScheduleEvents.ts
├── lib
│   └── supabase.ts
├── pages
│   ├── Dashboard.tsx
│   ├── Insights.tsx
│   ├── ReviewLibrary.tsx
│   └── Schedule.tsx
├── types
│   └── index.ts
├── App.tsx
└── main.tsx
```

## 开发状态

当前版本已完成核心产品闭环：

- 前端页面
- Supabase 数据连接
- 看板 CRUD
- 复盘 CRUD 与 STAR 编辑
- 日程 CRUD
- 洞察页数据联动
- 全局搜索
- 基础部署配置

后续可扩展方向：

- 用户登录与权限隔离
- AI 复盘建议生成
- 更完整的通知系统
- 拖拽式看板状态更新
- 多端数据同步优化
