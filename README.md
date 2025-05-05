# SolarX UI 🌞

[![Turborepo](https://img.shields.io/badge/-Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build)
[![SolarX Version](https://img.shields.io/npm/v/@solarx/ui?color=007ACC&label=SOLARX)](https://www.npmjs.com/package/@solarx/ui)
[![License](https://img.shields.io/badge/License-MIT-007ACC.svg)](https://opensource.org/license/mit)

**现代化高性能 React 移动端组件库**，专为打造卓越用户体验设计

![SolarX Preview](https://via.placeholder.com/1920x800.png/F8FAFC/007ACC?text=SolarX+UI+Components+Showcase)

## 🚀 核心特性

- ⚡ **闪电构建** - Rsbuild (Rspack) 驱动，冷启动 <1.5s
- 🎨 **设计系统** - PandaCSS 原子化样式 + 主题扩展
- ✨ **丝滑动画** - Framer Motion 60FPS 硬件加速
- ♿ **极致可访问** - WCAG 2.1 AA 合规
- 📚 **智能文档** - 实时组件预览 + 交互式 Playground
- 🧪 **测试无忧** - 98% 测试覆盖率 + 视觉回归测试

## 💻 技术栈全景

| 领域           | 技术方案                 | 关键优势                     |
|----------------|--------------------------|------------------------------|
| **架构**       | Turborepo + pnpm         | 智能缓存/多包协同            |
| **构建**       | Rsbuild (Rspack)         | Rust内核/深度优化            |
| **样式**       | PandaCSS                 | 原子化/零运行时              |
| **交互**       | React Aria               | 无障碍/手势管理              |
| **动画**       | Framer Motion            | 物理动画/流畅交互            |
| **文档**       | Rspress                  | 实时预览/MDX支持             |
| **测试**       | Vitest + Testing Library | 并发测试/快照对比            |

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装步骤
```bash
# 安装依赖
pnpm install

# 生成样式系统
pnpm gen:styles

# 启动开发环境
pnpm dev