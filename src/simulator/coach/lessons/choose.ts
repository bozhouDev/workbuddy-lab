import type { ChatRunSpec, GuidedLessonDef, GuidedShellState, GuidedStep } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';
import { freeChat } from './freeChat';

/**
 * 3.7 怎么选：判断练习
 * 不做选择题：每个场景把任务放进输入框，学员自己用 + 挂上觉得合适的专家 / 技能 / 连接器（或什么都不挂），
 * 发出去后泊舟按他实际挂了什么点评。至少一个场景的正确答案是「什么都不挂」。
 * 专家、技能每个场景清空重挂；连接器开关是全局的，跨场景保留（和真机一致）。
 */

/** 当前挂着的专家名 */
const expertsOf = (s: GuidedShellState) => s.composerChips.filter((c) => c.kind === 'expert').map((c) => c.label);
/** 当前挂着的技能名 */
const skillsOf = (s: GuidedShellState) => s.composerChips.filter((c) => c.kind === 'skill').map((c) => c.label);
/** 飞书开关是否开着 */
const feishuOn = (s: GuidedShellState) => s.enabledConnectorIds.includes('feishu');
/** 名字列表拼成「A、B」 */
const names = (list: string[]) => list.map((n) => `<b>${n}</b>`).join('、');
/** 当前挂着的专家 + 技能，用作对话里用户消息上方的胶囊 */
const chipsOf = (s: GuidedShellState) => s.composerChips.filter((c) => c.kind === 'expert' || c.kind === 'skill');

/** 一个练习场景 */
interface Scenario {
  key: string;
  title: string;
  prompt: string;
  /** 按挂了什么生成对话结果 */
  chat: (s: GuidedShellState) => Omit<ChatRunSpec, 'id' | 'prompt' | 'model' | 'estimateText' | 'consumedText' | 'consumedDelta' | 'promptChips'>;
  /** 按挂了什么生成点评 */
  judge: (s: GuidedShellState) => string[];
}

