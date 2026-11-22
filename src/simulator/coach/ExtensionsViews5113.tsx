import { useState } from 'react';
import { ExtensionsIcon, LinkChainIcon, PencilIcon, SearchIcon, SkillToolIcon } from '../shell/icons';
import {
  CONNECTORS,
  EXPERTS_DEFAULT,
  EXPERTS_PPT,
  FEATURED_SKILLS,
  FEISHU_CAPABILITIES,
  RECOMMEND_SKILLS,
  SKILLHUB_SKILLS,
  WPS_RESULTS,
  type SkillCard,
} from './extensionsData';
import type { GuidedShellState } from './guidedTypes';
import {
  BoltIcon,
  DownloadIcon,
  LetterIcon,
  StarIcon,
  makeTargetKit,
  type TargetKitProps,
} from './targetKit';

interface Props extends TargetKitProps {
  shell: GuidedShellState;
}

/** 真机截图里「已安装(15)」，装一个加一个 */
export const BASE_INSTALLED_COUNT = 15;

const SKILL_CATEGORIES = ['全部', 'OPC·一人公司', '办公协同', '开发工具', '投资理财', '效率工具', '内容创作', '信息资讯', '数据分析'];
const SKILLHUB_CATEGORIES = ['全部', 'Pay Skill', '办公效率', '内容创作', '开发编程', '数据分析', '设计多媒体', 'AI Agent'];
const EXPERT_CATEGORIES = ['全部', 'OPC·一人公司', '腾讯专家', '产品设计', '技术工程', '金融投资', '内容创作', '营销增长'];

/**
 * 「专家·技能·连接器」页（对照 5.11.3 真机截图）
 * 顶部三个标签共用一个页面，右上角的搜索和按钮随标签变化；详情抽屉、安装确认、扫码授权、添加 MCP 服务器都是本页上的浮层
 */
