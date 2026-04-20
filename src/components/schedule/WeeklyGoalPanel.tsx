const weeklyGoals = [
  { label: '投递', target: 10, current: 7, unit: '家' },
  { label: '面试', target: 3, current: 2, unit: '场' },
  { label: '复盘', target: 3, current: 1, unit: '次' },
];

export function WeeklyGoalPanel({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#1C1917]">{title}</h3>
          <p className="text-[#9C8B78] text-sm mt-0.5">先定节奏，再看每天怎么排。</p>
        </div>
      </div>
      <div className="space-y-4">
        {weeklyGoals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#6B5E4E] text-sm font-medium">{goal.label}</span>
                <span className="text-[#9C8B78] text-xs">
                  {goal.current} / {goal.target} {goal.unit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#F0EBE4] overflow-hidden">
                <div className="h-full rounded-full bg-[#FFD100]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
