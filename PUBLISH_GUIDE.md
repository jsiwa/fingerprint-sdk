# 开源库发布指南：@manus/fingerprint-sdk

本指南详细介绍了如何将 `fingerprint-sdk` 发布到 npm 仓库，并配置 GitHub Actions 实现自动化部署。

## 一、发布前的准备工作

在发布之前，请确保您已完成以下步骤：

### 1. 完善项目信息

*   **`package.json`**：确保 `name`、`version`、`description`、`main`、`module`、`types` 和 `files` 字段正确无误。
*   **许可证**：确保项目根目录下有 `LICENSE` 文件（已提供 MIT 许可证）。
*   **文档**：确保 `README.md` 文件内容完整，包含安装和使用说明。

### 2. 编译打包

在发布前，必须先执行构建命令，确保 `dist` 目录下的文件是最新的。

```bash
npm install
npm run build
```

### 3. npm 账号配置

#### 步骤 3.1: 注册与登录

如果您还没有 npm 账号，请先注册。然后，在本地终端登录：

```bash
npm login
```

#### 步骤 3.2: 检查权限

由于您的包名使用了 `@manus` 范围（Scope），如果这是您第一次发布带范围的包，您需要确保该范围是公开的：

```bash
# 检查当前用户是否拥有 @manus 范围的权限
npm whoami
```

## 二、手动发布流程

手动发布适用于首次发布或需要本地验证的场景。

### 1. 提升版本号

根据本次发布的内容，使用 `npm version` 命令提升版本号。这会自动修改 `package.json` 中的 `version` 字段，并创建一个 Git Tag。

| 类型 | 描述 | 示例 |
| :--- | :--- | :--- |
| `patch` | 修复小 Bug，不影响 API | `npm version patch` (e.g., 4.0.0 -> 4.0.1) |
| `minor` | 新增功能，向后兼容 | `npm version minor` (e.g., 4.0.0 -> 4.1.0) |
| `major` | 重大更新，不向后兼容 | `npm version major` (e.g., 4.0.0 -> 5.0.0) |

**示例：**
```bash
npm version minor -m "Release new feature: WebGPU and Tamper Detection"
```

### 2. 发布到 npm

执行发布命令。由于 `package.json` 中已设置 `"files": ["dist"]`，npm 只会上传 `dist` 目录和根目录下的必要文件。

```bash
npm publish --access public
```

### 3. 推送 Tag

将本地生成的版本 Tag 推送到远程仓库：

```bash
git push --tags
```

## 三、GitHub Actions 自动化部署 (CI/CD)

为了实现更高效、更可靠的发布，我们推荐使用 GitHub Actions 自动化流程。

### 1. 配置 GitHub Secrets

自动化发布需要一个 npm 令牌（Token）来授权 GitHub Actions 访问您的 npm 账号。

| 步骤 | 操作 |
| :--- | :--- |
| **生成 Token** | 访问 [npm 网站](https://www.npmjs.com/settings/~/tokens)，生成一个新的 **Publish Token**。 |
| **配置 Secret** | 在您的 GitHub 仓库中，进入 `Settings` -> `Secrets and variables` -> `Actions`。点击 `New repository secret`，名称设置为 `NPM_TOKEN`，值为您刚刚生成的 Token。 |

### 2. 自动化流程文件 (`.github/workflows/publish.yml`)

我们已为您创建了 `publish.yml` 文件，它定义了以下自动化流程：

| 触发条件 | 流程描述 |
| :--- | :--- |
| **`on: push: tags: 'v*'`** | 仅当您向 GitHub 推送以 `v` 开头的 Tag 时（例如 `v4.1.0`），才会触发发布流程。 |
| **`jobs: publish`** | 1. 检出代码。 2. 设置 Node.js 环境。 3. 安装依赖。 4. 执行 `npm run build` 进行编译。 5. 执行 `npm publish --access public`，使用 `NPM_TOKEN` 秘密变量进行认证并发布。 |

### 3. 自动化发布步骤

完成上述配置后，您只需在本地执行以下三步，即可完成自动化发布：

1.  **提升版本号**：`npm version minor`
2.  **推送代码**：`git push`
3.  **推送 Tag**：`git push --tags`

GitHub Actions 将自动捕获新的 Tag，并执行发布流程。

## 四、文件清单

以下是您需要上传到 GitHub 仓库的关键文件：

| 文件/目录 | 作用 |
| :--- | :--- |
| `src/index.ts` | 核心 TypeScript 源码 |
| `package.json` | 项目配置和依赖 |
| `tsconfig.json` | TypeScript 编译配置 |
| `tsup.config.ts` | 打包工具配置 |
| `README.md` | 项目说明文档 |
| `LICENSE` | 许可证文件 |
| `.github/workflows/publish.yml` | **GitHub Actions 自动化配置** |
| `PUBLISH_GUIDE.md` | 本发布指南 |
