import { useState } from 'react';
import { Search, Bell, LayoutGrid, BookOpen, BarChart2, Calendar } from 'lucide-react';
import { TabType } from '../types';
import { applications, reviews, scheduleEvents } from '../data/mockData';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'dashboard', label: '看板' },
  { id: 'review', label: '复盘库' },
  { id: 'insights', label: '洞察' },
  { id: 'schedule', label: '日程' },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [openTip, setOpenTip] = useState<'notifications' | 'profile' | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');

  const searchResults = query.trim()
    ? [
        ...applications
          .filter((item) =>
            [item.company, item.position, item.department, item.note || '', ...(item.tags || [])]
              .join(' ')
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          )
          .slice(0, 4)
          .map((item) => ({
            id: `application-${item.id}`,
            tab: 'dashboard' as TabType,
            title: `${item.company} · ${item.position}`,
            meta: `看板 / ${item.department || '未填写方向'}`,
          })),
        ...reviews
          .filter((item) =>
            [item.company, item.position, item.stage, item.summary, ...item.tags]
              .join(' ')
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          )
          .slice(0, 4)
          .map((item) => ({
            id: `review-${item.id}`,
            tab: 'review' as TabType,
            title: `${item.company} · ${item.stage}`,
            meta: `复盘库 / ${item.position}`,
          })),
        ...scheduleEvents
          .filter((item) =>
            [item.title, item.company || '', item.weekday, item.time || '']
              .join(' ')
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          )
          .slice(0, 4)
          .map((item) => ({
            id: `schedule-${item.id}`,
            tab: 'schedule' as TabType,
            title: item.title,
            meta: `日程 / ${item.weekday} ${item.time || ''}`,
          })),
      ].slice(0, 8)
    : [];

  const openResult = (tab: TabType) => {
    onTabChange(tab);
    setShowSearch(false);
    setQuery('');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FBF8F3] border-b border-[#E8E2D9] h-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center gap-4 md:gap-8">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-[#FFD100] rounded-lg flex items-center justify-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <rect x="3.2" y="7" width="15.6" height="10.5" rx="2.2" fill="#1C1917" />
            <path
              d="M8.2 7V5.8C8.2 4.8 9 4 10 4H12C13 4 13.8 4.8 13.8 5.8V7"
              stroke="#1C1917"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M5.2 11.2H16.8"
              stroke="#FFD100"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <rect x="9.2" y="10" width="3.6" height="2.6" rx="0.8" fill="#FFD100" />
            <path
              d="M7.2 14.7H11.2"
              stroke="#FBF8F3"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M13.2 14.7H14.8"
              stroke="#FBF8F3"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="font-semibold text-[#1C1917] text-base">JobFlow</span>
      </div>

      <div className="hidden md:flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#1C1917] text-white'
                : 'text-[#6B5E4E] hover:text-[#1C1917] hover:bg-[#EDE8E1]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        onClick={() => setShowSearch(true)}
        className="hidden lg:flex items-center gap-2 bg-white border border-[#E8E2D9] rounded-lg px-3 py-1.5 w-52 text-left hover:border-[#C5BDB5] transition-colors"
      >
        <Search size={14} className="text-[#9C8B78]" />
        <span className="text-[#B8AFA5] text-sm flex-1">搜公司 / 岗位 / 复盘</span>
        <span className="text-[#C5BDB5] text-xs border border-[#E8E2D9] rounded px-1">⌘ K</span>
      </button>

      <div className="hidden md:block relative">
        <button
          onClick={() => setOpenTip((current) => current === 'notifications' ? null : 'notifications')}
          className="flex relative p-1.5 hover:bg-[#EDE8E1] rounded-lg transition-colors"
        >
          <Bell size={18} className="text-[#6B5E4E]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FFD100] rounded-full" />
        </button>
        {openTip === 'notifications' && (
          <div className="absolute right-0 top-10 w-56 bg-white border border-[#F0EBE4] rounded-lg shadow-lg p-3">
            <div className="text-[#1C1917] text-sm font-medium">暂无新的提醒</div>
            <p className="text-[#9C8B78] text-xs leading-relaxed mt-1">
              当前没有待处理通知，新增面试或复盘后这里会用于展示提醒。
            </p>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setOpenTip((current) => current === 'profile' ? null : 'profile')}
          className="flex items-center gap-2 rounded-lg hover:bg-[#EDE8E1] transition-colors p-1"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFB800] flex items-center justify-center overflow-hidden">
            <span className="text-white text-xs font-medium">林</span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[#1C1917] text-sm font-medium leading-tight">林晚</div>
            <div className="text-[#9C8B78] text-xs leading-tight">新闻学院</div>
          </div>
        </button>
        {openTip === 'profile' && (
          <div className="absolute right-0 top-12 w-64 bg-white border border-[#F0EBE4] rounded-lg shadow-lg p-3">
            <div className="text-[#1C1917] text-sm font-medium">林晚</div>
            <p className="text-[#9C8B78] text-xs leading-relaxed mt-1">
              为了便于展示作品，这里暂时不做登录系统。当前页面使用示例身份展示，新增的数据会直接保存到 Supabase。
            </p>
          </div>
        )}
      </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBF8F3] border-t border-[#E8E2D9] flex">
        {[
          { id: 'dashboard' as TabType, label: '看板', Icon: LayoutGrid },
          { id: 'review' as TabType, label: '复盘库', Icon: BookOpen },
          { id: 'insights' as TabType, label: '洞察', Icon: BarChart2 },
          { id: 'schedule' as TabType, label: '日程', Icon: Calendar },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${
              activeTab === id ? 'text-[#1C1917]' : 'text-[#9C8B78]'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {showSearch && (
        <div className="fixed inset-0 z-[70] bg-black/25 flex items-start justify-center px-4 pt-24">
          <div className="w-full max-w-xl bg-white border border-[#F0EBE4] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F5F0EA]">
              <Search size={18} className="text-[#9C8B78]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setShowSearch(false);
                    setQuery('');
                  }
                }}
                placeholder="搜索公司、岗位、复盘或日程"
                className="flex-1 outline-none text-sm text-[#1C1917] placeholder:text-[#B8AFA5]"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setQuery('');
                }}
                className="text-[#9C8B78] text-xs hover:text-[#1C1917]"
              >
                关闭
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {!query.trim() && (
                <div className="px-3 py-8 text-center">
                  <div className="text-[#1C1917] text-sm font-medium">快速查找记录</div>
                  <p className="text-[#9C8B78] text-xs mt-1">
                    输入公司、岗位、面试阶段或日程关键词。
                  </p>
                </div>
              )}

              {query.trim() && searchResults.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <div className="text-[#1C1917] text-sm font-medium">没有找到相关记录</div>
                  <p className="text-[#9C8B78] text-xs mt-1">换一个关键词试试。</p>
                </div>
              )}

              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => openResult(result.tab)}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#FBF8F3] transition-colors"
                >
                  <div className="text-[#1C1917] text-sm font-medium">{result.title}</div>
                  <div className="text-[#9C8B78] text-xs mt-0.5">{result.meta}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
