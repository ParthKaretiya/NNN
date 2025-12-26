
import React from 'react';

interface RiskMeterProps {
  score: number;
  label: string;
  size?: 'sm' | 'lg';
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score, label, size = 'lg' }) => {
  const getColor = (s: number) => {
    if (s > 75) return 'text-red-500';
    if (s > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStroke = (s: number) => {
    if (s > 75) return '#ef4444';
    if (s > 40) return '#f59e0b';
    return '#10b981';
  };

  const radius = size === 'lg' ? 45 : 20;
  const stroke = size === 'lg' ? 8 : 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#27272a"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={getStroke(score)}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className={`absolute flex flex-col items-center ${getColor(score)}`}>
           <span className={`${size === 'lg' ? 'text-2xl' : 'text-xs'} font-bold`}>{score}</span>
        </div>
      </div>
      <span className={`mt-2 ${size === 'lg' ? 'text-sm' : 'text-[10px]'} font-medium text-zinc-400 uppercase tracking-wider`}>{label}</span>
    </div>
  );
};

export default RiskMeter;
