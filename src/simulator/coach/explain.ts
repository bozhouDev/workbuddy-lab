import type { AreaId, CoachActionId } from './types';

export interface ExploreAreaDef {
  id: AreaId;
  title: string;
  shortHint: string;
  callout: string;
  actions: CoachActionId[];
  coachReply: string;
}

/**
 * 第 1 课「0.4 认识界面」7 大首页核心探索区 + 右侧产物区 = 与 01-新手入门.md 8 块 1:1 对齐
 */
export const EXPLORE_AREAS: readonly ExploreAreaDef[] = [
  {
    id: 'nav',
    title: '左侧入口与发现应用',
    shortHint: '版本号、6 大功能导航与腾讯生态',
    callout: '点「发现应用」或「发现」',
    actions: ['discoverApps', 'discover', 'extensions'],
    coachReply:
      '左上角看版本号 <b>5.11.3</b> 和<b>发现应用</b>；左侧 6 项是全局大入口（新建任务、助理、专家·技能·连接器、定时任务、资料库），点开<b>发现</b>能看到腾讯文档、ima、乐享知识库和自定义菜单。',
  },
  {
    id: 'historyGroups',
    title: '「最近」与左侧「分组」',
    shortHint: '找历史聊天记录、按项目收拢对话',
    callout: '点「最近」或「分组」',
    actions: ['recent', 'groupsList'],
    coachReply:
      '<b>最近</b>按时间列出你跑过的历史聊天记录，想回头接着改直接点进去；<b>分组</b>就是一个项目文件夹，把同一件事的所有对话和成品收在一起，清清爽爽。',
  },
  {
    id: 'avatar',
    title: '左下角头像与通知',
    shortHint: '积分余额、设置、记忆与连手机',
    callout: '点左下角头像',
    actions: ['avatar', 'notify', 'mobileConnect'],
    coachReply:
      '90% 的账号和配置都藏在<b>头像</b>里：套餐与积分余额、<b>Buddy加油站</b>、<b>成长计划</b>、<b>设置</b>、还有<b>记忆与进化</b>；旁边铃铛看任务完成通知，最右边可扫码连手机端。',
  },
  {
    id: 'quickTags',
    title: '快捷场景标签',
    shortHint: '点击切换推荐模板，但不是必选',
    callout: '点任意场景标签',
    actions: ['quickTags'],
    coachReply:
      '点一下标签它会变黑、下面的推荐任务也会跟着换——但它<b>不是必选分类</b>，只是内置提示词模板。平时不点也能直接在输入框里说人话。',
  },
  {
    id: 'plus',
    title: '输入框左下角 +',
    shortHint: '加文件、切模式、选专家技能',
    callout: '点输入框 + 号',
    actions: ['plus'],
    coachReply:
      '发任务 90% 的操作都在输入框里：<b>+</b> 是向上弹的两级菜单，加文件、切 Plan/Ask 模式都在这；打 <b>@</b> 引用分组文件，打 <b>/</b> 调技能，右下角选模型和发送。',
  },
  {
    id: 'group',
    title: '选择分组（框下方）',
    shortHint: '动手前先选文件夹，别漏看',
    callout: '点「选择分组」',
    actions: ['group'],
    coachReply:
      '<b>新手第一个坑就在这</b>：输入框下面这个「选择分组」决定它去哪读资料、成品存哪。不选分组直接发任务，生成完文件很难找。记住：<b>动手前，先选分组</b>。',
  },
  {
    id: 'permission',
    title: '默认权限（框下方）',
    shortHint: '新手保持关闭，别开完全访问',
    callout: '点「默认权限」',
    actions: ['permission'],
    coachReply:
      '这里决定它动你电脑前要不要先问你。点开里面有个「<b>允许完全访问</b>」开关，<b>新手一直保持关闭（默认权限）</b>，别手滑打开。',
  },
];

export const ACTION_LABEL: Record<CoachActionId, string> = {
  discoverApps: '发现应用',
  newTask: '新建任务',
  assistant: '助理',
  extensions: '专家·技能·连接器',
  schedule: '定时任务',
  library: '资料库',
  discover: '发现',
  recent: '最近',
  groupsList: '分组列表',
  avatar: '左下角头像',
  notify: '通知铃铛',
  mobileConnect: '连接手机端',
  quickTags: '快捷场景标签',
  plus: '+ 菜单',
  model: '模型选择',
  voice: '语音输入',
  send: '发送',
  group: '选择分组',
  permission: '默认权限',
  suggestions: '首页推荐任务',
};

/**
 * 用户点到非当前目标控件时，泊舟的实时解释（点哪讲哪）
 */
