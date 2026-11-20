/**
 * 内容集合定义：图文（docs）、模拟器路线（routes）、会变的事实（facts）
 * 路线里字段写错、引用不存在的拍或外壳元素时，构建直接报错。
 * 图文引用不存在的路线 / 事实时，Astro 只打 [ERROR] 日志不中断构建，
 * 所以另由 scripts/check-content.mjs 在构建前硬检查（npm run build 已串上）。
 */
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { SIM_IDS } from './simulator/registry';

/* ------------------------------------------------------------------ */
/* 图文：Starlight 自带字段之外，加上版本、核对日期、对应的模拟器路线      */
/* ------------------------------------------------------------------ */
const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      clientVersion: z.string().default('5.11.3'), // 本文对应的客户端版本
      verifiedAt: z.coerce.date().optional(), // 最近一次真机核对日期（YAML 里直接写 2026-11-19）
      simRoute: reference('routes').optional(), // 有模拟器路线时填路线 ID，侧栏显示「可试」
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

/* ------------------------------------------------------------------ */
/* 模拟器路线                                                          */
/* ------------------------------------------------------------------ */

// 外壳元素 ID 只能取注册表里的值
const simId = z.enum(SIM_IDS);

// 产物区里的一行：same 原样 / removed 被删（橙色删除线）/ added 新增（蓝底）
const artifactLine = z.object({
  text: z.string(),
  change: z.enum(['same', 'removed', 'added']).default('same'),
});

// 对话消息里的内容块；text 支持行内标记 {{wrong:编造的内容}} {{ok:未明确}}
const block = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({
    type: z.literal('file'),
    name: z.string(),
    size: z.string().optional(),
    status: z.enum(['written', 'overwritten', 'unchanged']),
  }),
  z.object({ type: z.literal('plan'), items: z.array(z.string()), ask: z.string().optional() }),
  z.object({ type: z.literal('note'), text: z.string() }), // 灰色小字，如「当前是 Ask 模式，没有修改文件」
]);

// 场景：外壳在某一刻的完整状态快照。外壳只负责按场景渲染，不含剧情逻辑
const scene = z.object({
  view: z.enum(['home', 'chat', 'settings', 'extensions', 'library', 'schedule']),
  overlay: z
    .enum([
      'plusMenu',
      'plusMenuFiles',
      'permissionMenu',
      'groupMenu',
      'modelMenu',
      'atMenu',
      'approvalDialog',
    ])
    .optional(),
  chatTitle: z.string().optional(),
  elapsed: z.string().optional(),
  composer: z
    .object({
      text: z.string().default(''),
      mode: z.enum(['default', 'plan', 'ask']).default('default'),
      permission: z.enum(['default', 'full']).default('default'),
      group: z.string().nullable().default(null), // null = 未选分组
      model: z.string().default('Hy4 flash'),
    })
    .optional(),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), blocks: z.array(block) }))
    .default([]),
  artifacts: z
    .object({
      file: z.string(),
      docTitle: z.string().optional(),
      badge: z.string().optional(),
      lines: z.array(artifactLine),
    })
    .optional(),
  approval: z
    .object({
      action: z.string(),
      path: z.string(),
      outsideWorkspace: z.boolean(),
      question: z.string().optional(),
      confirmLabel: z.string().optional(),
      cancelLabel: z.string().optional(),
    })
    .optional(),
});

// 一拍（beat）：导览的最小单位 = 一个场景 + 一句旁白 + 一个聚光目标 + 一种推进方式
const beat = z.object({
  id: z.string(),
  step: z.enum(['what', 'where', 'when', 'try', 'mistake', 'remember']), // 属于 6 步里的哪一步
  scene: z.string().optional(), // 不写则沿用「数组里前一拍」的场景（按书写顺序静态推出，与用户走哪条分支无关）
  say: z.string(), // 旁白
  tone: z.enum(['neutral', 'right', 'wrong']).default('neutral'), // 旁白配色：灰 / 蓝 / 橙
  spotlight: simId.nullable().default(null), // 高亮哪个元素；null = 不高亮、不变暗
  await: z
    .union([z.literal('next'), z.object({ click: simId })])
    .default('next'), // next = 点「下一步」；click = 必须点高亮的元素
  choices: z
    .array(z.object({ label: z.string(), hint: z.string().optional(), goto: z.string() }))
    .optional(), // 有选项时忽略 await
  next: z.string().optional(), // 不写 = 数组里的下一拍
  // 已经走过指定的那一拍就跳过本拍：保证没选错的人也能看到「用错了会怎样」，选错过的人不重复看
  skipIfVisited: z.string().optional(),
});

const routes = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/routes' }),
  schema: z
    .object({
      title: z.string(),
      chapter: z.string(),
      guide: z.string(), // 对应图文的地址
      clientVersion: z.string().default('5.11.3'),
      illustrative: z.boolean().default(true), // true = 后果是示意，还没在真机上复现过
      start: z.string(),
      scenes: z.record(z.string(), scene),
      beats: z.array(beat).min(1),
    })
    .superRefine((r, ctx) => {
      // 校验所有跳转和场景引用都存在，6 步都有
      const ids = new Set(r.beats.map((b) => b.id));
      const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
      if (ids.size !== r.beats.length) issue('beat id 有重复');
      if (!ids.has(r.start)) issue(`start 指向不存在的 beat：${r.start}`);
      if (!r.beats[0]?.scene) issue('第一拍必须写 scene');
      for (const b of r.beats) {
        if (b.scene && !(b.scene in r.scenes)) issue(`${b.id} 引用了不存在的场景：${b.scene}`);
        if (b.next && !ids.has(b.next)) issue(`${b.id} 的 next 不存在：${b.next}`);
        if (b.skipIfVisited && !ids.has(b.skipIfVisited)) issue(`${b.id} 的 skipIfVisited 不存在：${b.skipIfVisited}`);
        for (const c of b.choices ?? []) {
          if (!ids.has(c.goto)) issue(`${b.id} 的选项「${c.label}」goto 不存在：${c.goto}`);
        }
      }
      for (const s of ['what', 'where', 'when', 'try', 'mistake', 'remember']) {
        if (!r.beats.some((b) => b.step === s)) issue(`缺少第 ${s} 步`);
      }
    }),
});

export const collections = { docs, routes, facts };
