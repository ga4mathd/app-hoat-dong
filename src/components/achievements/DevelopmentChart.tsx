import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { DevelopmentData } from '@/lib/developmentCategories';

interface DevelopmentChartProps {
  data: DevelopmentData[];
}

export function DevelopmentChart({ data }: DevelopmentChartProps) {
  // Custom tick for displaying category names with icons
  const CustomTick = ({ x, y, payload }: any) => {
    const item = data.find(d => d.category === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          fontSize={12}
          fontWeight={500}
        >
          {item?.icon}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="category"
            tick={<CustomTick />}
            stroke="hsl(var(--muted-foreground))"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 'auto']}
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickCount={4}
          />
          <Radar
            name="Phát triển"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
