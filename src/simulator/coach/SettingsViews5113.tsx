import { useEffect, useRef, useState } from 'react';
import { GuidanceCallout } from './GuidanceCue';
import type { GuidedShellState, GuidedTargetId, SettingsTab } from './guidedTypes';

interface SettingsViewsProps {
  shell: GuidedShellState;
  waitTarget: GuidedTargetId | null;
  waitCallout: string | null;
  urgent: boolean;
  onTargetClick: (target: GuidedTargetId) => void;
  onAsideClick: (label: string, explain: string) => void;
}

function Toggle({ on, accent = 'green' }: { on: boolean; accent?: 'green' | 'blue' }) {
  const onBg = accent === 'green' ? 'bg-[#00b578]' : 'bg-accent-600';
  return (
    <span
      className={`w-[38px] h-[22px] rounded-full relative inline-block shrink-0 transition-colors duration-200 ${
        on ? onBg : 'bg-[#dcdcd8]'
      }`}
    >
      <span
        className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.16)] transition-all duration-200 ${
          on ? 'left-[18px]' : 'left-[2px]'
        }`}
      />
    </span>
  );
}

/** 极简 15px 线性图标，还原 5.11.3 设置左侧导航 */
function NavIcon({ kind }: { kind: string }) {
  const p = {
    width: 15,
    height: 15,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.35,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    className: 'shrink-0 text-[#4a4f57]',
  };
  switch (kind) {
    case 'general':
      return (
        <svg {...p}>
          <path d="M8 2.2 12.8 5v6L8 13.8 3.2 11V5L8 2.2Z" />
          <circle cx="8" cy="8" r="1.9" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...p}>
          <circle cx="8" cy="5.5" r="2.3" />
          <path d="M3.5 13c.7-2.2 2.4-3.2 4.5-3.2s3.8 1 4.5 3.2" />
        </svg>
      );
    case 'credits':
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 2.5V8h5.5" />
        </svg>
      );
    case 'appearance':
      return (
        <svg {...p}>
          <path d="M8 2.5a5.5 5.5 0 1 0 3.3 9.9c.7-.5.4-1.5-.4-1.6h-.7a1.5 1.5 0 0 1-1.5-1.5c0-.8.7-1.4 1.5-1.4h1.3A2 2 0 0 0 13.5 6 4.5 4.5 0 0 0 8 2.5Z" />
          <circle cx="5.7" cy="6.6" r=".6" fill="currentColor" stroke="none" />
          <circle cx="8.2" cy="5.2" r=".6" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'shortcuts':
      return (
        <svg {...p}>
          <rect x="2" y="4" width="12" height="8" rx="1.6" />
          <path d="M5 7h.01M8 7h.01M11 7h.01M5.5 9.8h5" />
        </svg>
      );
    case 'personalization':
      return (
        <svg {...p}>
          <circle cx="6.8" cy="5.5" r="2.1" />
          <path d="M2.8 12.8c.6-2 2.1-2.9 4-2.9 1 0 2 .3 2.7.9" />
          <path d="M12.2 8.2v2.4M11 9.4h2.4" />
        </svg>
      );
    case 'memory':
      return (
        <svg {...p}>
          <path d="M8 3.2a3.3 3.3 0 0 0-2 5.9c.4.3.7.8.7 1.3h2.6c0-.5.3-1 .7-1.3a3.3 3.3 0 0 0-2-5.9Z" />
          <path d="M6.8 12.4h2.4" />
        </svg>
      );
    case 'agent':
      return (
        <svg {...p}>
          <rect x="3" y="4.8" width="10" height="7.5" rx="2.5" />
          <path d="M6 8.3h.01M10 8.3h.01M5 4.8 4 2.8M11 4.8l1-2" />
        </svg>
      );
    case 'model':
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="5.3" />
          <path d="M8 8V3M8 8l4.2 2.6M8 8l-4.2 2.6" />
        </svg>
      );
    case 'assistant':
      return (
        <svg {...p}>
          <circle cx="8" cy="8.5" r="4.8" />
          <path d="M6.2 8.2h.01M9.8 8.2h.01M6.6 10.4c.8.5 2 .5 2.8 0M6.2 3.8 5.2 2.4M9.8 3.8l1-1.4" />
        </svg>
      );
    case 'devices':
      return (
        <svg {...p}>
          <rect x="2" y="3.5" width="8.5" height="6.2" rx="1.2" />
          <rect x="9.5" y="7" width="4.5" height="6.2" rx="1" />
        </svg>
      );
    case 'flow':
      return (
        <svg {...p}>
          <path d="M4 4.5h8M4 8h8M4 11.5h5.5" />
        </svg>
      );
    case 'import':
      return (
        <svg {...p}>
          <path d="M8.5 3.5H12a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 12.5H8.5M3 8h6.5M7 5.5 9.5 8 7 10.5" />
        </svg>
      );
    case 'data':
      return (
        <svg {...p}>
          <ellipse cx="8" cy="4.3" rx="4.5" ry="1.7" />
          <path d="M3.5 4.3v7.4c0 .9 2 1.7 4.5 1.7s4.5-.8 4.5-1.7V4.3M3.5 8c0 .9 2 1.7 4.5 1.7s4.5-.8 4.5-1.7" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="5" />
        </svg>
      );
  }
}

type DropdownKey = null | 'lang' | 'linkOpen' | 'lockScreen' | 'proxy' | 'sound';

interface InlineSelectProps {
  value: string;
  options: readonly string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (val: string) => void;
}

/** 还原截图 3 样式的真实下拉选择框（白底圆角 + 绿色对勾） */
function InlineSelect({ value, options, open, onToggle, onSelect }: InlineSelectProps) {
  return (
    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={onToggle}
        className={`h-8 min-w-[110px] px-3 rounded-[9px] border bg-white text-[12.5px] text-[#111318] inline-flex items-center justify-between gap-2 cursor-pointer transition-colors ${
          open ? 'border-[#a6aab2] shadow-2xs' : 'border-[#e2e2de] hover:bg-[#f7f7f6]'
        }`}
      >
        <span>{value}</span>
        <span className={`text-[10px] text-[#6b7079] transition-transform ${open ? 'rotate-180' : ''}`}>
          ∨
        </span>
      </button>

      {open && (
        <div className="sim-pop-up absolute right-0 top-[36px] z-30 min-w-[138px] rounded-[12px] bg-white border border-[#e6e6e3] shadow-[0_14px_34px_rgba(17,19,24,0.14)] p-1.5 flex flex-col gap-0.5 text-[12.5px]">
          {options.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(opt)}
                className={`w-full border-0 rounded-[8px] px-2.5 py-1.5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors ${
                  active ? 'bg-[#f4f4f5] font-medium text-[#111318]' : 'bg-transparent text-[#2b2f36] hover:bg-[#f7f7f6]'
                }`}
              >
                <span>{opt}</span>
                {active && <span className="text-[#00b578] font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 100% 还原 WorkBuddy 5.11.3 设置窗口：
 * - 「通用」完整还原 5 大区块（常规 / 权限 / 存储 / 通知 / 隐私）共 18 项真实控件，每项可点击体验并由泊舟大白话解释
 * - 「记忆与进化」「个性化」同步保持高还原与实时交互
 */
export function SettingsViews5113({
  shell,
  waitTarget,
  waitCallout,
  urgent,
  onTargetClick,
  onAsideClick,
}: SettingsViewsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 通用页可自由点着玩的本地体验状态（不影响课程推进，只让用户点得动、看得懂）
  const [openDrop, setOpenDrop] = useState<DropdownKey>(null);
  const [lang, setLang] = useState('简体中文');
  const [fontLevel, setFontLevel] = useState(2); // 1..6，2 = 默认
  const [linkOpen, setLinkOpen] = useState('智能打开');
  const [lockMode, setLockMode] = useState(shell.lockScreenMode || '关闭');
  const [preventSleep, setPreventSleep] = useState(true);
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [proxyMode, setProxyMode] = useState('直接连接');
  const [autoTrustedSkill, setAutoTrustedSkill] = useState(false);
  const [autoUpdateSkill, setAutoUpdateSkill] = useState(shell.autoUpdateSkill);
  const [autoUpdatePack, setAutoUpdatePack] = useState(true);
  const [recommendExpert, setRecommendExpert] = useState(true);
  const [notifySound, setNotifySound] = useState('无音效');
  const [scheduleNotify, setScheduleNotify] = useState(true);
  const [privacyPlan, setPrivacyPlan] = useState(true);

  // 当引导步骤切换到下方控件（如存储路径「更改」或「桌面通知」）时，自动平滑滚入视野中央
  useEffect(() => {
    if (!waitTarget || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLElement>(`[data-guided-target="${waitTarget}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [waitTarget, shell.settingsTab]);

  const ring = (id: GuidedTargetId) =>
    waitTarget === id ? (urgent ? 'sim-ring-urgent' : 'sim-ring') : '';

  const clickOrAside = (id: GuidedTargetId, label: string, explain: string) => {
    setOpenDrop(null);
    if (waitTarget === id) {
      onTargetClick(id);
    } else {
      onAsideClick(label, explain);
    }
  };

  const navTop: Array<{ label: string; icon: string; tab?: SettingsTab; target?: GuidedTargetId; explain: string }> = [
    {
      label: '通用',
      icon: 'general',
      tab: 'general',
      target: 'settings.tab.general',
      explain: '「通用」管语言字体、防休眠、存储路径、桌面通知和隐私，装好软件第一天先来这里调顺。',
    },
    {
      label: '个人主页',
      icon: 'profile',
      explain: '「个人主页」看你的账号昵称和登录方式，日常基本不用改。',
    },
    {
      label: '套餐与积分',
      icon: 'credits',
      explain: '「套餐与积分」能查每一笔任务扣了多少积分、积分什么时候到期，1.5 节会重点讲。',
    },
    {
      label: '外观',
      icon: 'appearance',
      explain: '「外观」用来切换浅色 / 深色主题，按自己眼睛舒服选就行。',
    },
    {
      label: '快捷键',
      icon: 'shortcuts',
      explain: '「快捷键」查看或自定义唤起窗口、新建任务等键盘快捷键，熟练后再折腾。',
    },
  ];

  const navFeat: Array<{ label: string; icon: string; tab?: SettingsTab; target?: GuidedTargetId; explain: string }> = [
    {
      label: '个性化',
      icon: 'personalization',
      tab: 'personalization',
      target: 'settings.tab.personalization',
      explain: '「个性化」里放着「给 WorkBuddy 的指令」「人设设定」和「长期记忆」，1.4 节专门带你配。',
    },
    {
      label: '记忆与进化',
      icon: 'memory',
      tab: 'memory',
      target: 'settings.tab.memory',
      explain: '「记忆与进化」管云端记忆和本地记忆开关，记歪了也来这里删，1.3 节专门演示。',
    },
    {
      label: '智能体',
      icon: 'agent',
      explain: '「智能体」管理后台运行的 Agent 高级配置，新手保持默认即可。',
    },
    {
      label: '模型',
      icon: 'model',
      explain: '「模型」管理可用模型列表，或者接入你自己其他平台的 API Key（新手不用折腾）。',
    },
    {
      label: '助理',
      icon: 'assistant',
      explain: '「助理」用来绑定微信 / 飞书 / 企微等远程通道，出门用手机遥控电脑干活（第 4 章细讲）。',
    },
    {
      label: '设备连接',
      icon: 'devices',
      explain: '「设备连接」用来扫码绑定手机端，随时查看任务进度。',
    },
    {
      label: '对话流',
      icon: 'flow',
      explain: '「对话流」控制消息展示和流式输出细节，保持默认就很顺手。',
    },
  ];

  const navData: Array<{ label: string; icon: string; explain: string }> = [
    {
      label: '数据导入',
      icon: 'import',
      explain: '「数据导入」可以把你在其他 AI 工具里积累的历史记录或记忆一键迁过来。',
    },
    {
      label: '数据管理',
      icon: 'data',
      explain: '「数据管理」用来批量导出或清理旧对话记录和本地缓存。',
    },
  ];

  return (
    <div
      className="flex-1 min-w-0 h-full flex bg-[#f7f7f7] select-none overflow-hidden"
      onClick={() => setOpenDrop(null)}
    >
      {/* 左侧设置导航（100% 对照 5.11.3 截图图标与 3 分组） */}
      <aside className="w-[206px] shrink-0 bg-[#f7f7f7] border-r border-[#ebebeb] p-3 flex flex-col gap-0.5 text-[13px] overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <button
            type="button"
            data-guided-target="settings.back"
            onClick={(e) => {
              e.stopPropagation();
              clickOrAside('settings.back', '返回主界面', '点这里会退回 WorkBuddy 对话首页。');
            }}
            className={`relative border-0 bg-white hover:bg-[#eeeeeb] rounded-lg px-2.5 py-1 text-[12px] font-medium text-[#111318] shadow-2xs cursor-pointer ${ring(
              'settings.back'
            )}`}
          >
            ← 返回
            {waitTarget === 'settings.back' && waitCallout && (
              <GuidanceCallout text={waitCallout} placement="right" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAsideClick('搜索设置项', '真机里忘了某个开关藏在哪一页，直接在这搜关键词（比如搜“存储”或“通知”）能秒定位。');
          }}
          className="w-full border-0 text-left px-2.5 py-1.5 rounded-lg bg-[#ededeb] hover:bg-[#e5e5e2] text-[#8c9099] text-[12px] mb-2 cursor-pointer"
        >
          ⌕ 搜索设置项
        </button>

        <div className="px-2 pt-1 pb-1 text-[11px] text-[#8c9099]">设置</div>
        {navTop.map((n) => {
          const active = n.tab === shell.settingsTab;
          return (
            <button
              key={n.label}
              type="button"
              data-guided-target={n.target}
              onClick={(e) => {
                e.stopPropagation();
                if (n.target) {
                  clickOrAside(n.target, n.label, n.explain);
                } else {
                  onAsideClick(n.label, n.explain);
                }
              }}
              className={`relative w-full border-0 text-left px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${
                active
                  ? 'bg-[#e8e8e6] text-[#111318] font-medium'
                  : 'bg-transparent text-[#2b2f36] hover:bg-[#eeeeeb]'
              } ${n.target ? ring(n.target) : ''}`}
            >
              <NavIcon kind={n.icon} />
              <span className="truncate">{n.label}</span>
              {n.target && waitTarget === n.target && waitCallout && (
                <GuidanceCallout text={waitCallout} placement="right" />
              )}
            </button>
          );
        })}

        <div className="px-2 pt-3 pb-1 text-[11px] text-[#8c9099]">功能</div>
        {navFeat.map((n) => {
          const active = n.tab === shell.settingsTab;
          return (
            <button
              key={n.label}
              type="button"
              data-guided-target={n.target}
              onClick={(e) => {
                e.stopPropagation();
                if (n.target) {
                  clickOrAside(n.target, n.label, n.explain);
                } else {
                  onAsideClick(n.label, n.explain);
                }
              }}
              className={`relative w-full border-0 text-left px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${
                active
                  ? 'bg-[#e8e8e6] text-[#111318] font-medium'
                  : 'bg-transparent text-[#2b2f36] hover:bg-[#eeeeeb]'
              } ${n.target ? ring(n.target) : ''}`}
            >
              <NavIcon kind={n.icon} />
              <span className="truncate">{n.label}</span>
              {n.target && waitTarget === n.target && waitCallout && (
                <GuidanceCallout text={waitCallout} placement="right" />
              )}
            </button>
          );
        })}

        <div className="px-2 pt-3 pb-1 text-[11px] text-[#8c9099]">数据与安全</div>
        {navData.map((n) => (
          <button
            key={n.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAsideClick(n.label, n.explain);
            }}
            className="w-full border-0 text-left px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-[#eeeeeb] text-[#2b2f36] cursor-pointer flex items-center gap-2"
          >
            <NavIcon kind={n.icon} />
            <span className="truncate">{n.label}</span>
          </button>
        ))}
      </aside>

      {/* 右侧设置内容主区 */}
      <div
        ref={scrollRef}
        className="flex-1 min-w-0 overflow-y-auto p-5 xl:p-6 flex flex-col gap-3.5"
      >
        {/* ===== Tab 1：通用设置（完整还原 5 大区块：常规 / 权限 / 存储 / 通知 / 隐私） ===== */}
        {shell.settingsTab === 'general' && (
          <>
            {/* 区块 1：常规 */}
            <div className="text-[12px] text-[#8c9099] px-1">常规</div>
            <div className="rounded-[14px] bg-white border border-[#ececea] px-4 py-3.5 flex flex-col gap-4">
              {/* 语言 */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-[13.5px] font-semibold text-[#111318]">语言</div>
                <InlineSelect
                  value={lang}
                  options={['简体中文', 'English']}
                  open={openDrop === 'lang'}
                  onToggle={() => {
                    setOpenDrop((d) => (d === 'lang' ? null : 'lang'));
                    onAsideClick('语言', '切换 WorkBuddy 的界面显示语言，咱们保持「简体中文」就行。');
                  }}
                  onSelect={(v) => {
                    setLang(v);
                    setOpenDrop(null);
                    onAsideClick('语言', `已演示切到「${v}」——平时保持简体中文最顺眼。`);
                  }}
                />
              </div>

              {/* 字体大小（6 档真实可点滑块） */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">字体大小</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    第 5、6 档仅适用于对话区域。
                  </div>
                </div>
                <div className="w-[210px] shrink-0 flex flex-col gap-1">
                  <div className="relative h-5 flex items-center justify-between">
                    <div className="absolute left-0 right-0 h-[1.5px] bg-[#d4d4d0]" />
                    {[1, 2, 3, 4, 5, 6].map((lv) => {
                      const active = fontLevel === lv;
                      return (
                        <button
                          key={lv}
                          type="button"
                          aria-label={`字体第 ${lv} 档`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFontLevel(lv);
                            onAsideClick(
                              '字体大小',
                              `已切到第 ${lv} 档${lv === 2 ? '（默认）' : ''}。觉得屏幕字偏小往右拉一两档就行，第 5、6 档只会放大聊天文字，不会把侧栏撑乱。`
                            );
                          }}
                          className="relative z-10 w-5 h-5 border-0 bg-transparent flex items-center justify-center cursor-pointer p-0"
                        >
                          {active ? (
                            <span className="w-2.5 h-4 rounded-full bg-white border border-[#c8c8c4] shadow-xs block" />
                          ) : (
                            <span className="w-[1.5px] h-2 bg-[#c8c8c4] block" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8c9099] px-0.5">
                    <span>小</span>
                    <span className="-ml-10">默认</span>
                    <span>大</span>
                  </div>
                </div>
              </div>

              {/* 链接打开方式 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">链接打开方式</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    设置 WorkBuddy 对话中链接的默认打开策略。
                  </div>
                </div>
                <InlineSelect
                  value={linkOpen}
                  options={['智能打开', '系统默认浏览器', '应用内打开']}
                  open={openDrop === 'linkOpen'}
                  onToggle={() => {
                    setOpenDrop((d) => (d === 'linkOpen' ? null : 'linkOpen'));
                    onAsideClick(
                      '链接打开方式',
                      '决定你点对话里的网页链接时，是在软件里开还是用系统浏览器开。保持「智能打开」最省心。'
                    );
                  }}
                  onSelect={(v) => {
                    setLinkOpen(v);
                    setOpenDrop(null);
                    onAsideClick('链接打开方式', `已切换为「${v}」——日常推荐保持「智能打开」。`);
                  }}
                />
              </div>

              {/* 文件打开方式 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">文件打开方式</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    设置 WorkBuddy 文件浏览器为本地文件的默认打开方式。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAsideClick(
                      '文件打开方式',
                      '问你要不要让 WorkBuddy 接管双击电脑文件。新手不用设，保持「未设置」，避免平时双击文档总弹出它。'
                    );
                  }}
                  className="border-0 bg-transparent hover:bg-[#f4f4f2] rounded-lg px-2 py-1 text-[12.5px] text-[#6b7079] cursor-pointer shrink-0"
                >
                  未设置 ›
                </button>
              </div>
            </div>

            {/* 区块 2：权限（完整还原 8 项，含「网络代理」3 选 1 真下拉） */}
            <div className="text-[12px] text-[#8c9099] px-1 pt-0.5">权限</div>
            <div className="rounded-[14px] bg-white border border-[#ececea] px-4 py-3.5 flex flex-col gap-4">
              {/* 允许锁屏运行 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">允许锁屏运行</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    选择锁屏后的运行方式，保障远程控制与后台 Agent 任务持续执行。
                  </div>
                </div>
                <InlineSelect
                  value={lockMode}
                  options={['关闭', '合盖除外', '始终保持运行']}
                  open={openDrop === 'lockScreen'}
                  onToggle={() => {
                    setOpenDrop((d) => (d === 'lockScreen' ? null : 'lockScreen'));
                    onAsideClick(
                      '允许锁屏运行',
                      '打算出门用手机微信遥控家里电脑干活时才需要打开（一般选「合盖除外」）；平时只在电脑前用就保持「关闭」。'
                    );
                  }}
                  onSelect={(v) => {
                    setLockMode(v);
                    setOpenDrop(null);
                    onAsideClick(
                      '允许锁屏运行',
                      v === '关闭'
                        ? '平时只在电脑前用，保持「关闭」最省电安全。'
                        : `选了「${v}」后，电脑锁屏了后台也能继续接你手机发来的遥控任务。`
                    );
                  }}
                />
              </div>

              {/* 运行时防止系统休眠 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">运行时防止系统休眠</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    在 WorkBuddy 运行任务时，让电脑保持唤醒状态。
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="运行时防止系统休眠"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !preventSleep;
                    setPreventSleep(next);
                    onAsideClick(
                      '运行时防止系统休眠',
                      '跑复杂任务动辄一两分钟，开着它电脑才不会干到一半自己睡着断任务。建议<b>一直保持开启</b>。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
                >
                  <Toggle on={preventSleep} />
                </button>
              </div>

              {/* 开机自动启动 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">开机自动启动</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    开启后 WorkBuddy 会在你登录电脑后自动启动。
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="开机自动启动"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !autoLaunch;
                    setAutoLaunch(next);
                    onAsideClick(
                      '开机自动启动',
                      '如果你后面设了定时早报、或者天天重度用，可以打开它；刚上手先关着，免得拖慢开机速度。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
                >
                  <Toggle on={autoLaunch} />
                </button>
              </div>

              {/* 网络代理（完全还原截图 3 下拉：直接连接 ✓ / 跟随系统 / 手动配置） */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">网络代理</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    网络异常时可切换连接方式，修改后立即生效
                  </div>
                </div>
                <InlineSelect
                  value={proxyMode}
                  options={['直接连接', '跟随系统', '手动配置']}
                  open={openDrop === 'proxy'}
                  onToggle={() => {
                    setOpenDrop((d) => (d === 'proxy' ? null : 'proxy'));
                    onAsideClick(
                      '网络代理',
                      '平时保持「直接连接」就行；如果公司内网或者开了代理导致连不上网，切到「跟随系统」立刻就能通。'
                    );
                  }}
                  onSelect={(v) => {
                    setProxyMode(v);
                    setOpenDrop(null);
                    onAsideClick(
                      '网络代理',
                      v === '跟随系统'
                        ? '切到「跟随系统」后会自动复用电脑的代理设置，连不上网时优先试这招。'
                        : v === '手动配置'
                          ? '「手动配置」留给需要填公司内网代理地址和端口的情况，普通用户用不到。'
                          : '日常网络正常时保持「直接连接」最快最稳。'
                    );
                  }}
                />
              </div>

              {/* 自动安装可信技能 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">自动安装可信技能</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    安全检测通过后自动安装，高风险项始终要求手动确认。
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="自动安装可信技能"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !autoTrustedSkill;
                    setAutoTrustedSkill(next);
                    onAsideClick(
                      '自动安装可信技能',
                      '开着它，WorkBuddy 发现顺手的安全技能会直接帮你装好；新手建议先关着，装了什么自己心里有数。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
                >
                  <Toggle on={autoTrustedSkill} />
                </button>
              </div>

              {/* 技能自动更新 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">技能自动更新</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    开启后将自动更新已安装的技能为最新版本，不会更新你在 WorkBuddy 中编辑过的技能
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="技能自动更新"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !autoUpdateSkill;
                    setAutoUpdateSkill(next);
                    onAsideClick(
                      '技能自动更新',
                      '建议<b>保持打开</b>。后面装的 Skill 会持续修 bug，自动更新最省心，而且不会覆盖你自己改过的版本。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
                >
                  <Toggle on={autoUpdateSkill} />
                </button>
              </div>

              {/* 套件自动更新 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">套件自动更新</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    开启后将自动更新已安装的套件为最新版本。
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="套件自动更新"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !autoUpdatePack;
                    setAutoUpdatePack(next);
                    onAsideClick(
                      '套件自动更新',
                      '和技能自动更新类似，管成套工具包的自动升级，保持开启不用管就行。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
                >
                  <Toggle on={autoUpdatePack} />
                </button>
              </div>

              {/* 专家与技能推荐 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">专家与技能推荐</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    每次启动新任务时，为你推荐适合完成任务的专家与技能。
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="专家与技能推荐"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !recommendExpert;
                    setRecommendExpert(next);
                    onAsideClick(
                      '专家与技能推荐',
                      '发任务时顺手提醒你“这活有现成好用的专家或技能”，新手保持开着能发现很多好工具。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
                >
                  <Toggle on={recommendExpert} />
                </button>
              </div>
            </div>

            {/* 区块 3：存储（重点演示项 1：挪出 C 盘） */}
            <div className="text-[12px] text-[#8c9099] px-1 pt-0.5">存储</div>
            <div className="rounded-[14px] bg-white border border-[#ececea] px-4 py-4 flex flex-col gap-5">
              {/* 系统缓存目录 + 3 段空间条 */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#111318]">系统缓存目录</div>
                    <div className="text-[12px] text-[#6b7079] mt-0.5">
                      ~/.workbuddy · 存放对话记录、运行缓存与临时文件。
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAsideClick(
                        '打开缓存目录',
                        '这里放聊天记录和运行缓存，平时不用动；哪天想清理临时文件或查日志，点它就能直达文件夹。'
                      );
                    }}
                    className="border-0 bg-transparent hover:bg-[#f4f4f2] rounded-lg px-2 py-1 text-[12px] text-[#4a4f57] cursor-pointer shrink-0"
                  >
                    📁 打开目录
                  </button>
                </div>

                {/* 磁盘条（迁移前 C 盘告急，迁移后宽裕） */}
                <div className="h-[6px] rounded-full bg-[#eeeeeb] overflow-hidden flex">
                  <div className="h-full bg-[#00b578] w-[2%]" />
                  <div
                    className={`h-full transition-all duration-500 ${
                      shell.storageMoved ? 'w-[34%] bg-[#7a7f89]' : 'w-[89%] bg-[#c2410c]'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-[#6b7079]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00b578]" />
                      系统缓存
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          shell.storageMoved ? 'bg-[#7a7f89]' : 'bg-[#c2410c]'
                        }`}
                      />
                      磁盘已用
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dcdcd8]" />
                      磁盘可用
                    </span>
                  </div>
                  <span className="font-mono">
                    {shell.storageMoved ? '已用 1.71 GB / 共 1.81 TB' : '已用 48.2 GB / C 盘剩余不足 8%'}
                  </span>
                </div>
              </div>

              {/* /WorkBuddy 默认工作空间存储路径（重点引导步骤） */}
              <div className="flex flex-col gap-2">
                <div className="text-[13.5px] font-semibold text-[#111318] flex items-center gap-2">
                  <span>/WorkBuddy 默认工作空间存储路径</span>
                  {shell.storageMoved && (
                    <span className="sim-pop-up text-[11px] font-medium text-accent-600 bg-accent-50 border border-accent-200 rounded-md px-1.5 py-[1px]">
                      已移出系统盘
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-[#6b7079]">
                  新建任务、分组时将自动存放在该路径下；修改后不影响已有数据。
                </div>
                <div className="flex items-center gap-2.5 pt-0.5">
                  <div
                    className={`flex-1 px-3 py-2 rounded-[9px] border font-mono text-[12.5px] transition-colors ${
                      shell.storageMoved
                        ? 'bg-[#f3f5fe] border-accent-200 text-accent-700'
                        : 'bg-[#f4f4f2] border-transparent text-[#6b7079]'
                    }`}
                  >
                    {shell.storagePath}
                  </div>
                  <button
                    type="button"
                    data-guided-target="settings.changePath"
                    onClick={(e) => {
                      e.stopPropagation();
                      clickOrAside(
                        'settings.changePath',
                        '更改存储路径',
                        '点「更改」把默认工作空间挪出 C 盘，以后新建任务和分组都会自动存到新目录里。'
                      );
                    }}
                    className={`relative h-9 px-4 rounded-[9px] border border-[#dcdcd8] bg-white hover:bg-[#f4f4f2] text-[13px] font-medium text-[#111318] cursor-pointer shrink-0 ${ring(
                      'settings.changePath'
                    )}`}
                  >
                    更改
                    {waitTarget === 'settings.changePath' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="top" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 区块 4：通知（重点演示项 2：桌面通知 + 提示音 + 定时任务产物通知） */}
            <div className="text-[12px] text-[#8c9099] px-1 pt-0.5">通知</div>
            <div className="rounded-[14px] bg-white border border-[#ececea] px-4 py-3.5 flex flex-col gap-4">
              {/* 桌面通知 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318] flex items-center gap-2">
                    <span>桌面通知</span>
                    {shell.notifyEnabled && (
                      <span className="sim-pop-up text-[11px] font-medium text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] rounded-md px-1.5 py-[1px]">
                        已授权开启
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    任务完成或有新消息时，将会通过系统弹窗提醒你。
                  </div>
                </div>
                <button
                  type="button"
                  data-guided-target="settings.enableNotify"
                  onClick={(e) => {
                    e.stopPropagation();
                    clickOrAside(
                      'settings.enableNotify',
                      '桌面通知',
                      '长任务常要跑一两分钟，开通知后你可以先切去回消息，它干完会弹窗叫你回来验收。'
                    );
                  }}
                  className={`relative h-9 px-3.5 rounded-[9px] border text-[12.5px] font-medium cursor-pointer shrink-0 transition-colors ${
                    shell.notifyEnabled
                      ? 'border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]'
                      : 'border-[#dcdcd8] bg-white hover:bg-[#f4f4f2] text-[#111318]'
                  } ${ring('settings.enableNotify')}`}
                >
                  {shell.notifyEnabled ? '已开启 ✓' : '前往系统设置 ↗'}
                  {waitTarget === 'settings.enableNotify' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="top" />
                  )}
                </button>
              </div>

              {/* 通知提示音 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">通知提示音</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    收到桌面或应用内通知时播放的提示音。
                  </div>
                </div>
                <InlineSelect
                  value={notifySound}
                  options={['无音效', '轻柔提示音', '清脆提示音']}
                  open={openDrop === 'sound'}
                  onToggle={() => {
                    setOpenDrop((d) => (d === 'sound' ? null : 'sound'));
                    onAsideClick(
                      '通知提示音',
                      '弹窗提醒时要不要带声音。在办公室怕吵到旁边同事，保持「无音效」就行。'
                    );
                  }}
                  onSelect={(v) => {
                    setNotifySound(v);
                    setOpenDrop(null);
                    onAsideClick('通知提示音', `已切到「${v}」——办公环境一般选无音效最安静。`);
                  }}
                />
              </div>

              {/* 定时任务产物通知 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">定时任务产物通知</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    定时任务的产物生成后，将会通过系统弹窗提醒你。
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="定时任务产物通知"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !scheduleNotify;
                    setScheduleNotify(next);
                    onAsideClick(
                      '定时任务产物通知',
                      '后面你设了每天自动生成早报/周报的定时任务，出成品会弹窗叫你看，建议保持开着。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
                >
                  <Toggle on={scheduleNotify} />
                </button>
              </div>
            </div>

            {/* 区块 5：隐私（体验优化计划） */}
            <div className="text-[12px] text-[#8c9099] px-1 pt-0.5">隐私</div>
            <div className="rounded-[14px] bg-white border border-[#ececea] px-4 py-3.5 flex items-center justify-between gap-4 mb-2">
              <div>
                <div className="text-[13.5px] font-semibold text-[#111318]">体验优化计划</div>
                <div className="text-[12px] text-[#6b7079] mt-0.5">
                  允许使用你的对话数据帮助改进模型。数据会先加密脱敏，且无法关联到你个人。
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAsideClick(
                      '体验优化计划',
                      '如果你平时经常拿 WorkBuddy 处理公司内部文档或个人隐私材料，介意数据回传的话，直接把右边开关关掉就行，不影响任何功能。'
                    );
                  }}
                  className="border-0 bg-transparent p-0 mt-1 text-[12px] text-[#6b7079] hover:text-[#111318] underline cursor-pointer"
                >
                  了解更多
                </button>
              </div>
              <button
                type="button"
                aria-label="体验优化计划"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = !privacyPlan;
                  setPrivacyPlan(next);
                  onAsideClick(
                    '体验优化计划',
                    next
                      ? '已开启体验优化计划；如果处理公司敏感资料，随时可以关掉它。'
                      : '已关闭体验优化计划——处理公司或个人敏感材料时关掉最安心，不影响任何功能。'
                  );
                }}
                className="border-0 bg-transparent p-0 cursor-pointer shrink-0"
              >
                <Toggle on={privacyPlan} />
              </button>
            </div>
          </>
        )}

        {/* ===== Tab 2：记忆与进化（1.3 记忆与进化） ===== */}
        {shell.settingsTab === 'memory' && (
          <>
            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">云端记忆</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    自动记住对话中的重要信息，每晚整理更新，让后续回答越来越贴合你。
                  </div>
                </div>
                <button
                  type="button"
                  data-guided-target="settings.toggleCloudMemory"
                  onClick={(e) => {
                    e.stopPropagation();
                    clickOrAside(
                      'settings.toggleCloudMemory',
                      '云端记忆开关',
                      '打开云端记忆后，跨对话也会记住你反复交代过的格式与偏好。'
                    );
                  }}
                  className={`relative border-0 bg-transparent p-1 rounded-full cursor-pointer ${ring(
                    'settings.toggleCloudMemory'
                  )}`}
                >
                  <Toggle on={shell.cloudMemoryOn} />
                  {waitTarget === 'settings.toggleCloudMemory' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="left" />
                  )}
                </button>
              </div>

              <div className="h-px bg-[#f0f0ee]" />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">本地记忆与技能</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    记录有长期价值的项目成果和约定，支持用户级和项目级，在后续任务中继续遵循。
                  </div>
                </div>
                <button
                  type="button"
                  data-guided-target="settings.toggleLocalMemory"
                  onClick={(e) => {
                    e.stopPropagation();
                    clickOrAside(
                      'settings.toggleLocalMemory',
                      '本地记忆开关',
                      '本地记忆用于沉淀长期项目的约定与经验。'
                    );
                  }}
                  className={`relative border-0 bg-transparent p-1 rounded-full cursor-pointer ${ring(
                    'settings.toggleLocalMemory'
                  )}`}
                >
                  <Toggle on={shell.localMemoryOn} />
                  {waitTarget === 'settings.toggleLocalMemory' && waitCallout && (
                    <GuidanceCallout text={waitCallout} placement="left" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318]">管理云端记忆</div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    每晚自动整理更新，全局共享。发现回答突然跑偏时，来这里删掉记歪的条目。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAsideClick(
                      '导入记忆',
                      '以前在别的 AI 工具里攒过个人偏好和记忆的，可以点「导入」直接带进来，不用重新养。'
                    );
                  }}
                  className="h-8 px-3 rounded-lg border border-[#dcdcd8] bg-white hover:bg-[#f4f4f2] text-[12.5px] text-[#4a4f57] inline-flex items-center cursor-pointer"
                >
                  导入
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {shell.cloudMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className={`sim-msg-rise flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[10px] border text-[13px] ${
                      mem.bad
                        ? 'bg-[#fff6ef] border-[#f6d7c2]'
                        : 'bg-[#fafaf9] border-[#eeeeeb]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10.5px] font-semibold px-1.5 py-[1px] rounded shrink-0 ${
                            mem.bad
                              ? 'bg-[#ffe4cf] text-[#9a3412]'
                              : 'bg-[#eef2ff] text-accent-600'
                          }`}
                        >
                          {mem.tag}
                        </span>
                        <span className="text-[#111318] font-medium">{mem.text}</span>
                      </div>
                    </div>
                    {mem.bad ? (
                      <button
                        type="button"
                        data-guided-target="settings.deleteBadMemory"
                        onClick={(e) => {
                          e.stopPropagation();
                          clickOrAside(
                            'settings.deleteBadMemory',
                            '删除记歪的记忆',
                            '删除这条误记的偏好后，后续中文任务就不会再莫名其妙输出英文了。'
                          );
                        }}
                        className={`relative h-7 px-2.5 rounded-lg border border-[#f6d7c2] bg-white hover:bg-[#ffe4cf] text-[#9a3412] text-[12px] font-semibold cursor-pointer shrink-0 ${ring(
                          'settings.deleteBadMemory'
                        )}`}
                      >
                        删除
                        {waitTarget === 'settings.deleteBadMemory' && waitCallout && (
                          <GuidanceCallout text={waitCallout} placement="left" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[11.5px] text-[#8c9099] shrink-0">生效中</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== Tab 3：个性化（1.4 个性化：指令） ===== */}
        {shell.settingsTab === 'personalization' && (
          <>
            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[13.5px] font-semibold text-[#111318]">WorkBuddy 对你的称呼</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAsideClick('称呼', '称呼和名字按喜好填就行，不影响干活质量。');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#e6e6e3] bg-white text-[12px] text-[#8c9099] cursor-pointer"
                >
                  暂无内容，点击编辑添加
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[13.5px] font-semibold text-[#111318]">WorkBuddy 的名字</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAsideClick('名字', '按喜好起名即可。');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#e6e6e3] bg-white text-[12px] text-[#8c9099] cursor-pointer"
                >
                  暂无内容，点击编辑添加
                </button>
              </div>
            </div>

            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[13.5px] font-semibold text-[#111318]">回复风格</div>
                <div className="text-[12px] text-[#6b7079] mt-0.5">选择 WorkBuddy 回复的默认语气。</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAsideClick('回复风格', '偏简洁干脆的语气能少看很多废话，也更省积分。');
                }}
                className="px-3 py-1.5 rounded-lg border border-[#e2e2de] bg-white text-[12.5px] text-[#2b2f36] cursor-pointer"
              >
                默认 ∨
              </button>
            </div>

            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[13.5px] font-semibold text-[#111318]">首页任务推荐</div>
                <div className="text-[12px] text-[#6b7079] mt-0.5">
                  在首页输入框下方展示任务示例，帮助你快速开始。
                </div>
              </div>
              <Toggle on />
            </div>

            {/* 核心卡片：给 WorkBuddy 的指令 */}
            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111318] flex items-center gap-2">
                    <span>给 WorkBuddy 的指令</span>
                    {shell.rulesSaved && (
                      <span className="sim-pop-up text-[11px] font-semibold text-accent-600 bg-accent-50 border border-accent-200 rounded-md px-2 py-[1px]">
                        已生效
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#6b7079] mt-0.5">
                    写下你希望 WorkBuddy 一直遵守的要求，之后每次对话和任务都会默认生效。
                  </div>
                </div>
                {!shell.rulesEditing && (
                  <button
                    type="button"
                    data-guided-target="settings.editRules"
                    onClick={(e) => {
                      e.stopPropagation();
                      clickOrAside(
                        'settings.editRules',
                        '编辑指令',
                        '点「编辑」把 5 条做事红线写进去，以后每次对话都自动遵守。'
                      );
                    }}
                    className={`relative h-8 px-3.5 rounded-lg border border-[#dcdcd8] bg-white hover:bg-[#f4f4f2] text-[12.5px] font-medium text-[#111318] cursor-pointer shrink-0 ${ring(
                      'settings.editRules'
                    )}`}
                  >
                    编辑
                    {waitTarget === 'settings.editRules' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="left" />
                    )}
                  </button>
                )}
              </div>

              <div
                className={`rounded-[10px] border p-3 min-h-[112px] text-[12.5px] leading-[1.75] transition-colors ${
                  shell.rulesEditing
                    ? 'border-[#111318] bg-white shadow-[0_0_0_1px_#111318]'
                    : 'border-[#e6e6e3] bg-[#fafaf9]'
                } ${shell.rulesFilled || shell.rulesSaved ? 'text-[#111318]' : 'text-[#9ea3ad]'}`}
              >
                {shell.rulesFilled || shell.rulesSaved ? (
                  <ol className="m-0 pl-4.5 flex flex-col gap-1">
                    {shell.rulesList.map((rule, i) => (
                      <li key={i} className="sim-msg-rise" style={{ animationDelay: `${i * 45}ms` }}>
                        {rule}
                      </li>
                    ))}
                  </ol>
                ) : (
                  '例如：回答尽量简洁，先给结论'
                )}
              </div>

              {shell.rulesEditing && (
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    data-guided-target="settings.fillRules"
                    onClick={(e) => {
                      e.stopPropagation();
                      clickOrAside(
                        'settings.fillRules',
                        '填入泊舟 5 条模板',
                        '把泊舟总结的 5 条核心红线一键填进去，不用自己手打。'
                      );
                    }}
                    className={`relative h-8 px-3.5 rounded-lg border border-accent-200 bg-accent-50 hover:bg-accent-100 text-accent-700 text-[12.5px] font-semibold cursor-pointer ${ring(
                      'settings.fillRules'
                    )}`}
                  >
                    填入泊舟 5 条指令模板
                    {waitTarget === 'settings.fillRules' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="top" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!shell.rulesFilled}
                    data-guided-target="settings.saveRules"
                    onClick={(e) => {
                      e.stopPropagation();
                      clickOrAside('settings.saveRules', '保存指令', '保存后，所有新对话都会默认遵守这 5 条。');
                    }}
                    className={`relative h-8 px-4 rounded-lg border-0 bg-gray-900 text-white text-[12.5px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${ring(
                      'settings.saveRules'
                    )}`}
                  >
                    保存
                    {waitTarget === 'settings.saveRules' && waitCallout && (
                      <GuidanceCallout text={waitCallout} placement="top" />
                    )}
                  </button>
                  <span className="text-[11.5px] text-[#8c9099]">模拟器里一键填入模板，免打字</span>
                </div>
              )}
            </div>

            {/* 人设设定 & 长期记忆 */}
            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[13.5px] font-semibold text-[#111318]">人设设定</div>
                <div className="text-[12px] text-[#6b7079] mt-0.5">
                  设定 WorkBuddy 的身份、性格与表达风格，对所有回复生效。
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAsideClick(
                    '人设设定',
                    '「人设设定」管它是谁、什么说话性格（比如干脆的效率顾问），和「指令」里的做事红线要分开填。'
                  );
                }}
                className="h-8 px-3.5 rounded-lg border border-[#dcdcd8] bg-white text-[12.5px] text-[#2b2f36] cursor-pointer shrink-0"
              >
                编辑
              </button>
            </div>

            <div className="rounded-[14px] bg-white border border-[#ececea] p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[13.5px] font-semibold text-[#111318]">长期记忆</div>
                <div className="text-[12px] text-[#6b7079] mt-0.5">
                  跨会话保存的重要信息与结论（你是谁、做什么业务、面向什么受众），可随时查看修改。
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAsideClick(
                    '长期记忆',
                    '「长期记忆」放你的固定背景资料（职业、受众、常用软件），让它不用每次追问你是干嘛的。'
                  );
                }}
                className="h-8 px-3.5 rounded-lg border border-[#dcdcd8] bg-white text-[12.5px] text-[#2b2f36] cursor-pointer shrink-0"
              >
                编辑
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
