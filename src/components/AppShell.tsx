import { Link, Outlet } from "@tanstack/react-router";
import { LayoutGrid, Mail, NotebookPen, BarChart3, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/email", label: "Email Writer", icon: Mail },
  { to: "/meetings", label: "Meeting Notes", icon: NotebookPen },
  { to: "/charts", label: "Chart Bot", icon: BarChart3 },
] as const;

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-64">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary font-display text-lg font-bold text-sidebar-primary-foreground">
            D
          </div>
          <span className="font-display text-xl font-semibold">Deskmate</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden items-start gap-2 px-6 py-5 text-xs opacity-70 md:flex">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          AI runs on secure servers. Your text is never stored.
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon?: ReactNode }) {
  return (
    <header className="mb-8 animate-rise">
      <div className="flex items-center gap-3">
        {icon}
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
      </div>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </header>
  );
}
