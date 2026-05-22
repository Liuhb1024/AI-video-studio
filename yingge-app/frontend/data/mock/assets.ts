export type MockAsset = {
  id: string;
  type: "image" | "video" | "audio" | "character-ref" | "scene-ref";
  title: string;
  projectId: string;
  characterId: string;
  status: "candidate" | "accepted" | "rejected";
  model: string;
  promptVersion: string;
  cost: number;
};

export const assets: MockAsset[] = [
  {
    id: "asset-wusong-ref-01",
    type: "character-ref",
    title: "武松主外观定妆图",
    projectId: "project-wusong-hero",
    characterId: "wusong",
    status: "accepted",
    model: "gpt-image-2",
    promptVersion: "v1.3",
    cost: 1.2,
  },
  {
    id: "asset-wusong-video-05",
    type: "video",
    title: "醉打蒋门神第 5 镜候选",
    projectId: "project-wusong-hero",
    characterId: "wusong",
    status: "candidate",
    model: "Seedance 2.0",
    promptVersion: "v2.1",
    cost: 28.6,
  },
  {
    id: "asset-linchong-scene-02",
    type: "scene-ref",
    title: "林冲雪夜场景参考",
    projectId: "project-linchong-night",
    characterId: "linchong",
    status: "accepted",
    model: "nano banana",
    promptVersion: "v1.1",
    cost: 0.6,
  },
];
