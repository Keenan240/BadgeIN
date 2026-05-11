"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/wizard/StepIndicator";
import { StepMapping } from "@/components/wizard/StepMapping";
import { StepPreview } from "@/components/wizard/StepPreview";
import type {
  Attendee,
  AttendeeWarning,
  ColumnMapping,
  Orientation,
  ParsedCsv,
  WizardStep,
} from "@/lib/types";

const STORAGE_KEY = "badgein:parsed";

export default function GeneratePage() {
  const router = useRouter();
  const didInit = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<WizardStep>("mapping");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [attendees, setAttendees] = useState<Attendee[] | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [, setWarnings] = useState<AttendeeWarning[]>([]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as ParsedCsv;
        if (data?.rawRows?.length && data.detectedColumns?.length) {
          setParsed(data);
          setStep("mapping");
          sessionStorage.removeItem(STORAGE_KEY);
          setHydrated(true);
          return;
        }
      } catch {
        // fall through to redirect
      }
    }
    router.replace("/");
  }, [router]);

  const handleMapped = (next: ColumnMapping) => {
    setMapping(next);
    setAttendees(null);
    setStep("preview");
  };

  const handleAttendeesReady = (
    next: Attendee[],
    nextWarnings: AttendeeWarning[]
  ) => {
    setAttendees(next);
    setWarnings(nextWarnings);
  };

  const handleStepClick = (target: WizardStep) => {
    if (target === "mapping") setStep("mapping");
  };

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex justify-center px-6 pt-10 pb-8 no-print shrink-0">
        <StepIndicator current={step} onStepClick={handleStepClick} />
      </div>

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 pb-6">
        {step === "mapping" && parsed && (
          <StepMapping
            parsed={parsed}
            mapping={mapping}
            onMapped={handleMapped}
            onBack={() => router.push("/")}
          />
        )}
        {step === "preview" && parsed && mapping && (
          <StepPreview
            parsed={parsed}
            mapping={mapping}
            attendees={attendees}
            orientation={orientation}
            onOrientationChange={setOrientation}
            onAttendeesReady={handleAttendeesReady}
            onBack={() => setStep("mapping")}
          />
        )}
      </main>
    </div>
  );
}
