import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, BarChart3, ArrowRight, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Deskmate AI workplace tools" },
      { name: "description", content: "One place to write emails, summarize meetings and turn data into charts with AI." },
      { property: "og:title", content: "Deskmate — AI workplace tools" },
      { property: "og:description", content: "Write emails, summarize meetings and chart data in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Describe what you need to say. Get a polished email with subject line in seconds.", saves: "~10 min per email" },
  { to: "/meetings", icon: NotebookPen, title: "Meeting Notes Summarizer", desc: "Paste messy notes or a transcript. Get the summary, decisions and action items.", saves: "~20 min per meeting" },
  { to: "/charts", icon: BarChart3, title: "AI Chart Bot", desc: "Paste a table or CSV and ask a question. Get the right chart and the key insight.", saves: "~15 min per report" },
] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  return (
    <div>
      <section className="animate-rise overflow-hidden rounded-2xl bg-hero p-8 text-primary-foreground shadow-soft md:p-12">
        <p className="text-sm uppercase tracking-widest opacity-80" suppressHydrationWarning>{greeting()}</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
          Less busywork. <em className="text-accent">More</em> real work.
        </h1>
        <p className="mt-4 max-w-xl opacity-85">
          Three AI assistants for the everyday tasks that eat your week — all in one place.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {tools.map(({ to, icon: Icon, title, desc, saves }, i) => (
          <Link
            key={to}
            to={to}
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
            className="group animate-rise flex flex-col rounded-xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary"
          >
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{desc}</p>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {saves}
              </span>
              <span className="flex items-center gap-1 font-medium text-primary">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
