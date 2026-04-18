interface BarChartProps {
  data: { category: string; rate: number; color: string }[];
}

export default function HorizontalBarChart({ data }: BarChartProps) {
  return (
    <div className="space-y-4 mt-4">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-20 text-right text-sm text-[#6B5E4E] flex-shrink-0">{item.category}</div>
          <div className="flex-1 bg-[#F0EBE4] rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 flex items-center"
              style={{ width: `${item.rate}%`, backgroundColor: item.color }}
            >
              <span className="text-white text-[11px] font-medium ml-2 opacity-90">{item.rate}%</span>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 mt-2 ml-23">
        <div className="w-20 flex-shrink-0" />
        <div className="flex-1 flex justify-between text-[#C5BDB5] text-xs">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
