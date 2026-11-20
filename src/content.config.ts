/**
 * 内容集合定义：图文（docs）、会变的事实（facts）
 * 图文的 simRoute 只能填陪练课程目录（LESSON_CATALOG）里有的课程 ID，填错时构建直接报错。
 * 图文引用不存在的事实时，Astro 只打 [ERROR] 日志不中断构建，
 * 所以另由 scripts/check-content.mjs 在构建前硬检查（npm run build 已串上）。
 */
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { LESSON_CATALOG } from './simulator/coach/guidedTypes';

// 陪练课程 ID 唯一来源：src/simulator/coach/guidedTypes.ts 里的 LESSON_CATALOG
const lessonIds = LESSON_CATALOG.map((l) => l.id) as [string, ...string[]];

/* ------------------------------------------------------------------ */
/* 图文：Starlight 自带字段之外，加上版本、核对日期、对应的陪练课程        */
/* ------------------------------------------------------------------ */
const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      clientVersion: z.string().default('5.11.3'), // 本文对应的客户端版本
      verifiedAt: z.coerce.date().optional(), // 最近一次真机核对日期（YAML 里直接写 2026-11-19）
      simRoute: z.enum(lessonIds).optional(), // 有陪练课程时填课程 ID，侧栏显示「可试」、文章顶部出陪练入口卡
      facts: z.array(reference('facts')).default([]), // 本文用到的会变事实
    }),
  }),
});

/* ------------------------------------------------------------------ */
/* 会变的事实：积分、倍率、菜单位置等，统一维护                            */
/* ------------------------------------------------------------------ */
const facts = defineCollection({
  loader: file('src/content/facts.yaml'),
  schema: z.object({
    id: z.string(),
    text: z.string(), // 面向读者的一句话
    status: z.enum(['verified', 'pending']), // pending = 待核对，发布前必须清零
    verifiedAt: z.coerce.date().optional(),
    source: z.string().optional(), // 核对来源：真机截图 / 官方页面链接
  }),
});

export const collections = { docs, facts };
