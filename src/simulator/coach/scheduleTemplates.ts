/**
 * 定时任务「从模板添加」里的 12 个模板
 * 标题、卡片简介、提示词都取自 5.11.3 中文语言包 automation.templates.*；顺序按真机截图（3 列 4 行）
 */
export interface ScheduleTemplate {
  id: string;
  title: string;
  /** 卡片上的一行简介 */
  content: string;
  /** 点开后填进表单的提示词 */
  prompt: string;
  /** 表单里预填的重复 / 时间：只填了课程会打开的两个（每周工作周报按真机截图，父母联系提醒按简介） */
  repeat?: string;
  time?: string;
}

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: 'dailyAiNews',
    title: '每日 AI 新闻推送',
    content: '关注当天 AI 领域的重要动态，侧重 AI coding 与具身智能进展，筛选 3-5 条值得关注的信息。',
    prompt:
      '关注当天 AI 领域的重要动态，侧重 AI coding 与具身智能方向。筛选 3-5 条有价值的信息，简要说明事件内容及值得关注的原因。结合 memory.md 里之前推送过的内容，尽量不要重复。',
  },
  {
    id: 'dailyWords',
    title: '每日 5 个英语单词',
    content: '每天推荐 5 个高频实用英语单词，包含词义、音标、例句与记忆提示。',
    prompt:
      '每天推荐 5 个实用英语单词，优先选取生活和职场中常见词汇。输出词义、音标、例句，以及一条便于记忆的小提示。结合 memory.md 里之前推荐过的单词，尽量不要重复。',
  },
  {
    id: 'bedtimeStory',
    title: '每日儿童睡前故事',
    content: '生成 3-5 分钟可读的温和睡前故事，情节完整并附简短寓意。',
    prompt:
      '写一个适合儿童的睡前故事，语言温和易懂，阅读时长约 3-5 分钟。故事需有完整情节，结尾附上简短寓意。结合 memory.md 里之前讲过的故事，尽量不要重复。',
  },
  {
    id: 'weeklyReport',
    title: '每周工作周报',
    content: '每周五汇总仓库 PR 与 Issue 进展，输出关键变更与待关注事项。',
    prompt: '梳理本周仓库中的 PR 与 Issue 情况，包括新增、已关闭及重点讨论。输出一份周报，涵盖主要进展、关键变更和待关注事项。',
    repeat: '每周 周五',
    time: '17:00',
  },
  {
    id: 'classicMovie',
    title: '经典电影推荐',
    content: '推荐一部高分经典电影，简要介绍剧情梗概、亮点与推荐理由，全程不剧透。',
    prompt:
      '给我推荐一部公认的经典电影（评分高、口碑好），简要介绍剧情梗概、亮点所在，以及它为什么值得一看，但是不要剧透。结合 memory.md 里之前推荐过的电影，尽量不要重复。',
  },
  {
    id: 'historyToday',
    title: '历史上的今天',
    content: '从科技、电影、音乐等领域挑选一件"今天发生过"的有趣事件，200-300 字讲清来龙去脉。',
    prompt: '历史上的今天发生过什么有趣的事？从科技、电影、音乐等领域中挑一个，讲讲它的来龙去脉吧。控制在 200-300 字左右。',
  },
  {
    id: 'dailyWhy',
    title: '每日一个为什么',
    content: '每天抛出一个有趣问题，先提问再解答，语气轻松、通俗易懂，答案控制在 200-300 字。',
    prompt:
      '随机挑选一个有趣的冷知识或生活百科问题，并给出详细、有趣、通俗易懂的解答。每次问题尽量不重复，覆盖科学、生活、历史、自然、食物、文化、动物、人体等多个领域；先抛出问题再揭晓答案；语气轻松有趣；答案控制在 200-300 字。',
  },
  {
    id: 'parentContactReminder',
    title: '父母联系提醒',
    content: '每周日 10:00 提醒你给家人打电话或发消息，简单问候近况。',
    prompt: '每周日十点提醒我给家人打电话或发消息，简单问候近况。',
    repeat: '每周 周日',
    time: '10:00',
  },
  {
    id: 'healthCheckupReminder',
    title: '体检预约提醒',
    content: '在 2026/11/24 07:00 提醒你确认体检时间、准备证件，并注意空腹与其他事项。',
    prompt: '在 2026/11/24 07:00 提醒我确认体检时间、准备证件，提前空腹并留意注意事项。',
  },
  {
    id: 'interviewPreparationReminder',
    title: '面试准备提醒',
    content: '工作日每 2 小时提醒你复习大模型面试内容，并生成 3 个模拟问题。',
    prompt: '每两小时提醒我复习关于大模型的项目亮点、技术难点、常见问答，并生成 3 个模拟面试问题。',
  },
  {
    id: 'preMeetingPreparation',
    title: '会议前准备',
    content: '在会议开始前提醒你整理议题、目标、待确认问题和关键结论。',
    prompt: '在会议开始前，提醒我整理议题、目标、需要确认的问题，以及要同步的关键结论。',
  },
  {
    id: 'cutePetWallpaper',
    title: '可爱萌宠手机壁纸',
    content: '随机从 7 种不同风格中挑选一种，为你生成一张 9:16 竖版高清萌宠手机壁纸。',
    prompt: '帮我生成一张手机壁纸，以下主题随机选一个就可以。主体：可爱萌宠。格式要求：手机壁纸、高清分辨率，9:16 竖版比例。（后面附 7 种风格描述）',
  },
];

/** 本节课让学员从模板建的那个：提醒类，开箱即用 */
export const LESSON_TEMPLATE_ID = 'parentContactReminder';
