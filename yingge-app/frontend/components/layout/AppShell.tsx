import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { PageHeader } from "./PageHeader";
import { RightInspector, type InspectorType } from "./RightInspector";
import { TopStatusBar } from "./TopStatusBar";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  pageHeader?: ReactNode;
  rightInspector?: ReactNode;
  inspectorType?: InspectorType;
  inspectorTitle?: string;
  inspectorDescription?: string;
  currentProject?: string;
  currentCharacter?: string;
  currentStage?: string;
  modelStatus?: "normal" | "warning";
};

export function AppShell({
  children,
  title,
  subtitle,
  eyebrow,
  actions,
  pageHeader,
  rightInspector,
  inspectorType = "default",
  inspectorTitle,
  inspectorDescription,
  currentProject,
  currentCharacter,
  currentStage,
  modelStatus,
}: AppShellProps) {
  const resolvedHeader =
    pageHeader ??
    (title ? (
      <PageHeader
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        actions={actions}
      />
    ) : null);

  return (
    <div className="ink-texture flex h-screen min-w-[1440px] overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopStatusBar
          currentProject={currentProject}
          currentCharacter={currentCharacter}
          currentStage={currentStage}
          modelStatus={modelStatus}
        />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-auto bg-[color:rgba(19,19,19,0.72)] px-6 py-6">
            {resolvedHeader}
            {children}
          </main>
          <RightInspector
            type={inspectorType}
            title={inspectorTitle}
            description={inspectorDescription}
          >
            {rightInspector}
          </RightInspector>
        </div>
      </div>
    </div>
  );
}
