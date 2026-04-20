import { Phone, FileText, Users, Zap, CheckCircle2, Clock, XCircle, Coffee, Trash2 } from 'lucide-react';
import { ScheduleEvent } from '../../types';

export function EventIcon({ type }: { type: ScheduleEvent['type'] }) {
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

export function getEventStyle(event: ScheduleEvent) {
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

export function ScheduleEventRow({
  event,
  onDelete,
}: {
  event: ScheduleEvent;
  onDelete: (event: ScheduleEvent) => void;
}) {
  const style = getEventStyle(event);

  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${style.bg}`}>
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
        onClick={() => onDelete(event)}
        disabled={event.isDemo}
        className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] disabled:text-[#C5BDB5] disabled:hover:bg-transparent"
        title={event.isDemo ? '示例数据不能删除' : '删除日程'}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
