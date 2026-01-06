# Publishing Guide

English | [中文](./PUBLISH_GUIDE.zh-CN.md)

This guide explains how to publish `fingerprint-sdk` to npm and how to set up GitHub Actions for automated releases.

## Prerequisites

- **Project metadata**: ensure `package.json` has correct `name`, `version`, `description`, `main`, `module`, `types`, and `files`.
- **License**: root `LICENSE` exists (MIT).
- **Docs**: root `README.md` includes install/usage.

## Build before publish

Always build to make sure `dist/` is up to date (this package publishes `dist/`).

```bash
npm install
npm run build
```

## Manual publish

### 1) Bump version

Pick one:

- `npm version patch`
- `npm version minor`
- `npm version major`

Example:

```bash
npm version minor -m "Release %s"
```

### 2) Publish to npm

```bash
npm publish --access public
```

### 3) Push tags

```bash
git push --follow-tags
```

## GitHub Actions (CI/CD) publish

### 1) Create an npm token

On npm, create a **Publish** token (Automation tokens are recommended where available), then add it to your GitHub repo secrets as:

- `NPM_TOKEN`

### 2) Workflow

Create `.github/workflows/publish.yml` to publish on tags (e.g. `v5.0.0`).

Typical steps:

- checkout
- setup Node
- install deps
- `npm run build`
- `npm publish --access public` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`

## Files to include

Key files in the repo:

| File/Dir | Purpose |
| --- | --- |
| `src/index.ts` | TypeScript source |
| `dist/` | Built artifacts published to npm |
| `package.json` | Package metadata |
| `tsconfig.json` | TypeScript config |
| `tsup.config.ts` | Build config |
| `README.md` | Documentation (English-first) |
| `README.zh-CN.md` | Documentation (Chinese) |
| `LICENSE` | License |
| `PUBLISH_GUIDE.md` | This guide (English-first) |
| `PUBLISH_GUIDE.zh-CN.md` | This guide (Chinese) |
