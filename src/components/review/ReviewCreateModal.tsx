import { useState } from 'react';
import { X } from 'lucide-react';
import { ReviewEntry, ReviewInput } from '../../types';

export function ReviewCreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: ReviewInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    company: '',
    position: '',
    stage: '',
    date: '',
    duration: '45',
    summary: '',
    tags: '',
    result: 'pending' as NonNullable<ReviewEntry['result']>,
    moodScore: '7',
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await onCreate({
      company: form.company,
      position: form.position,
      stage: form.stage,
      date: form.date,
      duration: Number(form.duration) || 0,
      summary: form.summary,
      tags: form.tags
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      score: form.result === 'fail' ? '待改进' : '待复盘',
      scoreColor: form.result === 'fail' ? '#EF4444' : '#FFD100',
      completed: 25,
      isHot: true,
      result: form.result,
      star: { situation: '', task: '', action: '', result: '' },
      moodScore: Number(form.moodScore) || undefined,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">新增复盘</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">保存后可以在详情里继续补 STAR。</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">公司</span>
            <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">岗位</span>
            <input required value={form.position} onChange={(e) => updateField('position', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">面试阶段</span>
            <input value={form.stage} onChange={(e) => updateField('stage', e.target.value)} placeholder="例如 一面·业务负责人" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">日期</span>
            <input value={form.date} onChange={(e) => updateField('date', e.target.value)} placeholder="例如 4 月 18 日 14:00" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">时长（分钟）</span>
            <input value={form.duration} onChange={(e) => updateField('duration', e.target.value)} type="number" min="0" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">结果</span>
            <select value={form.result} onChange={(e) => updateField('result', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] bg-white">
              <option value="pending">等待中</option>
              <option value="pass">通过</option>
              <option value="fail">未通过</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">标签</span>
            <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="用逗号分隔" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">状态评分</span>
            <input value={form.moodScore} onChange={(e) => updateField('moodScore', e.target.value)} type="number" min="0" max="10" step="0.1" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">整理摘要</span>
            <textarea value={form.summary} onChange={(e) => updateField('summary', e.target.value)} rows={3} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] resize-none" />
          </label>
        </div>

        <div className="px-5 py-4 bg-[#FBF8F3] border-t border-[#F5F0EA] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#6B5E4E] text-sm">取消</button>
          <button disabled={submitting} className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm font-medium disabled:opacity-60">
            {submitting ? '保存中...' : '保存复盘'}
          </button>
        </div>
      </form>
    </div>
  );
}
