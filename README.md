# Moyu Search

A basic Plasmo extension.

## 开发

```bash
pnpm dev
```

## 构建

```bash
pnpm build
```

## 打包

```bash
pnpm package
```

## 代码质量

### Lint-staged 配置

项目已配置 lint-staged 和 husky，在每次提交前会自动运行以下检查：

- **JavaScript/TypeScript 文件**: 运行 ESLint 修复和 Prettier 格式化
- **其他文件 (JSON, CSS, MD)**: 运行 Prettier 格式化

### 手动运行

```bash
# 运行 ESLint
pnpm lint

# 运行 ESLint 并自动修复
pnpm lint:fix

# 运行 lint-staged（处理暂存的文件）
npx lint-staged
```

### Git Hooks

- **pre-commit**: 自动运行 lint-staged，确保提交的代码符合规范

如果遇到问题，可以跳过 hooks：

```bash
git commit --no-verify
```
