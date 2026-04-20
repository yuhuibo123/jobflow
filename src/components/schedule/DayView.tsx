import { ScheduleEvent } from '../../types';
import { today, isSameDay, formatDate, weekdayNames } from '../../lib/dateHelpers';
import { ScheduleEventRow } from './ScheduleEventRow';
import { InterviewPrepPanel } from './InterviewPrepPanel';

export function DayView({
  scheduleEvents,
  anchorDate,
  onDelete,
}: {
  scheduleEvents: ScheduleEvent[];
  anchorDate: Date;
  onDelete: (event: ScheduleEvent) => void;
}) {
  const todayEvents = scheduleEvents
    .filter((event) => event.date === anchorDate.getDate())
    .slice(0, 3);
  const isToday = isSameDay(anchorDate, today);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F0EBE4] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[#1C1917]">
              {isToday ? '今天最重要的 3 件事' : `${anchorDate.getMonth() + 1} 月 ${anchorDate.getDate()} 日的安排`}
            </h3>
            <p className="text-[#9C8B78] text-sm mt-0.5">先处理这一天会影响结果的事情。</p>
          </div>
          <span className="text-[#9C8B78] text-xs">{formatDate(anchorDate)}・{weekdayNames[anchorDate.getDay()]}</span>
        </div>
        <div className="space-y-3">
          {todayEvents.length > 0 ? (
            todayEvents.map((event) => (
              <ScheduleEventRow key={event.id} event={event} onDelete={onDelete} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[#E8E2D9] bg-[#FBF8F3] p-5 text-center text-[#C5BDB5] text-sm">
              今天没有安排，适合补复盘或整理岗位。
            </div>
          )}
        </div>
      </div>
      <InterviewPrepPanel />
    </div>
  );
}
