# Psychological Scale 前端管理后台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.4-green)](https://vuejs.org/)
[![ElementUI](https://img.shields.io/badge/ElementUI-2.5-green)](https://element.eleme.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## 项目介绍

Psychological Scale 前端管理后台，基于 Vue 3.4 + ElementUI 2.5 + TypeScript 构建，提供心理测评系统的管理界面，包括量表管理、用户管理、订单管理、数据分析等功能。

## 技术架构

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4 | 前端框架 |
| ElementUI | 2.5 | UI组件库 |
| TypeScript | 5.x | 类型系统 |
| Pinia | 2.x | 状态管理 |
| Vite | 5.x | 构建工具 |

## 项目结构

```
frontend/
├── src/
│   ├── api/                    # API接口定义
│   ├── assets/                 # 静态资源
│   ├── components/              # 公共组件
│   ├── composables/            # 组合式API
│   ├── layouts/                # 布局组件
│   ├── router/                 # 路由配置
│   ├── stores/                 # 状态管理
│   ├── utils/                  # 工具函数
│   └── views/                  # 页面视图
├── public/                     # 公共资源
├── package.json
└── vite.config.ts
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev
```

### 构建生产版本

```bash
# 构建打包
npm run build

# 类型检查
npm run tsc

# 代码检查
npm run lint
```

## 功能模块

### 📊 量表管理
- 量表列表与详情
- 题目管理
- 维度配置
- 计分规则设置

### 👥 用户管理
- 用户列表
- 角色权限管理
- 企业用户管理
- 用户分组管理

### 🛒 订单管理
- 订单列表
- 支付管理
- 退款处理
- 企业配额管理

### 📈 数据分析
- 数据驾驶舱
- 群体分析
- 常模对比
- 报告导出

### 📝 测评执行
- 测评监控
- 记录查看
- 进度跟踪

## 开发规范

本项目遵循以下开发规范，详见 [AGENTS.md](../AGENTS.md)：

- Vue 3 + TypeScript 开发规范
- 组件命名规范
- 代码格式规范
- 路径别名配置

## 文档

- [UI设计文档](../docs/design/ui-design.md) - 界面设计规范
- [需求文档](../docs/requirements/) - 各模块需求说明

## 相关链接

- [后端服务](../backend/) - 后端API服务
- [项目总览](../README.md) - 项目总体介绍

## 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](../LICENSE) 文件。

---

*Psychological Scale 前端 - 专业的心理测评管理后台*
