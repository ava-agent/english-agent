# English Learning Assistant

AI 驱动的英语学习助手，以**情景对话**为核心，通过模拟真实旅行场景与 AI 角色聊天，在自然交流中学习英语。

**在线体验:** [https://english.rxcloud.group](https://english.rxcloud.group)

> **免注册试用:** 点击首页「免费试用」按钮，无需登录即可体验情景对话功能！

---

## 截图

| 首页 | 登录 |
|:---:|:---:|
| ![首页](docs/screenshots/01-landing.png) | ![登录](docs/screenshots/02-login.png) |

| 选择目的地 | 选择场景 |
|:---:|:---:|
| ![目的地](docs/screenshots/03-chat-destinations.png) | ![场景](docs/screenshots/04-chat-scenarios.png) |

| 选择角色 | 对话界面 |
|:---:|:---:|
| ![角色](docs/screenshots/05-chat-characters.png) | ![对话](docs/screenshots/06-chat-conversation.png) |

| 每日学习 | 学习面板 |
|:---:|:---:|
| ![学习](docs/screenshots/07-learn.png) | ![面板](docs/screenshots/08-dashboard.png) |

| 词汇库 | 设置 |
|:---:|:---:|
| ![词汇](docs/screenshots/09-vocabulary.png) | ![设置](docs/screenshots/10-settings.png) |

---

## 核心功能

### 情景对话 (主打功能)
- **免注册试用** - 无需登录即可体验完整对话功能，降低使用门槛
- **8 个旅行目的地** - 东京、曼谷、巴黎、纽约、伦敦、悉尼、首尔、新加坡
- **6 种场景** - 机场通关、酒店入住、餐厅点餐、购物逛街、景点游览、社交聊天
- **3 位 AI 角色** - Sophia (美国旅行博主)、Emma (英国英语老师)、Mia (澳洲背包客)，各有独特性格和说话风格
- **实时流式对话** - AI 角色保持人设，自然引入实用词汇并用 **粗体** 标记
- **快捷回复** - 根据场景提供常用短语建议，降低输入门槛
- **自动词汇提取** - 对话结束后自动提取新词，生成定义和中文翻译，纳入 SRS 复习

### 每日学习
- **个性化学习计划** - 结合复习卡片、新词汇和练习题
- **FSRS 间隔重复** - 基于 `ts-fsrs`，科学安排复习时间 (Again / Hard / Good / Easy)
- **AI 内容生成** - GLM-4 生成例句、情景对话和填空练习
- **双主题** - 旅游英语 + 软件工程英语

### 数据分析
- **学习面板** - 连续打卡天数、每周活跃度、掌握度分布、分类进度
- **词汇库** - 浏览所有已学词汇，查看掌握状态和复习计划

### 通知推送
- **Telegram Bot** - 每日提醒和学习完成通知
- **Server 酱 (微信)** - 通过 Server 酱推送到微信
- **Web Push** - 浏览器原生推送通知
- **可配置时间** - 按时区设置每日提醒时间

### 自动化
- **每日提醒** (UTC 1:00) - 多渠道推送，包含连续天数和待复习数量
- **每日报告** (UTC 16:00) - 自动生成 Markdown 学习报告并提交到 GitHub
- **打卡检查** (UTC 17:00) - 自动使用打卡冻结保护连续天数

---

## 系统架构

![系统架构](docs/diagrams/01-system-architecture.png)

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router, Server Components, Server Actions) |
| 语言 | TypeScript 5 |
| UI | Tailwind CSS 4 + Radix UI + shadcn/ui |
| 数据库 | PostgreSQL 17 (Supabase) + RLS 行级安全 |
| 认证 | Supabase Auth (邮箱密码, PKCE 流程) |
| AI | GLM-4 Plus (智谱 AI) via OpenAI 兼容 SDK |
| SRS | ts-fsrs v5.2 (间隔重复算法) |
| 通知 | Telegram Bot API, Server 酱 API, Web Push |
| GitHub | Octokit REST API |
| 部署 | Vercel (含 Cron Jobs) |
| 输入校验 | Zod |

---

## 项目结构

