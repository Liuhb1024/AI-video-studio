import { CharacterDetailInspector } from "@/components/characters/CharacterDetailInspector";
import { CharacterFilterPanel } from "@/components/characters/CharacterFilterPanel";
import { CharacterGrid } from "@/components/characters/CharacterGrid";
import { CharacterLibraryToolbar } from "@/components/characters/CharacterLibraryToolbar";
import type { CharacterCardData } from "@/components/characters/CharacterCard";
import { AppShell } from "@/components/layout/AppShell";
import { getCharacters } from "@/lib/api/characters";
import { API_BASE_URL } from "@/lib/api/config";
import type { ApiCharacter } from "@/lib/api/types";

export const dynamic = "force-dynamic";

function inferFaceColorCss(facePrimaryColor?: string | null) {
  if (!facePrimaryColor) return "#6f8490";
  if (facePrimaryColor.startsWith("#")) return facePrimaryColor;
  if (facePrimaryColor.includes("朱砂") || facePrimaryColor.includes("红")) {
    return "#c93a32";
  }
  if (facePrimaryColor.includes("黑")) return "#191515";
  return "#6f8490";
}

function listFromMetadata(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function mapCharacter(character: ApiCharacter): CharacterCardData {
  const metadata = character.metadata_ ?? {};
  const tags = listFromMetadata(metadata.visual_tone_keywords);

  return {
    id: character.id,
    name: character.name,
    nickname: character.nickname ?? "待补充",
    ranking: character.ranking ?? 0,
    star: character.star ?? "待补充",
    liangshanRole: character.liangshan_role ?? "待补充",
    weapon: character.weapon ?? "待补充",
    yinggeRole: character.yingge_role ?? "待补充",
    facePrimaryColor: character.face_primary_color ?? "待补充",
    facePrimaryColorCss: inferFaceColorCss(character.face_primary_color),
    facePattern: character.face_pattern ?? "待补充",
    personalityTags: tags.length > 0 ? tags : ["刚烈", "护义", "英歌"],
    positivePromptKeywords: ["英歌战舞", "朱砂脸谱", "水墨烟尘"],
    forbiddenPromptKeywords: ["现代服饰", "塑料质感", "西式盔甲"],
    appearanceCount: 1,
    referenceAssetCount: 0,
    fieldCompleteness: 82,
    excelSourceRow: character.ranking ? character.ranking + 1 : 0,
    visualProfile:
      character.face_pattern ??
      "后端暂未返回完整视觉档案，后续可接角色圣经详情接口。",
    narrativeProfile: character.color_symbolism ?? "待补充叙事素材层。",
    commercialProfile: "待补充商业文化层。",
  };
}

function ApiStateCard({
  title,
  description,
  detail,
}: {
  title: string;
  description: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-[color:rgba(233,195,73,0.22)] bg-[linear-gradient(180deg,rgba(39,35,25,0.78),rgba(24,25,24,0.72))] p-6">
      <p className="text-sm font-semibold text-[var(--accent-gold)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
      {detail ? (
        <p className="mt-3 rounded border border-[color:rgba(111,132,144,0.2)] bg-black/20 p-3 font-mono text-xs text-[var(--text-muted)]">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

type CharactersLoadResult =
  | {
      status: "ok";
      characters: CharacterCardData[];
    }
  | {
      status: "error";
      message: string;
    };

async function loadCharactersData(): Promise<CharactersLoadResult> {
  try {
    const apiCharacters = await getCharacters();

    return {
      status: "ok",
      characters: apiCharacters.map(mapCharacter),
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "未知错误",
    };
  }
}

export default async function CharactersPage() {
  const data = await loadCharactersData();

  if (data.status === "error") {
    return (
      <AppShell
        title="英歌角色库"
        eyebrow="Yingge Character Bible"
        subtitle="管理从 Excel 导入的英歌水浒角色圣经，为剧本、分镜、Prompt、生图、生视频提供一致性来源。"
        inspectorType="consistency"
        inspectorTitle="角色一致性检查"
        inspectorDescription="后端 API 暂不可用。"
        currentStage="角色库"
      >
        <ApiStateCard
          title="后端 API 连接失败"
          description="页面已进入错误态，没有白屏。请确认 FastAPI 后端正在 8000 端口运行。"
          detail={`${API_BASE_URL} · ${data.message}`}
        />
      </AppShell>
    );
  }

  const selectedCharacter = data.characters[0];

  return (
    <AppShell
      title="英歌角色库"
      eyebrow="Yingge Character Bible"
      subtitle="管理从 Excel 导入的英歌水浒角色圣经，为剧本、分镜、Prompt、生图、生视频提供一致性来源。"
      inspectorType="consistency"
      inspectorTitle="角色一致性检查"
      inspectorDescription="展示选中角色的五层摘要、外观、Prompt 关键词与字段来源。"
      currentStage="角色库"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-[color:rgba(233,195,73,0.28)] px-4 py-2 text-sm font-medium text-[var(--accent-gold)] transition hover:border-[var(--accent-cinnabar)] hover:text-[var(--text-primary)]"
          >
            导入角色 Excel
          </button>
          <button
            type="button"
            className="rounded bg-[var(--accent-cinnabar)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(154,45,38,0.28)]"
          >
            从角色创建短片
          </button>
        </div>
      }
      rightInspector={
        selectedCharacter ? (
          <CharacterDetailInspector character={selectedCharacter} />
        ) : (
          <ApiStateCard
            title="暂无选中角色"
            description="后端角色列表为空，右侧一致性检查暂无内容。"
          />
        )
      }
    >
      <div className="space-y-5">
        <CharacterLibraryToolbar />
        {data.characters.length === 0 ? (
          <ApiStateCard
            title="暂无角色数据"
            description="后端返回了空角色列表。请确认已执行 Backend Phase 6 seed 脚本。"
          />
        ) : (
          <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
            <CharacterFilterPanel />
            <CharacterGrid characters={data.characters} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
