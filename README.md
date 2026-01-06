# fingerprint-sdk

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-blue.svg)](https://www.typescriptlang.org/)

English | [中文](./README.zh-CN.md)

High-entropy browser fingerprinting for JavaScript/TypeScript. Collects multiple stable-ish signals (WebGPU/WebGL/Canvas/Audio/Fonts/Screen/Hardware) and returns a deterministic `visitorId`, plus a lightweight bot/tamper indicator derived from common automation signals.

## Features

- **Multi-signal fingerprint**: WebGPU, WebGL, canvas, audio, fonts, screen/viewport, hardware concurrency & memory.
- **Iframe-isolated sampling**: runs some collectors inside a hidden iframe to reduce impact from naive global hooks.
- **Bot/tamper signals (basic)**: aggregates common automation indicators (e.g. `navigator.webdriver`, missing plugins, suspicious dimensions).
- **TypeScript-first**: typed API and ESM/CJS builds.

## Install

```bash
npm install fingerprint-sdk
# or
yarn add fingerprint-sdk
# or
pnpm add fingerprint-sdk
# or
bun add fingerprint-sdk
```

## Usage

```ts
import FingerprintSDK, { FingerprintResult } from "fingerprint-sdk";

async function main() {
  const result: FingerprintResult = await FingerprintSDK.get({
    debug: true,  // include raw components
    timeout: 5000 // (currently not used by collectors; kept for API compatibility)
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

**Options**

- `debug?: boolean`: when `true`, returns `components` with raw collector outputs.
- `timeout?: number`: reserved; collectors apply internal per-signal timeouts.

**Returns: `Promise<FingerprintResult>`**

| Field | Type | Description |
| --- | --- | --- |
| `visitorId` | `string` | Deterministic ID hashed from collected entropy values. |
| `confidence` | `number` | A coarse confidence score (currently based on the security signal). |
| `isBot` | `boolean` | `true` when basic automation/tamper signals are detected. |
| `components` | `Record<string, any> \| null` | Raw signals (only when `debug: true`). |
| `meta` | `{ version: string; duration: string }` | SDK version and runtime duration. |

## Notes & Responsible Use

- **Browser-only**: requires `window`, `document`, and various Web APIs; don’t run it on the server.
- **Privacy**: fingerprinting may be regulated; make sure you have proper user notice/consent where required.
- **No guarantee**: anti-fraud is adversarial; treat signals as inputs to a broader risk system.

## Development

```bash
npm install
npm run build
npm run dev
```

## License

MIT.
