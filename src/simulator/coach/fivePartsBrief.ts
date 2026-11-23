export interface FivePartsItem {
  num: string;
  label: string;
  tone: 'blue' | 'teal' | 'indigo' | 'amber' | 'slate';
  text: string;
  why: string;
}

/** 2.4 写清任务：5 要素拆解与合并后的完整提示词（单一数据源，弹窗与输入框共用） */
export const FIVE_PARTS_ITEMS: readonly FivePartsItem[] = [
  {
    num: '①',
    label: '材料',
    tone: 'blue',
    text: '@周末读书会群聊.txt ',
    why: '直接点名原始文件，不让它自己翻目录猜',
  },
  {
    num: '②',
    label: '交付物',
    tone: 'teal',
    text: '整理成《周末读书会筹备纪要.md》存到当前分组。',
    why: '写死文件名和存放位置，别只吐在对话里',
  },
  {
    num: '③',
    label: '目标内容',
    tone: 'indigo',
    text: '包含：活动信息、待办表格（事项/负责人/截止时间/备注）。',
    why: '说清要整理出哪几块、表格包含哪些列',
  },
  {
    num: '④',
    label: '禁止事项',
    tone: 'amber',
    text: '原记录没写明的负责人或时间一律标“未明确”，不要改原文件，',
    why: '防编造保命句：没定人就留空，绝不乱填、不改原件',
  },
  {
    num: '⑤',
    label: '怎么检查',
    tone: 'slate',
    text: '完成后列出最需要我核对的 3 处内容。',
    why: '让它主动挑出最容易出错的地方方便你验收',
  },
];

export const FIVE_PARTS_BRIEF = FIVE_PARTS_ITEMS.map((item) => item.text).join('');
