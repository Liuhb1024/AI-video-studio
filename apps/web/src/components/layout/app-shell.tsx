import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-workspace-radial text-[#f5ead6]">
      <div className="pointer-events-none absolute left-[-12rem] top-24 h-96 w-96 rounded-full bg-stage-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-clay-500/12 blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1840px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 pb-8 pt-4 md:px-5 lg:px-6">
            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 enter-soft">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