const SCENARIOS: Scenario[] = [
  {
    key: 'translate',
    title: '把一句会议通知翻成英文',
    prompt: '把这句话翻成英文：「本周五下午三点在 3 楼会议室开季度复盘会，请大家提前准备各自的数据。」',
    chat: () => ({
      chatTitle: '练习 1 · 翻译',
      footerTip: '判断练习',
      elapsed: '4s',
      steps: [{ running: '翻译中…', done: '已完成' }],
      replyHtml:
        'The quarterly review meeting will be held at 3 p.m. this Friday in the 3rd-floor meeting room. Please prepare your data in advance.',
    }),
    judge: (s) => {
      const mounted = [...expertsOf(s), ...skillsOf(s)];
      const lines = mounted.length
        ? [
            `你挂了 ${names(mounted)}。翻一句话用不上它：结果和直接说差不多，挂着的东西还可能把它往别的方向带。`,
            '<b>这件活什么都不用挂</b>，直接说就行。',
          ]
        : ['你什么都没挂，<b>这就对了</b>。翻一句话是它本来就会的事，直接说就行。'];
      if (feishuOn(s)) lines.push('飞书开关也开着：不碍事，但这件活用不上。');
      return lines;
    },
  },
  {
    key: 'minutes',
    title: '每周一都要把周会录音整理成格式一样的纪要',
    prompt: '@周会录音转写.txt 整理成会议纪要。（这件事每周一都要做，格式要和上周一样）',
    chat: (s) => {
      const good = skillsOf(s).includes('会议纪要整理');
      return {
        chatTitle: '练习 2 · 周会纪要',
        footerTip: '判断练习',
        elapsed: '15s',
        steps: [{ running: '读取 周会录音转写.txt…', done: '已整理' }],
        replyHtml: good
          ? '| 决议 | 待办 | 负责人 | 截止 |\n| --- | --- | --- | --- |\n| 12 月活动预算定 3 万 | 出活动方案 | 小周 | 周三 |\n| 报名页周四提测 | 测试报名流程 | 阿林 | 周四 |'
          : '本次周会主要讨论了 12 月活动预算和报名页进度，预算定为 3 万，报名页计划周四提测，小周负责活动方案，阿林负责测试。',
      };
    },
    judge: (s) => {
      const sk = skillsOf(s);
      const ex = expertsOf(s);
      if (sk.includes('会议纪要整理')) {
        const lines = ['<b>挑对了</b>。每周都做、格式要一样，正是技能的活：格式写在技能里，每周都照着来。想更贴合你们团队的格式，可以照技能那节做日报技能的办法，自己做一个。'];
        if (ex.length) lines.push(`另外挂的 ${names(ex)} 可以去掉：格式一致靠技能，用不上专家视角。`);
        return lines;
      }
      if (sk.length) return [`你挂了 ${names(sk)} 技能，它干的活和整理纪要对不上。这件活该挂 <b>会议纪要整理</b>（+ → 技能 里有），或自己做一个。`];
      if (ex.length)
        return [`你只挂了专家 ${names(ex)}。专家管视角，管不了「每周格式都一样」，这要靠技能把格式写死。该挂的是 <b>会议纪要整理</b> 技能。`];
      return [
        '什么都不挂也能整理，你看它交了一段话。要每周格式一样，就得每周重新交代一遍，这正是技能那节说的「说到第二遍」。',
        '这件活该用技能：+ → 技能 里的 <b>会议纪要整理</b>，或自己做一个。',
      ];
    },
  },
  {
    key: 'contract',
    title: '看看一份外包合同有没有对你不利的条款',
    prompt: '@外包服务合同.pdf 帮我看看这份合同有没有对我们不利的条款。',
    chat: (s) => {
      const good = expertsOf(s).includes('合同审查顾问');
      return {
        chatTitle: '练习 3 · 审合同',
        footerTip: '判断练习',
        elapsed: '22s',
        steps: [{ running: '读取 外包服务合同.pdf…', done: '已读取 12 页' }],
        replyHtml: good
          ? '按条款逐条过了一遍，标出 3 处：\n\n1. 不利条款 · 第 5.2 条：验收标准只写「甲方满意」，没有可量化的标准\n2. 不利条款 · 第 8 条：违约金只约束乙方，甲方延迟付款没有对应条款\n3. 缺失条款：没有约定交付物的知识产权归属\n\n以上仅供参考，金额较大的合同建议请律师复核。'
          : '看了一遍，有两处要注意：\n\n1. 第 5.2 条验收标准只写「甲方满意」，太模糊，建议写明可量化的标准\n2. 第 8 条违约金只约束了乙方，甲方延迟付款没有对应条款\n\n建议和对方确认后再签，以上仅供参考。',
      };
    },
    judge: (s) => {
      const ex = expertsOf(s);
      if (ex.includes('合同审查顾问'))
        return [
          '<b>挑对了</b>。它的能力介绍就是逐条标出不利条款和缺失条款，和这件活对得上。',
          '但要记住：<b>结果只做参考</b>，金额大的合同还是要请律师过一遍。',
        ];
      if (ex.length) return [`你挂的是 ${names(ex)}，视角和审合同对不上。+ → 专家 里有 <b>合同审查顾问</b>，这件活该挂它。`];
      return [
        '没挂专家也看出了验收标准和违约金两处问题，这件活不挂也能做。',
        '想按审合同的套路系统地过一遍（逐条看不利条款，再查有没有缺的条款），+ → 专家 里的 <b>合同审查顾问</b> 视角正好对口。不管挂不挂，结果都只做参考。',
      ];
    },
  },
  {
    key: 'feishu-weekly',
    title: '汇总飞书「周报」文件夹里本周 5 个人的周报',
    prompt: '把飞书「周报」文件夹里本周 5 个人的周报汇总成一份，列出每人完成了什么。',
    chat: (s) =>
      feishuOn(s)
        ? {
            chatTitle: '练习 4 · 飞书周报汇总',
            footerTip: '判断练习',
            elapsed: '19s',
            steps: [
              { running: '飞书：搜索「周报」文件夹…', done: '找到本周 5 份周报' },
              { running: '读取并汇总…', done: '已汇总' },
            ],
            replyHtml:
              '| 成员 | 本周完成 |\n| --- | --- |\n| 小周 | 活动方案初稿 |\n| 阿林 | 报名页提测 |\n| 老陈 | 茶歇供应商确认 |\n| 小米 | 用户反馈归类 48 条 |\n| 大卫 | 海报定稿 |',
          }
        : {
            chatTitle: '练习 4 · 飞书周报汇总',
            footerTip: '判断练习',
            elapsed: '3s',
            steps: [{ running: '查找可用的飞书工具…', done: '没有可用的飞书连接' }],
            replyHtml: '{{wrong:我现在访问不了你的飞书。}}可以把 5 份周报的内容粘贴过来，或者先打开飞书连接器。',
          },
    judge: (s) => {
      const sk = skillsOf(s);
      if (feishuOn(s)) {
        const lines = ['<b>对了</b>。打开飞书，它才拿得到你飞书里的周报。话里也说清了范围：「周报」文件夹、本周、5 个人，它不用满飞书乱翻。'];
        if (sk.length || expertsOf(s).length) lines.push(`另外挂的 ${names([...expertsOf(s), ...sk])} 这次用不上，可以不挂。`);
        return lines;
      }
      const lines = ['飞书没打开，它<b>读不到</b>你飞书里的东西，只能让你自己复制粘贴。下一个场景也要用飞书：先点 <b>+ → 连接器</b> 把它打开。'];
      if (sk.length) lines.push('挂技能解决不了「读不到」：<b>技能管怎么做，连接器管拿得到</b>。');
      return lines;
    },
  },
  {
    key: 'feishu-ppt',
    title: '用飞书里本周的周报，做一份能在 WPS 里改的汇报 PPT',
    prompt: '用飞书「周报」文件夹里本周的周报，做一份能在 WPS 里改的汇报 PPT。',
    chat: (s) => {
      const sk = skillsOf(s);
      if (!feishuOn(s))
        return {
          chatTitle: '练习 5 · 周报做 PPT',
          footerTip: '判断练习',
          elapsed: '3s',
          steps: [{ running: '查找可用的飞书工具…', done: '没有可用的飞书连接' }],
          replyHtml: '{{wrong:我现在访问不了你的飞书。}}可以把周报内容粘贴过来，或者先打开飞书连接器。',
        };
      const web = sk.includes('网页 PPT（演讲版）') && !sk.includes('WPS Office 全家桶') && !sk.includes('pptx');
      return {
        chatTitle: '练习 5 · 周报做 PPT',
        footerTip: '判断练习',
        elapsed: '52s',
        steps: [
          { running: '飞书：读取本周 5 份周报…', done: '已读取' },
          { running: web ? '生成演讲网页…' : '写入演示文稿…', done: web ? '已写入 本周汇报_演讲版.html' : '已写入 本周汇报.pptx' },
        ],
        replyHtml: web
          ? '已完成，共 6 页。{{wrong:交付文件是 本周汇报_演讲版.html，用浏览器打开演示}}。'
          : '已完成，共 6 页：本周完成、各人进展、风险、下周计划。交付文件是 本周汇报.pptx，用 WPS 打开就能改。',
        fileCard: web
          ? { name: '本周汇报_演讲版.html', meta: '6 页 · 网页', warn: true }
          : { name: '本周汇报.pptx', meta: '6 页 · 可用 WPS 修改' },
      };
    },
    judge: (s) => {
      const sk = skillsOf(s);
      const ex = expertsOf(s);
      const lines: string[] = [];
      if (!feishuOn(s)) lines.push('飞书没开，周报都读不到。这件活<b>先得拿到资料</b>，真用的时候先在 + → 连接器 打开飞书。');
      if (sk.includes('WPS Office 全家桶') || sk.includes('pptx')) {
        lines.push(`技能挑对了：${names(sk.filter((n) => n === 'WPS Office 全家桶' || n === 'pptx'))} 交出能改的 .pptx。`);
      } else if (sk.includes('网页 PPT（演讲版）')) {
        lines.push('<b>网页 PPT（演讲版）</b> 交出的是网页，WPS 里改不了，技能那节踩过这个坑。要能改，挂 <b>WPS Office 全家桶</b>。');
      } else if (feishuOn(s)) {
        lines.push('这次没挂技能，它也交出了 .pptx。但没点名时用哪个技能是它自己挑的；交付格式要紧，<b>自己选上</b> WPS Office 全家桶，或直接说「用 X 技能」，更稳。');
      }
      if (ex.includes('PPT制作专家')) lines.push('<b>PPT制作专家</b> 可挂可不挂：想让它顺便把关页面结构就挂上。');
      else if (ex.length) lines.push(`挂的 ${names(ex)} 和做汇报 PPT 关系不大，可以去掉。`);
      if (feishuOn(s) && (sk.includes('WPS Office 全家桶') || sk.includes('pptx')))
        lines.unshift('<b>这件活要两样一起用</b>：连接器拿资料，技能定交付格式。你两样都挂对了。');
      return lines;
    },
  },
];

