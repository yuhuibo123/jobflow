import { useEffect, useState } from 'react';
import { Phone, FileText, Users, Zap, CheckCircle2, Clock, XCircle, Coffee, Plus, Trash2, X } from 'lucide-react';
import { useScheduleEvents, ScheduleEventInput } from '../hooks/useScheduleEvents';
import { ScheduleEvent } from '../types';

const stats = [
  { label: '已投递', value: '14', unit: '家', delta: '+4 本周' },
  { label: '面试中', value: '4', unit: '家', delta: '+2 本周' },
  { label: 'OFFER', value: '1', unit: '个', subLabel: '满满・待定' },
  { label: '连续记录', value: '18', unit: '天', subLabel: '坚持就是赢了一半' },
];

function EventIcon({ type }: { type: ScheduleEvent['type'] }) {
  const cls = 'flex-shrink-0';
  switch (type) {
    case 'interview': return <Users size={15} className={cls} />;
    case 'call': return <Phone size={15} className={cls} />;
    case 'test': return <FileText size={15} className={cls} />;
    case 'review': return <Zap size={15} className={cls} />;
    case 'task': return <CheckCircle2 size={15} className={cls} />;
    case 'rest': return <Coffee size={15} className={cls} />;
    case 'deadline': return <XCircle size={15} className={cls} />;
    default: return <Clock size={15} className={cls} />;
  }
}

function getEventStyle(event: ScheduleEvent) {
  switch (event.status) {
    case 'done': return { bg: 'bg-[#F5F0EA]', text: 'text-[#9C8B78]', badge: 'bg-[#F0EBE4] text-[#9C8B78]', badgeText: '已完成', icon: 'text-[#9C8B78]' };
    case 'today': return { bg: 'bg-[#FFFBEA] border border-[#FFE36A]', text: 'text-[#1C1917]', badge: 'bg-[#FFD100] text-white', badgeText: '今天', icon: 'text-[#FFD100]' };
    case 'upcoming': return { bg: 'bg-white border border-[#F0EBE4]', text: 'text-[#1C1917]', badge: 'bg-[#EDE8E1] text-[#6B5E4E]', badgeText: '计划中', icon: 'text-[#6B5E4E]' };
    case 'planned': return { bg: 'bg-white border border-[#F0EBE4]', text: 'text-[#1C1917]', badge: 'bg-[#EDE8E1] text-[#6B5E4E]', badgeText: '计划中', icon: 'text-[#6B5E4E]' };
    case 'rest': return { bg: 'bg-[#FAFAF9] border border-[#F0EBE4]', text: 'text-[#9C8B78]', badge: 'bg-[#F5F0EA] text-[#9C8B78]', badgeText: '休息', icon: 'text-[#C5BDB5]' };
    case 'cancelled': return { bg: 'bg-[#FEF2F2] border border-[#FECACA]', text: 'text-[#9C8B78]', badge: 'bg-[#FEE2E2] text-[#EF4444]', badgeText: '临近截止', icon: 'text-[#EF4444]' };
    default: return { bg: 'bg-white border border-[#F0EBE4]', text: 'text-[#1C1917]', badge: 'bg-[#EDE8E1] text-[#6B5E4E]', badgeText: '', icon: 'text-[#6B5E4E]' };
  }
}

const dayGroups = [
  { date: 23, weekday: '周一' },
  { date: 24, weekday: '周二' },
  { date: 25, weekday: '周三' },
  { date: 26, weekday: '周四' },
  { date: 27, weekday: '周五' },
  { date: 28, weekday: '周六' },
  { date: 1, weekday: '周日' },
];

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

