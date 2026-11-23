import type { ComposerChip, GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/** 在对话里发起飞书授权（与图文实测流程一致） */
const AUTH_PROMPT = '帮我认证飞书';
/** 第一次试读：只读、小范围 */
const PROBE_PROMPT = '用飞书列出我最近更新的 5 篇文档的名称和更新时间，不要修改任何文档。';
/** 不说范围的说法 */
const VAGUE_PROMPT = '用飞书帮我整理一下项目资料。';
/** 按 5 件事说清楚：哪个服务 / 找什么 / 时间范围 / 做什么 / 结果放哪 */
const GOOD_PROMPT =
  '用飞书，只在「读书会项目」文件夹里，找 11-17 到 11-21 这周更新的周报，按 进展 / 风险 / 下周计划 三栏汇总；只读不改，结果存成本地 本周周报汇总.md。';
const FEISHU_CHIP: ComposerChip[] = [{ kind: 'connector', label: '飞书' }];

export const connectorsLesson: GuidedLessonDef = {
  id: 'connectors',
  code: '3.5',
  title: '连接器：接飞书',
  guideUrl: '/features/extend/connectors/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      composerText: '',
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '连接器是<b>一个授权通道</b>，让它读得到飞书、QQ邮箱、腾讯文档里的东西。它只管<b>拿得到什么</b>，不管怎么做。',
        '这节用飞书走一整圈：<b>安装 → 授权 → 看清给了它什么权限 → 在对话里打开开关 → 小范围试读 → 说清范围再用 → 用完关掉</b>。先去装。',
      ],
      buttons: [{ label: '去装飞书', primary: true }],
    },
    {
      id: 'open-ext',
      phase: 1,
      navLabel: '专家·技能·连接器',
      say: [],
      wait: { target: 'nav.extensions', callout: '点这里进入', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'skills' }),
    },
    {
      id: 'tab-connectors',
      phase: 1,
      navLabel: '连接器',
      say: [],
      wait: { target: 'ext.tab.connectors', callout: '点「连接器」', label: '连接器' },
      onAction: () => ({ extTab: 'connectors' }),
    },
    {
      id: 'add-feishu',
      phase: 1,
      navLabel: '安装飞书',
      say: [
        '每张卡右上角的 <b>+</b> 就是安装。飞书、钉钉、企业微信、QQ邮箱这些常用的都有现成的。点飞书卡片上的 +。',
      ],
      wait: { target: 'connectors.add', callout: '点 + 安装飞书', label: '安装飞书' },
      onAction: (s) => ({
        connectedIds: s.connectedIds.includes('feishu') ? s.connectedIds : [...s.connectedIds, 'feishu'],
        toast: '「飞书」已连接',
      }),
    },
    {
      id: 'auth-chat',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: AUTH_PROMPT, composerChips: [] }),
      say: [
        '飞书卡片亮起<b>绿点</b>（悬停显示「已连接」），旁边的对话小图标是「去试试」。',
        '但这只是装好了，<b>你的飞书账号还没授权给它</b>。最省事的做法：回到对话里直接说一句「帮我认证飞书」，它会在对话里给你一个二维码。我已经回到首页填好了，发送。',
      ],
      wait: { target: 'composer.send', callout: '在对话里发起认证', label: '发送（帮我认证飞书）' },
      runChat: () =>
        freeChat({
          id: 'connectors-auth',
          prompt: AUTH_PROMPT,
          chatTitle: '认证飞书',
          footerTip: '授权在对话里完成，用手机飞书扫码',
          elapsed: '4s',
          steps: [{ running: '调用 飞书 · 发起授权…', done: '已生成授权二维码' }],
          replyHtml: '请用手机飞书扫描下面的二维码，在手机上确认授权。授权完成后告诉我一声。',
          actionCard: {
            icon: 'qr',
            title: '扫码授权飞书',
            meta: '模拟二维码，扫不了；真机用手机飞书扫码并同意',
            buttonLabel: '我已扫码（模拟）',
          },
        }),
    },
    {
      id: 'qr-done',
      phase: 1,
      say: ['真机里用飞书 App 扫这个码，在手机上点同意就通了。<b>这里的码是模拟的</b>，点卡片上的「我已扫码（模拟）」。'],
      wait: { target: 'chat.actionCard', callout: '假装扫好了', label: '我已扫码（模拟）' },
    },
    {
      id: 'back-ext',
      phase: 1,
      navLabel: '回连接器页',
      say: ['授权好了。接完别急着用，先回连接器页看看<b>你到底授权给了它什么</b>。'],
      wait: { target: 'nav.extensions', callout: '回连接器页', label: '专家·技能·连接器' },
      onAction: () => ({ view: 'extensions', extTab: 'connectors' }),
    },
    {
      id: 'detail',
      phase: 1,
      navLabel: '看权限',
      say: [],
      wait: { target: 'connectors.card', callout: '点开看可用功能', label: '飞书详情' },
      onAction: () => ({ connectorDetailId: 'feishu' }),
    },
    {
      id: 'read-caps',
      phase: 1,
      say: [
        '「可用功能」就是它能替你做的事，比如读文档、创建文档、往多维表格里录数据。<b>授权给了它什么，它就真能做什么</b>；像橙色的发送消息，发出去就收不回来，用之前要让它先列清单给你确认。',
      ],
      buttons: [{ label: '看懂了，去对话里用它', primary: true }],
    },
    {
      id: 'open-plus',
      phase: 1,
      navLabel: '+',
      onEnter: () => ({ view: 'home', connectorDetailId: null, composerText: PROBE_PROMPT, composerChips: [], popover: null }),
      say: ['装好、授权好，还差一步：<b>在对话里把它打开</b>。回到首页，点输入框左下角的 <b>+</b>。'],
      wait: { target: 'composer.plus', callout: '点 +', label: '+' },
      onAction: () => ({ popover: 'plus', plusSubmenu: 'mode' }),
    },
    {
      id: 'plus-connectors',
      phase: 1,
      navLabel: '连接器',
      say: [],
      wait: { target: 'plusMenu.connectors', callout: '点「连接器」', label: '连接器' },
      onAction: () => ({ plusSubmenu: 'connectors' }),
    },
    {
      id: 'toggle-feishu',
      phase: 1,
      navLabel: '打开飞书',
      say: [
        '这个列表和真机一样：<b>已经接好的显示开关</b>，没接的显示「连接」，最底下「管理连接器」回到刚才那页。把飞书的开关打开。',
      ],
      wait: { target: 'plusMenu.toggleFeishu', callout: '打开飞书', label: '飞书开关' },
      onAction: (s) => ({
        enabledConnectorIds: s.enabledConnectorIds.includes('feishu') ? s.enabledConnectorIds : [...s.enabledConnectorIds, 'feishu'],
        popover: null,
      }),
    },
    {
      id: 'run-probe',
      phase: 2,
      say: [
        '输入框底栏多了飞书图标。<b>注意：这个开关是全局的</b>，打开以后所有对话都能用飞书，直到你回来关掉。',
        '第一次用，先做一个<b>只读、小范围</b>的试读，确认它读得对。句子已经放好了，发送。',
      ],
      wait: { target: 'composer.send', callout: '只读小范围试读', label: '发送（试读）' },
      runChat: () =>
        freeChat({
          id: 'connectors-probe',
          prompt: PROBE_PROMPT,
          promptChips: FEISHU_CHIP,
          chatTitle: '① 飞书试读 · 最近 5 篇',
          footerTip: '第一次先只读、小范围，确认它读得对',
          elapsed: '6s',
          steps: [{ running: '调用 飞书 · 搜索文档（按更新时间）…', done: '调用 飞书 · 搜索文档：返回 5 条' }],
          replyHtml:
            '最近更新的 5 篇（未做任何修改）：\n\n| 文档 | 更新时间 |\n| --- | --- |\n| 读书会项目周报 W47 | 11-21 18:02 |\n| 读书会项目周报 W46 | 11-14 17:40 |\n| 12 月选书投票 | 11-13 21:15 |\n| 场地对比表 | 11-12 10:08 |\n| 茶歇供应商报价 | 11-10 16:33 |\n\n{{ok:只读取了列表，没有打开或修改文档内容。}}',
        }),
    },
    {
      id: 'run-vague',
      phase: 1,
      onEnter: () => ({ view: 'home', composerText: VAGUE_PROMPT }),
      say: [
        '读得准，说明连接没问题。接下来很多人会犯的错：<b>不说范围，让它「整理一下」</b>。发出去看看。',
      ],
      wait: { target: 'composer.send', callout: '不说范围直接发', label: '发送（不说范围）' },
      runChat: () =>
        freeChat({
          id: 'connectors-vague',
          prompt: VAGUE_PROMPT,
          promptChips: FEISHU_CHIP,
          chatTitle: '② 不说范围 · 整理项目资料',
          footerTip: '不说范围，它会把能读到的都读一遍',
          elapsed: '6m 12s',
          hideMarksInitially: true,
          steps: [
            { running: '调用 飞书 · 搜索文档「项目」…', done: '调用 飞书 · 搜索文档：返回 186 条' },
            { running: '逐篇读取…', done: '已读取 186 篇文档' },
          ],
          replyHtml:
            '已整理项目资料，共涉及 {{wrong:186 篇文档}}：\n\n- 读书会项目（23 篇）\n- {{wrong:2024 年部门年会筹备（41 篇）}}\n- {{wrong:同事共享给你的「华东区销售复盘」（67 篇）}}\n- 其他（55 篇）\n\n已生成 项目资料整理.md。',
        }),
    },
    {
      id: 'ask-vague',
      phase: 2,
      say: ['跑了 6 分多钟，交出一份大杂烩。<b>问题出在哪？</b>'],
      buttons: [{ label: '标出问题', primary: true }],
    },
    {
      id: 'reveal-vague',
      phase: 2,
      revealMarksOnEnter: true,
      say: [
        '看左边橙色标出的几处：它<b>把你能看到的 186 篇都翻了一遍</b>，去年的年会、同事共享给你的销售复盘全混进来了。授权给它的账号能看到的，它<b>都有可能翻进来</b>。',
      ],
      buttons: [{ label: '好，说清范围再发一次', primary: true }],
    },
    {
      id: 'run-good',
      phase: 2,
      onEnter: () => ({ view: 'home', composerText: GOOD_PROMPT }),
      say: [
        '用连接器要说清 <b>5 件事</b>：哪个服务、找什么、时间范围、做什么、结果放哪。我按这个改好了，再发一次。',
      ],
      wait: { target: 'composer.send', callout: '说清范围再发', label: '发送（说清范围）' },
      runChat: () =>
        freeChat({
          id: 'connectors-good',
          prompt: GOOD_PROMPT,
          promptChips: FEISHU_CHIP,
          chatTitle: '③ 说清范围 · 本周周报汇总',
          footerTip: '在左侧 最近 里点 ② 和 ③ 对比',
          elapsed: '28s',
          steps: [
            { running: '调用 飞书 · 搜索文档（读书会项目 · 11-17~11-21）…', done: '调用 飞书 · 搜索文档：返回 2 条' },
            { running: '读取周报…', done: '已写入 本周周报汇总.md' },
          ],
          replyHtml:
            '本周「读书会项目」有 2 份周报，已汇总：\n\n| 进展 | 风险 | 下周计划 |\n| --- | --- | --- |\n| 场地已订，海报定稿 | 拍照负责人还没定 | 周四前出开场 PPT |\n\n{{ok:只读了这 2 份，没有改动飞书里的任何文档。}}',
          fileCard: { name: '本周周报汇总.md', meta: '三栏 · 来源 2 份周报' },
        }),
    },
    {
      id: 'off-plus',
      phase: 2,
      navLabel: '+',
      onEnter: () => ({ view: 'home', composerText: '', popover: null }),
      say: [
        '同一个飞书，说清范围之后：<b>只读 2 份、28 秒、结果干净</b>。',
        '最后一件事：开关是全局的，<b>这节练完就把它关掉</b>，免得以后做别的任务时它也去翻你的飞书。点 <b>+</b>。',
      ],
      wait: { target: 'composer.plus', callout: '点 +', label: '+' },
      onAction: () => ({ popover: 'plus', plusSubmenu: 'mode' }),
    },
    {
      id: 'off-connectors',
      phase: 2,
      navLabel: '连接器',
      say: [],
      wait: { target: 'plusMenu.connectors', callout: '点「连接器」', label: '连接器' },
      onAction: () => ({ plusSubmenu: 'connectors' }),
    },
    {
      id: 'off-feishu',
      phase: 2,
      navLabel: '关掉飞书',
      say: [],
      wait: { target: 'plusMenu.toggleFeishu', callout: '关掉飞书', label: '飞书开关' },
      onAction: (s) => ({
        enabledConnectorIds: s.enabledConnectorIds.filter((id) => id !== 'feishu'),
        popover: null,
        toast: '飞书已关闭，授权还在，下次用时再打开',
      }),
    },
    {
      id: 'summary',
      phase: 3,
      say: ['底栏的飞书图标没了。授权还在，下次要用时在 <b>+ → 连接器</b> 里再打开就行。'],
      card: {
        kind: 'compare',
        title: '同一个连接器，两种说法',
        leftLabel: '② 只说「整理一下」',
        leftTone: 'warn',
        leftHtml: '翻了 186 篇，混进去年的、别人的资料，跑了 6 分多钟。',
        rightLabel: '③ 说清 5 件事',
        rightTone: 'ok',
        rightHtml: '<b>只读 2 份本周周报</b>，按三栏汇总，28 秒。',
      },
      after: [
        '用连接器记住 4 条：<b>① 在 + → 连接器 里打开开关它才会用；开关是全局的，用完就关</b>；<b>② 刚接上先做只读、小范围的试读</b>；<b>③ 删除、发消息、发邮件这类收不回的动作，提示词里写死「先列清单给我确认」</b>；<b>④ 彻底不用了，在详情里点「解除授权」</b>。',
      ],
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
