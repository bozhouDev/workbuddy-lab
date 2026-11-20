// @ts-check
// Astro 配置：图文页走 Starlight，模拟器是独立页面里的 React 岛
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/site.config.mjs';

export default defineConfig({
  site: SITE.url,
  integrations: [
    starlight({
      title: SITE.name,
      // 只有中文一种语言，设为根语言，<html lang="zh-CN">，Pagefind 才会按中文分词
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      logo: { src: './src/assets/logo-mark.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      // 全站样式和设计变量；必须放第一项（Tailwind 分层要求）
      customCss: ['./src/styles/global.css'],
      components: {
        // 只做浅色：去掉主题切换，并强制浅色主题
        ThemeSelect: './src/components/overrides/Empty.astro',
        ThemeProvider: './src/components/overrides/ForceLight.astro',
        // 定制导航、标题区（含版本与模拟器入口卡）、侧栏（含「可试」标记）、页脚
        Header: './src/components/overrides/Header.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
        Sidebar: './src/components/overrides/Sidebar.astro',
        Footer: './src/components/overrides/Footer.astro',
      },
      sidebar: [
        // Starlight 0.39 起：分组要写成 label + items，autogenerate 放进 items
        { label: '00 入门', items: [{ autogenerate: { directory: 'features/basics' } }] },
        { label: '01 开局设置', items: [{ autogenerate: { directory: 'features/setup' } }] },
        { label: '02 发任务', items: [{ autogenerate: { directory: 'features/send-task' } }] },
        { label: '03 能力扩展', items: [{ autogenerate: { directory: 'features/extend' } }] },
        { label: '04 自动化', items: [{ autogenerate: { directory: 'features/automation' } }] },
      ],
    }),
    react(),
  ],
  vite: { plugins: [tailwindcss()] },
});