export const ASIDE_EXPLAIN: Record<CoachActionId, string> = {
  discoverApps: '「<b>发现应用</b>」里能搜到美图设计室、财税和投研这类垂直行业应用，有对应需求时再逛。',
  newTask: '「<b>新建任务</b>」会开一个干净的新对话。换一件新事就点它，能省不少积分。',
  assistant: '「<b>助理（BETA）</b>」用来配手机微信遥控电脑，第 4 章自动化里细讲。',
  extensions: '「<b>专家·技能·连接器</b>」是给 WorkBuddy 请专业角色、装插件、连飞书/腾讯文档的地方，第 3 章讲。',
  schedule: '「<b>定时任务</b>」让它每天或每周到点自动跑重复工作，第 4 章讲。',
  library: '「<b>资料库</b>」统一存参考资料，生成的图片、文档默认也会收进这里，第 3 章讲。',
  discover: '「<b>发现</b>」里集中了项目、邮箱、腾讯文档、ima、乐享知识库，还能自定义左侧显示哪些项。',
  recent: '「<b>最近</b>」按时间列出你跑过的历史任务，想接着改直接点进去。',
  groupsList: '这里列出你已经关联好的项目分组，同一件事的对话和文件全收在一起。',
  avatar: '点左下角<b>头像</b>能看积分余额、领 Buddy加油站福利、进设置和记忆与进化。',
  notify: '这是<b>通知铃铛</b>，复杂任务跑完会在这提醒你回来验收。',
  mobileConnect: '最右下角这个图标点开可以<b>扫码连手机端</b>（支持 App 和微信小程序），第 4 章讲。',
  quickTags: '这一排只是内置场景模板，<b>不用每次先点分类</b>，直接往输入框说就行。',
  plus: '左下角 <b>+</b> 菜单可以添加本地/云端文件、切换默认/Plan/Ask 模式、挂载专家和技能。',
  model: '这是<b>模型选择</b>：不同模型消耗积分倍率不一样（Hy4 flash 限时免费 0.00x），第 1 章「模型与积分」细讲。',
  voice: '这是<b>语音输入</b>，懒得打字时可以直接口述任务。',
  send: '这是<b>发送按钮</b>，填好任务并确认好左下角分组和权限后点它开始干活。',
  group: '这是<b>选择分组</b>：决定它去哪个本地文件夹读资料、成品存去哪，发任务前一定瞄一眼。',
  permission: '这是<b>默认权限</b>：涉及删文件或敏感目录前会先弹审批窗，新手别开「允许完全访问」。',
  suggestions: '输入框下面这几条是官方的「首页任务推荐」，嫌占地方可以在「设置 → 个性化」里关掉。',
};

export const DEMO_PROMPT_TEXT =
  '帮我整理一份 WorkBuddy 新手 3 步上手清单，保存到当前分组的 新手清单.md';

export const DEMO_REPLY_TEXT =
  '已按 3 步结构整理好上手清单，并写入到 WorkBuddy-练习 分组下的 新手清单.md。你可以直接在右侧产物区核对内容。';

export const DEMO_ARTIFACT_LINES = [
  { heading: '1. 先配好底子（5 分钟）', body: '把默认存储路径挪出系统盘，打开桌面通知，并在个性化里写好 5 条核心指令。' },
  { heading: '2. 动手前看一眼左下角', body: '确认选中了对应的项目分组（如 WorkBuddy-练习），权限保持「默认权限」。' },
  { heading: '3. 跑完必须右侧验产物', body: '不要只看对话里说“已完成”，点开右侧预览核对关键信息，有不对在原对话里局部修改。' },
];

export const DEFAULT_SUGGESTIONS = [
  '未来一个月，哪些大事可能影响市场',
  '第一次用 AI 办公，可以先做哪 3 件事',
  '今年 AI 行业发生了什么变化',
  '写一份大促活动完整执行方案',
];

/** 5.11.3 快捷场景标签对应的推荐任务列表（点击标签时实时切换） */
export const TAG_SUGGESTIONS: Record<string, string[]> = {
  创作文档: [
    '写一封催进度也不显生硬的邮件',
    '帮我写一份不流水账的周报范例',
    '帮我整理一个项目会议纪要模板',
    '把资料整理成一看就懂的图文笔记',
  ],
  分析数据: [
    '把这份季度销售表找出异常数据并汇总',
    '分析近三个月客户留存变化并画折线图',
    '把多张 Excel 月报合并成交互式 HTML 看板',
    '对比各渠道转化率并给出优化建议',
  ],
  代码开发: [
    '做个今日待办清单的网站',
    '帮我做一个电商网站首页',
    '帮我做个活动报名小程序',
    '做个支持人工转接的智能客服 Agent',
  ],
  'UI/UX': [
    '设计一套清爽克制的后台仪表盘原型',
    '帮我优化个人作品集首页的移动端排版',
    '生成一套浅色系设计规范和配色表',
    '把需求草图变成可点击的 HTML 交互原型',
  ],
  生图生视频: [
    '给新品发布会生成 3 张极简风主视觉海报',
    '为教程文章配一张干净的概念示意图',
    '生成一段 15 秒产品功能展示分镜脚本',
    '做一套统一风格的图文封面模板',
  ],
  金融服务: [
    '提炼这份上市公司季报的核心财务指标',
    '对比三家行业龙头近三年营收增速',
    '整理近期宏观政策对消费板块的影响',
    '帮我读懂这份基金季报的持仓变化',
  ],
  制作PPT: [
    '把项目复盘文档整理成 10 页汇报 PPT 大纲',
    '帮我做一份季度工作总结演示文稿',
    '把数据分析结论转成一页看懂的汇报 PPT',
    '优化现有 PPT 的排版层级与图表表达',
  ],
};
