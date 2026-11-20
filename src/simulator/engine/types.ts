import type { SimId } from '../registry';

export type StepKey = 'what' | 'where' | 'when' | 'try' | 'mistake' | 'remember';

export const STEP_ORDER: readonly StepKey[] = [
  'what',
  'where',
  'when',
  'try',
  'mistake',
  'remember',
] as const;

export const STEP_LABELS: Record<StepKey, string> = {
  what: '是什么',
  where: '在哪里',
  when: '什么时候用',
  try: '试一下',
  mistake: '用错了会怎样',
  remember: '一句话记住',
};

export interface ArtifactLine {
  text: string;
  change?: 'same' | 'removed' | 'added';
}

export type MessageBlock =
  | { type: 'text'; text: string }
  | { type: 'file'; name: string; size?: string; status: 'written' | 'overwritten' | 'unchanged' }
  | { type: 'plan'; items: string[]; ask?: string }
  | { type: 'note'; text: string };

export interface SceneMessage {
  role: 'user' | 'assistant';
  blocks: MessageBlock[];
}

export interface SceneComposer {
  text?: string;
  mode?: 'default' | 'plan' | 'ask';
  permission?: 'default' | 'full';
  group?: string | null;
  model?: string;
}

export interface SceneArtifacts {
  file: string;
  docTitle?: string;
  badge?: string;
  lines: ArtifactLine[];
}

export interface SceneApproval {
  action: string;
  path: string;
  outsideWorkspace: boolean;
  question?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface SceneData {
  view: 'home' | 'chat' | 'settings' | 'extensions' | 'library' | 'schedule';
  overlay?:
    | 'plusMenu'
    | 'plusMenuFiles'
    | 'permissionMenu'
    | 'groupMenu'
    | 'modelMenu'
    | 'atMenu'
    | 'approvalDialog';
  chatTitle?: string;
  elapsed?: string;
  composer?: SceneComposer;
  messages?: SceneMessage[];
  artifacts?: SceneArtifacts;
  approval?: SceneApproval;
}

export interface BeatChoice {
  label: string;
  hint?: string;
  goto: string;
}

export interface BeatData {
  id: string;
  step: StepKey;
  scene?: string;
  say: string;
  tone?: 'neutral' | 'right' | 'wrong';
  spotlight?: SimId | null;
  await?: 'next' | { click: SimId };
  choices?: BeatChoice[];
  next?: string;
  skipIfVisited?: string;
}

export interface RouteData {
  id: string;
  title: string;
  chapter: string;
  guide: string;
  clientVersion: string;
  illustrative: boolean;
  start: string;
  scenes: Record<string, SceneData>;
  beats: BeatData[];
}

export interface RouteMeta {
  id: string;
  title: string;
  chapter: string;
  guide: string;
}

export interface EngineState {
  routeId: string;
  beatId: string;
  visited: Set<string>;
  history: string[];
}
