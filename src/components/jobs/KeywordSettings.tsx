import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useJobFlow } from '../../store/useJobFlow';

export function KeywordSettings() {
  const { userSettings, addWatchedKeyword, removeWatchedKeyword } = useJobFlow();
  const [keyword, setKeyword] = useState('');

  const addKeyword = () => {
    addWatchedKeyword(keyword);
    setKeyword('');
  };

  return (
    <div className="rounded-xl border border-[#F0EBE4] bg-white p-4">
      <div className="flex items-center gap-2 mb-1">
        <Search size={15} className="text-[#6B5E4E]" />
        <h4 className="text-[#1C1917] font-bold text-sm">关注关键词</h4>
      </div>
      <p className="text-[#9C8B78] text-xs leading-relaxed mb-3">岗位雷达会围绕这些方向推送机会。</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {userSettings.watchedKeywords.map((item) => (
          <button
            key={item}
            onClick={() => removeWatchedKeyword(item)}
            className="inline-flex items-center gap-1 rounded-full bg-[#FFF7CC] border border-[#FFE36A] px-2 py-1 text-[10px] text-[#7A5A00]"
          >
            {item}
            <X size={10} />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') addKeyword(); }}
          placeholder="新增关键词"
          className="min-w-0 flex-1 border border-[#E8E2D9] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#FFD100]"
        />
        <button onClick={addKeyword} className="rounded-lg bg-[#1C1917] px-3 py-2 text-xs font-medium text-white">
          添加
        </button>
      </div>
    </div>
  );
}
