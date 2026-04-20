import { ScheduleEvent } from '../../types';
import { ScheduleEventRow } from './ScheduleEventRow';

const priority: Record<ScheduleEvent['status'], number> = {
  today: 0,
  cancelled: 1,
  upcoming: 2,
  planned: 3,
  rest: 4,
  done: 5,
};

export function OpenView({
  scheduleEvents,
  onDelete,
}: {
  scheduleEvents: ScheduleEvent[];
  onDelete: (event: ScheduleEvent) => void;
}) {
  const openEvents = scheduleEvents
    .filter((event) => event.status !== 'done' && event.status !== 'rest')
    .sort((a, b) => {
      const statusDelta = priority[a.status] - priority[b.status];
      if (statusDelta !== 0) return statusDelta;
      return a.date - b.date;
    });

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#1C1917]">未完成日程</h3>
          <p className="text-[#9C8B78] text-sm mt-0.5">按今天、临近截止、计划中排序。</p>
        </div>
        <span className="text-[#9C8B78] text-xs">{openEvents.length} 条</span>
      </div>
      <div className="space-y-2">
        {openEvents.map((event) => (
          <ScheduleEventRow key={event.id} event={event} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
