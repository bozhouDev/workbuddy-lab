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
import { LESSON_CATALOG, type GuidedLessonDef, type LessonId } from '../guidedTypes';
import { loadLesson } from '../lessons/catalog';

// 用步骤数据驱动的课程，按课程目录逐节拼好（「认识界面」是单独写的 InterfaceLesson 组件，不在这里）
const LESSONS: GuidedLessonDef[] = await Promise.all(
  LESSON_CATALOG.filter((l) => l.id !== 'interface').map((l) => loadLesson(l.id as Exclude<LessonId, 'interface'>))
);

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

  it('图文里填的 simRoute 都在课程目录里（图文和陪练只对齐大章节，一节课可以对应几篇图文）', () => {
    const linked = listDocs(DOCS_DIR)
      .map((file) => ({ file, simRoute: readSimRoute(file) }))
      .filter((d) => d.simRoute);
    expect(linked.length).toBeGreaterThan(0);
    for (const { file, simRoute } of linked) {
      const meta = LESSON_CATALOG.find((l) => l.id === simRoute);
      expect(meta, `${relative(DOCS_DIR, file)} 的 simRoute「${simRoute}」不在课程目录里`).toBeDefined();
    }
  });

  it('每节课的「对应图文」指向存在的文章', () => {
    const urls = new Set(listDocs(DOCS_DIR).map(docUrl));
    for (const meta of LESSON_CATALOG) {
      expect(urls.has(meta.guideUrl), `${meta.id} 的 guideUrl ${meta.guideUrl} 没有对应文章`).toBe(true);
    }
  });
});

describe.each(LESSONS.map((l) => [l.id, l] as const))('课程：%s', (_id, lesson) => {
  it('步骤 ID 不重复', () => {
    const ids = lesson.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每个小段都把 4 段（是什么 / 动手 / 看结果 / 记住）走到', () => {
    const marks = lesson.parts ?? [{ title: lesson.title, startIdx: 0 }];
    marks.forEach((m, k) => {
      const end = marks[k + 1]?.startIdx ?? lesson.steps.length;
      const phases = new Set(lesson.steps.slice(m.startIdx, end).map((s) => s.phase));
      expect([...phases].sort(), `小段「${m.title}」`).toEqual([0, 1, 2, 3]);
    });
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

  it('带 revealMarksOnEnter 的步骤不能同时把视图切回 home（否则橙色标注还没看就被切走）', () => {
    const base = lesson.initialState();
    for (const step of lesson.steps) {
      if (!step.revealMarksOnEnter || !step.onEnter) continue;
      const patch = step.onEnter({ ...base, view: 'chat' });
      expect(patch.view, `步骤 ${step.id} 在标出问题的同时切走了视图`).not.toBe('home');
    }
  });

  it('初始状态能正常生成', () => {
    expect(() => lesson.initialState()).not.toThrow();
  });
});
