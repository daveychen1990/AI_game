# 游戏开发工作室 - Hermes 多 Profile 协作系统

一个完整的游戏开发团队 AI Agent 配置系统，基于 Hermes 的 Profile 功能实现多角色协作开发。

## 团队架构

```
用户(你)
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        制作人 (Producer)                         │
│              项目总负责人，统筹全局，与你直接对接                   │
└─────────────────────────────────────────────────────────────────┘
  │                    │                    │
  ▼                    ▼                    ▼
┌──────────┐    ┌──────────┐    ┌──────────────────┐
│  策划组   │    │  程序组   │    │      美术组       │
│           │    │          │    │                  │
│ • 主策划   │    │ • 主程   │    │ • 主美           │
│ • 系统策划 │    │ • 前端   │    │ • UI             │
│ • 数值策划 │    │ • 后端   │    └──────────────────┘
└──────────┘    └──────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        测试组 (QA)                              │
│              按项目情况安排测试人员进行验收                        │
└─────────────────────────────────────────────────────────────────┘
```

## 工作流程

```
阶段1: 需求确认              阶段2: 策划阶段              阶段3: 开发阶段
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│ 你 ↔ 制作人   │           │ 主策划分发任务 │           │ 主程提炼任务   │
│ 确认项目需求   │──────────▶│ 系统策划写文档 │──────────▶│ 下发前后端    │
│             │           │ 数值策划建模   │           │ 主程核心开发   │
└──────────────┘           └──────────────┘           └──────────────┘
                                                          │
                               阶段5: 测试验收              │
                               ┌──────────────┐            │
                               │ 测试功能验收   │◀───────────┘
                               │ 反馈制作人    │
                               │ 更新任务清单   │
                               └──────┬───────┘
                                      │
                               阶段6: 迭代沟通
                               ┌──────────────┐
                               │ 制作人反馈你   │
                               │ 下一步沟通    │
                               └──────────────┘

阶段4: 美术阶段
┌──────────────┐
│ 主美确认需求   │
│ 生产美术资源   │
│ 发送给主程    │
└──────────────┘
```

## 快速开始

### 1. 一键创建所有 Profile

```bash
# 进入项目目录
cd game-studio-profiles

# 运行初始化脚本，创建所有角色 Profile
bash scripts/create-all-profiles.sh
```

### 2. 手动创建单个 Profile

```bash
# 制作人
hermes profile create game-producer --clone
cp profiles/producer/SOUL.md ~/.hermes/profiles/game-producer/SOUL.md
cp profiles/producer/AGENTS.md ~/.hermes/profiles/game-producer/AGENTS.md

# 主策划
hermes profile create lead-designer --clone
cp profiles/lead-designer/SOUL.md ~/.hermes/profiles/lead-designer/SOUL.md
# ... 以此类推
```

### 3. 启动协作流程

```bash
# 启动制作人进行需求沟通
hermes -p game-producer chat

# 在对话中告知你的游戏创意，制作人会：
# 1. 与你确认需求细节
# 2. 创建项目任务清单
# 3. 向各组下发任务
```

## 文件结构

```
game-studio-profiles/
├── README.md                          # 本文件
├── scripts/
│   └── create-all-profiles.sh         # 一键创建所有 Profile
├── profiles/                          # 各角色 Profile 配置
│   ├── producer/                      # 制作人
│   │   ├── SOUL.md                    # 角色身份定义
│   │   └── AGENTS.md                  # 项目工作规范
│   ├── lead-designer/                 # 主策划
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   ├── system-designer/               # 系统策划
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   ├── numeric-designer/              # 数值策划
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   ├── lead-programmer/               # 主程
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   ├── frontend-programmer/           # 前端程序
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   ├── backend-programmer/            # 后端程序
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   ├── lead-artist/                   # 主美
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   ├── ui-artist/                     # UI
│   │   ├── SOUL.md
│   │   └── AGENTS.md
│   └── qa-tester/                     # 测试
│       ├── SOUL.md
│       └── AGENTS.md
├── shared/                            # 共享资源
│   └── task-board-template.md         # 任务清单模板
└── workflow-diagrams/                 # 工作流程图
    └── workflow.mmd                   # Mermaid 流程图
```

## 角色清单

| 角色 | Profile 名称 | 职责 | 关键决策点 |
|------|------------|------|----------|
| 制作人 | `game-producer` | 项目管理、需求确认、进度把控、跨组协调 | 需求确认、策划审批、最终验收 |
| 主策划 | `lead-designer` | 策划统筹、任务分发、文档审查 | 策划审查(一审) |
| 系统策划 | `system-designer` | 系统设计、文档撰写、逻辑梳理 | 无 |
| 数值策划 | `numeric-designer` | 数值建模、平衡性分析、公式设计 | 无 |
| 主程 | `lead-programmer` | 技术架构、任务提炼、核心开发、资源集成 | 开发任务分配、技术方案 |
| 前端程序 | `frontend-programmer` | 客户端开发、UI实现、交互逻辑 | 无 |
| 后端程序 | `backend-programmer` | 服务端开发、数据库设计、API实现 | 无 |
| 主美 | `lead-artist` | 美术风格、资源生产、质量把控 | 美术方案确认 |
| UI | `ui-artist` | UI设计、图标、界面美术 | 无 |
| 测试 | `qa-tester` | 功能测试、Bug报告、验收确认 | 测试通过/打回 |

## 协作规则

1. **任务清单是唯一的真相源** - 所有任务必须在共享任务清单中跟踪
2. **审查未通过必须打回修改** - 一审(主策划)和二审(制作人)未通过需明确反馈修改意见
3. **美术资源完成后必须通知主程** - 确保资源及时集成
4. **开发完成必须通知测试** - 确保功能及时验收
5. **测试通过必须反馈制作人** - 确保项目进度同步

## 任务状态流转

```
[待办] → [进行中] → [审查中] → [已完成]
              ↑         │
              └─────────┘ (审查未通过打回)
```

| 状态 | 说明 | 谁可以变更 |
|------|------|----------|
| 待办 (TODO) | 已创建但未开始 | 制作人、主程、主策划 |
| 进行中 (IN_PROGRESS) | 正在开发/设计中 | 执行者 |
| 审查中 (IN_REVIEW) | 等待审查 | 执行者提交 |
| 已完成 (DONE) | 审查通过 | 审查者(主策划/制作人/测试) |
| 已打回 (REJECTED) | 审查未通过 | 审查者 |

## 注意事项

- 每个 Profile 有独立的记忆和会话，角色之间通过文件共享协作
- 任务清单使用 Markdown 文件存储在项目共享目录中
- 所有角色都应定期检查任务清单更新
- 制作人是你唯一的直接沟通接口（除主美美术需求确认外）
