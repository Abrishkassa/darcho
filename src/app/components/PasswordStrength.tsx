// app/components/PasswordStrength.tsx
"use client";

import React from "react";

export default function PasswordStrength({ value }: { value: string }) {
  const score = getScore(value);
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
  const color =
    score <= 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : score === 3 ? "bg-emerald-500" : "bg-emerald-600";

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-200 dark:bg-stone-800 rounded-full overflow-hidden">
        <div style={{ width: `${(score / 4) * 100}%` }} className={`h-2 ${color} rounded-full transition-all`} />
      </div>
      <div className="mt-1 text-xs text-amber-800 dark:text-amber-100/80">{labels[Math.max(0, Math.min(4, score))]}</div>
    </div>
  );
}

function getScore(s: string) {
  let score = 0;
  if (!s) return 0;
  if (s.length >= 8) score++;
  if (/[A-Z]/.test(s) && /[0-9]/.test(s)) score++;
  if (/[^A-Za-z0-9]/.test(s)) score++;
  if (s.length >= 12) score++;
  return score;
}