```
src/
├── app/
│   ├── (authenticated)/        # 需认证路由
│   │   ├── chat/               # 情景对话 (主功能)
│   │   │   ├── [id]/           # 对话界面
│   │   │   ├── client.tsx      # 目的地/场景/角色选择器
│   │   │   └── page.tsx        # 对话列表
│   │   ├── learn/              # 每日学习
│   │   ├── dashboard/          # 学习面板
│   │   ├── vocabulary/         # 词汇库
│   │   └── settings/           # 用户设置
│   ├── api/
│   │   ├── chat/               # 流式对话 API
│   │   └── cron/               # 定时任务
│   ├── actions/                # Server Actions
│   └── login/                  # 登录页
├── components/
│   ├── chat/                   # 对话组件
│   │   ├── chat-view.tsx       # 对话主视图 (流式消息、快捷回复)
│   │   ├── chat-bubble.tsx     # 消息气泡 (词汇高亮、点击查释义)
│   │   └── chat-summary.tsx    # 对话总结 (词汇列表、统计)
│   ├── session/                # 学习会话组件
│   └── ui/                     # shadcn 组件
├── lib/
│   ├── chat-ai.ts              # 对话 AI (系统提示词、流式响应、词汇提取)
│   ├── chat-constants.ts       # 目的地、场景、角色定义
│   ├── srs.ts                  # FSRS 算法封装
│   ├── llm.ts                  # GLM-4 API 客户端
│   ├── validation.ts           # Zod 输入校验
│   ├── github.ts               # GitHub 提交逻辑
│   ├── notifications/          # 通知分发
│   └── supabase/               # 数据库客户端
└── middleware.ts               # 路由保护
```

---

## 数据库

![数据库 ER 图](docs/diagrams/04-database-schema.png)

8 张表，全部启用 Row-Level Security:

- **profiles** - 用户设置、通知偏好、打卡冻结
- **vocabulary** - 词汇语料库 (旅游 + 软件工程)
- **user_cards** - 用户 SRS 卡片状态 (到期时间、稳定性、难度、重复次数)
- **sessions** - 学习会话记录
- **review_logs** - 不可变的复习历史
- **daily_checkins** - 每日打卡记录
- **chat_conversations** - 对话会话 (角色、目的地、场景、状态、已学词汇)
- **chat_conversation_messages** - 对话消息 (角色、内容、元数据)

3 个 PostgreSQL 函数:
- `get_mastery_distribution(user_id)` - 按掌握度统计词汇数量
- `get_category_progress(user_id)` - 按分类统计学习进度
- `get_current_streak(user_id)` - 计算连续学习天数

---

## 快速开始

### 前置条件

