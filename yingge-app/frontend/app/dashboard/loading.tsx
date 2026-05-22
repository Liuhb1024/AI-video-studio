export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[var(--bg-ink)] p-8 text-[var(--text-primary)]">
      <div className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(35,38,37,0.86),rgba(24,25,24,0.78))] p-6">
        <p className="text-sm text-[var(--accent-gold)]">正在连接后端 API</p>
        <h1 className="mt-2 text-2xl font-semibold">项目总览加载中</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          正在读取项目、任务、素材和成本数据。
        </p>
      </div>
    </main>
  );
}

