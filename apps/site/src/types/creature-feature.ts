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
  background: string;
  foreground: string;
  isFinale?: boolean;
}
