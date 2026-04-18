import { Search, Plus, Bell, LayoutGrid, BookOpen, BarChart2, Calendar } from 'lucide-react';
import { TabType } from '../types';

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
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FBF8F3] border-b border-[#E8E2D9] h-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center gap-4 md:gap-8">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-[#F5A623] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">J</span>
        </div>
        <span className="font-semibold text-[#1C1917] text-base">JobFlow</span>
        <span className="text-[#9C8B78] text-sm">· 一家家来</span>
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

      <div className="hidden lg:flex items-center gap-2 bg-white border border-[#E8E2D9] rounded-lg px-3 py-1.5 w-52">
        <Search size={14} className="text-[#9C8B78]" />
        <span className="text-[#B8AFA5] text-sm flex-1">搜公司 / 岗位 / 复盘</span>
        <span className="text-[#C5BDB5] text-xs border border-[#E8E2D9] rounded px-1">⌘ K</span>
      </div>

      <button className="flex items-center gap-1.5 bg-[#1C1917] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#2D2420] transition-colors">
        <Plus size={14} />
        记一家
      </button>

      <button className="hidden md:flex relative p-1.5 hover:bg-[#EDE8E1] rounded-lg transition-colors">
        <Bell size={18} className="text-[#6B5E4E]" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#F5A623] rounded-full" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E8952A] flex items-center justify-center overflow-hidden">
          <span className="text-white text-xs font-medium">林</span>
        </div>
        <div className="hidden md:block">
          <div className="text-[#1C1917] text-sm font-medium leading-tight">林晚</div>
          <div className="text-[#9C8B78] text-xs leading-tight">新闻学院</div>
        </div>
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
    </nav>
  );
}