/** 把一个场景展开成「挂东西 + 发送」和「看点评」两步 */
function scenarioSteps(sc: Scenario, idx: number): GuidedStep[] {
  const isLast = idx === SCENARIOS.length - 1;
  return [
    {
      id: `${sc.key}-send`,
      phase: idx === 0 ? 1 : 2,
      onEnter: () => ({ view: 'home', composerText: sc.prompt, composerChips: [], popover: null, freeMount: true }),
      say: [
        `<b>场景 ${idx + 1} / ${SCENARIOS.length}</b>：${sc.title}。`,
        idx === 0
          ? '任务已经放进输入框。点左下角 <b>+</b>，在 专家 / 技能 / 连接器 里挂上你觉得合适的（点一下挂上，再点一下取下），<b>也可以什么都不挂</b>。想好了就发送。'
          : '专家和技能我清空了，连接器开关是全局的，保持你上次的状态。挂好再发送。',
      ],
      wait: { target: 'composer.send', callout: '挂好了就发送', label: `发送（场景 ${idx + 1}）` },
      runChat: (s) => freeChat({ id: `choose-${sc.key}`, prompt: sc.prompt, promptChips: chipsOf(s), ...sc.chat(s) }),
    },
    {
      id: `${sc.key}-judge`,
      phase: 2,
      sayFrom: (s) => [
        ...sc.judge(s),
        // 最后一个场景练完，提醒关掉全局的飞书开关
        ...(isLast && feishuOn(s) ? ['练完了。飞书开关还开着，它是<b>全局</b>的，不用了记得在 <b>+ → 连接器</b> 里关掉。'] : []),
      ],
      say: [],
      buttons: [{ label: isLast ? '看总结' : '下一个场景', primary: true }],
    },
  ];
}

