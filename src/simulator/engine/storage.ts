import type { EngineState } from './types';
import type { PersistedProgress } from './reducer';

const PREFIX = 'wbl:sim:v1:';

export function loadProgress(routeId: string): PersistedProgress | null {
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${routeId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedProgress;
    return {
      visited: Array.isArray(parsed.visited) ? parsed.visited : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return null;
  }
}

export function saveProgress(state: EngineState): void {
  try {
    const payload: PersistedProgress = {
      visited: Array.from(state.visited),
      history: state.history,
    };
    window.sessionStorage.setItem(`${PREFIX}${state.routeId}`, JSON.stringify(payload));
  } catch {
    // 无痕模式或存储受限时静默忽略
  }
}

export function syncUrl(routeId: string, beatId: string): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('route', routeId);
    url.searchParams.set('beat', beatId);
    window.history.replaceState(null, '', url.toString());
  } catch {
    // 忽略异常环境
  }
}

export function getExitTarget(): string {
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin && !ref.pathname.startsWith('/simulator')) {
        return ref.href;
      }
    }
  } catch {
    // 忽略非法 referrer
  }
  return '/';
}
