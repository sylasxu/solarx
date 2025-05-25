# @solarx/vite-ui

一个基于 Vite 打包的 React TypeScript 组件库，使用 Pigment CSS 进行样式管理。

## 特性

- 🚀 基于 Vite 构建，快速开发和打包
- 💎 使用 Pigment CSS 进行零运行时 CSS-in-JS
- 📦 TypeScript 支持，完整的类型定义
- 🎨 现代化的设计系统
- 🧪 完整的测试覆盖
- 📱 响应式设计

## 安装

```bash
npm install @solarx/vite-ui
# 或
yarn add @solarx/vite-ui
# 或
pnpm add @solarx/vite-ui
```

## 使用

```tsx
import { Button } from '@solarx/vite-ui'

function App() {
  return (
    <div>
      <Button variant="primary" size="md">
        点击我
      </Button>
    </div>
  )
}
```

## 组件

### Button 按钮

基础的按钮组件，支持多种变体、尺寸和状态。

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'success' \| 'danger' \| 'outline' \| 'ghost'` | `'primary'` | 按钮变体 |
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 按钮尺寸 |
| fullWidth | `boolean` | `false` | 是否占满容器宽度 |
| loading | `boolean` | `false` | 是否显示加载状态 |
| leftIcon | `React.ReactNode` | - | 左侧图标 |
| rightIcon | `React.ReactNode` | - | 右侧图标 |
| disabled | `boolean` | `false` | 是否禁用 |

#### 示例

```tsx
// 基础用法
<Button>默认按钮</Button>

// 不同变体
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">轮廓按钮</Button>

// 不同尺寸
<Button size="xs">超小按钮</Button>
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>

// 带图标
<Button leftIcon={<span>👈</span>}>左图标</Button>
<Button rightIcon={<span>👉</span>}>右图标</Button>

// 加载状态
<Button loading>加载中...</Button>

// 全宽按钮
<Button fullWidth>全宽按钮</Button>
```

## 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test
```

### 类型检查

```bash
pnpm type-check
```

## 主题定制

组件库使用 Pigment CSS 的主题系统，你可以通过配置主题来定制组件的外观。

```tsx
import { styled } from '@pigment-css/react'

// 自定义主题配置
const customTheme = {
  palette: {
    primary: {
      500: '#your-primary-color',
    },
  },
}
```

## 许可证

MIT