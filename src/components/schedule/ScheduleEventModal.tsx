import { useState } from 'react';
import { X } from 'lucide-react';
import { ScheduleEvent, ScheduleEventInput } from '../../types';

const eventTypes: { value: ScheduleEvent['type']; label: string }[] = [
  { value: 'interview', label: '面试' },
  { value: 'call', label: '电话' },
  { value: 'test', label: '笔试' },
  { value: 'review', label: '复盘' },
  { value: 'task', label: '任务' },
  { value: 'rest', label: '休息' },
  { value: 'deadline', label: '截止' },
];

const eventStatuses: { value: ScheduleEvent['status']; label: string }[] = [
  { value: 'today', label: '今天' },
  { value: 'upcoming', label: '即将开始' },
  { value: 'planned', label: '计划中' },
  { value: 'done', label: '已完成' },
  { value: 'rest', label: '休息' },
  { value: 'cancelled', label: '临近截止' },
];

export function ScheduleEventModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: ScheduleEventInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    date: '24',
    weekday: '周二',
    time: '',
    title: '',
    company: '',
    status: 'planned' as ScheduleEvent['status'],
    type: 'task' as ScheduleEvent['type'],
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await onCreate({
      date: Number(form.date) || 1,
      weekday: form.weekday,
      time: form.time,
      title: form.title,
      company: form.company,
      status: form.status,
      type: form.type,
      isToday: form.status === 'today',
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-2xl border border-[#F0EBE4] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F0EA] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">新增日程</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">会保存到前端统一状态，刷新后重置。</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">日期</span>
            <input required value={form.date} onChange={(e) => updateField('date', e.target.value)} type="number" min="1" max="31" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">星期</span>
            <input value={form.weekday} onChange={(e) => updateField('weekday', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">时间</span>
            <input value={form.time} onChange={(e) => updateField('time', e.target.value)} placeholder="例如 14:00" className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">公司</span>
            <input value={form.company} onChange={(e) => updateField('company', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">标题</span>
            <input required value={form.title} onChange={(e) => updateField('title', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100]" />
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">类型</span>
            <select value={form.type} onChange={(e) => updateField('type', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] bg-white">
              {eventTypes.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[#6B5E4E] text-xs font-medium">状态</span>
            <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="w-full border border-[#E8E2D9] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFD100] bg-white">
              {eventStatuses.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="px-5 py-4 bg-[#FBF8F3] border-t border-[#F5F0EA] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#6B5E4E] text-sm">取消</button>
          <button disabled={submitting} className="px-4 py-2 rounded-lg bg-[#1C1917] text-white text-sm font-medium disabled:opacity-60">
            {submitting ? '保存中...' : '保存日程'}
          </button>
        </div>
      </form>
    </div>
  );
}
