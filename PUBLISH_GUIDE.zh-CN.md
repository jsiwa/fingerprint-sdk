# 发布指南

[English](./PUBLISH_GUIDE.md) | 中文

本指南介绍如何将 `fingerprint-sdk` 发布到 npm，以及如何使用 GitHub Actions 实现自动化发布。

## 发布前准备

- **项目信息**：确认 `package.json` 中 `name`、`version`、`description`、`main`、`module`、`types`、`files` 等字段正确。
- **许可证**：根目录存在 `LICENSE`（MIT）。
- **文档**：根目录 `README.md`（英文为主）与 `README.zh-CN.md`（中文）内容完整。

## 发布前构建

发布前务必构建，确保 `dist/` 是最新产物（该包会发布 `dist/`）。

```bash
npm install
npm run build
```

## 手动发布

### 1）提升版本号

三选一：

- `npm version patch`
- `npm version minor`
- `npm version major`

示例：

```bash
npm version minor -m "Release %s"
```

### 2）发布到 npm

```bash
npm publish --access public
```

### 3）推送 tag

```bash
git push --follow-tags
```

## 版本降级 / 回滚指南

本节用于处理“误操作把版本号升错了 / tag 打错了”的情况，按 **publish 前** 和 **publish 后** 分开说明。

### 情况 A：在 `npm publish` **之前**（尚未发布到 npm）

如果还没发布到 npm，可以安全地在本地/远端回滚版本号提交与 tag。

#### A1）撤销最近一次 `npm version ...`（保留工作区改动）

`npm version` 默认会创建一个 git commit + tag。要撤销它：

```bash
# 删除 npm version 创建的 tag（示例：v5.0.0）
git tag -d v5.0.0

# 撤销 npm version 创建的提交，但保留文件改动
git reset --soft HEAD~1

# 然后手动把 package.json 版本改回去，或重新正确执行 npm version
```

#### A2）如果你已经把 tag/提交推送到远端了

```bash
# 删除远端 tag
git push origin :refs/tags/v5.0.0

# 可选：删除本地 tag
git tag -d v5.0.0

# 如果版本号提交也已推送且必须从分支上移除，需要 force push（务必与团队协商）
git reset --hard HEAD~1
git push --force
```

### 情况 B：在 `npm publish` **之后**（已经发布到 npm）

发布到 npm 后，一般 **不能覆盖同一个版本号**（也就是不能“把 5.0.0 改回 4.9.9 再用 5.0.0 覆盖”）。推荐用以下方式处理：

#### B1）弃用（deprecate）错误版本（推荐）

```bash
npm deprecate fingerprint-sdk@5.0.0 "误发布版本，请使用 5.0.1"
```

然后发布一个修复版（例如 `5.0.1`）。

#### B2）向前修复：发布新版本

```bash
npm version patch -m "Release %s"
npm run build
npm publish --access public
git push --follow-tags
```

#### B3）撤回发布（unpublish，仅在 npm 允许时）

npm 对 unpublish 有时间窗口/限制。若在允许范围内且确实需要移除：

```bash
npm unpublish fingerprint-sdk@5.0.0
```

若不允许 unpublish，请使用 **deprecate + 发布修复版本**。

## GitHub Actions 自动化发布（CI/CD）

### 1）创建 npm Token

在 npm 生成 **Publish Token**（如支持更推荐 Automation token），然后在 GitHub 仓库里设置 Secret：

- `NPM_TOKEN`

### 2）配置工作流

创建 `.github/workflows/publish.yml`，在推送 tag（例如 `v5.0.0`）时自动发布。

常见步骤：

- checkout
- setup Node
- install deps
- `npm run build`
- `npm publish --access public`（通过 `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` 认证）

## 关键文件清单

| 文件/目录 | 作用 |
| --- | --- |
| `src/index.ts` | TypeScript 源码 |
| `dist/` | 构建产物（npm 发布内容） |
| `package.json` | 包信息 |
| `tsconfig.json` | TS 配置 |
| `tsup.config.ts` | 构建配置 |
| `README.md` | 英文主文档 |
| `README.zh-CN.md` | 中文文档 |
| `LICENSE` | 许可证 |
| `PUBLISH_GUIDE.md` | 英文发布指南 |
| `PUBLISH_GUIDE.zh-CN.md` | 中文发布指南 |


