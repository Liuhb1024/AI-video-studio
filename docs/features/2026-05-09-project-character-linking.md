# 项目中心项目角色接入

状态：done
负责人线程：功能开发线程
创建时间：2026-05-09
最后更新：2026-05-09

## 1. 为什么现在做

角色中心已经完成角色资料、参考图库、角色定稿、四视图生成和提示词优化。项目中心里“项目角色”目前仍显示“下一轮接全局角色引用”，导致项目内剧本、分镜和后续关键帧生成还不能稳定引用角色资产。

本功能目标是把全局角色中心接入项目文件夹，让每个项目可以选择并管理自己的项目角色。

## 2. 目标链路

```text
项目详情
  ↓
打开项目角色文件夹
  ↓
从全局角色中心选择角色
  ↓
创建 ProjectCharacter 引用
  ↓
项目内显示角色卡、状态、备注、主参考/候选资产
  ↓
后续供分镜卡和关键帧生成读取
```

## 3. 本次范围

- 新增项目角色引用数据结构。
- 项目内角色页面从占位页变成可用页面。
- 支持从全局角色中心搜索/选择角色加入当前项目。
- 支持移除项目角色引用，但不删除全局角色。
- 支持项目角色列表展示：
  - 角色名 / 别名
  - 英歌身份
  - 武器/道具
  - 参考图/生成资产状态摘要
  - 项目内备注或用途
  - 项目内状态
- 项目详情页“项目角色”文件夹显示真实数量，并标记为已接入。
- 补齐后端 API 测试和前端 typecheck/lint。
- 更新任务档案完成记录。

## 4. 明确不做

- 不做关键帧生成。
- 不做分镜卡绑定角色。
- 不做复杂角色关系图。
- 不做复制全局角色数据快照。
- 不做多用户权限。
- 不做批量导入项目角色。
- 不做删除全局角色。
- 不做角色字段大规模迁移。

## 5. 设计建议

### 5.1 后端数据结构

建议新增模块：

- `apps/api/app/modules/project_characters/`

建议模型：

```text
ProjectCharacter
- id
- project_id
- character_id
- role_in_project
- usage_note
- status
- sort_order
- created_at
- updated_at
```

唯一约束建议：

- 同一个 `project_id + character_id` 只能引用一次。

状态建议：

- `draft`
- `selected`
- `needs_reference`
- `ready`

### 5.2 API 设计

建议路由：

```text
GET    /api/v1/projects/{project_id}/characters
POST   /api/v1/projects/{project_id}/characters
PATCH  /api/v1/projects/{project_id}/characters/{project_character_id}
DELETE /api/v1/projects/{project_id}/characters/{project_character_id}
```

创建 payload：

```json
{
  "character_id": "...",
  "role_in_project": "主角 / 反派 / 配角",
  "usage_note": "本项目中的人物定位"
}
```

返回时建议嵌入角色摘要，避免前端二次拼装：

```json
{
  "id": "...",
  "project_id": "...",
  "character_id": "...",
  "role_in_project": "...",
  "usage_note": "...",
  "status": "selected",
  "sort_order": 0,
  "character": {
    "id": "...",
    "name": "...",
    "alias": "...",
    "yingge_role": "...",
    "weapons": "...",
    "reference_asset_id": "...",
    "image_consistency_prompt": "..."
  }
}
```

### 5.3 前端页面

目标页面：

- `apps/web/src/app/(workspace)/projects/[projectId]/characters/page.tsx`
- 可新增 `apps/web/src/features/projects/project-characters-screen.tsx`

页面建议：

- 顶部展示项目名和项目角色数量。
- 左侧/上方提供“添加全局角色”入口。
- 支持搜索全局角色。
- 已加入项目的角色显示为项目角色卡。
- 已加入的全局角色在选择器里禁用或标记“已加入”。
- 空状态明确提示“从全局角色中心引用人物 IP”。

### 5.4 项目详情页计数

`ProjectDetailScreen` 当前只加载剧本和分镜数量。本次应加入项目角色数量：

- `moduleCounts.characters = listProjectCharacters(projectId).length`
- 项目角色文件夹状态从 `next` 改为 `active`
- 当前能力改为“已接入全局角色引用”

## 6. 涉及模块

后端：

- `apps/api/app/api/router.py`
- `apps/api/app/db/init_db.py`
- `apps/api/app/modules/project_characters/models.py`
- `apps/api/app/modules/project_characters/schemas.py`
- `apps/api/app/modules/project_characters/repository.py`
- `apps/api/app/modules/project_characters/service.py`
- `apps/api/app/modules/project_characters/router.py`
- `apps/api/tests/test_project_characters_api.py`

前端：

- `apps/web/src/app/(workspace)/projects/[projectId]/characters/page.tsx`
- `apps/web/src/features/projects/project-characters-screen.tsx`
- `apps/web/src/features/projects/project-detail-screen.tsx`
- `apps/web/src/features/projects/types.ts`
- `apps/web/src/lib/api/project-characters.ts`
- 可能复用 `apps/web/src/lib/api/characters.ts`

文档：

- `docs/features/2026-05-09-project-character-linking.md`
- `docs/current-development-map.md`

## 7. 验收标准

