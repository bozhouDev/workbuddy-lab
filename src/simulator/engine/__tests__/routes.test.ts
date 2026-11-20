import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  advanceNext,
  canGoBack,
  chooseOption,
  createInitialState,
  getCurrentBeat,
  goBack,
  resolveScene,
  skipStep,
} from '../reducer';
import type { EngineState, RouteData } from '../types';

const ROUTES_DIR = join(process.cwd(), 'src/content/routes');

function loadAllRoutes(): RouteData[] {
  return readdirSync(ROUTES_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((file) => {
      const raw = parse(readFileSync(join(ROUTES_DIR, file), 'utf8')) as Omit<RouteData, 'id'>;
      return { id: basename(file, '.yaml'), ...raw };
    });
}

interface FinishedPath {
  beats: string[];
  sawMistake: boolean;
  sawRight: boolean;
}

/**
 * 穷举一条路线的所有选项组合，断言无死循环且每条完整路径都满足教学约束
 */
function exploreAllPaths(route: RouteData): FinishedPath[] {
  const results: FinishedPath[] = [];
  const MAX_STEPS = 40;

  function dfs(state: EngineState, trail: string[], sawMistake: boolean, sawRight: boolean) {
    if (trail.length > MAX_STEPS) {
      throw new Error(`路线「${route.id}」疑似死循环：${trail.join(' -> ')}`);
    }

    const beat = getCurrentBeat(route, state);
    // 每拍必须能正确解析出一个有效场景
    const scene = resolveScene(route, beat.id);
    expect(scene).toBeDefined();

    const nextSawMistake = sawMistake || beat.step === 'mistake';
    const nextSawRight = sawRight || beat.tone === 'right';

    if (beat.step === 'remember') {
      results.push({
        beats: trail,
        sawMistake: nextSawMistake,
        sawRight: nextSawRight,
      });
      return;
    }

    if (beat.choices && beat.choices.length > 0) {
      beat.choices.forEach((_, idx) => {
        const nextState = chooseOption(route, state, idx);
        expect(nextState.beatId).not.toBe(state.beatId);
        dfs(nextState, [...trail, nextState.beatId], nextSawMistake, nextSawRight);
      });
      return;
    }

    const nextState = advanceNext(route, state);
    expect(nextState.beatId).not.toBe(state.beatId);
    dfs(nextState, [...trail, nextState.beatId], nextSawMistake, nextSawRight);
  }

  const init = createInitialState(route);
  dfs(init, [init.beatId], false, false);
  return results;
}

describe('导览引擎与全部路线全分支校验', () => {
  const routes = loadAllRoutes();

  it('至少存在 mode 路线', () => {
    expect(routes.some((r) => r.id === 'mode')).toBe(true);
  });

  for (const route of routes) {
    describe(`路线：${route.id}（${route.title}）`, () => {
      it('任意选项组合均能走到 remember，且必经 mistake 与 tone=right，无死循环', () => {
        const paths = exploreAllPaths(route);
        expect(paths.length).toBeGreaterThan(0);

        for (const p of paths) {
          expect(p.sawMistake, `路径 ${p.beats.join(' -> ')} 漏看了 mistake`).toBe(true);
          expect(p.sawRight, `路径 ${p.beats.join(' -> ')} 漏看了正确做法 (tone: right)`).toBe(true);
        }
      });

      it('上一步与跳过边界行为正常', () => {
        let state = createInitialState(route);
        expect(canGoBack(route, state)).toBe(false);

        const next = advanceNext(route, state);
        expect(canGoBack(route, next)).toBe(true);
        expect(goBack(route, next).beatId).toBe(state.beatId);

        // 模拟直达分享链接（无 history）时，上一步应回退到数组前一拍
        const directState = createInitialState(route, route.beats[1].id, null);
        expect(canGoBack(route, directState)).toBe(true);
        expect(goBack(route, directState).beatId).toBe(route.beats[0].id);

        // 连续跳过最终能到达 remember
        let cur = createInitialState(route);
        for (let i = 0; i < 10; i += 1) {
          if (getCurrentBeat(route, cur).step === 'remember') break;
          cur = skipStep(route, cur);
        }
        expect(getCurrentBeat(route, cur).step).toBe('remember');
      });
    });
  }
});
