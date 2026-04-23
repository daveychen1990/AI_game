# 游戏工作室 - 飞书机器人配置指南

## 概述
每个游戏开发角色需要独立的飞书机器人，这样团队成员可以直接@对应角色对话。

## 创建步骤

### 1. 登录飞书开放平台
访问：https://open.feishu.cn/app

### 2. 创建应用（每个角色一个）
点击"创建企业自建应用"，填写信息：

| 角色 | 应用名称建议 | 应用描述 |
|------|------------|---------|
| 制作人 | `游戏-制作人` | 项目总负责人 |
| 主策划 | `游戏-主策划` | 策划组负责人 |
| 系统策划 | `游戏-系统策划` | 系统规则设计 |
| 数值策划 | `游戏-数值策划` | 数值平衡设计 |
| 主程 | `游戏-主程` | 程序组负责人 |
| 前端程序 | `游戏-前端` | 客户端开发 |
| 后端程序 | `游戏-后端` | 服务端开发 |
| 主美 | `游戏-主美` | 美术组负责人 |
| UI美术 | `游戏-UI美术` | 界面设计 |
| 测试 | `游戏-测试` | 质量保证 |

### 3. 配置每个应用

#### 添加机器人能力
1. 进入应用详情 → "添加应用能力" → "机器人"
2. 启用机器人

#### 获取凭证
1. 进入"凭证与基础信息"
2. 复制 **App ID** 和 **App Secret**

#### 配置权限
进入"权限管理"，添加以下权限：
- `im:chat:readonly` (读取群组信息)
- `im:message` (发送消息)
- `im:message.group_msg` (发送群消息)

#### 发布版本
1. 进入"版本管理与发布"
2. 点击"创建版本"
3. 填写版本号（如 1.0.0）
4. 提交发布

#### 将机器人加入群聊
1. 在飞书群聊中 @机器人名称
2. 或进入群设置 → 添加机器人

---

## 配置文件模板

创建文件：`~/.hermes/profiles/<profile-name>/.env`

每个 Profile 的 `.env` 文件内容：

```bash
# 制作人
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx
FEISHU_DOMAIN=feishu
FEISHU_CONNECTION_MODE=websocket

# 允许所有用户访问（或配置白名单）
GATEWAY_ALLOW_ALL_USERS=true
```

---

## 快速配置脚本

运行以下命令为每个 Profile 创建独立的飞书配置：

```bash
# 设置每个角色的飞书凭证（替换为实际值）
# 制作人
hermes -p game-producer config set-env FEISHU_APP_ID "cli_a9637fe965389bb4"
hermes -p game-producer config set-env FEISHU_APP_SECRET "caP4s9AuMtic8OpIecBnQhnmjuBZxNgW"

# 主策划
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a963726e63fadbb7"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "wEBV4VKYx5BagAp5uhA9zeWPPVEgUdQV"

# 系统策划
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a963679fc57a9bd5"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "krnJOGA5ZMhUPRclrCzkCbuaDSvDYEXc"

# 数值策划
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a963612f387a5bc2"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "LWuuvlle1omqOSxFNap6hg8U57Oi271L"

# 主程
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a9636204a4bb1bb7"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "Fan1VCzx4yY561TgrFbdfcQ6hwQZzFhi"

# 前端
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a963625ee4fb1bc9"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "6W24yyXMRxynLeakLx7RKe2qRPO6U8GJ"

# 后端
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a96362749d631bdf"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "XmUzPQ5vNfJA7nhcGjDjAb4AQrvZ8dP5"

# 主美
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a96361a494ba1bc3"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "0agRILgvNh5tsqSNo4uTAdTUs8T2b0bY"

# UI
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a96361f311ba1bdf"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "imMRV9Db2GUrfc18qekkBSauh1zyfURP"

# 测试
hermes -p lead-designer config set-env FEISHU_APP_ID "cli_a963638b8d401bb3"
hermes -p lead-designer config set-env FEISHU_APP_SECRET "IQQ144gBt8Da1W1zsYlG4c1ZFUuStcfB"

# ... 其他角色以此类推
```

---

## 验证配置

```bash
# 检查所有 Profile 的飞书配置
for p in game-producer lead-designer system-designer numeric-designer lead-programmer frontend-programmer backend-programmer lead-artist ui-artist qa-tester; do
  echo "=== $p ==="
  hermes -p $p config get-env FEISHU_APP_ID 2>/dev/null || echo "未配置"
done
```

---

## 启动所有 Gateway

配置完成后，启动所有角色的 Gateway：

```bash
bash ~/.hermes/game-studio-gateway.sh restart
```

---

## 使用方式

团队成员在飞书中：
- @游戏-制作人 → 与制作人对话
- @游戏-主策划 → 与主策划对话
- @游戏-主程 → 与主程对话
- ...以此类推

每个角色会根据其 SOUL.md 中定义的专业知识和风格回复。
