import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useJobFlow } from '../store/useJobFlow';
import { ScheduleEventInput } from '../types';
import { today, isSameDay, formatDate, formatMonth, getWeekDays, weekdayNames, addDays, addMonths } from '../lib/dateHelpers';
import { ScheduleEventModal } from '../components/schedule/ScheduleEventModal';
import { WeeklyGoalPanel } from '../components/schedule/WeeklyGoalPanel';
import { DayView } from '../components/schedule/DayView';
import { WeekView } from '../components/schedule/WeekView';
import { MonthView } from '../components/schedule/MonthView';
import { OpenView } from '../components/schedule/OpenView';

type ScheduleView = 'day' | 'week' | 'month' | 'open';

const stats = [
  { label: '已投递', value: '14', unit: '家', delta: '+4 本周' },
  { label: '面试中', value: '4', unit: '家', delta: '+2 本周' },
  { label: 'OFFER', value: '1', unit: '个', subLabel: '满满・待定' },
  { label: '连续记录', value: '18', unit: '天', subLabel: '坚持就是赢了一半' },
];

const scheduleViews: { id: ScheduleView; label: string }[] = [
  { id: 'day', label: '日' },
  { id: 'week', label: '周' },
  { id: 'month', label: '月' },
  { id: 'open', label: '未完成' },
];

function getViewCopy(view: ScheduleView, anchorDate: Date) {
  const weekDays = getWeekDays(anchorDate);
  if (view === 'day') {
    const relative = isSameDay(anchorDate, today)
      ? '今天怎么走'
      : anchorDate < today
        ? `${anchorDate.getMonth() + 1} 月 ${anchorDate.getDate()} 日怎么过`
        : `${anchorDate.getMonth() + 1} 月 ${anchorDate.getDate()} 日怎么排`;
    return { title: relative, subtitle: `${formatDate(anchorDate)} · ${weekdayNames[anchorDate.getDay()]}`, planTitle: '今日计划', description: '只看这一天最要紧的安排。' };
  }
  if (view === 'month') {
    const title = anchorDate.getFullYear() === today.getFullYear() && anchorDate.getMonth() === today.getMonth()
      ? '这个月怎么走'
      : anchorDate < today ? `${anchorDate.getMonth() + 1} 月怎么过` : `${anchorDate.getMonth() + 1} 月怎么排`;
    return { title, subtitle: formatMonth(anchorDate), planTitle: '本月目标', description: '用月历看面试、笔试和截止节点。' };
  }
  if (view === 'open') {
    return { title: '还有哪些没处理', subtitle: '按优先级排列', planTitle: '未完成事项', description: '把还没处理的任务集中看一遍。' };
  }
  const isCurrentWeek = weekDays.some((day) => isSameDay(day.fullDate, today));
  return {
    title: isCurrentWeek ? '这周怎么走' : anchorDate < today ? '上周怎么过' : '下周怎么排',
    subtitle: `${weekDays[0].fullDate.getMonth() + 1} 月 ${weekDays[0].date} 日 — ${weekDays[6].fullDate.getMonth() + 1} 月 ${weekDays[6].date} 日`,
    planTitle: '本周目标',
    description: '按一周节奏安排面试、笔试和复盘。',
  };
}

