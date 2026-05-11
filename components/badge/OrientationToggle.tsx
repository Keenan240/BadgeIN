"use client";

import { RectangleHorizontal, RectangleVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Orientation } from "@/lib/types";

interface OrientationToggleProps {
  value: Orientation;
  onChange: (next: Orientation) => void;
  className?: string;
}

const OPTIONS: { value: Orientation; label: string; Icon: typeof RectangleVertical }[] = [
  { value: "landscape", label: "Landscape", Icon: RectangleHorizontal },
  { value: "portrait", label: "Portrait", Icon: RectangleVertical },
];

export function OrientationToggle({
  value,
  onChange,
  className,
}: OrientationToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Badge orientation"
      className={cn(
        "inline-flex items-center rounded-lg border bg-card p-1",
        className
      )}
    >
      {OPTIONS.map(({ value: optValue, label, Icon }) => {
        const active = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(optValue)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-xs transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
