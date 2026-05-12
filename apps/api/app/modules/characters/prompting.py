from app.modules.characters.schemas import CharacterCreate


def build_character_prompts(payload: CharacterCreate) -> dict[str, str]:
    identity = "，".join(part for part in [payload.name, payload.alias, payload.rank, payload.star] if part)
    visual_parts = [
        payload.yingge_role,
        f"脸谱主色：{payload.facepaint_main_color}" if payload.facepaint_main_color else None,
        f"脸谱纹样：{payload.facepaint_patterns}" if payload.facepaint_patterns else None,
        f"武器/道具：{payload.weapons or payload.weapon}" if payload.weapons or payload.weapon else None,
        f"视觉调性：{payload.visual_tone_keywords}" if payload.visual_tone_keywords else None,
        f"正向词：{payload.positive_prompt_terms}" if payload.positive_prompt_terms else None,
    ]
    visual_context = "；".join(part for part in visual_parts if part)
    negative = payload.negative_prompt_terms or payload.negative_keywords or "避免脸谱漂移、服饰错色、武器变形、五官崩坏、水印、廉价恐怖化"
    image_prompt = (
        f"{identity}。{visual_context}。英歌水浒人物 IP 形象，保持脸谱纹样、妆造服饰、武器道具和气质一致，"
        "庄重、热血、具有潮汕英歌文化仪式感，角色设定稿级别，细节清晰。"
    )
    video_prompt = (
        f"基于关键帧生成视频，保持{payload.name}的脸谱纹样、妆造服饰、武器道具和人物气质完全一致；"
        "只执行一个主要动作，镜头运动稳定，服饰和道具不变形，脸谱不漂移。"
    )
    three_view_prompt = (
        f"基于参考图和角色设定，生成{payload.name}的三视图角色设定图：正面、侧面、背面。"
        f"{visual_context}。保持脸谱、五官比例、发型、服饰结构、颜色、头饰、腰饰、鞋履、武器道具完全一致，"
        "干净背景，清晰展示服饰结构和身体比例。"
    )
    negative_prompt = f"避免：{negative}。不要改成京剧脸谱，不要改成普通武侠服，不要出现多余人物，不要水印。"
    return {
        "image_consistency_prompt": image_prompt,
        "video_consistency_prompt": video_prompt,
        "three_view_prompt": three_view_prompt,
        "negative_prompt": negative_prompt,
    }
