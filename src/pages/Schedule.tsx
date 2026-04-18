import { Phone, FileText, Users, Zap, CheckCircle2, Clock, XCircle, Coffee } from 'lucide-react';
import { scheduleEvents } from '../data/mockData';
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
    case 'today': return { bg: 'bg-[#FFFBF0] border border-[#FDE68A]', text: 'text-[#1C1917]', badge: 'bg-[#F5A623] text-white', badgeText: '今天', icon: 'text-[#F5A623]' };
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

export default function Schedule() {
  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="text-[#9C8B78] text-sm mb-1">2 月 23 日 — 3 月 1 日</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">这周怎么走</h1>
          <div className="flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] px-4 py-2 rounded-xl text-sm font-medium">
            <span>🔥</span>
            <span>已连续记录 18 天，挺稳</span>
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
                  <div className={`w-14 md:w-20 flex-shrink-0 flex flex-col items-center justify-start pt-4 pb-4 ${isToday ? 'bg-[#FFFBF0]' : ''}`}>
                    <div className={`text-xl md:text-2xl font-bold leading-none ${isToday ? 'text-[#F5A623]' : 'text-[#1C1917]'}`}>
                      {day.date}
                    </div>
                    <div className={`text-xs mt-0.5 ${isToday ? 'text-[#F5A623]' : 'text-[#9C8B78]'}`}>
                      {day.weekday}
                    </div>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623] mt-1.5" />}
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
                              {event.company && (
                                <span className="text-[#9C8B78] text-sm ml-1.5">・{event.company}</span>
                              )}
                            </div>
                            {style.badgeText && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${style.badge}`}>
                                {style.badgeText}
                              </span>
                            )}
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
    </div>
  );
}
