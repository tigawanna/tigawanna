import { journalEntryTypeValues } from "@repo/db";
import { z } from "zod";

export const journalEntryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  markdown: z.string(),
  richtext: z.string(),
  gist: z.string(),
  type: z.enum(journalEntryTypeValues),
});

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;

export const journalEntryFormDefaults: JournalEntryFormValues = {
  title: "",
  description: "",
  markdown: "",
  richtext: "",
  gist: "",
  type: "TIL",
};