export function ExtensionsViews5113(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const installedCount = BASE_INSTALLED_COUNT + shell.installedSkillIds.length + shell.customSkills.length;

  // 三个标签的悬停提示用真机文案
  const tabs = [
    { id: 'experts' as const, label: '专家', tip: '以专家视角完成你的任务', icon: <ExtensionsIcon size={17} />, target: 'ext.tab.experts' as const },
    { id: 'skills' as const, label: '技能', tip: '适合高效完成特定的任务', icon: <SkillToolIcon size={17} />, target: 'ext.tab.skills' as const },
    { id: 'connectors' as const, label: '连接器', tip: '帮你连接外部应用数据', icon: <LinkChainIcon size={17} />, target: 'ext.tab.connectors' as const },
  ];

  return (
    <div className="relative flex-1 min-w-0 flex flex-col bg-white overflow-hidden" data-view="extensions">
      {/* 顶栏：三个标签 + 右侧搜索 / 按钮 */}
      <div className="shrink-0 h-14 px-5 flex items-center justify-between gap-3 border-b border-[#f2f2f0]">
        <div className="flex items-center gap-3 shrink-0">
          {tabs.map((t) => {
            const active = shell.extTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                title={t.tip}
                data-guided-target={t.target}
                onClick={kit.click(t.target, t.label, `<b>${t.label}</b>：${t.tip}。这一步先跟着蓝圈走，学完这节随便逛。`)}
                className={`relative border-0 bg-transparent inline-flex items-center gap-1.5 text-[16px] whitespace-nowrap cursor-pointer px-1 py-1 rounded-lg ${
                  active ? 'text-[#111318] font-bold' : 'text-[#9ea3ad] hover:text-[#4a4f57]'
                } ${kit.ring(t.target)}`}
              >
                {t.icon}
                {t.label}
                {kit.callout(t.target, 'bottom', 'start')}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {shell.extTab === 'skills' && <SkillsHeaderActions {...props} installedCount={installedCount} />}
          {shell.extTab === 'connectors' && (
            <>
              <div className="hidden xl:flex h-8 w-[180px] px-2.5 rounded-lg border border-[#e6e6e3] items-center gap-1.5 text-[12.5px] text-[#9ea3ad]">
                <SearchIcon size={13} /> 搜索连接器
              </div>
              <button
                type="button"
                data-guided-target="connectors.custom"
                onClick={kit.click(
                  'connectors.custom',
                  '自定义连接器',
                  '列表里没有的服务，就从这里自己接。点开其实就是「添加 MCP 服务器」，3.6 节专门教。'
                )}
                className={`relative h-8 px-3 rounded-lg border-0 bg-[#111318] text-white text-[12.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer ${kit.ring('connectors.custom')}`}
              >
                <PencilIcon size={13} /> 自定义连接器
                {kit.callout('connectors.custom', 'bottom', 'end')}
              </button>
            </>
          )}
          {shell.extTab === 'experts' && (
            <button
              type="button"
              data-guided-target="experts.search"
              onClick={kit.click('experts.search', '搜索专家', '输入岗位或场景关键词，比如 ppt、合同、小红书，就能按「专家职称或描述」搜。')}
              className={`relative h-8 w-[200px] px-2.5 rounded-lg border border-[#e6e6e3] bg-white inline-flex items-center gap-1.5 text-[12.5px] cursor-pointer ${
                shell.expertSearch ? 'text-[#111318]' : 'text-[#9ea3ad]'
              } ${kit.ring('experts.search')}`}
            >
              <SearchIcon size={13} /> {shell.expertSearch || '搜索专家职称或描述'}
              {kit.callout('experts.search', 'bottom', 'end')}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {shell.extTab === 'experts' && <ExpertsPane {...props} />}
        {shell.extTab === 'skills' && <SkillsPane {...props} />}
        {shell.extTab === 'connectors' && <ConnectorsPane {...props} />}
      </div>

      <ExtensionOverlays {...props} />
    </div>
  );
}

/* ====================== 专家 ====================== */

/** 专家标签：默认是行业大卡 + 分类 + 网格；搜索后显示「搜索 "ppt" 找到 40 位专家」 */
function ExpertsPane(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const [sort, setSort] = useState('综合');
  const list = shell.expertSearch ? EXPERTS_PPT : EXPERTS_DEFAULT;

  return (
    <div className="flex flex-col gap-4">
      {shell.expertSearch ? (
        <div className="text-[13px] text-[#4a4f57]">
          搜索 <b className="text-[#111318]">"{shell.expertSearch}"</b> 找到 <b className="text-[#111318]">40</b> 位专家
        </div>
      ) : (
        <>
          <div className="rounded-[16px] bg-gradient-to-r from-[#eef2ff] to-[#fdf2f8] px-5 py-4">
            <div className="text-[16px] font-bold text-[#111318]">专家中心</div>
            <div className="text-[12.5px] text-[#5c5f66] mt-1">按行业分类浏览专家，召唤他们为你服务</div>
            <div className="flex gap-2 mt-3 text-[12px]">
              {['电商运营', '内容创作', '投资分析', '法律咨询'].map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-full bg-white/80 text-[#4a4f57]">{c}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-[14px]">
              <span className="font-bold text-[#111318]">专家</span>
              <span className="text-[#9ea3ad]">专家团 <span className="text-[10px] border border-[#dadad7] rounded-full px-1">Beta</span></span>
            </div>
            <SortBar options={['综合', '最热', '最新']} value={sort} onChange={setSort} />
          </div>
          <CategoryChips items={EXPERT_CATEGORIES} onAside={kit.aside} />
        </>
      )}

      <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3">
        {list.map((ex) => {
          const isTarget = ex.id === 'ppt';
          return (
            <button
              key={ex.id}
              type="button"
              data-guided-target={isTarget ? 'experts.card' : undefined}
              onClick={
                isTarget
                  ? kit.click('experts.card', ex.name, '点开专家卡片能看到它的能力介绍、用了哪些技能、谁分享的。')
                  : kit.aside(ex.name, `卡片上的 <b>⚡ ${ex.use}</b> 是这个专家被召唤使用的次数。挑专家先看这个数和有没有「官方」标。`)
              }
              className={`group relative text-left rounded-[14px] border border-[#ececea] bg-white hover:shadow-[0_6px_20px_rgba(17,19,24,0.08)] p-3.5 flex gap-3 cursor-pointer ${
                isTarget ? kit.ring('experts.card') : ''
              }`}
            >
              <LetterIcon name={ex.name} color={ex.color} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[13.5px] text-[#111318] truncate">{ex.name}</span>
                  {ex.official && (
                    <span className="text-[10px] px-1.5 rounded bg-[#eef2ff] text-[#3355e0] font-semibold shrink-0">官方</span>
                  )}
                </div>
                <div className="text-[12px] text-[#6b7079] line-clamp-1 mt-0.5">{ex.desc}</div>
                <div className="flex items-center gap-2 mt-2 text-[11.5px] text-[#8c9099]">
                  <span className="inline-flex items-center gap-0.5" title={`使用量 ${ex.use}`}>
                    <BoltIcon size={11} /> {ex.use}
                  </span>
                  {ex.tags.map((t) => (
                    <span key={t} className="px-1.5 rounded bg-[#f4f4f5]">{t}</span>
                  ))}
                </div>
              </div>
              <span className="hidden group-hover:inline-flex absolute right-3 top-3 h-6 px-2 rounded-md bg-[#111318] text-white text-[11px] items-center">
                召唤
              </span>
              {isTarget && kit.callout('experts.card', 'bottom', 'start')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ====================== 技能 ====================== */

/** 技能标签右上角：搜索技能 / 已安装(N) / + 添加技能 */
function SkillsHeaderActions(props: Props & { installedCount: number }) {
  const { shell, installedCount } = props;
  const kit = makeTargetKit(props);
  return (
    <>
      <button
        type="button"
        data-guided-target="skills.search"
        onClick={kit.click('skills.search', '搜索技能', '知道要干什么活，就直接搜关键词，比翻分类快。')}
        className={`relative inline-flex h-8 w-[112px] xl:w-[160px] shrink min-w-0 px-2.5 whitespace-nowrap overflow-visible rounded-lg border border-[#e6e6e3] bg-white items-center gap-1.5 text-[12.5px] cursor-pointer ${
          shell.skillSearch ? 'text-[#111318]' : 'text-[#9ea3ad]'
        } ${kit.ring('skills.search')}`}
      >
        <SearchIcon size={13} /> {shell.skillSearch || '搜索技能'}
        {kit.callout('skills.search', 'bottom', 'end')}
      </button>
      <button
        type="button"
        data-guided-target="skills.installed"
        onClick={kit.click('skills.installed', `已安装(${installedCount})`, '这里能看到装过的所有技能，分「用户自定义 / 来自市场 / 套件」三组，也在这里卸载。')}
        className={`relative h-8 px-3 rounded-lg border border-[#e6e6e3] bg-white text-[12.5px] font-medium text-[#111318] cursor-pointer whitespace-nowrap ${kit.ring('skills.installed')}`}
      >
        已安装({installedCount})
        {kit.callout('skills.installed', 'bottom', 'end')}
      </button>
      <button
        type="button"
        data-guided-target="skills.addMenu"
        onClick={kit.click('skills.addMenu', '添加技能', '添加技能有三种：创建技能（让 AI 帮你写）、上传技能（导入文件夹或 zip）、查找技能（让 AI 帮你搜）。')}
        className={`relative h-8 px-3 rounded-lg border-0 bg-[#111318] text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap ${kit.ring('skills.addMenu')}`}
      >
        + 添加技能
        {kit.callout('skills.addMenu', 'bottom', 'end')}
      </button>
    </>
  );
}

/** 技能标签主体：已安装列表 / 搜索结果 / 精选 + 推荐 / SkillHub */
function SkillsPane(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const [sort, setSort] = useState('综合');

  if (shell.installedPanelOpen) {
    const market = WPS_RESULTS.filter((s) => shell.installedSkillIds.includes(s.id));
    return (
      <div className="flex flex-col gap-4">
        <div className="text-[16px] font-bold text-[#111318]">已安装技能</div>
        <InstalledGroup title="用户自定义" items={shell.customSkills.map((n) => ({ name: n, desc: '你自己创建的技能', color: '#3355e0' }))} empty="上传本地技能文件夹，或通过 AI 对话快速创建一个专属技能" highlight />
        <InstalledGroup title="来自市场" items={[...market.map((s) => ({ name: s.name, desc: s.desc, color: s.color })), { name: '腾讯文档 PDFKit', desc: 'PDF全能工具箱', color: '#dc2626' }]} />
        <InstalledGroup title="套件" items={[{ name: '企业微信套件', desc: '消息、邮件、日程', color: '#2563eb' }]} />
      </div>
    );
  }

  if (shell.skillSearch) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[13px] text-[#4a4f57]">
          <span>
            搜索 <b className="text-[#111318]">"{shell.skillSearch}"</b> 的结果
          </span>
          <label className="inline-flex items-center gap-1.5 text-[12px] text-[#5c5f66]">
            <span className="w-3.5 h-3.5 rounded border border-[#c9ccd1] bg-white" /> 仅展示未安装
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {WPS_RESULTS.map((s) => {
            const isTarget = s.id === 'wps-b';
            return (
              <SkillCardView
                key={s.id}
                skill={s}
                mode="hub"
                installed={shell.installedSkillIds.includes(s.id)}
                ringClass={isTarget ? kit.ring('skills.pickCard') : ''}
                dataTarget={isTarget ? 'skills.pickCard' : undefined}
                onClick={
                  isTarget
                    ? kit.click('skills.pickCard', s.name, '点开详情看来源和 License 再决定装不装。')
                    : kit.aside(s.name, `同名的另一个：⬇ 下载量 ${s.downloads}、☆ 收藏只有 ${s.stars}，来源是个人上传、没写 License。<b>两个同名时，挑下载多、收藏多、来源清楚的那个。</b>`)
                }
                callout={isTarget ? kit.callout('skills.pickCard', 'bottom', 'start') : null}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const isHub = shell.skillTab === 'skillhub';
  const grid = isHub ? SKILLHUB_SKILLS : RECOMMEND_SKILLS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold text-[#111318]">精选技能</span>
        <span className="text-[12px] text-[#8c9099]">↻ 换一批</span>
      </div>
      <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3">
        {FEATURED_SKILLS.map((s, idx) => (
          <SkillCardView
            key={s.id}
            skill={s}
            mode="recommend"
            onClick={kit.aside(s.name, `精选技能是官方挑出来的常用技能。看卡片底部：<b>⚡ ${s.use}</b> 是使用量，<b>⬇ ${s.install}</b> 是安装量。`)}
            statProps={idx === 0 ? { shell, kit } : undefined}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-4 text-[15px]">
          <button
            type="button"
            onClick={kit.aside('推荐', '推荐里是 WorkBuddy 自家技能市场，卡片上是 ⚡ 使用量 和 ⬇ 安装量。')}
            className={`border-0 bg-transparent cursor-pointer ${!isHub ? 'font-bold text-[#111318]' : 'text-[#9ea3ad]'}`}
          >
            推荐
          </button>
          <button
            type="button"
            data-guided-target="skills.tab.skillhub"
            onClick={kit.click('skills.tab.skillhub', 'SkillHub', 'SkillHub 是另一个技能市场，卡片上换成 ⬇ 下载量 和 ☆ 收藏量。')}
            className={`relative border-0 bg-transparent cursor-pointer rounded-md px-0.5 ${isHub ? 'font-bold text-[#111318]' : 'text-[#9ea3ad]'} ${kit.ring('skills.tab.skillhub')}`}
          >
            SkillHub
            {kit.callout('skills.tab.skillhub', 'bottom', 'start')}
          </button>
          <button
            type="button"
            onClick={kit.aside('套件', '套件是一组打包好的技能（比如企业微信套件），装一次给一整套能力。')}
            className="border-0 bg-transparent cursor-pointer text-[#9ea3ad]"
          >
            套件
          </button>
        </div>
        <SortBar options={isHub ? ['综合', '下载量', '最新', '收藏'] : ['综合', '使用量', '安装量', '最新']} value={sort} onChange={setSort} />
      </div>
      <CategoryChips items={isHub ? SKILLHUB_CATEGORIES : SKILL_CATEGORIES} onAside={kit.aside} />

      <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3">
        {grid.map((s, idx) => (
          <SkillCardView
            key={s.id}
            skill={s}
            mode={isHub ? 'hub' : 'recommend'}
            onClick={kit.aside(
              s.name,
              s.paid
                ? '这个技能带 <b>付费</b> 角标，装之前看清收费方式。'
                : s.needsKey
                  ? '这个技能带 <b>需 APIKey</b> 标签：要你自己去第三方申请密钥，新手先别装。'
                  : `点卡片右上角 <b>+</b> 就能装。不过这节课我们要装的是 WPS 技能，跟着蓝圈走。`
            )}
            statProps={isHub && idx === 0 ? { shell, kit } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

/** 一张技能卡片；statProps 存在时底部计数是可点的教学目标 */
function SkillCardView({
  skill,
  mode,
  onClick,
  installed,
  ringClass = '',
  dataTarget,
  callout,
  statProps,
}: {
  skill: SkillCard;
  mode: 'recommend' | 'hub';
  onClick: () => void;
  installed?: boolean;
  ringClass?: string;
  dataTarget?: string;
  callout?: React.ReactNode;
  statProps?: { shell: GuidedShellState; kit: ReturnType<typeof makeTargetKit> };
}) {
  const kit = statProps?.kit;
  const tip = statProps?.shell.statTip;

  /** 计数小块：教学目标时带蓝圈和悬停提示 */
  const stat = (
    kind: 'use' | 'install' | 'download' | 'star',
    icon: React.ReactNode,
    value: string | undefined,
    tipText: string
  ) => {
    if (value === undefined) return null;
    const target =
      kind === 'use' ? 'skills.statUse' : kind === 'install' ? 'skills.statInstall' : kind === 'download' ? 'skills.statDownload' : null;
    const teach = Boolean(kit && target);
    return (
      <span
        role={teach ? 'button' : undefined}
        data-guided-target={teach ? target! : undefined}
        title={tipText}
        onClick={
          teach
            ? (e) => {
                e.stopPropagation();
                kit!.click(target!, tipText, `鼠标放上去显示「${tipText}」。`)();
              }
            : undefined
        }
        className={`relative inline-flex items-center gap-0.5 rounded px-0.5 ${teach ? 'cursor-pointer' : ''} ${teach ? kit!.ring(target!) : ''}`}
      >
        {icon} {value}
        {tip === kind && (
          <span className="sim-pop-up absolute left-0 bottom-full mb-1.5 px-2 py-1 rounded-md bg-[#111318] text-white text-[11px] whitespace-nowrap z-10">
            {tipText}
          </span>
        )}
        {teach && kit!.callout(target!, 'bottom', 'start')}
      </span>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      data-guided-target={dataTarget}
      onClick={onClick}
      className={`relative text-left rounded-[14px] border border-[#ececea] bg-white hover:shadow-[0_6px_20px_rgba(17,19,24,0.08)] p-3.5 flex gap-3 cursor-pointer ${ringClass}`}
    >
      <LetterIcon name={skill.name} color={skill.color} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-[13.5px] text-[#111318] truncate">{skill.name}</span>
          <span className="w-6 h-6 rounded-md border border-[#e6e6e3] text-[#4a4f57] text-[14px] inline-flex items-center justify-center shrink-0">
            {installed ? '✓' : '+'}
          </span>
        </div>
        <div className="text-[12px] text-[#6b7079] line-clamp-1 mt-0.5">
          {skill.paid && <span className="mr-1 px-1 rounded bg-[#fef3c7] text-[#92400e] text-[10.5px]">付费</span>}
          {skill.needsKey && <span className="mr-1 px-1 rounded bg-[#fff1e8] text-[#9a3412] text-[10.5px]">需 APIKey</span>}
          {skill.desc}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11.5px] text-[#8c9099]">
          {mode === 'recommend' ? (
            <>
              {stat('use', <BoltIcon size={11} />, skill.use, `使用量 ${skill.use}`)}
              {stat('install', <DownloadIcon size={11} />, skill.install, `安装量 ${skill.install}`)}
            </>
          ) : (
            <>
              {stat('download', <DownloadIcon size={11} />, skill.downloads, `下载量 ${skill.downloads}`)}
              {stat('star', <StarIcon size={11} />, skill.stars, `收藏量 ${skill.stars}`)}
            </>
          )}
        </div>
      </div>
      {callout}
    </div>
  );
}

/** 「已安装技能」里的一组 */
function InstalledGroup({
  title,
  items,
  empty,
  highlight,
}: {
  title: string;
  items: Array<{ name: string; desc: string; color: string }>;
  empty?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[12.5px] font-semibold text-[#5c5f66]">
        {title} <span className="text-[#9ea3ad] font-normal">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-[12px] text-[#9ea3ad] px-3 py-3 rounded-[12px] border border-dashed border-[#e2e2de]">{empty}</div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {items.map((it) => (
            <div
              key={it.name}
              className={`sim-msg-rise rounded-[12px] border px-3 py-2.5 flex items-center gap-2.5 ${
                highlight ? 'border-accent-200 bg-accent-50' : 'border-[#ececea] bg-white'
              }`}
            >
              <LetterIcon name={it.name} color={it.color} size={30} />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#111318] truncate">{it.name}</div>
                <div className="text-[11.5px] text-[#8c9099] truncate">{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ====================== 连接器 ====================== */

/** 连接器网格：右上角 +，连上后变绿点 + 对话图标 */
function ConnectorsPane(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  return (
    <div className="flex flex-col gap-3">
      {/* 自定义 MCP 条目：首次连接要在条目里点「信任」（真机文案 mcp.approvalRequired / mcp.approve） */}
      {shell.customConnectors.map((c) => (
        <div
          key={c.name}
          className={`sim-msg-rise rounded-[14px] border p-3.5 flex items-center gap-3 ${c.trusted ? 'border-accent-200 bg-white' : 'border-[#f6d7c2] bg-[#fffaf6]'}`}
        >
          <LetterIcon name={c.name} color="#3355e0" size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13.5px] text-[#111318] font-mono">{c.name}</span>
              <span className="text-[10.5px] px-1.5 rounded bg-[#f4f4f5] text-[#5c5f66]">自定义 MCP</span>
              {c.trusted && (
                <span className="inline-flex items-center gap-1 text-[11.5px] text-[#047857]">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> 已连接
                </span>
              )}
            </div>
            <div className="text-[12px] mt-0.5 text-[#6b7079]">
              {c.trusted ? c.tools : '第三方服务，WorkBuddy 未审核 · 首次连接此 MCP 服务需要您的信任确认。'}
            </div>
          </div>
          {!c.trusted && (
            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                onClick={kit.aside('拒绝', '来路不明、看不懂它要干什么的服务，就点拒绝。')}
                className="h-8 px-3 rounded-lg border-0 bg-[#f1f1ef] text-[12.5px] cursor-pointer"
              >
                拒绝
              </button>
              <button
                type="button"
                data-guided-target="mcp.trust"
                onClick={kit.click('mcp.trust', '信任', '这是你自己让 AI 写的、代码就在你的文件夹里，可以信任。')}
                className={`relative h-8 px-3 rounded-lg border-0 bg-[#111318] text-white text-[12.5px] font-semibold cursor-pointer ${kit.ring('mcp.trust')}`}
              >
                信任
                {kit.callout('mcp.trust', 'bottom', 'end')}
              </button>
            </div>
          )}
        </div>
      ))}

    <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3">
      {CONNECTORS.map((c) => {
        const connected = shell.connectedIds.includes(c.id);
        const isFeishu = c.id === 'feishu';
        const addTarget = isFeishu && !connected;
        const cardTarget = isFeishu && connected;
        return (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            data-guided-target={cardTarget ? 'connectors.card' : undefined}
            onClick={
              cardTarget
                ? kit.click('connectors.card', '飞书', '点开已连接的连接器，能看到它被授权了哪些功能。')
                : kit.aside(c.name, connected ? `<b>${c.name}</b> 已连接（绿点）。` : `点右上角 <b>+</b> 连接 ${c.name}，一般要扫码或登录授权。`)
            }
            className={`relative rounded-[14px] border border-[#ececea] bg-white hover:shadow-[0_6px_20px_rgba(17,19,24,0.08)] p-3.5 flex gap-3 cursor-pointer ${
              cardTarget ? kit.ring('connectors.card') : ''
            }`}
          >
            <LetterIcon name={c.name} color={c.color} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[13.5px] text-[#111318] truncate">{c.name}</span>
                {connected ? (
                  <span className="inline-flex items-center gap-1.5 shrink-0" title="已连接">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[11px] text-[#5c5f66]">💬</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    data-guided-target={addTarget ? 'connectors.add' : undefined}
                    onClick={
                      addTarget
                        ? kit.click('connectors.add', '连接飞书', '点 + 开始连接。')
                        : kit.aside(c.name, `这节课只连飞书。<b>${c.name}</b> 的连法一样：点 + → 授权 → 绿点。`)
                    }
                    className={`relative w-6 h-6 rounded-md border border-[#e6e6e3] bg-white text-[#4a4f57] text-[14px] inline-flex items-center justify-center cursor-pointer shrink-0 ${
                      addTarget ? kit.ring('connectors.add') : ''
                    }`}
                  >
                    +{addTarget && kit.callout('connectors.add', 'bottom', 'end')}
                  </button>
                )}
              </div>
              <div className="text-[12px] text-[#6b7079] line-clamp-1 mt-0.5">{c.desc}</div>
            </div>
            {cardTarget && kit.callout('connectors.card', 'bottom', 'start')}
          </div>
        );
      })}
    </div>
    </div>
  );
}

/* ====================== 浮层 ====================== */

/** 本页所有浮层：专家详情 / 技能详情 / 安装确认 / 添加技能菜单 / 扫码授权 / 连接器详情 / 添加 MCP 服务器 */
function ExtensionOverlays(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);

  const expert = shell.expertDetailId ? EXPERTS_PPT.find((e) => e.id === shell.expertDetailId) : null;
  const skill = shell.skillDetailId ? WPS_RESULTS.find((s) => s.id === shell.skillDetailId) : null;

  return (
    <>
      {/* 专家详情抽屉 */}
      {expert && (
        <Drawer>
          <div className="flex items-center gap-3">
            <LetterIcon name={expert.name} color={expert.color} size={48} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[16px] font-bold text-[#111318]">{expert.name}</span>
                {expert.official && <span className="text-[10px] px-1.5 rounded bg-[#eef2ff] text-[#3355e0] font-semibold">官方</span>}
              </div>
              <div className="text-[12px] text-[#8c9099] mt-0.5 inline-flex items-center gap-1">
                <BoltIcon size={11} /> 使用量 {expert.use}
              </div>
            </div>
          </div>
          <Section title="具体能力介绍">
            <ul className="list-disc pl-4 flex flex-col gap-1">
              {expert.abilities?.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </Section>
          <Section title="使用技能">
            <div className="flex flex-wrap gap-1.5">
              {expert.skills?.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-[#f4f4f5] text-[12px]">{s}</span>
              ))}
            </div>
          </Section>
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            <Meta label="行业分类" value={expert.tags[0]} />
            <Meta label="分享者" value={expert.author ?? '—'} />
            <Meta label="版本" value={expert.version ?? '—'} />
          </div>
          <button
            type="button"
            data-guided-target="experts.summon"
            onClick={kit.click('experts.summon', '立即召唤', '召唤后，专家会挂在输入框里，这次对话就按它的视角干活。')}
            className={`relative mt-auto h-10 rounded-[10px] border-0 bg-[#111318] text-white text-[13.5px] font-semibold cursor-pointer ${kit.ring('experts.summon')}`}
          >
            立即召唤
            {kit.callout('experts.summon', 'top', 'center')}
          </button>
        </Drawer>
      )}

      {/* 技能详情抽屉 */}
      {skill && (
        <Drawer>
          <div className="flex items-center gap-3">
            <LetterIcon name={skill.name} color={skill.color} size={48} />
            <div>
              <div className="text-[16px] font-bold text-[#111318]">{skill.name}</div>
              <div className="text-[12px] text-[#8c9099] mt-0.5 inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5"><DownloadIcon size={11} /> 下载量 {skill.downloads}</span>
                <span className="inline-flex items-center gap-0.5"><StarIcon size={11} /> 收藏量 {skill.stars}</span>
              </div>
            </div>
          </div>
          <Section title="简介">{skill.desc}</Section>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <Meta label="来源" value={skill.source ?? '—'} />
            <Meta label="License" value={skill.license ?? '—'} />
          </div>
          {shell.installedSkillIds.includes(skill.id) ? (
            <div className="mt-auto h-10 rounded-[10px] bg-[#ecfdf5] text-[#047857] text-[13.5px] font-semibold inline-flex items-center justify-center">
              ✓ 已安装
            </div>
          ) : (
            <button
              type="button"
              data-guided-target="skills.install"
              onClick={kit.click('skills.install', '安装', '确认来源靠谱再点安装。')}
              className={`relative mt-auto h-10 rounded-[10px] border-0 bg-[#111318] text-white text-[13.5px] font-semibold cursor-pointer ${kit.ring('skills.install')}`}
            >
              安装
              {kit.callout('skills.install', 'top', 'center')}
            </button>
          )}
        </Drawer>
      )}

      {/* 安装确认弹窗（真机文案） */}
      {shell.skillInstallConfirmOpen && skill && (
        <Modal width={360}>
          <div className="text-[15px] font-bold text-[#111318]">安装技能 {skill.name}？</div>
          <div className="text-[13px] text-[#5c5f66] mt-2">该技能包将被下载并安装到本地技能目录。</div>
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={kit.aside('取消', '不想装就取消，什么都不会发生。')} className="h-8 px-3.5 rounded-lg border-0 bg-[#f1f1ef] text-[13px] cursor-pointer">
              取消
            </button>
            <button
              type="button"
              data-guided-target="skills.installConfirm"
              onClick={kit.click('skills.installConfirm', '安装', '确认安装。')}
              className={`relative h-8 px-3.5 rounded-lg border-0 bg-[#111318] text-white text-[13px] font-semibold cursor-pointer ${kit.ring('skills.installConfirm')}`}
            >
              安装
              {kit.callout('skills.installConfirm', 'bottom', 'end')}
            </button>
          </div>
        </Modal>
      )}

      {/* 添加技能菜单（真机三项） */}
      {shell.addSkillMenuOpen && (
        <div className="sim-pop-up absolute right-5 top-14 z-30 w-[300px] rounded-[14px] bg-white border border-[#e6e6e3] shadow-[0_14px_36px_rgba(17,19,24,0.16)] p-1.5 flex flex-col">
          <button
            type="button"
            onClick={kit.aside('查找技能', '输入框会预填「请帮我查找并自动安装能「……」的skill」，让 AI 帮你搜并装上。')}
            className="text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-3 py-2.5 cursor-pointer"
          >
            <div className="text-[13.5px] font-semibold text-[#111318]">查找技能</div>
            <div className="text-[11.5px] text-[#8c9099] mt-0.5">让 AI 帮你找到并安装合适的技能</div>
          </button>
          <button
            type="button"
            onClick={kit.aside('上传技能', '上传一个文件夹或 .zip，里面必须有 <code>SKILL.md</code>，开头要写 <b>name</b> 和 <b>description</b>。上传前会做安全检测，带高风险操作的会被拦下。')}
            className="text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-3 py-2.5 cursor-pointer"
          >
            <div className="text-[13.5px] font-semibold text-[#111318]">上传技能</div>
            <div className="text-[11.5px] text-[#8c9099] mt-0.5">导入包含 SKILL.md 的文件夹或 .zip</div>
          </button>
          <button
            type="button"
            data-guided-target="skills.addMenu.create"
            onClick={kit.click('skills.addMenu.create', '创建技能', '用对话让 AI 帮你写一个技能。')}
            className={`relative text-left border-0 bg-transparent hover:bg-[#f4f4f5] rounded-lg px-3 py-2.5 cursor-pointer ${kit.ring('skills.addMenu.create')}`}
          >
            <div className="text-[13.5px] font-semibold text-[#111318]">创建技能</div>
            <div className="text-[11.5px] text-[#8c9099] mt-0.5">通过 AI 对话快速创建一个专属技能</div>
            {kit.callout('skills.addMenu.create', 'left', 'center')}
          </button>
        </div>
      )}

      {/* 连接器详情：可用功能 */}
      {shell.connectorDetailId === 'feishu' && (
        <Drawer>
          <div className="flex items-center gap-3">
            <LetterIcon name="飞书" color="#0f766e" size={48} />
            <div>
              <div className="text-[16px] font-bold text-[#111318]">飞书</div>
              <div className="text-[12px] text-[#047857] mt-0.5 inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> 已连接
              </div>
            </div>
          </div>
          <Section title="可用功能">
            <div className="flex flex-col gap-1.5">
              {FEISHU_CAPABILITIES.map((c) => (
                <div key={c.name} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${c.risk ? 'bg-[#fff6ef]' : 'bg-[#f7f7f6]'}`}>
                  <span className={c.risk ? 'text-[#9a3412] font-medium' : ''}>{c.name}</span>
                  <span className="text-[11px] text-[#047857]">可用</span>
                </div>
              ))}
            </div>
          </Section>
          <div className="flex gap-2 mt-auto">
            <button type="button" onClick={kit.aside('解除授权', '不用了就解除授权，WorkBuddy 就再也碰不到你的飞书。')} className="flex-1 h-9 rounded-[10px] border border-[#e6e6e3] bg-white text-[13px] cursor-pointer">
              解除授权
            </button>
            <button type="button" onClick={kit.aside('去试试', '会新开一个对话，并把飞书挂到输入框里。')} className="flex-1 h-9 rounded-[10px] border-0 bg-[#111318] text-white text-[13px] cursor-pointer">
              去试试
            </button>
          </div>
        </Drawer>
      )}

      {/* 添加 MCP 服务器（字段与说明用真机文案；表单只读预填，不让学员输入任何真实密钥） */}
      {shell.mcpFormOpen && <McpForm {...props} />}

    </>
  );
}

/** 「添加 MCP 服务器」表单：真机字段，只读预填 */
function McpForm(props: Props) {
  const { shell } = props;
  const kit = makeTargetKit(props);
  const filled = shell.mcpFormFilled;
  const path = '/Users/你的用户名/WorkBuddy-练习/weather-mcp/server.js';

  /** 一行只读字段 */
  const field = (label: string, value: string, placeholder: string, hint?: string) => (
    <div className="flex flex-col gap-1">
      <span className="text-[12.5px] font-semibold text-[#111318]">{label}</span>
      <div className={`h-8 px-2.5 rounded-lg border border-[#e6e6e3] flex items-center text-[12.5px] font-mono ${filled && value ? 'text-[#111318] bg-[#f7f9ff]' : 'text-[#b0b4bc] bg-white'}`}>
        {filled && value ? value : placeholder}
      </div>
      {hint && <span className="text-[11px] text-[#9ea3ad]">{hint}</span>}
    </div>
  );

  return (
    <Modal width={460}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-bold text-[#111318]">添加 MCP 服务器</div>
          <div className="text-[12px] text-[#8c9099] mt-1">填写服务器连接信息，保存后会自动刷新 MCP 服务列表。</div>
        </div>
        <span className="text-[11px] text-[#8c9099] border border-[#e6e6e3] rounded-md px-1.5 py-0.5">表单 | JSON</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {field('名称', 'my-weather', '例如：github-tools')}
        <div className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-[#111318]">传输类型</span>
          <div className="flex gap-1.5 text-[12px]">
            <span className={`px-2.5 py-1 rounded-md border ${filled ? 'border-accent-200 bg-accent-50 text-accent-700 font-semibold' : 'border-[#e6e6e3]'}`}>本地命令（stdio）</span>
            <span className="px-2.5 py-1 rounded-md border border-[#e6e6e3] text-[#8c9099]">远程 URL</span>
          </div>
        </div>
        {field('启动命令', 'node', '例如：npx')}
        {field('命令参数', path, '每行填写一个参数')}
        <div className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-[#111318]">环境变量</span>
          <div className="text-[11.5px] text-[#9ea3ad]">{filled ? '这个服务不需要 Key，不用填。需要 Key 的服务，Key 只填在这里，别写进提示词。' : '名称 = 值'}</div>
        </div>
        {field('工作目录', '', '选填', '选填，启动命令的运行目录；留空使用会话工作区')}
      </div>
      <div className="flex justify-between items-center gap-2 mt-5">
        {!filled ? (
          <button
            type="button"
            data-guided-target="mcp.fill"
            onClick={kit.click('mcp.fill', '按说明填好', '照着 AI 给的填写表填。')}
            className={`relative h-8 px-3.5 rounded-lg border border-accent-200 bg-accent-50 text-accent-700 text-[12.5px] font-semibold cursor-pointer ${kit.ring('mcp.fill')}`}
          >
            按 AI 给的说明填好（模拟）
            {kit.callout('mcp.fill', 'bottom', 'start')}
          </button>
        ) : (
          <span className="text-[11.5px] text-[#047857]">✓ 已按说明填好</span>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={kit.aside('取消', '关掉表单，什么都不会添加。')} className="h-8 px-3.5 rounded-lg border-0 bg-[#f1f1ef] text-[13px] cursor-pointer">
            取消
          </button>
          <button
            type="button"
            data-guided-target="mcp.submit"
            onClick={kit.click('mcp.submit', '添加', filled ? '点添加。' : '先把表单按说明填好。')}
            className={`relative h-8 px-3.5 rounded-lg border-0 text-white text-[13px] font-semibold cursor-pointer ${filled ? 'bg-[#111318]' : 'bg-[#c9ccd1]'} ${kit.ring('mcp.submit')}`}
          >
            添加
            {kit.callout('mcp.submit', 'bottom', 'end')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ====================== 小组件 ====================== */

/** 右侧滑入的详情抽屉 */
function Drawer({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 bg-black/10 flex justify-end" onClick={(e) => e.stopPropagation()}>
      <div className="sim-slide-in-panel w-[340px] h-full bg-white border-l border-[#ebebeb] shadow-[-12px_0_32px_rgba(17,19,24,0.12)] p-5 flex flex-col gap-4 text-[13px] text-[#2b2f36] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/** 居中弹窗 */
function Modal({ children, width }: { children: React.ReactNode; width: number }) {
  return (
    <div className="absolute inset-0 z-30 bg-black/20 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <div className="sim-pop-up rounded-[18px] bg-white shadow-[0_24px_60px_rgba(17,19,24,0.25)] p-5" style={{ width }}>
        {children}
      </div>
    </div>
  );
}

/** 抽屉里的小节 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[12.5px] font-semibold text-[#111318]">{title}</div>
      <div className="text-[12.5px] text-[#4a4f57] leading-[1.7]">{children}</div>
    </div>
  );
}

/** 抽屉里的键值小格 */
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f7f7f6] px-2.5 py-1.5">
      <div className="text-[10.5px] text-[#8c9099]">{label}</div>
      <div className="text-[12px] text-[#111318] font-medium truncate">{value}</div>
    </div>
  );
}

/** 排序切换（只改高亮，不影响课程） */
function SortBar({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-lg bg-[#f4f4f5] p-0.5 text-[12px] shrink-0">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(o);
          }}
          className={`border-0 px-2.5 py-1 rounded-md cursor-pointer ${value === o ? 'bg-white font-semibold text-[#111318] shadow-sm' : 'bg-transparent text-[#5c5f66]'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** 分类条：点了只解释，不真筛选（避免把课程要点的卡片筛没了） */
function CategoryChips({ items, onAside }: { items: string[]; onAside: ReturnType<typeof makeTargetKit>['aside'] }) {
  return (
    <div className="flex items-center gap-1.5 overflow-hidden text-[12.5px]">
      {items.map((c, i) => (
        <button
          key={c}
          type="button"
          onClick={onAside(c, `按分类筛选。真机点了会只看「${c}」类，这里先不筛，免得蓝圈要点的卡片被筛没。`)}
          className={`border-0 px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer ${i === 0 ? 'bg-[#f1f1ef] font-semibold text-[#111318]' : 'bg-transparent text-[#5c5f66] hover:bg-[#f7f7f6]'}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
