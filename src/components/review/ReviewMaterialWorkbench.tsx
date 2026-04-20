import { Upload, ClipboardList, PencilLine } from 'lucide-react';
import { ReviewEntry } from '../../types';

export function ReviewMaterialWorkbench({
  review,
  noteDraft,
  audioFileName,
  parsingAudio,
  onNoteChange,
  onAudioChange,
  onStructureNote,
  onManualFocus,
}: {
  review: ReviewEntry;
  noteDraft: string;
  audioFileName?: string;
  parsingAudio: boolean;
  onNoteChange: (value: string) => void;
  onAudioChange: (fileName: string) => void;
  onStructureNote: () => void;
  onManualFocus: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#F0EBE4] bg-[#FBF8F3] p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[#1C1917] text-sm font-semibold">这场复盘的资料</div>
          <p className="text-[#9C8B78] text-xs mt-1">
            {review.company} · {review.stage || '待确认轮次'} · {review.position}
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E8E2D9] text-[#6B5E4E]">
          {review.status === 'completed' ? '已完成' : '待写复盘'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="rounded-xl bg-white border border-[#F0EBE4] p-4 cursor-pointer hover:border-[#E8DDD0]">
          <div className="flex items-center gap-2 mb-2">
            <Upload size={16} className="text-[#6B5E4E]" />
            <span className="text-[#1C1917] text-sm font-medium">上传录音</span>
          </div>
          <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">
            选择文件后模拟解析，自动生成摘要和问题草稿。
          </p>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAudioChange(file.name);
            }}
          />
          <div className="text-[#7A5A00] text-xs font-medium">
            {parsingAudio ? '正在解析...' : audioFileName || '选择录音文件'}
          </div>
        </label>

        <div className="md:col-span-2 rounded-xl bg-white border border-[#F0EBE4] p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={16} className="text-[#6B5E4E]" />
            <span className="text-[#1C1917] text-sm font-medium">粘贴笔记</span>
          </div>
          <textarea
            value={noteDraft}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={4}
            placeholder="把面试追问、自己的回答、面试官反馈先贴在这里。"
            className="w-full resize-none rounded-lg border border-[#E8E2D9] px-3 py-2 text-sm outline-none focus:border-[#FFD100]"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              onClick={onStructureNote}
              disabled={!noteDraft.trim()}
              className="rounded-lg bg-[#1C1917] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              AI 结构化 STAR
            </button>
            <button onClick={onManualFocus} className="inline-flex items-center gap-1 text-[#6B5E4E] text-xs font-medium hover:text-[#1C1917]">
              <PencilLine size={13} />
              手动补充
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