export const chooseLesson: GuidedLessonDef = {
  id: 'choose',
  code: '3.7',
  title: '怎么选：判断练习',
  guideUrl: '/features/extend/choose/',
  initialState: () =>
    createBaseGuidedState({
      selectedGroup: 'WorkBuddy-练习',
      selectedModel: 'Hy4 flash',
      freeMount: true,
      // 接着前几节：飞书已接好（开关关着）、WPS 已装、日报技能已做好
      connectedIds: ['feishu'],
      installedSkillIds: ['wps-b'],
      customSkills: ['每日工作日报'],
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '专家、技能、连接器都学完了。最后练<b>怎么选</b>：5 个场景，每个我把任务放进输入框，<b>你自己决定挂什么</b>，发出去以后我按你挂的点评。',
        '没有「挂得越多越好」，有的场景正确答案就是<b>什么都不挂</b>。',
      ],
      buttons: [{ label: '开始练习', primary: true }],
    },
    ...SCENARIOS.flatMap((sc, i) => scenarioSteps(sc, i)),
    {
      id: 'summary',
      phase: 3,
      onEnter: () => ({ freeMount: false, composerChips: [], composerText: '' }),
      say: ['挂之前先问一句：<b>它这次缺的是什么？</b>'],
      card: {
        kind: 'table',
        title: '缺什么，挂什么',
        headers: ['它缺的', '挂什么', '例子'],
        rows: [
          ['什么都不缺', '什么都不挂，直接说', '翻译、改一句话、问个概念'],
          ['固定的做法（反复做）', '技能', '每周纪要、日报、固定格式的 PPT'],
          ['内行的视角', '专家', '审合同、改汇报大纲'],
          ['拿不到资料', '连接器', '读飞书文档、多维表格'],
        ],
      },
      after: [
        '缺几样就挂几样，比如飞书周报做 PPT 就是连接器 + 技能。挂完第一次<b>拿小样本试</b>，不合适就移除。',
      ],
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
