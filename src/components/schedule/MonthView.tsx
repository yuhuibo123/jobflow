import { ScheduleEvent } from '../../types';
import { today, formatMonth } from '../../lib/dateHelpers';

export function MonthView({ scheduleEvents, anchorDate }: { scheduleEvents: ScheduleEvent[]; anchorDate: Date }) {
  const daysInMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const isCurrentMonth = anchorDate.getMonth() === today.getMonth() && anchorDate.getFullYear() === today.getFullYear();

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F5F0EA] flex items-center justify-between">
        <h3 className="font-bold text-[#1C1917]">{formatMonth(anchorDate)}月历</h3>
        <span className="text-[#9C8B78] text-xs">面试 / 笔试 / 截止会标记在日期里</span>
      </div>
      <div className="grid grid-cols-7 border-b border-[#F5F0EA] bg-[#FBF8F3]">
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
          <div key={day} className="px-3 py-2 text-center text-[#9C8B78] text-xs font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((date) => {
          const events = scheduleEvents.filter((event) => event.date === date);
          const hasInterview = events.some((event) => event.type === 'interview' || event.type === 'call');
          const hasTest = events.some((event) => event.type === 'test');
          const hasDeadline = events.some((event) => event.type === 'deadline' || event.status === 'cancelled');
          const isToday = isCurrentMonth && date === today.getDate();
          return (
            <div key={date} className={`min-h-24 border-r border-b border-[#F5F0EA] p-3 ${isToday ? 'bg-[#FFFBEA]' : 'bg-white'}`}>
              <div className={`text-sm font-semibold ${isToday ? 'text-[#FFD100]' : 'text-[#1C1917]'}`}>{date}</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {hasInterview && <span className="text-[10px] rounded-full bg-[#FFF7CC] text-[#7A5A00] border border-[#FFE36A] px-2 py-0.5">面试</span>}
                {hasTest && <span className="text-[10px] rounded-full bg-[#F5F0EA] text-[#6B5E4E] px-2 py-0.5">笔试</span>}
                {hasDeadline && <span className="text-[10px] rounded-full bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] px-2 py-0.5">截止</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
