# WorkBuddy Lab

免费的 WorkBuddy 互动功能模拟器与实战图文公开课（对应 WorkBuddy 5.11.3）。

> **声明**：本项目为个人教学站，与 WorkBuddy 官方无关。网页模拟器为教学交互还原，不收集任何账号、密码或 API Key。

## 本地开发

```bash
npm install
npm run dev
```

## 校验与构建

```bash
npm run check          # 检查图文引用（simRoute / facts）
npm run build          # 内容校验 + Astro 静态构建
npm run test:unit      # 模拟器导览引擎全分支单元测试
npm run test:e2e       # Playwright 外壳与响应式冒烟测试
npm run check:release  # 发布前检查（要求 facts.yaml 无 pending）
```

## 许可证

- 教程文字、图示与课程内容采用 **CC BY-NC-SA 4.0**（见 `LICENSE-CONTENT`），禁止商业使用。
- 网站与模拟器源代码采用 **PolyForm Noncommercial 1.0.0**（见 `LICENSE`），禁止商业使用。
