import { ReviewEntry } from '../../types';

export function PendingReviewQueue({
  reviews,
  selectedId,
  onSelect,
}: {
  reviews: ReviewEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const pendingReviews = reviews.filter((review) => review.status === 'pending' || review.isHot || review.completed < 100);

  if (pendingReviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5 mb-6">
        <div className="text-[#1C1917] font-bold mb-1">待复盘队列</div>
        <p className="text-[#9C8B78] text-sm">当前没有待写复盘。新建复盘后，会先出现在这里。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5 mb-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-4">
        <div>
          <div className="text-[#1C1917] font-bold">待复盘队列</div>
          <p className="text-[#9C8B78] text-sm mt-0.5">先选一场面试，再添加录音、笔记或手动补充。</p>
        </div>
        <span className="text-[#9C8B78] text-xs">{pendingReviews.length} 场待整理</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pendingReviews.slice(0, 6).map((review) => {
          const active = selectedId === review.id;
          return (
            <button
              key={review.id}
              onClick={() => onSelect(review.id)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                active ? 'bg-[#FFFBEA] border-[#FFE36A]' : 'bg-[#FBF8F3] border-[#F0EBE4] hover:border-[#E8DDD0]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-[#1C1917] text-sm font-semibold">{review.company}</div>
                  <div className="text-[#6B5E4E] text-xs mt-0.5">{review.stage || '待确认轮次'}</div>
                </div>
                <span className="text-[10px] bg-[#FFF7CC] text-[#7A5A00] border border-[#FFE36A] px-2 py-0.5 rounded-full">
                  {review.status === 'completed' ? '已完成' : '待写'}
                </span>
              </div>
              <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">{review.position}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#C5BDB5] text-xs">{review.date || '时间待补'}</span>
                <span className="text-[#1C1917] text-xs font-medium">开始整理 →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
