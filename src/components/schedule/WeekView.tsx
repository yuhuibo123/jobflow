import { ScheduleEvent } from '../../types';
import { today, isSameDay, getWeekDays } from '../../lib/dateHelpers';
import { ScheduleEventRow } from './ScheduleEventRow';
import { InterviewPrepPanel } from './InterviewPrepPanel';

export function WeekView({
  scheduleEvents,
  anchorDate,
  onDelete,
}: {
  scheduleEvents: ScheduleEvent[];
  anchorDate: Date;
  onDelete: (event: ScheduleEvent) => void;
}) {
  const weekDays = getWeekDays(anchorDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F0EBE4] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F5F0EA]">
          <h3 className="font-bold text-[#1C1917]">本周节奏</h3>
        </div>
        <div className="divide-y divide-[#F5F0EA]">
          {weekDays.map((day) => {
            const dayEvents = scheduleEvents.filter((e) => e.date === day.date);
            const isThisToday = isSameDay(day.fullDate, today);
            return (
              <div key={day.date} className="flex">
                <div className={`w-14 md:w-20 flex-shrink-0 flex flex-col items-center justify-start pt-4 pb-4 ${isThisToday ? 'bg-[#FFFBEA]' : ''}`}>
                  <div className={`text-xl md:text-2xl font-bold leading-none ${isThisToday ? 'text-[#FFD100]' : 'text-[#1C1917]'}`}>
                    {day.date}
                  </div>
                  <div className={`text-xs mt-0.5 ${isThisToday ? 'text-[#FFD100]' : 'text-[#9C8B78]'}`}>
                    {day.weekday}
                  </div>
                  {isThisToday && <div className="w-1.5 h-1.5 rounded-full bg-[#FFD100] mt-1.5" />}
                </div>
                <div className="flex-1 py-3 px-4 space-y-2">
                  {dayEvents.length === 0 ? (
                    <div className="py-2 text-[#C5BDB5] text-sm">暂无安排</div>
                  ) : (
                    dayEvents.map((event) => (
                      <ScheduleEventRow key={event.id} event={event} onDelete={onDelete} />
                    ))
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
      <InterviewPrepPanel />
    </div>
  );
}
