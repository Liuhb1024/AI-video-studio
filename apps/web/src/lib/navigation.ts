export type NavigationItem = {
  label: string;
  href: string;
  shortLabel: string;
  description: string;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "工作台",
    shortLabel: "工作台",
    href: "/workbench",
    description: "制作总控与协作入口",
  },
  {
    label: "项目",
    shortLabel: "项目",
    href: "/projects",
    description: "项目集、进度和分组",
  },
  {
    label: "角色中心",
    shortLabel: "角色",
    href: "/characters",
    description: "人物 IP、脸谱与参考图",
  },
  {
    label: "风格模板",
    shortLabel: "风格",
    href: "/style-templates",
    description: "全局漫剧风格资产",
  },
  {
    label: "数据看板",
    shortLabel: "看板",
    href: "/dashboard",
    description: "生产状态、产能和风险",
  },
  {
    label: "设置",
    shortLabel: "设置",
    href: "/settings",
    description: "团队、权限、工作流",
  },
];

export const moduleChips = [
  "项目统筹",
  "项目文件夹",
  "分镜驱动",
  "素材沉淀",
  "成本复盘",
];
