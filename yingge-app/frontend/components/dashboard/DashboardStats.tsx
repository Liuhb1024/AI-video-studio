import { MetricCard } from "@/components/common/MetricCard";
import { dashboardStats } from "@/data/mock/projects";
import type { StatusBadgeStatus } from "../common/StatusBadge";

export type DashboardStat = {
  label: string;
  value: string;
  hint: string;
  status: StatusBadgeStatus;
};

const stats: DashboardStat[] = [
  {
    label: "进行中项目",
    value: `${dashboardStats.activeProjects}`,
    hint: "英歌人物介绍短片",
    status: "processing" as const,
  },
  {
    label: "已导入角色",
    value: `${dashboardStats.importedCharacters}`,
    hint: "来自角色圣经 Excel",
    status: "success" as const,
  },
  {
    label: "运行中任务",
    value: `${dashboardStats.runningTasks}`,
    hint: "生图 / 生视频 / Agent",
    status: "warning" as const,
  },
  {
    label: "已采纳视频",
    value: `${dashboardStats.acceptedVideos}`,
    hint: "可进入成片库",
    status: "success" as const,
  },
  {
    label: "失败任务",
    value: `${dashboardStats.failedTasks}`,
    hint: "需人工复盘",
    status: "error" as const,
  },
  {
    label: "本月成本",
    value: `¥${dashboardStats.monthlyCost.toFixed(2)}`,
    hint: "Mock 成本摘要",
    status: "warning" as const,
  },
];

type DashboardStatsProps = {
  stats?: DashboardStat[];
};

export function DashboardStats({ stats: statItems = stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {statItems.map((stat) => (
        <MetricCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          hint={stat.hint}
          status={stat.status}
        />
      ))}
    </div>
  );
}
