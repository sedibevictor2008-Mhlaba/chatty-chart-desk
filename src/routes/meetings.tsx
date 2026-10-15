import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Loader2, Sparkle, Copy, CheckCircle2, ListChecks, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/tools.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Deskmate" },
      { name: "description", content: "Turn meeting notes into a summary, decisions and action items with AI." },
      { property: "og:title", content: "Meeting Notes Summarizer — Deskmate" },
      { property: "og:description", content: "Summary, decisions and action items from any meeting notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

type Summary = Awaited<ReturnType<typeof summarizeMeeting>>;

const sample = `Weekly product sync - Oct 14
Attendees: Thandi, Mark, Priya, Leo
Mark: checkout redesign 80% done, QA starts Monday. Priya worried about mobile perf.
Agreed to delay launch from Oct 20 to Oct 27 to allow for perf testing.
Leo will draft customer announcement by Friday. Priya to run perf benchmarks on Android by Wednesday.
Thandi: budget for Q4 ads approved at R250k. Need someone to own vendor contract - nobody yet.`;

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [r, setR] = useState<Summary | null>(null);

  async function run() {
    if (notes.trim().length < 20) { toast.error("Paste a bit more of the meeting notes."); return; }
    setLoading(true);
    try {
      setR(await summarizeMeeting({ data: { notes } }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!r) return;
    const t = `${r.title}\n\n${r.summary}\n\nKey points:\n${r.keyPoints.map((k) => `- ${k}`).join("\n")}\n\nDecisions:\n${r.decisions.map((k) => `- ${k}`).join("\n")}\n\nAction items:\n${r.actionItems.map((a) => `- ${a.task} (${a.owner}, ${a.due})`).join("\n")}`;
    navigator.clipboard.writeText(t);
    toast.success("Copied");
  }

  return (
    <div>
      <PageHeader title="Meeting Notes Summarizer" subtitle="Paste notes or a transcript. Get what matters." icon={<NotebookPen className="h-7 w-7 text-accent" />} />
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <Textarea rows={9} placeholder="Paste your meeting notes or transcript here…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={run} disabled={loading} size="lg">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkle />} {loading ? "Summarizing…" : "Summarize"}
          </Button>
          <Button variant="ghost" onClick={() => setNotes(sample)}>Try sample notes</Button>
        </div>
      </div>

      {r && (
        <div className="mt-8 animate-rise space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{r.title}</h2>
              <p className="mt-2 text-muted-foreground">{r.summary}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copy}><Copy /> Copy</Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Section icon={<Lightbulb className="h-4 w-4" />} title="Key points" items={r.keyPoints} />
            <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Decisions" items={r.decisions} />
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-soft">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><ListChecks className="h-4 w-4 text-accent" /> Action items</h3>
            {r.actionItems.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No action items found.</p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr><th className="py-2 font-medium">Task</th><th className="font-medium">Owner</th><th className="font-medium">Due</th></tr>
                </thead>
                <tbody>
                  {r.actionItems.map((a, i) => (
                    <tr key={i} className="border-t"><td className="py-2 pr-3">{a.task}</td><td className="pr-3">{a.owner}</td><td>{a.due}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h3 className="flex items-center gap-2 text-lg font-semibold"><span className="text-accent">{icon}</span> {title}</h3>
      {items.length ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{items.map((k, i) => <li key={i}>{k}</li>)}</ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">None recorded.</p>
      )}
    </div>
  );
}
