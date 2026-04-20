import { CheckCircle2 } from 'lucide-react';
import { ReviewEntry } from '../../types';

export function ReviewListCard({
  review,
  isSelected,
  onClick,
}: {
  review: ReviewEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getProgressColor = () => {
    if (review.completed === 100) return review.result === 'fail' ? '#EF4444' : '#22C55E';
    return '#FFD100';
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
        isSelected ? 'border-[#FFD100] bg-[#FFFBEA]' : 'border-[#F0EBE4] bg-white hover:border-[#E8DDD0]'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1C1917] text-base">{review.company}</span>
          {review.isHot && (
            <span className="text-[10px] bg-[#FFF7CC] text-[#7A5A00] px-2 py-0.5 rounded-full font-medium border border-[#FFE36A]">
              趁热待写
            </span>
          )}
          {review.result === 'pass' && <CheckCircle2 size={16} className="text-[#22C55E]" />}
          {review.result === 'fail' && (
            <div className="w-4 h-4 rounded-full border-2 border-[#EF4444] flex items-center justify-center">
              <span className="text-[#EF4444] text-[8px] font-bold">✕</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[#9C8B78] text-xs">{review.date}</div>
          <div className="text-[#9C8B78] text-xs mt-0.5">{review.duration} 分钟</div>
        </div>
      </div>

      <div className="text-[#6B5E4E] text-xs mb-2">{review.position}・{review.stage}</div>
      <p className="text-[#6B5E4E] text-sm leading-relaxed mb-3">{review.summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {review.tags.map((tag, i) => (
            <span
              key={i}
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${
                tag === '挂了' || tag === '不太好'
                  ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                  : 'bg-[#F5F0EA] text-[#6B5E4E] border-[#EDE8E1]'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: getProgressColor() }}>
            {review.score}
          </span>
          <span className="text-[#C5BDB5] text-xs">・</span>
          <span className="text-[#9C8B78] text-xs">{review.completed}%</span>
        </div>
      </div>

      <div className="h-0.5 rounded-full mt-3" style={{ backgroundColor: '#F0EBE4' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${review.completed}%`, backgroundColor: getProgressColor() }}
        />
      </div>
    </div>
  );
}
