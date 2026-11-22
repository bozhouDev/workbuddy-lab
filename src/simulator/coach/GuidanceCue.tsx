interface CalloutProps {
  text: string;
  placement?: 'top' | 'bottom' | 'right' | 'left';
  align?: 'center' | 'start' | 'end';
}

/**
 * 贴在目标控件边缘轻幅弹动的迷你指引浮标（不压暗全屏，一眼锁定目标）
 * 支持 align='start' | 'end' 防止贴近容器左右边缘时被裁切
 */
export function GuidanceCallout({
  text,
  placement = 'top',
  align = 'center',
}: CalloutProps) {
  let posClass: string;
  let arrowClass: string;

  if (placement === 'top' || placement === 'bottom') {
    const verticalPos = placement === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5';
    const horizPos =
      align === 'start'
        ? 'left-0'
        : align === 'end'
          ? 'right-0'
          : 'left-1/2 -translate-x-1/2';
    posClass = `${verticalPos} ${horizPos}`;

    const verticalArrow =
      placement === 'top'
        ? 'top-full -mt-[4px] border-t-[#3355E0] border-x-transparent border-b-transparent'
        : 'bottom-full -mb-[4px] border-b-[#3355E0] border-x-transparent border-t-transparent';
    const horizArrow =
      align === 'start'
        ? 'left-4'
        : align === 'end'
          ? 'right-4'
          : 'left-1/2 -translate-x-1/2';
    arrowClass = `${verticalArrow} ${horizArrow} border-[5px]`;
  } else if (placement === 'right') {
    posClass = 'left-full top-1/2 -translate-y-1/2 ml-2.5';
    arrowClass =
      'right-full top-1/2 -translate-y-1/2 -mr-[4px] border-r-[#3355E0] border-y-transparent border-l-transparent border-[5px]';
  } else {
    posClass = 'right-full top-1/2 -translate-y-1/2 mr-2.5';
    arrowClass =
      'left-full top-1/2 -translate-y-1/2 -ml-[4px] border-l-[#3355E0] border-y-transparent border-r-transparent border-[5px]';
  }

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-30 whitespace-nowrap ${posClass}`}
    >
      <span className="sim-callout-bob relative inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-2.5 py-1 text-[11.5px] font-semibold text-white shadow-[0_8px_20px_rgba(51,85,224,0.38)]">
        <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
        {text}
        <span className={`absolute w-0 h-0 border-solid ${arrowClass}`} />
      </span>
    </span>
  );
}

/**
 * 尚未探索区域上的克制蓝色呼吸微点（提示“这里也能点”）
 */
export function ExploreDot() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none relative inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center"
    >
      <span className="sim-dot-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-600" />
    </span>
  );
}
