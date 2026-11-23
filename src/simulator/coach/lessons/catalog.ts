import { LESSON_CATALOG, type GuidedLessonDef, type GuidedStep, type LessonId } from '../guidedTypes';

/**
 * 陪练课程的组成：一节课由一到几段「小段」拼成
 * 每个小段是一个独立写好的课程脚本（lessons/*.ts），这里按顺序拼起来。
 * 图文和模拟器分开设计，只对齐大章节，所以一节课可以覆盖好几篇图文。
 */

/** 一个小段：标题 + 按需加载脚本（动态 import，保持按课拆包） */
interface PartLoader {
  title: string;
  load: () => Promise<GuidedLessonDef>;
}

/** 课程 ID → 组成它的小段（顺序即学习顺序） */
const COMPOSITION: Record<Exclude<LessonId, 'interface'>, PartLoader[]> = {
  setup: [
    { title: '系统设置', load: async () => (await import('./settings')).settingsLesson },
    { title: '模型与积分', load: async () => (await import('./modelsCredits')).modelsCreditsLesson },
  ],
  'know-you': [
    { title: '分组与文件夹', load: async () => (await import('./groups')).groupsLesson },
    { title: '记忆与进化', load: async () => (await import('./memory')).memoryLesson },
    { title: '个性化指令', load: async () => (await import('./personalization')).personalizationLesson },
  ],
  attach: [
    { title: '+ 和 @', load: async () => (await import('./attach')).attachLesson },
    { title: '资料库', load: async () => (await import('./library')).libraryLesson },
  ],
  send: [
    { title: '模式', load: async () => (await import('./mode')).modeLesson },
    { title: '权限与审批', load: async () => (await import('./permission')).permissionLesson },
    { title: '写清任务', load: async () => (await import('./taskBrief')).taskBriefLesson },
    { title: '看执行过程', load: async () => (await import('./execution')).executionLesson },
  ],
  review: [
    { title: '检查结果', load: async () => (await import('./review')).reviewLesson },
    { title: '二次修改', load: async () => (await import('./revise')).reviseLesson },
  ],
  skills: [
    { title: '挑、装、用', load: async () => (await import('./skills')).skillsLesson },
    { title: '做一个自己的技能', load: async () => (await import('./makeSkill')).makeSkillLesson },
  ],
  experts: [{ title: '专家', load: async () => (await import('./experts')).expertsLesson }],
  connectors: [
    { title: '接飞书', load: async () => (await import('./connectors')).connectorsLesson },
    { title: '自己做一个 MCP', load: async () => (await import('./customConnector')).customConnectorLesson },
  ],
  choose: [{ title: '判断练习', load: async () => (await import('./choose')).chooseLesson }],
  schedule: [{ title: '定时任务', load: async () => (await import('./schedule')).scheduleLesson }],
  assistant: [{ title: '助理', load: async () => (await import('./assistant')).assistantLesson }],
};

/** 课程目录里排在这节后面的那节（最后一节返回 null） */
function nextOf(id: LessonId) {
  const idx = LESSON_CATALOG.findIndex((l) => l.id === id);
  return idx >= 0 && idx + 1 < LESSON_CATALOG.length ? LESSON_CATALOG[idx + 1] : null;
}

/**
 * 把几个小段拼成一节课
 * - 第 2 段起，开头一步先把左边界面恢复成该段自己的初始状态（每段原本就是按独立开场写的）
 * - 每段最后一步的按钮统一重写：中间段是「接着学：下一段」，最后一段是「下一节」+「重来一遍」
 * - 步骤 ID 加上小段前缀，避免不同小段同名
 */
export function composeLesson(id: Exclude<LessonId, 'interface'>, parts: Array<{ title: string; def: GuidedLessonDef }>): GuidedLessonDef {
  const meta = LESSON_CATALOG.find((l) => l.id === id);
  if (!meta) throw new Error(`课程目录里没有 ${id}`);
  const next = nextOf(id);
  const multi = parts.length > 1;
  const steps: GuidedStep[] = [];
  const partMarks: Array<{ key: string; title: string; startIdx: number }> = [];

  parts.forEach((part, k) => {
    partMarks.push({ key: part.def.id, title: part.title, startIdx: steps.length });
    const last = part.def.steps.length - 1;
    part.def.steps.forEach((orig, i) => {
      const step: GuidedStep = { ...orig, id: multi ? `${part.def.id}:${orig.id}` : orig.id };

      // 第 2 段起：进入第一步时换成这一段的初始界面，再叠加原来的 onEnter
      if (k > 0 && i === 0) {
        const origEnter = orig.onEnter;
        step.onEnter = (s) => {
          const base = { ...part.def.initialState(), sidebarCollapsed: s.sidebarCollapsed };
          return { ...base, ...(origEnter ? origEnter({ ...s, ...base }) : {}) };
        };
      }

      // 小段结尾：重写按钮，并带上这一段自己的图文（图文和陪练粒度不同，一节课可能对应几篇）
      if (i === last) {
        const guide = { label: multi ? '读这一段的图文教程' : '读本节图文教程', href: part.def.guideUrl };
        if (k < parts.length - 1) {
          step.buttons = [{ label: `接着学：${parts[k + 1].title}`, primary: true }, guide];
        } else {
          step.buttons = [
            ...(next ? [{ label: `下一节：${next.code} ${next.title} →`, primary: true, nextLesson: next.id }] : []),
            guide,
            { label: '重来一遍', restart: true, primary: !next },
          ];
        }
      }
      steps.push(step);
    });
  });

  return {
    id,
    code: meta.code,
    title: meta.title,
    guideUrl: meta.guideUrl,
    // 课程初始界面 = 第一段的初始界面
    initialState: parts[0].def.initialState,
    steps,
    parts: multi ? partMarks : undefined,
  };
}

/** 按课程 ID 加载并拼好一节课 */
export async function loadLesson(id: Exclude<LessonId, 'interface'>): Promise<GuidedLessonDef> {
  const parts = await Promise.all(COMPOSITION[id].map(async (p) => ({ title: p.title, def: await p.load() })));
  return composeLesson(id, parts);
}
