export const PRACTICE_MODEL_ID = 'gpt-6.2-sol';
export const PRACTICE_DRAFT_ENDPOINT = 'https://api.example.invalid';
export const PRACTICE_ENDPOINT = `${PRACTICE_DRAFT_ENDPOINT}/v1`;
export const PRACTICE_PROMPT = '你是什么模型？';

export function createPracticeKey(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  return `sk-demo-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}
