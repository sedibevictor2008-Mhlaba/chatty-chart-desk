import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Copy, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateEmail } from "@/lib/tools.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Deskmate" },
      { name: "description", content: "Create professional workplace emails in seconds with AI." },
      { property: "og:title", content: "Smart Email Generator — Deskmate" },
      { property: "og:description", content: "Describe it, pick a tone, get a polished email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const tones = ["Professional", "Friendly", "Formal", "Persuasive", "Apologetic"];
const lengths = ["Short", "Medium", "Detailed"];

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            value === o ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  async function run() {
    if (purpose.trim().length < 3) { toast.error("Tell us what the email should say."); return; }
    setLoading(true);
    try {
      setResult(await generateEmail({ data: { purpose, recipient, tone, length } }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Smart Email Generator" subtitle="Describe what you need to say — we'll write it properly." icon={<Mail className="h-7 w-7 text-accent" />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border bg-card p-6 shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="to">Recipient (optional)</Label>
            <Input id="to" placeholder="e.g. Client, my manager, the finance team" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="what">What should the email say?</Label>
            <Textarea id="what" rows={7} placeholder="e.g. Ask the client to move Thursday's review to next Monday because our data isn't ready yet" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="space-y-2"><Label>Tone</Label><Chips options={tones} value={tone} onChange={setTone} /></div>
          <div className="space-y-2"><Label>Length</Label><Chips options={lengths} value={length} onChange={setLength} /></div>
          <Button onClick={run} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 />} {loading ? "Writing…" : "Generate email"}
          </Button>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-soft">
          {result ? (
            <div className="animate-rise">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Subject</p>
                  <p className="mt-1 font-medium">{result.subject}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`); toast.success("Copied"); }}>
                  <Copy /> Copy
                </Button>
              </div>
              <hr className="my-4" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.body}</p>
            </div>
          ) : (
            <div className="grid h-full min-h-64 place-items-center text-center text-sm text-muted-foreground">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Your email will appear here."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
