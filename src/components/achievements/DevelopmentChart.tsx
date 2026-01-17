import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { DevelopmentData } from '@/lib/developmentCategories';

interface DevelopmentChartProps {
  data: DevelopmentData[];
  showLabels?: boolean;
}

export function DevelopmentChart({ data, showLabels = true }: DevelopmentChartProps) {
  // Custom tick for displaying category names with icons
  const CustomTick = ({ x, y, payload, cx, cy }: any) => {
    const item = data.find(d => d.category === payload.value);
    if (!item) return null;

    // Calculate angle from center to determine text position
    const angle = Math.atan2(y - cy, x - cx);
    const angleDeg = (angle * 180) / Math.PI;
    
    // Determine text anchor based on position
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    let dx = 0;
    
    if (angleDeg > 45 && angleDeg < 135) {
      // Bottom area
      textAnchor = 'middle';
    } else if (angleDeg >= 135 || angleDeg <= -135) {
      // Left area
      textAnchor = 'end';
      dx = -4;
    } else if (angleDeg >= -45 && angleDeg <= 45) {
      // Right area
      textAnchor = 'start';
      dx = 4;
    } else {
      // Top area
      textAnchor = 'middle';
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={dx}
          y={0}
          dy={4}
          textAnchor={textAnchor}
          fill="hsl(var(--foreground))"
          fontSize={14}
        >
          {item.icon}
        </text>
        {showLabels && (
          <text
            x={dx}
            y={18}
            textAnchor={textAnchor}
            fill="hsl(var(--muted-foreground))"
            fontSize={11}
            fontWeight={500}
          >
            {item.shortName}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="category"
            tick={<CustomTick />}
            stroke="hsl(var(--muted-foreground))"
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
