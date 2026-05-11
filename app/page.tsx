"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Download, FileSpreadsheet, Upload, Users, X, Printer, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { parseCsvFile } from "@/lib/parseCsv";
import { Button } from "@/components/ui/button";

const Dither = dynamic(() => import("@/components/Dither"), { ssr: false });

const ROTATE_MS = 2800;

function renderVariant(idx: number): ReactNode {
  switch (idx) {
    case 0:
      return (
        <>
          <span>for</span>
          <Image
            src="/logos/luma.png"
            alt="Luma"
            width={72}
            height={72}
            className="h-8 w-8 md:h-10 md:w-10 inline-block rounded-[4px]"
            priority
          />
          <span>events</span>
        </>
      );
    case 1:
      return <span>for Networking Events</span>;
    case 2:
      return (
        <>
          <span>for</span>
          <span className="font-toronto-tech-week font-semibold tracking-tight">
            Toronto Tech Week
          </span>
        </>
      );
    case 3:
      return <span>for Hackathons</span>;
    case 4:
      return <span>for Conferences</span>;
    default:
      return null;
  }
}

const VARIANT_COUNT = 5;

function RotatingHeadline() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % VARIANT_COUNT);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.2] text-center">
      <span className="flex items-center justify-center gap-2 md:gap-3">
        <span>Create</span>
        <Image
          src="/logos/linkedin.png"
          alt="LinkedIn"
          width={40}
          height={40}
          className="h-8 w-8 md:h-10 md:w-10 inline-block rounded-[8px]"
          priority
        />
        <span>name tags</span>
      </span>
      <span
        key={i}
        className="mt-2 flex items-center justify-center gap-2 md:gap-3 animate-slide-up-fade min-h-[1.2em]"
      >
        {renderVariant(i)}
      </span>
    </h1>
  );
}

const STEPS = [
  {
    icon: FileSpreadsheet,
    title: "Export your guest list",
    body: "Head to your event platform — Luma, Eventbrite, Bevy, or any other — open your attendee list, and export it as a CSV file. Most platforms have an \"Export\" or \"Download\" button on the guest list page.",
  },
  {
    icon: CheckCircle2,
    title: "Upload & verify your data",
    body: "Drop the CSV into BadgeIn. We'll automatically detect columns like name and LinkedIn profile URL. Review the attendee table to make sure everything looks right before moving on.",
  },
  {
    icon: Printer,
    title: "Preview & print",
    body: "See exactly how your name tags will look — portrait or landscape — before a single sheet leaves the printer. When you're happy, hit Print or Download PDF. Cards include trim guides and extra side clearance so they slide into holders more easily.",
  },
];

const LUMA_STEPS = [
  {
    icon: CheckCircle2,
    title: "Open Manage Event",
    body: "In Luma, find your event from your dashboard or event page, then click Manage Event.",
  },
  {
    icon: Users,
    title: "Go to Guests",
    body: "Open the Guests tab to view the guest list for that event.",
  },
  {
    icon: Download,
    title: "Download and upload the CSV",
    body: "On the top right of the guest list, click the third button with the download icon. Upload that CSV file here.",
  },
];

function HowItWorksModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="How BadgeIn works"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border bg-background shadow-xl p-6 flex flex-col gap-6 transition-all duration-300 ease-out",
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.985]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">How does this work?</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              From guest list to printed name tags in three steps.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps */}
        <ol className="flex flex-col gap-5">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={i} className="flex gap-4">
              <div className="shrink-0 flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold">
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-border min-h-[20px]" />
                )}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm font-medium">{title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <Button onClick={onClose} className="w-full mt-1">
          Got it
        </Button>
      </div>
    </div>
  );
}

function LumaInstructionsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="For Luma Events instructions"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border bg-background shadow-xl p-6 flex flex-col gap-6 transition-all duration-300 ease-out",
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.985]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">For Luma Events</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Export the guest list CSV from Luma, then upload it here.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps */}
        <ol className="flex flex-col gap-5">
          {LUMA_STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={i} className="flex gap-4">
              <div className="shrink-0 flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold">
                  {i + 1}
                </div>
                {i < LUMA_STEPS.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-border min-h-[20px]" />
                )}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm font-medium">{title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <Button onClick={onClose} className="w-full mt-1">
          Got it
        </Button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showLumaInstructions, setShowLumaInstructions] = useState(false);

  const stageFile = useCallback((file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      return;
    }
    setSelectedFile(file);
  }, []);

  const confirmUpload = useCallback(async () => {
    if (!selectedFile) return;
    setIsParsing(true);
    setError(null);
    try {
      const parsed = await parseCsvFile(selectedFile);
      sessionStorage.setItem("badgein:parsed", JSON.stringify(parsed));
      router.push("/generate");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV.");
      setIsParsing(false);
    }
  }, [selectedFile, router]);

  const openPicker = useCallback(() => {
    if (!isParsing) inputRef.current?.click();
  }, [isParsing]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) stageFile(file);
    },
    [stageFile]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const file = e.clipboardData.files?.[0];
      if (file) {
        e.preventDefault();
        stageFile(file);
      }
    },
    [stageFile]
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Dithered background — vignette around the edges, white in the center behind content */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -10,
          maskImage:
            "radial-gradient(ellipse 70% 65% at 50% 52%, transparent 38%, black 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 65% at 50% 52%, transparent 38%, black 80%)",
        }}
      >
        <Dither
          waveColor={[0.65, 0.65, 0.65]}
          waveSpeed={0.03}
          waveFrequency={3}
          waveAmplitude={0.3}
          colorNum={5}
          pixelSize={2}
          enableMouseInteraction={true}
          mouseRadius={0.4}
          disableAnimation={false}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-[8vh]">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
          <div className="mb-14 w-full">
            <RotatingHeadline />
            <p className="mt-4 text-sm text-muted-foreground">
              Drop in a CSV. Print badges in five minutes.
            </p>
          </div>

          <div
            tabIndex={0}
            onPaste={onPaste}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
              "w-full max-w-xl mx-auto rounded-sm border border-dashed border-neutral-300 bg-background font-mono outline-none transition-all",
              "shadow-[0_1px_0_0_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]",
              "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              isDragging && "border-foreground/35 bg-secondary/25 shadow-none ring-1 ring-foreground/20"
            )}
          >
            <div className="flex min-h-[44px] w-full items-stretch overflow-hidden rounded-sm">
              <button
                type="button"
                onClick={openPicker}
                disabled={isParsing}
                className="flex w-[44px] shrink-0 items-center justify-center border-r border-border bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                aria-label="Choose CSV file"
              >
                <Upload className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </button>

              <button
                type="button"
                onClick={openPicker}
                disabled={isParsing}
                className={cn(
                  "flex min-w-0 flex-1 items-center px-4 text-left text-sm leading-none tracking-wide transition-colors",
                  !selectedFile && !isParsing && "text-muted-foreground uppercase",
                  selectedFile && !isParsing && "text-foreground font-medium normal-case",
                  isParsing && "text-muted-foreground uppercase"
                )}
              >
                <span className="truncate w-full">
                  {isParsing
                    ? "Reading your file…"
                    : selectedFile
                      ? selectedFile.name
                      : "Upload CSV file"}
                </span>
              </button>

              {selectedFile && !isParsing && (
                <div className="flex shrink-0 items-center border-l border-border px-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 !rounded-sm px-3 text-xs font-mono uppercase tracking-wide"
                    onClick={(e) => {
                      e.stopPropagation();
                      void confirmUpload();
                    }}
                  >
                    Upload
                  </Button>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) stageFile(file);
                e.target.value = "";
              }}
            />
          </div>

          {error && (
            <p className="mt-3 text-center text-sm text-foreground">{error}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setShowHowItWorks(true)}
              className="underline-offset-4 hover:underline hover:text-foreground transition-colors"
            >
              How does this work?
            </button>
            <span aria-hidden className="hidden sm:inline">·</span>
            <button
              type="button"
              onClick={() => setShowLumaInstructions(true)}
              className="underline-offset-4 hover:underline hover:text-foreground transition-colors"
            >
              For Luma Events Instructions
            </button>
          </div>
        </div>
      </main>

      <HowItWorksModal
        open={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
      <LumaInstructionsModal
        open={showLumaInstructions}
        onClose={() => setShowLumaInstructions(false)}
      />
    </div>
  );
}