- 项目详情页“项目角色”卡片显示为已接入，并展示真实数量。
- 进入 `/projects/{projectId}/characters` 能看到项目角色页面。
- 可以搜索/浏览全局角色并加入当前项目。
- 同一个角色不能重复加入同一个项目。
- 可以编辑项目角色的项目内身份、备注和状态。
- 可以从项目中移除角色引用，且全局角色不被删除。
- 后端 API 返回嵌入的角色摘要。
- 后端测试覆盖列表、创建、重复创建、更新、删除、项目不存在、角色不存在。
- 前端 `npm run typecheck` 和 `npm run lint` 通过。
- 任务档案写回开发记录、完成记录和遗留问题。

## 8. 建议测试

后端：

```bash
cd apps/api
.venv/bin/python -m pytest tests/test_project_characters_api.py -q
.venv/bin/python -m pytest tests/test_projects_api.py tests/test_characters_api.py -q
.venv/bin/python -m pytest -q
```

前端：

```bash
cd apps/web
npm run typecheck
npm run lint
```

本地体验：

```bash
cd apps/api
uvicorn app.main:app --reload
```

```bash
cd apps/web
npm run dev
```

## 9. 开发记录

- 2026-05-09：按测试先行新增 `tests/test_project_characters_api.py`，先确认缺少 `app.modules.project_characters` 时失败。
- 2026-05-09：新增 `ProjectCharacter` 引用层，包含 `project_id`、`character_id`、项目内身份、备注、状态、排序和唯一约束。
- 2026-05-09：新增项目角色 API：
  - `GET /api/v1/projects/{project_id}/characters`
  - `POST /api/v1/projects/{project_id}/characters`
  - `PATCH /api/v1/projects/{project_id}/characters/{project_character_id}`
  - `DELETE /api/v1/projects/{project_id}/characters/{project_character_id}`
- 2026-05-09：API 返回嵌入的全局角色摘要，并补充 `reference_asset_count`、`generated_asset_count`，方便项目页展示资产状态。
- 2026-05-09：项目角色页面从占位页改为真实页面，支持搜索全局角色、加入项目、禁用已加入角色、编辑项目内身份/备注/状态、移除引用。
- 2026-05-09：项目详情页“项目角色”文件夹改为已接入，并读取项目角色真实数量。

## 10. 完成记录

完成了什么：

- 完成 ProjectCharacter 项目角色引用层，不复制全局角色快照。
- 完成项目内角色 API、后端服务和嵌入式角色摘要。
- 完成项目角色页面，从全局角色中心搜索/选择角色并创建项目引用。
- 支持编辑项目内身份、用途备注、项目内状态。
- 支持移除项目角色引用，且全局角色不删除。
- 项目详情页显示项目角色真实计数，并标记为“已接入全局角色引用”。

改了哪些文件：

- `apps/api/app/api/router.py`
- `apps/api/app/db/init_db.py`
- `apps/api/app/modules/project_characters/__init__.py`
- `apps/api/app/modules/project_characters/models.py`
- `apps/api/app/modules/project_characters/schemas.py`
- `apps/api/app/modules/project_characters/repository.py`
- `apps/api/app/modules/project_characters/service.py`
- `apps/api/app/modules/project_characters/router.py`
- `apps/api/tests/test_project_characters_api.py`
- `apps/web/src/app/(workspace)/projects/[projectId]/characters/page.tsx`
- `apps/web/src/features/projects/project-characters-screen.tsx`
- `apps/web/src/features/projects/project-detail-screen.tsx`
- `apps/web/src/features/projects/types.ts`
- `apps/web/src/lib/api/project-characters.ts`
- `docs/current-development-map.md`
- `docs/features/2026-05-09-project-character-linking.md`

怎么验证：

- 先运行新增后端测试并看到缺少 `project_characters` 模块的预期失败。
- 实现后运行项目角色 API 测试、相邻项目/角色 API 测试、完整后端测试。
- 运行前端 typecheck 和 lint。

哪些测试通过：

- `cd apps/api && .venv/bin/python -m pytest tests/test_project_characters_api.py -q`：4 passed。
- `cd apps/api && .venv/bin/python -m pytest tests/test_project_characters_api.py tests/test_projects_api.py tests/test_characters_api.py -q`：13 passed。
- `cd apps/api && .venv/bin/python -m pytest -q`：67 passed。
- `cd apps/web && npm run typecheck`：通过。
- `cd apps/web && npm run lint`：通过。

哪些测试未能运行以及原因：

- 未启动本地 `uvicorn` / `next dev` 做浏览器手工验收；本轮以自动化 API 测试、TypeScript 和 lint 验证为主。

遗留问题：

- 项目角色页面当前复用全局角色列表搜索，暂未做全库分页选择器；角色数量继续增长后建议改用分页或弹窗选择器。
- 项目角色状态值仅做轻量约定，后续如进入生产质量门，可增加枚举校验和状态流转规则。

是否建议进入分镜卡绑定角色或关键帧生成：

- 建议下一步优先做“分镜卡绑定项目角色”，让分镜只引用项目角色集合；完成后再进入关键帧生成，会更容易获得稳定输入快照。

## 11. 遗留问题

- 项目角色引用已稳定落库，但尚未被分镜卡读取或绑定。
- 项目角色选择器暂未分页，后续大量角色时需要增强检索体验。
- 暂未增加批量加入、关系图、多用户权限、全局角色删除联动等能力，均保持在本任务排除范围外。

## 12. 下一步建议

- 回到指挥官线程确认本任务完成，并基于本引用层筹备“分镜卡绑定项目角色”任务档案。
- 分镜绑定完成后，再筹备关键帧生成任务档案，输入可使用：分镜卡 + 项目角色引用 + 已采纳角色资产 + 全局风格模板。
