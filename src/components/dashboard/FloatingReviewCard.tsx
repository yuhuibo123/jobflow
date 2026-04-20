import { X, Zap } from 'lucide-react';

export function FloatingReviewCard({ onClose, onWrite }: { onClose: () => void; onWrite: () => void }) {
  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-[calc(100vw-2rem)] md:w-80 bg-white rounded-2xl shadow-2xl border border-[#F0EBE4] overflow-hidden z-40">
      <div className="bg-[#FBF8F3] px-4 py-3 flex items-center justify-between border-b border-[#F0EBE4]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#FFD100] flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-[#1C1917] text-sm font-medium">趁热复盘</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#9C8B78] text-xs">14 小时前</span>
          <button onClick={onClose} className="text-[#9C8B78] hover:text-[#1C1917]">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded bg-[#FFD100] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">美</span>
          </div>
          <span className="text-[#1C1917] text-sm font-medium">美团</span>
          <span className="text-[#FFD100] text-sm font-medium">二面・业务负责人</span>
          <span className="text-[#1C1917] text-sm">刚刚过去</span>
        </div>
        <p className="text-[#6B5E4E] text-xs leading-relaxed mb-4">
          再过一天细节就模糊了。花 6 分钟先记两条要点。
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onWrite} className="flex-1 bg-[#1C1917] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#2D2420] transition-colors">
            好，花 6 分钟写
          </button>
          <button onClick={onClose} className="text-[#9C8B78] text-xs hover:text-[#6B5E4E]">稍后再说</button>
        </div>
      </div>
    </div>
  );
}
