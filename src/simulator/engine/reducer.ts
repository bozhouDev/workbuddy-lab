import {
  STEP_LABELS,
  STEP_ORDER,
  type BeatData,
  type EngineState,
  type RouteData,
  type SceneData,
  type StepKey,
} from './types';

function getBeatIndex(route: RouteData, beatId: string): number {
  return route.beats.findIndex((b) => b.id === beatId);
}

export function getCurrentBeat(route: RouteData, state: EngineState): BeatData {
  const beat = route.beats.find((b) => b.id === state.beatId);
  if (!beat) {
    throw new Error(`路线「${route.id}」中找不到拍：${state.beatId}`);
  }
  return beat;
}

/**
 * 按数组书写顺序静态反推当前拍对应的 scene ID（与用户走过的分支无关）
 */
export function resolveSceneId(route: RouteData, beatId: string): string {
  const idx = getBeatIndex(route, beatId);
  if (idx === -1) {
    throw new Error(`找不到拍：${beatId}`);
  }
  for (let i = idx; i >= 0; i -= 1) {
    const s = route.beats[i]?.scene;
    if (s) return s;
  }
  throw new Error(`拍「${beatId}」及之前均未声明 scene`);
}

export function resolveScene(route: RouteData, beatId: string): SceneData {
  const sceneId = resolveSceneId(route, beatId);
  const scene = route.scenes[sceneId];
  if (!scene) {
    throw new Error(`场景不存在：${sceneId}`);
  }
  return scene;
}

export function getStepIndex(step: StepKey): number {
  return STEP_ORDER.indexOf(step);
}

export function getStepLabel(step: StepKey): string {
  return STEP_LABELS[step];
}

export interface PersistedProgress {
  visited?: string[];
  history?: string[];
}

export function createInitialState(
  route: RouteData,
  initialBeatId?: string | null,
  persisted?: PersistedProgress | null
): EngineState {
  const validIds = new Set(route.beats.map((b) => b.id));
  const beatId = initialBeatId && validIds.has(initialBeatId) ? initialBeatId : route.start;
  const visited = new Set<string>(
    (persisted?.visited ?? []).filter((id) => validIds.has(id))
  );
  visited.add(beatId);
  const history = (persisted?.history ?? []).filter((id) => validIds.has(id));
  return {
    routeId: route.id,
    beatId,
    visited,
    history,
  };
}

/**
 * 解析下一拍（含连续跳过命中 skipIfVisited 的拍），带环路保护
 */
function resolveNextTarget(
  route: RouteData,
  fromBeatId: string,
  visited: Set<string>
): string | null {
  const seen = new Set<string>();
  let currentId: string | null = fromBeatId;

  while (currentId) {
    const idx = getBeatIndex(route, currentId);
    if (idx === -1) return null;
    const current = route.beats[idx];
    const candidateId = current.next ?? route.beats[idx + 1]?.id ?? null;
    if (!candidateId) return null;
    if (seen.has(candidateId)) return null;
    seen.add(candidateId);

    const candidate = route.beats.find((b) => b.id === candidateId);
    if (!candidate) return null;

    if (candidate.skipIfVisited && visited.has(candidate.skipIfVisited)) {
      currentId = candidate.id;
      continue;
    }
    return candidate.id;
  }
  return null;
}

export function advanceNext(route: RouteData, state: EngineState): EngineState {
  const nextId = resolveNextTarget(route, state.beatId, state.visited);
  if (!nextId) return state;

  const visited = new Set(state.visited);
  visited.add(nextId);

  return {
    routeId: state.routeId,
    beatId: nextId,
    visited,
    history: [...state.history, state.beatId],
  };
}

export function chooseOption(
  route: RouteData,
  state: EngineState,
  choiceIndex: number
): EngineState {
  const current = getCurrentBeat(route, state);
  const choice = current.choices?.[choiceIndex];
  if (!choice) return state;

  let targetId: string | null = choice.goto;
  const targetBeat = route.beats.find((b) => b.id === targetId);
  if (targetBeat?.skipIfVisited && state.visited.has(targetBeat.skipIfVisited)) {
    targetId = resolveNextTarget(route, targetBeat.id, state.visited);
  }
  if (!targetId) return state;

  const visited = new Set(state.visited);
  visited.add(targetId);

  return {
    routeId: state.routeId,
    beatId: targetId,
    visited,
    history: [...state.history, state.beatId],
  };
}

export function canGoBack(route: RouteData, state: EngineState): boolean {
  if (state.history.length > 0) return true;
  return getBeatIndex(route, state.beatId) > 0;
}

export function goBack(route: RouteData, state: EngineState): EngineState {
  if (state.history.length > 0) {
    const history = state.history.slice(0, -1);
    const prevId = state.history[state.history.length - 1];
    return {
      routeId: state.routeId,
      beatId: prevId,
      visited: new Set(state.visited),
      history,
    };
  }

  // 无 history（分享链接直达 / 无痕刷新）时按数组前一拍安全回退
  const idx = getBeatIndex(route, state.beatId);
  if (idx <= 0) return state;
  const prevId = route.beats[idx - 1].id;
  const visited = new Set(state.visited);
  visited.add(prevId);
  return {
    routeId: state.routeId,
    beatId: prevId,
    visited,
    history: [],
  };
}

export function canSkipStep(route: RouteData, state: EngineState): boolean {
  const current = getCurrentBeat(route, state);
  return current.step !== 'remember';
}

/**
 * 跳过：跳到下一个 step（按 6 步顺序）的第一拍
 */
export function skipStep(route: RouteData, state: EngineState): EngineState {
  const current = getCurrentBeat(route, state);
  const currentStepIdx = getStepIndex(current.step);
  if (currentStepIdx === -1 || currentStepIdx >= STEP_ORDER.length - 1) {
    return state;
  }

  for (let s = currentStepIdx + 1; s < STEP_ORDER.length; s += 1) {
    const targetStep = STEP_ORDER[s];
    const candidate = route.beats.find(
      (b) => b.step === targetStep && !(b.skipIfVisited && state.visited.has(b.skipIfVisited))
    );
    if (candidate) {
      const visited = new Set(state.visited);
      visited.add(candidate.id);
      return {
        routeId: state.routeId,
        beatId: candidate.id,
        visited,
        history: [...state.history, state.beatId],
      };
    }
  }
  return state;
}

export function restartRoute(route: RouteData): EngineState {
  return {
    routeId: route.id,
    beatId: route.start,
    visited: new Set([route.start]),
    history: [],
  };
}
