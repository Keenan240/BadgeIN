"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WizardStep } from "@/lib/types";

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "mapping", label: "Map" },
  { key: "preview", label: "Review" },
];

interface StepIndicatorProps {
  current: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

export function StepIndicator({ current, onStepClick }: StepIndicatorProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2 no-print">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isClickable = isComplete && !!onStepClick;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors",
                isCurrent && "bg-primary text-primary-foreground",
                isComplete && "bg-emerald-50 text-emerald-700",
                isClickable && "cursor-pointer hover:bg-emerald-100",
                !isCurrent && !isComplete && "text-muted-foreground"
              )}
              onClick={isClickable ? () => onStepClick(step.key) : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                isClickable
                  ? (e) => e.key === "Enter" && onStepClick(step.key)
                  : undefined
              }
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium",
                  isCurrent && "bg-primary-foreground/20",
                  isComplete && "bg-emerald-200 text-emerald-700",
                  !isCurrent && !isComplete && "border border-muted-foreground/30"
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6",
                  i < currentIdx ? "bg-emerald-400" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
