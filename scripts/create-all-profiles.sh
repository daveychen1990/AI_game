#!/bin/bash
# ============================================================
# 游戏开发工作室 - Hermes Profile 一键创建脚本
# ============================================================
# 用法:
#   bash scripts/create-all-profiles.sh
#   bash scripts/create-all-profiles.sh --clone  (克隆当前profile配置)
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROFILES_DIR="$PROJECT_DIR/profiles"

# Profile 定义
# 格式: "目录名:Profile名称:显示名称"
PROFILES=(
    "producer:game-producer:制作人"
    "lead-designer:lead-designer:主策划"
    "system-designer:system-designer:系统策划"
    "numeric-designer:numeric-designer:数值策划"
    "lead-programmer:lead-programmer:主程"
    "frontend-programmer:frontend-programmer:前端程序"
    "backend-programmer:backend-programmer:后端程序"
    "lead-artist:lead-artist:主美"
    "ui-artist:ui-artist:UI美术"
    "qa-tester:qa-tester:测试"
)

# 克隆选项
CLONE_FLAG=""
if [ "$1" == "--clone" ] || [ "$1" == "-c" ]; then
    CLONE_FLAG="--clone"
    echo -e "${YELLOW}将使用 --clone 模式创建 Profiles${NC}"
fi

echo -e "${BLUE}"
echo "============================================================"
echo "  游戏开发工作室 - Hermes 多 Profile 创建工具"
echo "============================================================"
echo -e "${NC}"

# 检查 hermes 是否安装
if ! command -v hermes &> /dev/null; then
    echo -e "${RED}错误: 未找到 hermes 命令${NC}"
    echo "请先安装 Hermes Agent: https://hermes-agent.ai"
    exit 1
fi

echo -e "${GREEN}✓ Hermes 已安装${NC}"
echo ""

# 创建统计
CREATED=0
FAILED=0
SKIPPED=0

# 逐个创建 Profile
for profile_def in "${PROFILES[@]}"; do
    IFS=':' read -r dir_name profile_name display_name <<< "$profile_def"

    SOUL_SRC="$PROFILES_DIR/$dir_name/SOUL.md"
    AGENTS_SRC="$PROFILES_DIR/$dir_name/AGENTS.md"
    PROFILE_HOME="$HOME/.hermes/profiles/$profile_name"

    echo -e "${BLUE}[$display_name]${NC} Profile: $profile_name"

    # 检查 Profile 是否已存在
    if [ -d "$PROFILE_HOME" ]; then
        echo -e "  ${YELLOW}⚠ Profile '$profile_name' 已存在，跳过创建${NC}"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # 创建 Profile
    if hermes profile create "$profile_name" $CLONE_FLAG --no-alias &> /dev/null; then
        echo -e "  ${GREEN}✓ Profile 创建成功${NC}"

        # 复制 SOUL.md
        if [ -f "$SOUL_SRC" ]; then
            cp "$SOUL_SRC" "$PROFILE_HOME/SOUL.md"
            echo -e "  ${GREEN}  ✓ SOUL.md 已复制${NC}"
        else
            echo -e "  ${RED}  ✗ SOUL.md 源文件不存在: $SOUL_SRC${NC}"
        fi

        # 复制 AGENTS.md（可选，AGENTS.md 通常放在项目目录）
        if [ -f "$AGENTS_SRC" ]; then
            # AGENTS.md 可以放在 profile 目录供参考
            cp "$AGENTS_SRC" "$PROFILE_HOME/AGENTS.md"
            echo -e "  ${GREEN}  ✓ AGENTS.md 已复制${NC}"
        fi

        CREATED=$((CREATED + 1))
    else
        echo -e "  ${RED}✗ Profile 创建失败${NC}"
        FAILED=$((FAILED + 1))
    fi
    echo ""
done

# 复制共享模板
echo -e "${BLUE}复制共享模板...${NC}"
SHARED_DIR="$PROJECT_DIR/shared"
if [ -d "$SHARED_DIR" ]; then
    # 可以复制到某个公共位置或项目目录
    echo -e "  ${GREEN}✓ 共享模板位于: $SHARED_DIR${NC}"
    echo -e "  ${YELLOW}  提示: 在实际项目中，将 shared/task-board-template.md 复制到项目目录使用${NC}"
fi

echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}  Profile 创建完成!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "  成功创建: ${GREEN}$CREATED${NC}"
echo -e "  已存在跳过: ${YELLOW}$SKIPPED${NC}"
echo -e "  失败: ${RED}$FAILED${NC}"
echo ""

# 显示使用说明
echo -e "${BLUE}使用说明:${NC}"
echo ""
echo "1. 启动制作人进行需求沟通:"
echo -e "   ${GREEN}hermes -p game-producer chat${NC}"
echo ""
echo "2. 查看所有 Profile:"
echo -e "   ${GREEN}hermes profile list${NC}"
echo ""
echo "3. 切换到特定 Profile:"
echo -e "   ${GREEN}hermes profile use game-producer${NC}"
echo ""
echo "4. 各角色 Profile 名称:"
for profile_def in "${PROFILES[@]}"; do
    IFS=':' read -r dir_name profile_name display_name <<< "$profile_def"
    printf "   %-20s → %s\n" "$display_name" "$profile_name"
done
echo ""
echo -e "${YELLOW}提示: 每个 Profile 需要单独设置 API Key 和模型${NC}"
echo -e "      运行: ${GREEN}hermes -p <profile-name> setup${NC}"
echo ""
