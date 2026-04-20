interface LineChartProps {
  data: { date: string; score: number }[];
  width?: number;
  height?: number;
}

export default function LineChart({ data, width = 800, height = 200 }: LineChartProps) {
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minScore = 0;
  const maxScore = 10;

  const getX = (i: number) => paddingLeft + (i / (data.length - 1)) * chartWidth;
  const getY = (score: number) =>
    paddingTop + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.score)}`)
    .join(' ');

  const areaD =
    pathD +
    ` L ${getX(data.length - 1)} ${paddingTop + chartHeight}` +
    ` L ${getX(0)} ${paddingTop + chartHeight} Z`;

  const gridLines = [0, 3, 6, 10];

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {gridLines.map((val) => (
          <g key={val}>
            <line
              x1={paddingLeft}
              y1={getY(val)}
              x2={width - paddingRight}
              y2={getY(val)}
              stroke="#F0EBE4"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 6}
              y={getY(val)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="#C5BDB5"
              fontFamily="sans-serif"
            >
              {val}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD100" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFD100" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path d={areaD} fill="url(#areaGradient)" />

        <path
          d={pathD}
          fill="none"
          stroke="#FFD100"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((d, i) => {
          const isMin = i === data.findIndex((x) => x.score === Math.min(...data.map((y) => y.score)));
          return (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.score)}
              r={isMin ? 5 : 4}
              fill={isMin ? '#EF4444' : '#FFD100'}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#9C8B78"
            fontFamily="sans-serif"
          >
            {d.date}
          </text>
        ))}
      </svg>
    </div>
  );
}
