import type { SimId } from '../registry';
import type { SceneData } from '../engine/types';
import { Composer } from './Composer';
import {
  ChevronRightIcon,
  CopyIcon,
  FolderIcon,
  ModelDotIcon,
  PanelRightIcon,
  RefreshIcon,
  SearchIcon,
  ShareIcon,
} from './icons';
import { ApprovalCard } from './Overlays';
import { RichText } from './RichText';

interface ChatViewProps {
  scene: SceneData;
  activeClickId: SimId | null;
  onTargetClick: (id: SimId) => void;
}

function getModeBadge(mode?: 'default' | 'plan' | 'ask') {
  if (mode === 'plan') return 'Plan 模式';
  if (mode === 'ask') return 'Ask 模式';
  return '默认模式';
}

function getFileIconChar(name: string) {
  if (name.endsWith('.md')) return 'M';
  if (name.endsWith('.xlsx') || name.endsWith('.csv')) return 'X';
  if (name.endsWith('.pptx')) return 'P';
  return 'W';
}

export function ChatView({ scene, activeClickId, onTargetClick }: ChatViewProps) {
  const messages = scene.messages ?? [];
  const artifacts = scene.artifacts;
  const hasApproval = scene.overlay === 'approvalDialog' && scene.approval;
  const mode = scene.composer?.mode ?? 'default';
  const modelName = scene.composer?.model ?? 'Hy4 flash';
  const firstUserText = messages.find((m) => m.role === 'user')?.blocks.find((b) => b.type === 'text');
  const derivedTitle =
    scene.chatTitle ||
    (firstUserText && firstUserText.type === 'text' ? firstUserText.text.slice(0, 16) : '整理 11 月周报');

  return (
    <div className="flex-1 min-w-0 flex bg-white select-none">
      {/* 左侧对话流（对照 9059D785） */}
      <div
        data-sim-id="chat"
        className="flex-1 min-w-0 flex flex-col border-r border-[#ebebeb]"
      >
        {/* 对话区顶栏 */}
        <div className="h-12 shrink-0 px-6 flex items-center justify-between border-b border-[#f0f0ee]">
          <span className="text-[14px] font-semibold text-[#111318] truncate">
            {derivedTitle}
          </span>
          <div className="flex items-center gap-3.5 text-[#5c5f66]">
            <SearchIcon size={15} />
            <ShareIcon size={15} />
            <PanelRightIcon size={15} />
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">
          {messages.map((msg, msgIdx) => {
            if (msg.role === 'user') {
              return (
                <div key={msgIdx} className="self-end max-w-[82%] rounded-[16px] bg-[#f4f4f5] px-4 py-2.5 text-[14px] leading-[1.7] text-[#111318]">
                  {msg.blocks.map((b, bi) =>
                    b.type === 'text' ? <RichText key={bi} text={b.text} /> : null
                  )}
                </div>
              );
            }

            const isLastAssistant = msgIdx === messages.length - 1;
            const fileBlocks = msg.blocks.filter((b) => b.type === 'file');

            return (
              <div
                key={msgIdx}
                data-sim-id={isLastAssistant ? 'chat.lastReply' : undefined}
                className="flex flex-col gap-3 text-[14px] leading-[1.75] text-[#2b2f36]"
              >
                {/* AI 头像 + 名称 + 模式徽标 */}
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-[11px] font-bold inline-flex items-center justify-center">
                    W
                  </span>
                  <strong className="text-[#111318] text-[14px] font-semibold">WorkBuddy</strong>
                  <span className="text-[11.5px] text-[#6b7079] border border-[#e5e5e3] rounded-md px-1.5 py-[1px]">
                    {getModeBadge(mode)}
                  </span>
                </div>

                {/* 耗时折叠行（对照 9059D785） */}
                <div className="inline-flex items-center gap-1 text-[12.5px] text-[#8c9099]">
                  <span>已完成 {scene.elapsed || '8s'}</span>
                  <ChevronRightIcon size={11} />
                </div>

                {/* 各内容块 */}
                {msg.blocks.map((b, bi) => {
                  if (b.type === 'text') {
                    return (
                      <div key={bi} className="text-[#1f2329]">
                        <RichText text={b.text} />
                      </div>
                    );
                  }

                  if (b.type === 'file') {
                    const isOverwritten = b.status === 'overwritten';
                    return (
                      <div key={bi} className="flex flex-col gap-2.5">
                        {/* 内联写入提示行 */}
                        <div className="flex items-center gap-2 text-[13px] text-[#4a4f57]">
                          <span>{isOverwritten ? '已覆盖原文件：' : '已写入文件：'}</span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12.5px] font-medium ${
                              isOverwritten
                                ? 'bg-[#fff1e8] text-[#9a3412]'
                                : 'bg-[#eef6ff] text-[#2563eb]'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded text-[9px] text-white font-bold inline-flex items-center justify-center ${
                                isOverwritten ? 'bg-[#c2410c]' : 'bg-[#0ea5e9]'
                              }`}
                            >
                              {getFileIconChar(b.name)}
                            </span>
                            {b.name}
                          </span>
                        </div>

                        {/* 横向产物卡片（精准还原 9059D785） */}
                        <div
                          data-sim-id="chat.fileCard"
                          className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-[14px] border ${
                            isOverwritten
                              ? 'bg-[#fff6ef] border-[#f6d7c2]'
                              : 'bg-[#f4f4f5] border-[#ebebeb]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-9 h-9 rounded-[10px] text-white text-[13px] font-bold inline-flex items-center justify-center shrink-0 ${
                                isOverwritten ? 'bg-[#c2410c]' : 'bg-[#0ea5e9]'
                              }`}
                            >
                              {getFileIconChar(b.name)}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-[13.5px] text-[#111318] truncate">
                                {b.name}
                              </div>
                              <div
                                className={`text-[12px] ${
                                  isOverwritten ? 'text-[#9a3412]' : 'text-[#8c9099]'
                                }`}
                              >
                                {isOverwritten ? '已直接覆盖原文件 · 无备份' : b.size || '2.4 KB'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-7 h-7 rounded-full border border-[#e0e0dd] bg-white inline-flex items-center justify-center text-[#5c5f66] text-[11px]">
                              •••
                            </span>
                            <span className="h-7 px-3 rounded-lg bg-[#1a1a1a] text-white text-[12px] font-medium inline-flex items-center gap-1">
                              <ShareIcon size={12} />
                              分享
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (b.type === 'plan') {
                    return (
                      <div
                        key={bi}
                        data-sim-id="chat.plan"
                        className="rounded-[14px] border border-[#e2e2de] bg-[#fafaf9] p-4 flex flex-col gap-2.5"
                      >
                        <div className="text-[12.5px] font-semibold text-[#111318]">
                          执行前先确认这份修改方案：
                        </div>
                        <ol className="m-0 pl-5 flex flex-col gap-1.5 text-[13.5px] text-[#2b2f36]">
                          {b.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ol>
                        {b.ask && (
                          <div className="pt-1.5 border-t border-[#eeeeeb] text-[13px] text-[#4a4f57]">
                            {b.ask}
                          </div>
                        )}
                        <div className="pt-1 flex items-center gap-2">
                          <span className="h-8 px-3.5 rounded-lg bg-[#1a1a1a] text-white text-[12.5px] font-semibold inline-flex items-center">
                            确认执行
                          </span>
                          <span className="h-8 px-3.5 rounded-lg border border-[#dcdcd8] bg-white text-[#2b2f36] text-[12.5px] inline-flex items-center">
                            修改方案
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (b.type === 'note') {
                    return (
                      <div
                        key={bi}
                        className="text-[12.5px] text-[#6b7079] bg-[#f7f7f6] border border-[#eeeeeb] rounded-lg px-3 py-2"
                      >
                        {b.text}
                      </div>
                    );
                  }

                  return null;
                })}

                {/* 查看所有产物 + 底部操作条（对照 9059D785） */}
                {fileBlocks.length > 0 && (
                  <div className="inline-flex items-center gap-1 text-[13px] text-[#4a4f57] pt-0.5">
                    <span>查看所有产物 ({fileBlocks.length})</span>
                    <ChevronRightIcon size={12} />
                  </div>
                )}

                <div className="flex items-center gap-3.5 pt-1 text-[#7a7f89] text-[12px]">
                  <CopyIcon size={13} />
                  <RefreshIcon size={13} />
                  <ShareIcon size={13} />
                  <span>•••</span>
                  <span className="inline-flex items-center gap-1 text-[#5c5f66]">
                    <ModelDotIcon size={12} />
                    <span>{modelName}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部区：有审批时渲染 5.11.3 底部审批卡片，否则渲染紧凑输入框 */}
        <div className="shrink-0 px-6 pb-4 pt-2 bg-white">
          {hasApproval && scene.approval ? (
            <ApprovalCard
              approval={scene.approval}
              activeClickId={activeClickId}
              onTargetClick={onTargetClick}
            />
          ) : (
            <Composer
              scene={scene}
              compact
              activeClickId={activeClickId}
              onTargetClick={onTargetClick}
            />
          )}
        </div>
      </div>

      {/* 右侧产物预览区（浏览器式 Tab 栏 + 操作副栏 + 正文，对照 9059D785） */}
      {artifacts && (
        <div
          data-sim-id="artifacts"
          className="w-[490px] shrink-0 flex flex-col bg-white"
        >
          {/* 浏览器式 Tab 栏 */}
          <div className="h-12 shrink-0 px-3 flex items-center justify-between border-b border-[#ebebeb] bg-[#fafafa]">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-8 px-3 rounded-lg bg-[#ececef] flex items-center gap-2 text-[13px] font-medium text-[#111318] max-w-[260px]">
                <span className="w-4 h-4 rounded bg-[#0ea5e9] text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                  {getFileIconChar(artifacts.file)}
                </span>
                <span className="truncate">{artifacts.file}</span>
                <span className="text-[#8c9099] text-[14px] ml-1">×</span>
              </div>
              <span className="w-7 h-7 rounded-md inline-flex items-center justify-center text-[#6b7079] text-[16px]">
                +
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#6b7079] pr-1">
              <span className="text-[13px]">⤢</span>
              <PanelRightIcon size={15} />
            </div>
          </div>

          {/* 文件操作副栏 */}
          <div className="h-11 shrink-0 px-5 flex items-center justify-between border-b border-[#f0f0ee]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[13px] font-medium text-[#2b2f36] truncate">{artifacts.file}</span>
              <FolderIcon size={13} className="text-[#8c9099] shrink-0" />
              {artifacts.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-[1px] rounded-md shrink-0 ${
                    artifacts.badge === '已覆盖'
                      ? 'bg-[#fff1e8] text-[#9a3412]'
                      : 'bg-[#efefef] text-[#4a4f57]'
                  }`}
                >
                  {artifacts.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full border border-[#e6e6e3] inline-flex items-center justify-center text-[#5c5f66] text-[11px]">
                •••
              </span>
              <span className="h-7 px-3 rounded-lg bg-[#1a1a1a] text-white text-[12px] font-medium inline-flex items-center gap-1">
                <ShareIcon size={12} />
                分享
              </span>
            </div>
          </div>

          {/* 文档预览正文区（可被聚光灯锁定的 artifacts.diff） */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#fafaf9]">
            <div
              data-sim-id="artifacts.diff"
              className="rounded-[12px] border border-[#ebebeb] bg-white p-6 flex flex-col gap-3.5 text-[14px] leading-[1.85] text-[#2b2f36]"
            >
              <h3 className="m-0 text-[16px] font-bold text-[#111318]">
                {artifacts.docTitle || '第 47 周工作周报'}
              </h3>
              <div className="flex flex-col gap-2.5">
                {artifacts.lines.map((line, i) => {
                  if (line.change === 'removed') {
                    return (
                      <div
                        key={i}
                        className="px-2 py-1 rounded-md bg-[#fff1e8] text-[#9a3412] line-through"
                      >
                        {line.text}
                      </div>
                    );
                  }
                  if (line.change === 'added') {
                    return (
                      <div
                        key={i}
                        className="px-2 py-1 rounded-md bg-[#eef2ff] text-[#1f3aa8]"
                      >
                        {line.text}
                      </div>
                    );
                  }
                  return <div key={i}>{line.text}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
