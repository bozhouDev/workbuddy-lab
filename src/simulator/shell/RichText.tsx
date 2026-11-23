import { parseInlineMarkup } from '../engine/inlineMarkup';

interface RichTextProps {
  text: string;
  /** 为 false 时保留原始纯文本不标红/标蓝，等泊舟揭示问题后再点亮高亮 */
  revealMarks?: boolean;
}

function InlineLine({ text, revealMarks = true }: RichTextProps) {
  const tokens = parseInlineMarkup(text);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.kind === 'wrong') {
          if (!revealMarks) return <span key={i}>{tok.text}</span>;
          return (
            <span
              key={`wrong-${i}`}
              className="sim-warn-reveal inline-block px-1.5 py-[1px] mx-0.5 rounded-[5px] bg-[#fff1e8] text-[#9a3412] font-medium border border-[#f6d7c2] transition-colors duration-300"
            >
              {tok.text}
            </span>
          );
        }
        if (tok.kind === 'ok') {
          if (!revealMarks) return <span key={i}>{tok.text}</span>;
          return (
            <span
              key={i}
              className="inline-block px-1.5 py-[1px] mx-0.5 rounded-[5px] bg-[#eef2ff] text-[#1f3aa8] font-medium border border-[#c9d3f7] transition-colors duration-300"
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

const isTableRow = (line: string) => {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
};

const isSeparatorRow = (line: string) => {
  const cells = line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((c) => c.trim());
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
};

const parseCells = (line: string) =>
  line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((c) => c.trim());

/**
 * 轻量富文本渲染：支持行内 {{wrong:...}} / {{ok:...}} / @mention，
 * 并自动把 Markdown 竖线表格渲染为真机风格的干净表格
 */
export function RichText({ text, revealMarks = true }: RichTextProps) {
  if (!text.includes('\n|') && !text.trimStart().startsWith('|')) {
    return <InlineLine text={text} revealMarks={revealMarks} />;
  }

  const lines = text.split('\n');
  const blocks: Array<
    | { kind: 'text'; lines: string[] }
    | { kind: 'table'; headers: string[]; rows: string[][] }
  > = [];

  let i = 0;
  while (i < lines.length) {
    if (isTableRow(lines[i])) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      if (tableLines.length >= 2) {
        const headers = parseCells(tableLines[0]);
        const bodyStart = isSeparatorRow(tableLines[1]) ? 2 : 1;
        const rows = tableLines.slice(bodyStart).map(parseCells);
        blocks.push({ kind: 'table', headers, rows });
      } else {
        blocks.push({ kind: 'text', lines: tableLines });
      }
    } else {
      const textLines: string[] = [];
      while (i < lines.length && !isTableRow(lines[i])) {
        textLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ kind: 'text', lines: textLines });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((blk, idx) => {
        if (blk.kind === 'table') {
          return (
            <div
              key={idx}
              className={`rounded-[10px] border overflow-hidden my-0.5 ${
                revealMarks ? 'border-[#c9d3f7] bg-white' : 'border-[#e6e6e3] bg-white'
              }`}
            >
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#f7f7f6] border-b border-[#e6e6e3] text-left">
                    {blk.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3 py-2 font-semibold text-[#111318] whitespace-nowrap"
                      >
                        <InlineLine text={h} revealMarks={revealMarks} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blk.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx < blk.rows.length - 1 ? 'border-b border-[#f0f0ee]' : ''}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-3 py-2 align-top ${
                            cIdx === 0 ? 'font-mono text-[#1f2329] whitespace-nowrap' : 'text-[#2b2f36]'
                          }`}
                        >
                          <InlineLine text={cell} revealMarks={revealMarks} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        const joined = blk.lines.join('\n');
        if (!joined.trim()) return null;
        return (
          <div key={idx} className="whitespace-pre-line">
            <InlineLine text={joined} revealMarks={revealMarks} />
          </div>
        );
      })}
    </div>
  );
}
