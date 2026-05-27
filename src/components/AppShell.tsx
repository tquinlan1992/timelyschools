"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SCHOOL_YEAR } from "@/constants";
import { RosterRefreshProvider, useRosterRefresh } from "@/contexts/roster-refresh";

function AppShellHeader() {
  const pathname = usePathname();
  const [attentionCount, setAttentionCount] = useState<number | null>(null);
  const { refreshKey } = useRosterRefresh();

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => setAttentionCount(d.attentionCount));
  }, [refreshKey]);

  const nav = [
    { href: "/students", label: "Students" },
    { href: "/courses", label: "Course catalog" },
  ];

  return (
    <header className="app-header">
      <div className="app-header-start">
        <Link href="/students" className="app-brand">
          <Image
            src="/timely-logo.png"
            alt="Timely"
            width={208}
            height={52}
            className="app-brand-logo"
            priority
          />
          <span className="app-product-label">Course Requests</span>
        </Link>
        <nav className="app-nav" aria-label="Main">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`app-nav-link ${pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="app-header-meta">
        <span>{SCHOOL_YEAR}</span>
        {attentionCount !== null && attentionCount > 0 && (
          <Link href="/students?filter=needs_attention" className="attention-badge">
            {attentionCount} need review
          </Link>
        )}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RosterRefreshProvider>
      <div className="app-shell">
        <AppShellHeader />
        <main className="app-main">{children}</main>
      </div>
    </RosterRefreshProvider>
  );
}
