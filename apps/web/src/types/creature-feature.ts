import type { LucideIcon } from "lucide-react";

export type StackTraceTone = "base" | "hot" | "dim";

export interface StackTraceSegment {
  text: string;
  tone: StackTraceTone;
}

export interface StackTraceLine {
  id: number;
  indent: number;
  opacity: number;
  segments: StackTraceSegment[];
}

export interface CreatureRevealPanel {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  variant?: "cinema" | "story" | "feature" | "finale";
  background: string;
  foreground: string;
  isFinale?: boolean;
  Icon?: LucideIcon;
  iconClassName?: string;
}
