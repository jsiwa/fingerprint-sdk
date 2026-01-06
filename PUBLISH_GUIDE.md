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

## Version rollback / downgrade guide

This section covers common “oops” scenarios when you bumped the version or created tags by mistake.

### Case A: Mistake **before** `npm publish`

If you have **not** published to npm yet, you can safely roll back locally and on your git remote.

#### A1) Undo the last `npm version ...` (keep working tree changes)

`npm version` creates a git commit + tag by default. To undo it:

```bash
# remove the tag created by npm version (example: v5.0.0)
git tag -d v5.0.0

# undo the commit created by npm version, but keep files in your working tree
git reset --soft HEAD~1

# edit package.json version to what you want, or run npm version again correctly
```

#### A2) If you already pushed the tag/commit

```bash
# delete remote tag
git push origin :refs/tags/v5.0.0

# optionally delete the local tag too
git tag -d v5.0.0

# if the version bump commit was pushed and you must remove it from the branch,
# you'll need a force-push (coordinate with teammates!)
git reset --hard HEAD~1
git push --force
```

### Case B: Mistake **after** `npm publish`

Once a version is published to npm, you generally **cannot “downgrade” or overwrite** the same version. You have a few safer options:

#### B1) Deprecate the bad version (recommended)

```bash
npm deprecate fingerprint-sdk@5.0.0 "Bad release: please use 5.0.1"
```

Then publish a fixed version (e.g. `5.0.1`).

#### B2) Fix forward: publish a new version

```bash
npm version patch -m "Release %s"
npm run build
npm publish --access public
git push --follow-tags
```

#### B3) Unpublish (only if allowed)

npm has restrictions on unpublishing. If you are within npm’s allowed window and you truly need to remove a release:

```bash
npm unpublish fingerprint-sdk@5.0.0
```

If unpublish is not allowed, use **deprecate + fix forward**.

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
