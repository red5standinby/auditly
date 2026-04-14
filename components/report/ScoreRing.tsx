"use client";

import { scoreToRingColor, scoreToGrade } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showGrade?: boolean;
  className?: string;
}

const SIZES = {
  sm: { dim: 64, stroke: 6, r: 26, textSize: "text-lg", gradeSize: "text-xs" },
  md: { dim: 96, stroke: 7, r: 38, textSize: "text-2xl", gradeSize: "text-sm" },
  lg: { dim: 140, stroke: 9, r: 56, textSize: "text-4xl", gradeSize: "text-base" },
};

export default function ScoreRing({ score, size = "md", showGrade = false, className }: Props) {
  const { dim, stroke, r, textSize, gradeSize } = SIZES[size];
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = scoreToRingColor(score);
  const grade = scoreToGrade(score);
  const cx = dim / 2;
  const cy = dim / 2;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e2736" strokeWidth={stroke} />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out, stroke 0.3s",
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-extrabold leading-none", textSize)} style={{ color }}>
          {score}
        </span>
        {showGrade && (
          <span className={cn("font-semibold text-slate-400 leading-none mt-0.5", gradeSize)}>
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}
