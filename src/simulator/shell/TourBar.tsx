import { STEP_LABELS, STEP_ORDER, type RouteMeta, type StepKey } from '../engine/types';
import { LogoMark } from './icons';

interface TourBarProps {
  routeTitle: string;
  routeId: string;
  routesIndex: RouteMeta[];
  currentStep: StepKey;
  onSelectRoute: (routeId: string) => void;
  onExit: () => void;
}

export function TourBar({
  routeTitle,
  routeId,
  routesIndex,
  currentStep,
  onSelectRoute,
  onExit,
}: TourBarProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-4 px-5 border-b border-gray-200 bg-gray-50 relative z-40">
      {/* 左侧：Logo + 路线选择 */}
      <div className="flex items-center gap-3.5 min-w-0">
        <a href="/" className="inline-flex items-center gap-2 text-gray-900 no-underline shrink-0">
          <LogoMark size={24} />
          <span className="text-[14px] font-bold tracking-[-0.01em]">
            WorkBuddy <span className="text-gray-500 font-medium">Lab</span>
          </span>
        </a>

        <span className="w-px h-[18px] bg-[#e2e2de] shrink-0" aria-hidden="true" />

        <div className="flex items-center gap-1.5 text-[13.5px] text-gray-600 min-w-0">
          <span className="shrink-0">路线：</span>
          {routesIndex.length > 1 ? (
            <select
              aria-label="切换导览路线"
              value={routeId}
              onChange={(e) => onSelectRoute(e.target.value)}
              className="bg-white border border-[#e2e2de] rounded-lg px-2.5 py-1 text-[13px] font-semibold text-gray-900 cursor-pointer max-w-[240px] truncate"
            >
              {routesIndex.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          ) : (
            <strong className="text-gray-900 font-semibold truncate">{routeTitle}</strong>
          )}
        </div>
      </div>

      {/* 中间：6 步胶囊进度条 */}
      <ol className="flex items-center gap-1 m-0 p-0 list-none shrink-0" aria-label="6 步导览进度">
        {STEP_ORDER.map((key, idx) => {
          const isCurrent = idx === currentIdx;
          const isPassed = idx < currentIdx;
          return (
            <li
              key={key}
              aria-current={isCurrent ? 'step' : undefined}
              className={[
                'text-[12.5px] px-2.5 py-1 rounded-full transition-colors',
                isCurrent
                  ? 'bg-gray-900 text-white font-semibold'
                  : isPassed
                    ? 'text-gray-900 font-medium'
                    : 'text-[#8a8f99]',
              ].join(' ')}
            >
              {STEP_LABELS[key]}
            </li>
          );
        })}
      </ol>

      {/* 右侧：教学声明 + 退出 */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[12px] text-gray-500 border border-[#e2e2de] bg-white rounded-full px-2.5 py-1">
          教学模拟器 · 非官方客户端
        </span>
        <button
          type="button"
          onClick={onExit}
          className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-[13px] text-gray-800 hover:bg-gray-100 cursor-pointer"
        >
          退出导览
        </button>
      </div>
    </header>
  );
}
