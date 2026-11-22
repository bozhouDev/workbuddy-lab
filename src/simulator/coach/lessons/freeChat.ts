import type { ChatRunSpec } from '../guidedTypes';

/**
 * 第 3、4 章对话的公共默认值：统一用 Hy4 flash（限时免费，不扣积分），
 * 课程只关心「怎么用对扩展能力」，不在这里讲积分，避免编造消耗数字
 */
export function freeChat(
  spec: Omit<ChatRunSpec, 'model' | 'estimateText' | 'consumedText' | 'consumedDelta'> &
    Partial<Pick<ChatRunSpec, 'model'>>
): ChatRunSpec {
  return {
    model: 'Hy4 flash',
    estimateText: '0.00',
    consumedText: '0.00',
    consumedDelta: 0,
    ...spec,
  };
}
