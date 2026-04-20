import { useState } from 'react';
import { X } from 'lucide-react';
import { ResumeVersion, ResumeVersionInput } from '../../types';

const emptyForm: ResumeVersionInput = {
  name: '',
  targetRole: '',
  summary: '',
  highlights: [],
  content: '',
};

function resumeToForm(resume?: ResumeVersion): ResumeVersionInput {
  if (!resume) return emptyForm;
  return {
    name: resume.name,
    targetRole: resume.targetRole,
    summary: resume.summary,
    highlights: resume.highlights,
    content: resume.content,
  };
}

export function ResumeEditorModal({
  resume,
  onClose,
  onSave,
}: {
  resume?: ResumeVersion;
  onClose: () => void;
  onSave: (input: ResumeVersionInput) => void;
}) {
  const [form, setForm] = useState<ResumeVersionInput>(resumeToForm(resume));
  const [highlightText, setHighlightText] = useState(resume?.highlights.join('\n') || '');

  const updateField = <Key extends keyof ResumeVersionInput>(key: Key, value: ResumeVersionInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...form,
      name: form.name.trim() || '未命名简历',
      targetRole: form.targetRole.trim() || '待确认岗位',
      highlights: highlightText.split(/\n+/).map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/30 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">{resume ? '编辑简历版本' : '新增简历版本'}</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">先把一版材料收好，后面根据 JD 再微调。</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">版本名称</span>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]"
              placeholder="例如：AI PM 版本"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">目标岗位</span>
            <input
              value={form.targetRole}
              onChange={(event) => updateField('targetRole', event.target.value)}
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]"
              placeholder="例如：产品经理"
            />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">简历摘要</span>
            <textarea
              value={form.summary}
              onChange={(event) => updateField('summary', event.target.value)}
              rows={3}
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
              placeholder="这版简历主打什么能力"
            />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">亮点</span>
            <textarea
              value={highlightText}
              onChange={(event) => setHighlightText(event.target.value)}
              rows={3}
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
              placeholder="每行一个亮点"
            />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">正文内容</span>
            <textarea
              value={form.content}
              onChange={(event) => updateField('content', event.target.value)}
              rows={6}
              className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none"
              placeholder="简历正文、项目经历或待整理素材"
            />
          </label>
        </div>

        <div className="px-5 py-4 bg-[#FBF8F3] border-t border-[#F5F0EA] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#6B5E4E] text-sm">取消</button>
          <button className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm font-medium">保存版本</button>
        </div>
      </form>
    </div>
  );
}
