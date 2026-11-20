import { parseInlineMarkup } from '../engine/inlineMarkup';

export function RichText({ text }: { text: string }) {
  const tokens = parseInlineMarkup(text);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.kind === 'wrong') {
          return (
            <span
              key={i}
              className="inline-block px-1.5 py-[1px] mx-0.5 rounded-[5px] bg-[#fff1e8] text-[#9a3412] font-medium border border-[#f6d7c2]"
            >
              {tok.text}
            </span>
          );
        }
        if (tok.kind === 'ok') {
          return (
            <span
              key={i}
              className="inline-block px-1.5 py-[1px] mx-0.5 rounded-[5px] bg-[#eef2ff] text-[#1f3aa8] font-medium border border-[#c9d3f7]"
            >
              {tok.text}
            </span>
          );
        }
        if (tok.kind === 'mention') {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-[1px] mx-0.5 rounded-[5px] bg-[#eef2ff] text-[#3355e0] text-[0.93em] font-medium"
            >
              {tok.text}
            </span>
          );
        }
        return <span key={i}>{tok.text}</span>;
      })}
    </>
  );
}
