type PrototypePlaceholderProps = {
  title: string;
  description?: string;
};

export function PrototypePlaceholder({
  title,
  description = "静态原型占位",
}: PrototypePlaceholderProps) {
  return (
    <main className="ink-texture flex min-h-screen items-center justify-center bg-[var(--background-secondary)] px-6 py-12 text-[var(--text-primary)]">
      <section className="w-full max-w-3xl rounded-lg border border-[color:rgba(90,64,62,0.55)] bg-[color:rgba(32,32,31,0.88)] p-8 shadow-2xl shadow-black/30">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-gold)]">
          AI Yingge Video Studio
        </p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-4 text-base text-[var(--text-secondary)]">
          {description}
        </p>
      </section>
    </main>
  );
}
