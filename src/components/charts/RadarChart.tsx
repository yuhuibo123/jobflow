interface RadarData {
  label: string;
  value: number;
  avg: number;
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
}

export default function RadarChart({ data, size = 200 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = data.length;

  const getPoint = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const labelR = r + 26;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
    };
  };

  const makePolygon = (values: number[], maxVal: number = 100) => {
    return data
      .map((_, i) => {
        const ratio = values[i] / maxVal;
        const pt = getPoint(i, r * ratio);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const makeGridPolygon = (ratio: number) => {
    return data
      .map((_, i) => {
        const pt = getPoint(i, r * ratio);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  const valuePolygon = makePolygon(data.map((d) => d.value));
  const avgPolygon = makePolygon(data.map((d) => d.avg));

  return (
    <div className="flex flex-col items-center">
      <svg width={size + 60} height={size + 60} viewBox={`-30 -30 ${size + 60} ${size + 60}`}>
        {gridLevels.map((level, i) => (
          <polygon
            key={i}
            points={makeGridPolygon(level)}
            fill="none"
            stroke="#E8E2D9"
            strokeWidth="1"
          />
        ))}

        {data.map((_, i) => {
          const pt = getPoint(i, r);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="#E8E2D9"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={avgPolygon}
          fill="rgba(245, 166, 35, 0.08)"
          stroke="#FFE36A"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        <polygon
          points={valuePolygon}
          fill="rgba(245, 166, 35, 0.25)"
          stroke="#FFD100"
          strokeWidth="2"
        />

        {data.map((d, i) => {
          const ratio = d.value / 100;
          const pt = getPoint(i, r * ratio);
          return (
            <circle key={i} cx={pt.x} cy={pt.y} r={3} fill="#FFD100" />
          );
        })}

        {data.map((d, i) => {
          const lp = getLabelPoint(i);
          return (
            <text
              key={i}
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="#6B5E4E"
              fontFamily="sans-serif"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 text-xs text-[#9C8B78]">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#FFD100] inline-block rounded" />
          实线是你
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-[#FFE36A] inline-block" />
          虚线是同期候选人均值
        </span>
      </div>
    </div>
  );
}
