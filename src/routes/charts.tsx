import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Loader2, Sparkle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { buildChart } from "@/lib/tools.functions";

export const Route = createFileRoute("/charts")({
  head: () => ({
    meta: [
      { title: "AI Chart Bot — Deskmate" },
      { name: "description", content: "Paste data and let AI turn it into the right chart with key insights." },
      { property: "og:title", content: "AI Chart Bot — Deskmate" },
      { property: "og:description", content: "Turn raw data into charts and graphs instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChartsPage,
});

type Spec = Awaited<ReturnType<typeof buildChart>>;
const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const sample = `Month,Revenue,Expenses
Jan,42000,31000
Feb,45500,32500
Mar,51000,33000
Apr,48200,35000
May,56300,34800
Jun,61000,36500`;

function ChartsPage() {
  const [data, setData] = useState("");
  const [ask, setAsk] = useState("");
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<Spec | null>(null);

  async function run() {
    if (data.trim().length < 5) { toast.error("Paste some data first."); return; }
    setLoading(true);
    try {
      setSpec(await buildChart({ data: { data, request: ask } }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="AI Chart Bot" subtitle="Paste a table, CSV or numbers in plain words. Ask for what you want to see." icon={<BarChart3 className="h-7 w-7 text-accent" />} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="data">Your data</Label>
            <Textarea id="data" rows={9} className="font-mono text-xs" placeholder="Month,Sales&#10;Jan,120&#10;Feb,140" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ask">What do you want to see? (optional)</Label>
            <Input id="ask" placeholder="e.g. Compare revenue vs expenses as a line chart" value={ask} onChange={(e) => setAsk(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={run} disabled={loading} size="lg">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkle />} {loading ? "Building…" : "Make chart"}
            </Button>
            <Button variant="ghost" onClick={() => setData(sample)}>Try sample data</Button>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-soft lg:col-span-3">
          {spec ? <ChartView spec={spec} /> : (
            <div className="grid h-full min-h-80 place-items-center text-sm text-muted-foreground">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Your chart will appear here."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartView({ spec }: { spec: Spec }) {
  const rows = spec.rows.map((r) => {
    const o: Record<string, string | number> = { [spec.xKey]: r.label };
    spec.series.forEach((s, i) => { o[s] = r.values[i] ?? 0; });
    return o;
  });
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
      <XAxis dataKey={spec.xKey} stroke="var(--muted-foreground)" fontSize={12} />
      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
      <Legend />
    </>
  );
  let chart;
  if (spec.chartType === "pie") {
    chart = (
      <PieChart>
        <Pie data={rows} dataKey={spec.series[0] ?? "value"} nameKey={spec.xKey} outerRadius="80%" label>
          {rows.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip /><Legend />
      </PieChart>
    );
  } else if (spec.chartType === "line") {
    chart = <LineChart data={rows}>{axes}{spec.series.map((s, i) => <Line key={s} type="monotone" dataKey={s} stroke={colors[i % 5]} strokeWidth={2.5} />)}</LineChart>;
  } else if (spec.chartType === "area") {
    chart = <AreaChart data={rows}>{axes}{spec.series.map((s, i) => <Area key={s} type="monotone" dataKey={s} stroke={colors[i % 5]} fill={colors[i % 5]} fillOpacity={0.25} />)}</AreaChart>;
  } else {
    chart = <BarChart data={rows}>{axes}{spec.series.map((s, i) => <Bar key={s} dataKey={s} fill={colors[i % 5]} radius={[4, 4, 0, 0]} />)}</BarChart>;
  }
  return (
    <div className="animate-rise">
      <h2 className="text-xl font-semibold">{spec.title}</h2>
      <div className="mt-4 h-80"><ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer></div>
      <p className="mt-4 flex gap-2 rounded-lg bg-secondary p-3 text-sm"><Lightbulb className="h-4 w-4 shrink-0 text-accent" /> {spec.insight}</p>
    </div>
  );
}