export default function Schedule({ createRequest }: { createRequest: number }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scheduleView, setScheduleView] = useState<ScheduleView>('week');
  const [anchorDate, setAnchorDate] = useState(today);
  const { scheduleEvents, createScheduleEvent, deleteScheduleEvent } = useJobFlow();
  const viewCopy = getViewCopy(scheduleView, anchorDate);

  useEffect(() => {
    if (createRequest > 0) setShowCreateModal(true);
  }, [createRequest]);

  const handleCreateScheduleEvent = async (input: ScheduleEventInput) => {
    const created = await createScheduleEvent(input);
    if (created) setShowCreateModal(false);
  };

  const shiftDate = (direction: -1 | 1) => {
    if (scheduleView === 'day') { setAnchorDate((current) => addDays(current, direction)); return; }
    if (scheduleView === 'week') { setAnchorDate((current) => addDays(current, direction * 7)); return; }
    if (scheduleView === 'month') { setAnchorDate((current) => addMonths(current, direction)); }
  };

  const rangeLabels = {
    day: { prev: '昨天', current: '今天', next: '明天' },
    week: { prev: '上周', current: '本周', next: '下周' },
    month: { prev: '上个月', current: '本月', next: '下个月' },
    open: { prev: '', current: '全部未完成', next: '' },
  }[scheduleView];

  const renderView = () => {
    const deleteHandler = (event: Parameters<typeof deleteScheduleEvent>[0]) => void deleteScheduleEvent(event);
    switch (scheduleView) {
      case 'day': return <DayView scheduleEvents={scheduleEvents} anchorDate={anchorDate} onDelete={deleteHandler} />;
      case 'month': return <MonthView scheduleEvents={scheduleEvents} anchorDate={anchorDate} />;
      case 'open': return <OpenView scheduleEvents={scheduleEvents} onDelete={deleteHandler} />;
      default: return <WeekView scheduleEvents={scheduleEvents} anchorDate={anchorDate} onDelete={deleteHandler} />;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-5 rounded-2xl border border-[#FFE36A] bg-[#FFFBEA] px-4 py-3 text-sm text-[#6B5E4E]">
          为了便于展示，这里预置了示例日程。新增日程会进入前端统一状态，示例数据不会被删除。
        </div>
        <div className="text-[#9C8B78] text-sm mb-1">{viewCopy.subtitle}</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">{viewCopy.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-xl bg-white border border-[#E8E2D9] p-1">
              {scheduleViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setScheduleView(view.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    scheduleView === view.id ? 'bg-[#1C1917] text-white' : 'text-[#6B5E4E] hover:text-[#1C1917] hover:bg-[#F5F0EA]'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
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
                {s.value}<span className="text-[#9C8B78] text-lg font-normal ml-1">{s.unit}</span>
              </div>
              {s.delta && <div className="text-[#22C55E] text-sm">{s.delta}</div>}
              {s.subLabel && <div className="text-[#9C8B78] text-sm">{s.subLabel}</div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <WeeklyGoalPanel title={viewCopy.planTitle} />
          </div>
          <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <div className="text-[#9C8B78] text-sm mb-1">当前视图</div>
                <div className="text-[#1C1917] text-xl font-bold">
                  {scheduleViews.find((v) => v.id === scheduleView)?.label}视图
                </div>
                <p className="text-[#9C8B78] text-sm leading-relaxed mt-2">
                  {scheduleView === 'day' ? '今天只看最要紧的 3 件事。' : viewCopy.description}
                </p>
              </div>
              <div className="border-t border-[#F5F0EA] pt-4">
                <div className="text-[#9C8B78] text-xs mb-2">时间选择</div>
                {scheduleView !== 'open' ? (
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#FBF8F3] border border-[#E8E2D9] p-1">
                    <button onClick={() => shiftDate(-1)} className="px-2 py-1.5 rounded-lg text-xs font-medium text-[#6B5E4E] hover:bg-white">
                      ← {rangeLabels.prev}
                    </button>
                    <button onClick={() => setAnchorDate(today)} className="px-2 py-1.5 rounded-lg text-xs font-medium bg-[#FFFBEA] text-[#7A5A00] border border-[#FFE36A]">
                      {rangeLabels.current}
                    </button>
                    <button onClick={() => shiftDate(1)} className="px-2 py-1.5 rounded-lg text-xs font-medium text-[#6B5E4E] hover:bg-white">
                      {rangeLabels.next} →
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#FBF8F3] border border-[#E8E2D9] px-3 py-2 text-xs font-medium text-[#6B5E4E]">
                    {rangeLabels.current}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {renderView()}
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
