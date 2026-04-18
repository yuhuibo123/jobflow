import { useState } from 'react';
import { CheckCircle2, Clock, Filter, ArrowRight } from 'lucide-react';
import { reviews } from '../data/mockData';
import { ReviewEntry } from '../types';

type FilterType = '全部' | '趁热待写' | '挂了的' | '高分场';

const filters: FilterType[] = ['全部', '趁热待写', '挂了的', '高分场'];

function ReviewListCard({
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
    return '#F59E0B';
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
        isSelected ? 'border-[#F5A623] bg-[#FFFBF0]' : 'border-[#F0EBE4] bg-white hover:border-[#E8DDD0]'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1C1917] text-base">{review.company}</span>
          {review.isHot && (
            <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-full font-medium border border-[#FDE68A]">
              趁热待写
            </span>
          )}
          {review.result === 'pass' && (
            <CheckCircle2 size={16} className="text-[#22C55E]" />
          )}
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
          <span
            className="text-xs font-medium"
            style={{ color: getProgressColor() }}
          >
            {review.score}
          </span>
          <span className="text-[#C5BDB5] text-xs">・</span>
          <span className="text-[#9C8B78] text-xs">{review.completed}%</span>
        </div>
      </div>

      <div
        className="h-0.5 rounded-full mt-3"
        style={{ backgroundColor: '#F0EBE4' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${review.completed}%`,
            backgroundColor: getProgressColor(),
          }}
        />
      </div>
    </div>
  );
}

function StarSection({ label, letter, content, placeholder }: {
  label: string;
  letter: string;
  content: string;
  placeholder?: string;
}) {
  const isEmpty = !content;
  return (
    <div className={`rounded-xl p-4 border ${isEmpty ? 'bg-[#FFFBF0] border-[#FDE68A]' : 'bg-[#FAFAF9] border-[#F0EBE4]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-[#1C1917] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">{letter}</span>
        </div>
        <span className="text-[#1C1917] text-sm font-medium">・{label}</span>
      </div>
      {isEmpty ? (
        <p className="text-[#C5BDB5] text-sm italic">{placeholder}</p>
      ) : (
        <p className="text-[#1C1917] text-sm leading-relaxed">{content}</p>
      )}
    </div>
  );
}

export default function ReviewLibrary() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('全部');
  const [selectedId, setSelectedId] = useState<string>('1');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '趁热待写') return r.isHot;
    if (activeFilter === '挂了的') return r.result === 'fail';
    if (activeFilter === '高分场') return r.score === '状态很好';
    return true;
  });

  const selected = reviews.find((r) => r.id === selectedId) || reviews[0];

  return (
    <div className="pt-16 min-h-screen bg-[#FBF8F3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="text-[#9C8B78] text-sm mb-1">每一场面试，都别白走</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1C1917]">
            复盘库 <span className="text-[#9C8B78] font-normal text-2xl">{reviews.length}</span>
          </h1>
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-[#1C1917] text-white'
                    : 'text-[#6B5E4E] hover:text-[#1C1917] hover:bg-[#EDE8E1]'
                }`}
              >
                {f}
              </button>
            ))}
            <button className="p-2 bg-white border border-[#E8E2D9] rounded-lg text-[#6B5E4E] hover:border-[#C5BDB5]">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className={`col-span-5 md:col-span-2 space-y-3 ${mobileView === 'detail' ? 'hidden md:block' : ''}`}>
            {filteredReviews.map((review) => (
              <ReviewListCard
                key={review.id}
                review={review}
                isSelected={selectedId === review.id}
                onClick={() => { setSelectedId(review.id); setMobileView('detail'); }}
              />
            ))}
          </div>

          <div className={`col-span-5 md:col-span-3 ${mobileView === 'list' ? 'hidden md:block' : ''}`}>
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden flex items-center gap-1.5 text-[#6B5E4E] text-sm mb-4"
            >
              ← 返回列表
            </button>
            <div className="bg-white rounded-2xl border border-[#F0EBE4] sticky top-20">
              <div className="p-6 border-b border-[#F5F0EA]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-[#1C1917]">{selected.company}</h2>
                      <span className="text-[#9C8B78]">・</span>
                      <span className="text-[#6B5E4E] font-medium">{selected.stage}</span>
                    </div>
                    <div className="text-[#9C8B78] text-sm">{selected.date} ・历时 {selected.duration} 分钟</div>
                  </div>
                  {selected.moodState && (
                    <div className="text-right">
                      <div className="text-[#9C8B78] text-xs mb-1">当时状态</div>
                      <div className="bg-[#FEF9EE] border border-[#FDE68A] text-[#D97706] text-sm px-3 py-1 rounded-full font-medium">
                        {selected.moodState}・{selected.moodScore}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#F5A623] rounded-full" />
                    <span className="text-[#1C1917] font-semibold text-sm">一句话总结</span>
                  </div>
                  <p className="text-[#1C1917] leading-relaxed">{selected.summary}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#F5A623] rounded-full" />
                      <span className="text-[#1C1917] font-semibold text-sm">STAR 复盘</span>
                    </div>
                    {selected.completed < 100 && (
                      <span className="text-[#F59E0B] text-xs bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                        还差 {100 - selected.completed}%
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <StarSection
                      letter="S"
                      label="情境"
                      content={selected.star?.situation || ''}
                      placeholder="当时的背景是什么？"
                    />
                    <StarSection
                      letter="T"
                      label="任务"
                      content={selected.star?.task || ''}
                      placeholder="你需要回答什么？"
                    />
                    <StarSection
                      letter="A"
                      label="行动"
                      content={selected.star?.action || ''}
                      placeholder="你当时怎么答的？"
                    />
                    <StarSection
                      letter="R"
                      label="结果"
                      content={selected.star?.result || ''}
                      placeholder="效果怎么样？"
                    />
                  </div>
                </div>

                {selected.nextStep && (
                  <div className="bg-[#1C1917] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-[#F5A623] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[#9C8B78] text-xs mb-1">下一步</div>
                        <p className="text-white text-sm leading-relaxed">{selected.nextStep}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[#F5A623] text-sm font-medium whitespace-nowrap ml-4 hover:text-[#F5C842] transition-colors">
                      加到日程 <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