- Node.js 18+
- Supabase 项目 ([supabase.com](https://supabase.com))
- 智谱 AI API 密钥 ([open.bigmodel.cn](https://open.bigmodel.cn))

### 安装

```bash
git clone https://github.com/ava-agent/english-agent.git
cd english-agent
npm install
```

### 环境变量

复制 `.env.example` 到 `.env.local` 并填入:

```bash
cp .env.example .env.local
```

| 变量 | 必填 | 说明 |
|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | 是 | Supabase 服务角色密钥 |
| `ZHIPU_API_KEY` | 是 | 智谱 AI API 密钥 |
| `ZHIPU_BASE_URL` | 是 | `https://open.bigmodel.cn/api/paas/v4` |
| `CRON_SECRET` | 是 | Vercel 定时任务鉴权密钥 |
| `GITHUB_TOKEN` | 否 | GitHub PAT (报告发布) |
| `GITHUB_REPO_OWNER` | 否 | GitHub 仓库所有者 |
| `GITHUB_REPO_NAME` | 否 | GitHub 仓库名称 |
| `TELEGRAM_BOT_TOKEN` | 否 | Telegram Bot Token |
| `NEXT_PUBLIC_APP_URL` | 否 | 生产环境 URL |

### 数据库初始化

通过 Supabase CLI 应用迁移:

```bash
npx supabase db push
```

或在 Supabase SQL 编辑器中手动执行 `supabase/migrations/` 下的迁移文件。

### 本地开发

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 部署

部署到 Vercel:

```bash
npx vercel --prod
```

`vercel.json` 自动配置 3 个定时任务:

| 定时任务 | 时间 | 说明 |
|---|---|---|
| `/api/cron/daily-reminder` | `0 1 * * *` | 发送每日学习提醒 |
| `/api/cron/daily-report` | `0 16 * * *` | 发布学习报告到 GitHub |
| `/api/cron/streak-check` | `0 17 * * *` | 自动使用打卡冻结 |

---

## 对话系统架构

![对话流程](docs/diagrams/02-chat-flow.png)

**流程说明:**

1. **选择阶段** - 用户依次选择目的地 (8 城市) → 场景 (6 种) → AI 角色 (3 位)
2. **创建对话** - 检查登录状态，创建 `chat_conversations` 记录，AI 生成角色化开场白
3. **对话循环** - 用户发消息 → Zod 校验 → 构建角色提示词 → 流式生成 AI 回复 → 双写 (客户端展示 + DB 保存)
4. **结束总结** - 提取 `**粗体**` 标记的词汇 → LLM 生成定义和翻译 → 注册用户入库 SRS / 访客仅展示

### 访客模式

- 通过 Cookie (`guestMode=true`) 识别访客身份
- 访客可完整体验对话功能，但数据不会持久化
- 对话结束后词汇仅展示，不进入 SRS 复习系统
- 注册登录后可保存学习进度

---

## AI Agent 架构

![AI Agent 架构](docs/diagrams/05-ai-agent-architecture.png)

系统采用**多 Agent 协作架构**，4 个专用 Agent 各司其职，通过共享数据结构协同工作:

| Agent | 职责 | 核心函数 | 文件 |
|---|---|---|---|
| **Chat Agent** | 实时角色对话，流式响应 | `buildSystemPrompt()`, `streamChatResponse()` | `chat-ai.ts` |
| **Vocabulary Extraction Agent** | 从对话中提取词汇并生成释义 | `extractVocabulary()` | `chat-ai.ts` |
| **Session Builder Agent** | 编排每日学习计划 | `buildSessionPlan()`, `interleaveItems()` | `session-builder.ts` |
| **FSRS Agent** | 间隔重复调度 | `reviewCard()`, `getMasteryLevel()` | `srs.ts` |

### Agent 执行流程

![Agent 执行流程](docs/diagrams/06-agent-execution-flow.png)

**三条核心流水线:**

1. **对话流** - 用户选择场景 → 构建角色提示词 (16 条行为规则) → GLM-4 流式生成 → `stream.tee()` 双写 (实时展示 + 后台存库)
2. **词汇提取流** - 对话结束 → Regex 提取 `**粗体**` 词汇 → LLM 生成释义+翻译 → Zod 校验 → 注册用户入库 SRS / 访客仅展示
3. **学习会话流** - `buildReviewQueue()` 复习队列 + `selectNewVocabulary()` 新词选取 + `generatePracticeItems()` 练习生成 → 交错编排 (2R+3L+1P)

### LLM 提示工程与数据管道

![LLM 提示工程](docs/diagrams/07-llm-prompt-pipeline.png)

所有 AI 能力统一由 **GLM-4 Plus (智谱 AI)** 驱动，通过 OpenAI 兼容 SDK 调用。不同任务使用不同的 Temperature 策略:

| LLM 调用 | Temperature | 响应格式 | 校验 | 用途 |
|---|:---:|---|---|---|
| 对话流式 | 0.85 | Text stream | — | 角色实时聊天 |
| 开场白生成 | 0.9 | Text | 降级兜底 | 创建对话时的角色化问候 |
| 词汇释义 | 0.3 | JSON | Zod | 对话结束后提取词汇定义 |
| 语料生成 | 0.8 | JSON | Strict Zod (7 字段) | 每日学习新词 + 例句 + 对话 |
| 练习生成 | 0.7 | JSON | Strict Zod | 填空题 + 4 选项 |

> **设计原则:** 创意任务 (对话、开场白) 使用高 Temperature，事实性任务 (释义、练习) 使用低 Temperature，确保输出既生动又准确。

---

## SRS 间隔重复系统

![SRS 流程](docs/diagrams/03-srs-flow.png)

基于 [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) 算法，词汇经历 5 个掌握状态:

| 状态 | 说明 |
|---|---|
| New | 从对话中提取的新词，尚未复习 |
| Learning | 初次复习，短间隔重复 |
| Familiar | 多次正确回忆，间隔逐渐延长 |
| Mastered | 稳定性 > 30 天，长期记忆 |
| Relearning | 遗忘后重新学习 |

用户每次复习后选择 Again / Hard / Good / Easy，算法自动计算下次复习时间。

---

## License

MIT
