export type MockAudioAsset = {
  id: string;
  shotId: string;
  text: string;
  voice: string;
  model: string;
  status: "candidate" | "accepted" | "rejected";
  duration: string;
  cost: number;
};

export const audioAssets: MockAudioAsset[] = [
  { id: "aud-01", shotId: "shot-01", text: "在水泊梁山的烽烟中，有一人，名震四方。", voice: "英雄沉厚男声", model: "MiniMax TTS 2.0", status: "accepted", duration: "00:05", cost: 0.11 },
  { id: "aud-02", shotId: "shot-02", text: "他，景阳冈上赤手空拳，打虎英雄，天下闻名。", voice: "英雄沉厚男声", model: "MiniMax TTS 2.0", status: "accepted", duration: "00:07", cost: 0.12 },
  { id: "aud-03", shotId: "shot-03", text: "他，醉打蒋门神，为兄弟出头，快意恩仇。", voice: "英雄沉厚男声", model: "MiniMax TTS 2.0", status: "candidate", duration: "00:08", cost: 0.13 },
];
