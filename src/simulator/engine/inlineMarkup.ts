export type MarkupToken =
  | { kind: 'plain'; text: string }
  | { kind: 'wrong'; text: string }
  | { kind: 'ok'; text: string }
  | { kind: 'mention'; text: string };

const PATTERN = /\{\{(wrong|ok):([^}]+)\}\}|(@[^\s，。；、]+)/g;

export function parseInlineMarkup(input: string): MarkupToken[] {
  const tokens: MarkupToken[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(PATTERN)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      tokens.push({ kind: 'plain', text: input.slice(lastIndex, idx) });
    }
    if (match[1] === 'wrong' && match[2]) {
      tokens.push({ kind: 'wrong', text: match[2] });
    } else if (match[1] === 'ok' && match[2]) {
      tokens.push({ kind: 'ok', text: match[2] });
    } else if (match[3]) {
      tokens.push({ kind: 'mention', text: match[3] });
    }
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < input.length) {
    tokens.push({ kind: 'plain', text: input.slice(lastIndex) });
  }
  return tokens;
}