function ScheduleEventModal({
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
            <p className="text-[#9C8B78] text-xs mt-0.5">会保存到 Supabase，刷新后仍然保留。</p>
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

export default function Schedule({ createRequest }: { createRequest: number }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { scheduleEvents, loading, error, createScheduleEvent, deleteScheduleEvent } = useScheduleEvents();

  useEffect(() => {
    if (createRequest > 0) {
      setShowCreateModal(true);
    }
  }, [createRequest]);

  const handleCreateScheduleEvent = async (input: ScheduleEventInput) => {
    const created = await createScheduleEvent(input);
    if (created) {
      setShowCreateModal(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-5 rounded-2xl border border-[#FFE36A] bg-[#FFFBEA] px-4 py-3 text-sm text-[#6B5E4E]">
          为了便于展示，这里预置了示例日程。你可以新增或删除自己的日程，示例数据不会被删除。
          {loading && <span className="ml-2 text-[#7A5A00]">正在加载数据库记录...</span>}
          {error && <span className="ml-2 text-[#EF4444]">{error}</span>}
        </div>
        <div className="text-[#9C8B78] text-sm mb-1">2 月 23 日 — 3 月 1 日</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">这周怎么走</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 bg-[#1C1917] text-white px-4 py-2 rounded-xl text-sm font-medium">
              <Plus size={14} />
              新增日程
            </button>
            <div className="flex items-center gap-2 bg-[#FFF7CC] border border-[#FFE36A] text-[#7A5A00] px-4 py-2 rounded-xl text-sm font-medium">
              <span>🔥</span>
              <span>已连续记录 18 天，挺稳</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
              <div className="text-[#9C8B78] text-sm mb-2">{s.label}</div>
              <div className="text-3xl font-bold text-[#1C1917] mb-1">
                {s.value}
                <span className="text-[#9C8B78] text-lg font-normal ml-1">{s.unit}</span>
              </div>
              {s.delta && <div className="text-[#22C55E] text-sm">{s.delta}</div>}
              {s.subLabel && <div className="text-[#9C8B78] text-sm">{s.subLabel}</div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#F0EBE4] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F0EA]">
            <h3 className="font-bold text-[#1C1917]">本周节奏</h3>
          </div>
          <div className="divide-y divide-[#F5F0EA]">
            {dayGroups.map((day) => {
              const dayEvents = scheduleEvents.filter((e) => e.date === day.date);
              const isToday = day.date === 24;
              return (
                <div key={day.date} className="flex">
                  <div className={`w-14 md:w-20 flex-shrink-0 flex flex-col items-center justify-start pt-4 pb-4 ${isToday ? 'bg-[#FFFBEA]' : ''}`}>
                    <div className={`text-xl md:text-2xl font-bold leading-none ${isToday ? 'text-[#FFD100]' : 'text-[#1C1917]'}`}>
                      {day.date}
                    </div>
                    <div className={`text-xs mt-0.5 ${isToday ? 'text-[#FFD100]' : 'text-[#9C8B78]'}`}>
                      {day.weekday}
                    </div>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#FFD100] mt-1.5" />}
                  </div>
                  <div className="flex-1 py-3 px-4 space-y-2">
                    {dayEvents.length === 0 ? (
                      <div className="py-2 text-[#C5BDB5] text-sm">暂无安排</div>
                    ) : (
                      dayEvents.map((event) => {
                        const style = getEventStyle(event);
                        return (
                          <div
                            key={event.id}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${style.bg}`}
                          >
                            <span className="text-[#9C8B78] text-sm w-10 md:w-12 flex-shrink-0 text-right">
                              {event.time}
                            </span>
                            <div className={`${style.icon}`}>
                              <EventIcon type={event.type} />
                            </div>
                            <div className="flex-1">
                              <span className={`font-medium text-sm ${style.text}`}>{event.title}</span>
                              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${event.isDemo ? 'bg-[#EDE8E1] text-[#6B5E4E]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
                                {event.isDemo ? '示例' : '我的'}
                              </span>
                              {event.company && (
                                <span className="text-[#9C8B78] text-sm ml-1.5">・{event.company}</span>
                              )}
                            </div>
                            {style.badgeText && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${style.badge}`}>
                                {style.badgeText}
                              </span>
                            )}
                            <button
                              onClick={() => void deleteScheduleEvent(event)}
                              disabled={event.isDemo}
                              className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] disabled:text-[#C5BDB5] disabled:hover:bg-transparent"
                              title={event.isDemo ? '示例数据不能删除' : '删除日程'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-4 border-t border-[#F5F0EA]">
            <p className="text-[#C5BDB5] text-sm flex items-center gap-2">
              <span>⊙</span>
              周日特意留空了 —— 不是偷懒，是给下周留点劲儿。
            </p>
          </div>
        </div>
      </div>
      {showCreateModal && (
        <ScheduleEventModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateScheduleEvent}
        />
      )}
    </div>
  );
}
