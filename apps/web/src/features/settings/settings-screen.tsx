import { ModuleScreen } from "@/components/layout/module-screen";

export function SettingsScreen() {
  return (
    <ModuleScreen
      eyebrow="设置"
      title="团队、权限与生产规则"
      description="维护账号、成员、角色权限、通知和工作流配置，让整套生产工作台具备可运营性。"
      stats={[
        { label: "成员数", value: "14", hint: "当前团队可协作成员数量。" },
        { label: "规则集", value: "06", hint: "已定义的审批、通知和生产规则。" },
        { label: "集成项", value: "03", hint: "后续可接入素材存储、消息与渲染服务。" },
      ]}
      workflowTitle="配置方向"
      workflowSteps={[
        "设置团队角色、审批链路和通知规则。",
        "定义项目模板、命名规范和交付格式。",
        "把生产规则沉淀为可复用的默认值。",
      ]}
      insights={[
        {
          title: "可运营性底座",
          description: "设置页是把工作台从演示原型推进到可交付产品的关键入口。",
          tone: "warm",
        },
        {
          title: "后续扩展点",
          description: "可以继续增加存储、生成供应商、Webhook 和审计日志配置。",
        },
      ]}
    />
  );
}
