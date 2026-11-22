/**
 * 陪练课程的一致性检查
 *
 * 课程信息分散在三处：课程目录 LESSON_CATALOG、每节课的定义文件、图文 frontmatter 的 simRoute。
 * 任何一处改了另一处没跟上，用户会从图文点进别的课，或者课程走到一半卡住，这里统一兜住。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { LESSON_CATALOG, type GuidedLessonDef } from '../guidedTypes';
import { attachLesson } from '../lessons/attach';
import { executionLesson } from '../lessons/execution';
import { groupsLesson } from '../lessons/groups';
import { memoryLesson } from '../lessons/memory';
import { modeLesson } from '../lessons/mode';
import { modelsCreditsLesson } from '../lessons/modelsCredits';
import { permissionLesson } from '../lessons/permission';
import { personalizationLesson } from '../lessons/personalization';
import { reviewLesson } from '../lessons/review';
import { reviseLesson } from '../lessons/revise';
import { settingsLesson } from '../lessons/settings';
import { taskBriefLesson } from '../lessons/taskBrief';
import { chooseLesson } from '../lessons/choose';
import { expertsLesson } from '../lessons/experts';
import { skillsLesson } from '../lessons/skills';
import { makeSkillLesson } from '../lessons/makeSkill';
import { connectorsLesson } from '../lessons/connectors';
import { customConnectorLesson } from '../lessons/customConnector';
import { libraryLesson } from '../lessons/library';
import { scheduleLesson } from '../lessons/schedule';
import { assistantLesson } from '../lessons/assistant';

// 用步骤数据驱动的课程（「认识界面」是单独写的 InterfaceLesson 组件，不在这里）
const LESSONS: GuidedLessonDef[] = [
  settingsLesson,
  groupsLesson,
  memoryLesson,
  personalizationLesson,
  modelsCreditsLesson,
  attachLesson,
  modeLesson,
  permissionLesson,
  taskBriefLesson,
  executionLesson,
  reviewLesson,
  reviseLesson,
  chooseLesson,
  expertsLesson,
  skillsLesson,
  makeSkillLesson,
  connectorsLesson,
  customConnectorLesson,
  libraryLesson,
  scheduleLesson,
  assistantLesson,
];

const COACH_DIR = join(process.cwd(), 'src/simulator/coach');

/** 界面组件源码合在一起，用来确认课程等待的目标真的画在界面上 */
const UI_SOURCE = readdirSync(COACH_DIR)
  .filter((name) => name.endsWith('.tsx'))
  .map((name) => readFileSync(join(COACH_DIR, name), 'utf8'))
  .join('\n');

const DOCS_DIR = join(process.cwd(), 'src/content/docs');

/** 递归列出图文目录下的 .md / .mdx 文件 */
function listDocs(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return listDocs(p);
    return ['.md', '.mdx'].includes(extname(p)) ? [p] : [];
  });
}

/** 读出文章 frontmatter 里的 simRoute，没有则返回 undefined */
function readSimRoute(file: string): string | undefined {
  const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? (parse(m[1]) ?? {}).simRoute : undefined;
}

/** 文章文件路径 → 站点地址，例如 features/setup/groups.mdx → /features/setup/groups/ */
function docUrl(file: string): string {
  return `/${relative(DOCS_DIR, file).replace(/\.mdx?$/, '')}/`;
}

describe('课程目录', () => {
  it('课程 ID 不重复', () => {
    const ids = LESSON_CATALOG.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('除「认识界面」外，目录里每节课都有课程定义，且编号、标题、图文地址一致', () => {
    for (const meta of LESSON_CATALOG.filter((l) => l.id !== 'interface')) {
      const def = LESSONS.find((l) => l.id === meta.id);
      expect(def, `缺少课程定义：${meta.id}`).toBeDefined();
      expect({ code: def!.code, title: def!.title, guideUrl: def!.guideUrl }).toEqual({
        code: meta.code,
        title: meta.title,
        guideUrl: meta.guideUrl,
      });
    }
  });

  it('图文里填了 simRoute 的，课程的图文地址就是这篇文章', () => {
    const linked = listDocs(DOCS_DIR)
      .map((file) => ({ file, simRoute: readSimRoute(file) }))
      .filter((d) => d.simRoute);
    expect(linked.length).toBeGreaterThan(0);
    for (const { file, simRoute } of linked) {
      const meta = LESSON_CATALOG.find((l) => l.id === simRoute);
      expect(meta, `${relative(DOCS_DIR, file)} 的 simRoute「${simRoute}」不在课程目录里`).toBeDefined();
      expect(meta!.guideUrl).toBe(docUrl(file));
    }
  });
});

describe.each(LESSONS.map((l) => [l.id, l] as const))('课程：%s', (_id, lesson) => {
  it('步骤 ID 不重复', () => {
    const ids = lesson.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('4 段（是什么 / 动手 / 看结果 / 记住）都走到', () => {
    const phases = new Set(lesson.steps.map((s) => s.phase));
    expect([...phases].sort()).toEqual([0, 1, 2, 3]);
  });

  it('每一步都有推进方式，不会卡住', () => {
    for (const step of lesson.steps) {
      const canAdvance = Boolean(step.wait || step.buttons?.length || step.runChat);
      expect(canAdvance, `步骤 ${step.id} 没有 wait / buttons / runChat`).toBe(true);
    }
  });

  it('跳到下一节课的按钮指向课程目录里存在的课', () => {
    const ids = new Set(LESSON_CATALOG.map((l) => l.id));
    for (const step of lesson.steps) {
      for (const b of step.buttons ?? []) {
        if (b.nextLesson) expect(ids.has(b.nextLesson), `${step.id}「${b.label}」`).toBe(true);
      }
    }
  });

  it('等待的目标在界面源码里有对应控件（防止拼错卡住）', () => {
    for (const step of lesson.steps) {
      const t = step.wait?.target;
      if (!t) continue;
      const found = UI_SOURCE.includes(`'${t}'`) || UI_SOURCE.includes(`"${t}"`);
      expect(found, `步骤 ${step.id} 等待的「${t}」在界面里找不到`).toBe(true);
    }
  });

  it('初始状态能正常生成', () => {
    expect(() => lesson.initialState()).not.toThrow();
  });
});
