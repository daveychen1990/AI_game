# 本地配置说明

本文档说明如何在本机配置并运行《1770：帝国北美》网页原型。当前项目目录为：

```powershell
E:\AI_Game\AI_game
```

## 1. 基础环境

需要安装：

- Node.js 24 或更高版本
- npm
- Git
- GitHub CLI：`gh`

检查命令：

```powershell
node --version
cmd /c npm --version
git --version
gh --version
```

说明：当前 Windows PowerShell 可能禁止直接运行 `npm.ps1`，如果看到“因为在此系统上禁止运行脚本”，优先使用：

```powershell
cmd /c npm <command>
```

例如：

```powershell
cmd /c npm install
cmd /c npm run dev
cmd /c npm test
cmd /c npm run build
```

如果你希望以后在 PowerShell 里直接运行 `npm`，可以自行评估后执行：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 2. 安装项目依赖

进入项目目录：

```powershell
cd E:\AI_Game\AI_game
```

安装依赖：

```powershell
cmd /c npm install
```

依赖会安装到 `node_modules/`，该目录已在 `.gitignore` 中忽略，不需要提交。

## 3. 运行开发服务器

启动本地开发服务器：

```powershell
cmd /c npm run dev
```

如果需要固定地址和端口：

```powershell
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
```

浏览器打开：

```text
http://127.0.0.1:5173
```

## 4. 测试与构建

运行单元测试：

```powershell
cmd /c npm test
```

生产构建：

```powershell
cmd /c npm run build
```

构建产物会生成到 `dist/`，该目录已被忽略，不需要提交。

当前 Vite 可能会提示 Phaser 打包体积较大，例如 `Some chunks are larger than 500 kB`。这是原型阶段可接受的警告，不代表构建失败。

## 5. Git 提交身份配置

建议只在本仓库设置提交身份，避免影响其他项目：

```powershell
git -C E:\AI_Game\AI_game config user.name daveychen1990
git -C E:\AI_Game\AI_game config user.email daveychen1989@163.com
```

查看当前仓库身份：

```powershell
git -C E:\AI_Game\AI_game config --get user.name
git -C E:\AI_Game\AI_game config --get user.email
```

如果你想设置为全局默认身份：

```powershell
git config --global user.name daveychen1990
git config --global user.email daveychen1989@163.com
```

## 6. GitHub 登录与推送

当前远程仓库应指向：

```text
https://github.com/daveychen1990/AI_game.git
```

查看 remote：

```powershell
git -C E:\AI_Game\AI_game remote -v
```

如果需要重新设置 remote：

```powershell
git -C E:\AI_Game\AI_game remote set-url origin https://github.com/daveychen1990/AI_game.git
```

登录 GitHub CLI：

```powershell
gh auth login --hostname github.com --web --git-protocol https --skip-ssh-key
```

登录时在浏览器里选择 `daveychen1990` 对应账号。

登录后检查：

```powershell
gh auth status
```

让本地 Git 使用 `gh` 的 GitHub 登录态：

```powershell
gh auth setup-git
```

验证远程访问：

```powershell
git -C E:\AI_Game\AI_game ls-remote origin
```

推送当前分支：

```powershell
git -C E:\AI_Game\AI_game push -u origin <branch-name>
```

例如：

```powershell
git -C E:\AI_Game\AI_game push -u origin codex/1770-web-prototype
```

## 7. 常用开发流程

查看当前状态：

```powershell
git -C E:\AI_Game\AI_game status -sb
```

创建新分支：

```powershell
git -C E:\AI_Game\AI_game checkout -b codex/<feature-name>
```

提交：

```powershell
git -C E:\AI_Game\AI_game add -A
git -C E:\AI_Game\AI_game commit -m "Your commit message"
```

推送：

```powershell
git -C E:\AI_Game\AI_game push -u origin <branch-name>
```

## 8. 本地文件与忽略规则

以下目录或文件是本地生成物，不应提交：

- `node_modules/`
- `dist/`
- `test-results/`
- `.vite/`
- `coverage/`
- `*.tsbuildinfo`

这些已写入 `.gitignore`。

## 9. Playwright 验证配置

如果需要运行浏览器自动化验证，先安装浏览器运行时：

```powershell
cmd /c npx playwright install chromium
```

项目里已经安装了 `playwright` 开发依赖。如果使用 Codex 的 `develop-web-game` 验证脚本，脚本自身目录也可能需要能解析 `playwright` 包。

## 10. Codex 沙箱说明

Codex 的文件读写沙箱不是项目内配置决定的，而是会话启动时由宿主环境决定。

本项目推荐启动目录：

```powershell
E:\AI_Game
```

实际项目仓库：

```powershell
E:\AI_Game\AI_game
```

如果新会话没有权限读写项目目录，请从 `E:\AI_Game` 打开工作区或重新启动 Codex 会话。

## 11. 常见问题

### PowerShell 不能运行 npm

使用：

```powershell
cmd /c npm <command>
```

### gh 已登录但 git push 失败

先执行：

```powershell
gh auth status
gh auth setup-git
git -C E:\AI_Game\AI_game ls-remote origin
```

再重试 push。

### 构建生成了 dist 或 tsbuildinfo

这是正常现象，`dist/` 和 `*.tsbuildinfo` 已忽略，不需要提交。

### 想切换 GitHub 账号

先退出：

```powershell
gh auth logout --hostname github.com
```

再登录：

```powershell
gh auth login --hostname github.com --web --git-protocol https --skip-ssh-key
gh auth setup-git
```
