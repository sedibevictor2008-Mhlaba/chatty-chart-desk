import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailInput = z.object({
  purpose: z.string().min(3).max(4000),
  recipient: z.string().max(200).optional().default(""),
  tone: z.string().max(40).default("Professional"),
  length: z.string().max(20).default("Medium"),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => emailInput.parse(d))
  .handler(async ({ data }) => {
    const { aiObject } = await import("./ai.server");
    const schema = z.object({ subject: z.string(), body: z.string() });
    return aiObject(
      "You write clear, polished workplace emails. Body is plain text with greeting, paragraphs and sign-off using [Your Name]. No markdown.",
      `Write an email.\nRecipient: ${data.recipient || "unspecified"}\nTone: ${data.tone}\nLength: ${data.length}\nWhat it needs to say:\n${data.purpose}`,
      schema,
    );
  });

const meetingInput = z.object({ notes: z.string().min(20).max(30000) });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => meetingInput.parse(d))
  .handler(async ({ data }) => {
    const { aiObject } = await import("./ai.server");
    const schema = z.object({
      title: z.string(),
      summary: z.string(),
      keyPoints: z.array(z.string()),
      decisions: z.array(z.string()),
      actionItems: z.array(
        z.object({ task: z.string(), owner: z.string(), due: z.string() }),
      ),
    });
    return aiObject(
      "You summarize meeting notes or transcripts for busy professionals. Be concise and factual. For action items use 'Unassigned' or 'Not set' when owner or due date is unknown.",
      `Meeting notes:\n${data.notes}`,
      schema,
    );
  });

const chartInput = z.object({
  data: z.string().min(5).max(20000),
  request: z.string().max(500).optional().default(""),
});

export const buildChart = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => chartInput.parse(d))
  .handler(async ({ data }) => {
    const { aiObject } = await import("./ai.server");
    const schema = z.object({
      chartType: z.enum(["bar", "line", "area", "pie"]),
      title: z.string(),
      xKey: z.string(),
      series: z.array(z.string()),
      rows: z.array(
        z.object({ label: z.string(), values: z.array(z.number()) }),
      ),
      insight: z.string(),
    });
    const out = await aiObject(
      "You turn raw data (CSV, tables, or prose) into a chart spec. Pick the best chart type unless the user asks for one. 'series' are numeric series names; each row has a label (x axis) and values aligned to series order. Pie charts use exactly one series. Max 40 rows. 'insight' is 1-2 sentences on the key takeaway.",
      `Request: ${data.request || "Pick the best chart"}\nData:\n${data.data}`,
      schema,
    );
    return { ...out, rows: out.rows.slice(0, 40) };
  });
