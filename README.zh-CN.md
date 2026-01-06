# fingerprint-sdk

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-blue.svg)](https://www.typescriptlang.org/)

[English](./README.md) | 中文

面向 JavaScript/TypeScript 的高熵值浏览器指纹库。它会采集多种相对稳定的信号（WebGPU/WebGL/Canvas/Audio/字体/屏幕/硬件等），生成确定性的 `visitorId`，并提供一个轻量的 bot/篡改风险指示（基于常见自动化特征）。

## 特性

- **多信号指纹**：WebGPU、WebGL、Canvas、Audio、字体、屏幕/视口、硬件并发与内存等。
- **Iframe 隔离采样**：部分采集逻辑在隐藏 iframe 中运行，降低简单全局 Hook 的影响。
- **基础 bot/篡改信号**：汇总常见自动化指标（如 `navigator.webdriver`、插件缺失、可疑窗口尺寸等）。
- **TypeScript 友好**：类型完备，支持 ESM/CJS 构建产物。

## 安装

```bash
npm install fingerprint-sdk
# 或
yarn add fingerprint-sdk
# 或
pnpm add fingerprint-sdk
# 或
bun add fingerprint-sdk
```

## 使用

```ts
import FingerprintSDK, { FingerprintResult } from "fingerprint-sdk";

async function main() {
  const result: FingerprintResult = await FingerprintSDK.get({
    debug: true,  // 返回 components 详细信息
    timeout: 5000 //（目前采集器内部有各自超时；该字段保留用于兼容）
  });

  console.log("visitorId:", result.visitorId);
  console.log("confidence:", result.confidence);
  console.log("isBot:", result.isBot);
  console.log("meta:", result.meta);

  if (result.components) {
    console.log("components:", result.components);
  }
}

main();
```

## API

### `FingerprintSDK.get(options?)`

**参数**

- `debug?: boolean`：为 `true` 时返回原始采集结果 `components`
- `timeout?: number`：保留字段；采集器内部会对单项信号设置超时

**返回：`Promise<FingerprintResult>`**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `visitorId` | `string` | 基于熵值计算的确定性访客 ID（hash）。 |
| `confidence` | `number` | 粗略置信度（目前主要由 security 信号推导）。 |
| `isBot` | `boolean` | 检测到基础自动化/篡改信号时为 `true`。 |
| `components` | `Record<string, any> \| null` | 原始信号（仅 `debug: true` 返回）。 |
| `meta` | `{ version: string; duration: string }` | SDK 版本与耗时。 |

## 注意事项与合规建议

- **仅浏览器环境**：依赖 `window`/`document` 及相关 Web API，不适用于服务端执行。
- **隐私合规**：指纹识别可能受到法律/政策约束，请确保合规告知与授权。
- **不保证对抗结果**：风控对抗是动态的，请将信号作为整体风控体系的输入之一。

## 开发

```bash
npm install
npm run build
npm run dev
```

## 许可证

MIT。


