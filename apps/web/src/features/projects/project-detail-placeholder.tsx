"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";

export function ProjectDetailPlaceholder({ title }: { title: string }) {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const [scriptId, setScriptId] = useState<string | null>(null);

  useEffect(() => {
    setScriptId(new URLSearchParams(window.location.search).get("scriptId"));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "项目中心", href: "/projects" }, { label: "项目文件夹", href: `/projects/${params.projectId}` }, { label: title }]} />
      <PageHeader
        eyebrow="项目内部模块"
        title={title}
        description={
          scriptId
            ? `已接收剧本 ${scriptId}，下一轮会从这个剧本的时间轴场次生成分镜卡。`
            : "这个入口已经放进项目文件夹里。下一轮会按你的验收节奏逐个开发真实功能。"
        }
        actions={
          <button
            type="button"
            onClick={() => router.push(`/projects/${params.projectId}`)}
            className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-xs text-stage-100 transition hover:border-stage-300/35"
          >
            返回项目文件夹
          </button>
        }
      />
    </div>
  );
}
